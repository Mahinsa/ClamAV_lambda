import { clamAvScanner } from './clamAvScanner';
import { s3Handler } from './s3Handler';
import { dynamoDbHandler } from './dynamoDbHandler';
import {APIGateway} from "aws-sdk";
const Region = process.env.REGION;
const QurantineBucket = process.env.QUARANTINE_BUCKET;
const BucketName = process.env.BUCKET_NAME;
export const init = async (event) => {
    console.log('Env variables', {Region,QurantineBucket,BucketName});
    console.log('Event', event);
    const [record] = event.Records;
    const Bucket = record.s3.bucket.name;
    const Key = record.s3.object.key;
    console.log('Bucket', Bucket);
    console.log('Key', Key);

    const file_url = `https://${Bucket}.s3.${Region}.amazonaws.com/${Key}`;
    const quarantinePath = `https://${QurantineBucket}.s3.${Region}.amazonaws.com/${Key}`;

    try {
        //file scan process
        const scanFileData = await clamAvScanner.fileScan(Bucket, Key);
        const { is_infected } = scanFileData;
        console.log('scanDFileData', scanFileData);
        //file read
        const object: any = await s3Handler.readStream({ Bucket, Key });
        console.log('object', object);

        const contentType: any = object.ContentType;
        console.log('contentType', contentType);

        //file name is combined with key and the bucket name
        const fileName: any = Bucket.concat('/', Key);
        console.log('fileName', fileName);

        //insert data to dynamodb
        await dynamoDbHandler.dbInsert(Bucket, fileName, file_url, 'Pending');

        //get uuid for the given filename
        const params: any = {
            index: 'fileName-index',
            queryKey: 'fileName',
            queryValue: fileName,
        };
        console.log('params', params);

        const dbData = await dynamoDbHandler.dbQuery(params);
        console.log('dbData', dbData);

        const ID = dbData[0].UUID;
        console.log('ID', dbData);

        console.log('is_infected', is_infected);

        //check file is infected or not
        if (is_infected) {
            console.log('isInfected');
            //write the file to qurantine bucket
            await s3Handler.writeStream({
                dataBuffer: object.Body.toString(),
                bucketName: QurantineBucket,
                contentType,
                fileName: Key,
            });
            //delete file from s3 bucket because its infected
            await s3Handler.deleteFile({ Bucket, Key });
            //update data in dynamodb
            await dynamoDbHandler.dbUpdate(
                ID,
                Bucket,
                'Complete',
                'Infected',
                scanFileData,
                BucketName,
                quarantinePath,
            );
        } else {
            console.log('no virus');
            //update data in dynamodb
            await dynamoDbHandler.dbUpdate(ID, Bucket, 'Complete', 'Clean', scanFileData, 'null', 'null');
        }
    } catch (error) {
        console.log('init-Error', error);
        throw error;
    }
};

export const  queryFileData = async (event, _context): Promise<any> => {
    const payload = JSON.parse(event.body);
    const { fileName } = payload
    console.log("queryFileData-payload ",payload)
    try {
        if (fileName) {
       
                const params = {
                    index: 'fileName-index',
                    queryKey: 'fileName',
                    queryValue: fileName
                };
                const data = await dynamoDbHandler.dbQuery(params);
                console.log("queryFileData-data",data)
                return  {
                    statusCode: "200",
                    body: JSON.stringify({
                      status: "ok",
                      data: data
                     })
                  };
        } else {
    
            return{
                statusCode: "500",
                headers: {
                },
                body: JSON.stringify({
                  status: "not success",
                  data: null
                 })
              };

        }
    } catch (error) {
        console.log("queryFileData-error",error);
        throw error
    }
    

}
