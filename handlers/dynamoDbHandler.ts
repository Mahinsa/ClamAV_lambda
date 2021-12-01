import * as AWS from 'aws-sdk';
import CONFIG from '../config/index';
import { v4 as uuidv4 } from 'uuid';
import { Idb } from '../config/dbData';

const db = new AWS.DynamoDB.DocumentClient({
    region: process.env.REGION,
});
// const db = new AWS.DynamoDB();
const TableName = process.env.TABLE_NAME;
class DynamoDbHandler {
    private readonly tableName: string = CONFIG.env.TABLE_NAME;

    async dbInsert(bucket, filename, path, scanState): Promise<any> {
<<<<<<< Updated upstream:handlers/dynamoDbHandler.ts

        const data: Idb = {
            UUID: uuidv4(),
            bucketName: bucket,
            fileName: filename,
            originalPath: path,
            scanState: scanState,
            virusState: 'null',
            virusDetail: 'null',
            quarantineBucket: 'null',
            quarantinePath: 'null',
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString()
        }
        const params = {
            TableName: this.tableName,
            Item: data
=======
        console.log('DynamoDbHandler', { bucket, filename, path, scanState,TableName });

        try {
            const data: Idb = {
                UUID: uuidv4(),
                bucketName: bucket,
                fileName: filename,
                originalPath: path,
                scanState: scanState,
                virusState: 'null',
                virusDetail: 'null',
                quarantineBucket: 'null',
                quarantinePath: 'null',
                createdAt: Date.now().toString(),
                updatedAt: Date.now().toString(),
            };
            console.log('DynamoDbHandler-data', data);
    
            const params:any = {
                TableName: TableName,
                Item: data,
            };
            console.log('DynamoDbHandler-params', params);
    
            const res = await db.put(params).promise();
            console.log('DynamoDbHandler-res', res);
    
            return res;
            
        } catch (error) {
            console.log("dbInsert-error",error);
            throw error;
>>>>>>> Stashed changes:file-scanner/handlers/dynamoDbHandler.ts
        }
    }

    async dbQuery(payload): Promise<any> {
<<<<<<< Updated upstream:handlers/dynamoDbHandler.ts
        const {
            index,
            queryKey,
            queryValue } = payload;

        const params: any = {
            TableName: this.tableName,
            IndexName: index,
            KeyConditionExpression: `${queryKey} = :hkey`,
            ExpressionAttributeValues: {
                ':hkey': queryValue,
            }
        };
        const res = await db.query(params).promise();
        return res.Items || [];
=======
        const { index, queryKey, queryValue } = payload;
        console.log('dbQuery-payload', payload);
        try {
            const params: any = {
                TableName: TableName,
                IndexName: index,
                KeyConditionExpression: `${queryKey} = :hkey`,
                ExpressionAttributeValues: {
                    ':hkey': queryValue,
                },
            };
            console.log('dbQuery-params', params);

            const res = await db.query(params).promise();
            console.log('dbQuery-res', res);

            return res.Items || [];
        } catch (error) {
            console.log("dbQuery-error",error);
            throw error;
        }
>>>>>>> Stashed changes:file-scanner/handlers/dynamoDbHandler.ts
    }

    async dbUpdate(
        UUID,
        bucketName,
        scanState,
        virusState,
        virusDetail,
        quarantineBucket,
<<<<<<< Updated upstream:handlers/dynamoDbHandler.ts
        quarantinePath
        ): Promise<any> {


        const params: any = {
            TableName: this.tableName,
            Key: {
                "UUID": UUID,
                "bucketName": bucketName
            },
            UpdateExpression:
                "SET scanState = :label1, virusState = :label2, virusDetail = :label3, quarantineBucket = :label4, quarantinePath = :label5, updatedAt = :label6   ",
            ExpressionAttributeValues: {
                ":label1": scanState,
                ":label2": virusState,
                ":label3": virusDetail,
                ":label4": quarantineBucket,
                ":label5": quarantinePath,
                ":label6": Date.now().toString()
            }

        };


        const res = await db.update(params).promise();
        return res;
=======
        quarantinePath,
    ): Promise<any> {
        try {
            const params: any = {
                TableName: TableName,
                Key: {
                    UUID,
                    bucketName
                },
                UpdateExpression:
                    'SET scanState = :l1, virusState = :l2, virusDetail = :l3, quarantineBucket = :l4, quarantinePath = :l5, updatedAt = :l6 ',
                ExpressionAttributeValues: {
                    ':l1': scanState,
                    ':l2': virusState,
                    ':l3': virusDetail,
                    ':l4': quarantineBucket,
                    ':l5': quarantinePath,
                    ':l6': Date.now().toString(),
                },
            };
    
            console.log('db update params', params);
            const res = await db.update(params).promise();
            console.log('res', res);
    
            return res;
            
        } catch (error) {
            console.log("dbUpdate-error",error);
            throw error;
        }
>>>>>>> Stashed changes:file-scanner/handlers/dynamoDbHandler.ts
    }
}

export const dynamoDbHandler = new DynamoDbHandler();
