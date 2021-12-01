import { clamAvScanner } from './clamAvScanner';
import { s3Handler } from './s3Handler';
import { dynamoDbHandler } from './dynamoDbHandler';
import { APIGatewayProxyHandler } from 'aws-lambda';
import CONFIG from '../config/index';

const quarantineBucketName = CONFIG.env.QUARANTINE_BUCKET;
export const init = async event => {
    const [record] = event.Records;
    const Bucket = record.s3.bucket.name;
    const Key = record.s3.object.key;
    const file_url = `https://${Bucket}.s3.us-east-2.amazonaws.com/${Key}`;
    const quarantinePath = `https://${quarantineBucketName}.s3.us-east-2.amazonaws.com/${Key}`;

    try {
        //file scan process
        const scanFileData = await clamAvScanner.fileScan(Bucket, Key);
        const { is_infected } = scanFileData;

        //file read
        const object = await s3Handler.readStream({ Bucket, Key });
        const contentType = object.ContentType;

        //file name is combined with key and the bucket name
        const fileName = Bucket.concat('/', Key);
        
        //insert data to dynamodb
        await dynamoDbHandler.dbInsert(Bucket, fileName, file_url, 'Pending');

        //get uuid for the given filename
        const params = {
            index: 'fileName-index',
            queryKey: 'fileName',
            queryValue: fileName
        };
        const dbData = await dynamoDbHandler.dbQuery(params);
        const ID = dbData[0].UUID;

        //check file is infected or not
        if (is_infected) {
            console.log('isInfected');
            //write the file to qurantine bucket
            await s3Handler.writeStream({
                dataBuffer: object.Body.toString(),
                bucketName: quarantineBucketName,
                contentType,
                fileName: Key
            });
            //delete file from s3 bucket because its infected
            await s3Handler.deleteFile({ Bucket, Key });
            //update data in dynamodb
            await dynamoDbHandler.dbUpdate(ID, Bucket, 'Complete', 'Infected', scanFileData, quarantineBucketName, quarantinePath);
        } else {
            console.log('no virus');
            //update data in dynamodb
            await dynamoDbHandler.dbUpdate(ID, Bucket, 'Complete', 'Clean', scanFileData, 'null', 'null');

        }


    } catch (error) {
        console.log('Error', error);
    }
}




export const queryFileData: APIGatewayProxyHandler = async (event, _context) => {
    const payload = JSON.parse(event.body);
    const { fileName } = payload
    if (fileName) {
        try {
            const params = {
                index: 'fileName-index',
                queryKey: 'fileName',
                queryValue: fileName
            };
            const data = await dynamoDbHandler.dbQuery(params);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'File Data',
                    input: data,
                }, null, 2),
            };
        } catch (error) {
            console.log(error);
        }
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'No file name',
            }, null, 2),
        };
    }

}


