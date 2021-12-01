import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
    service: {
        name: '${self:custom.s3.bucketName}-clamAV-lambda',
    },
    frameworkVersion: '>=1.72.0',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true,
        },
        s3: {
            bucketName: '${env:BUCKET_NAME}',
            // bucketName: 'axistechfilescanner',
            quarantineBucket: 'bambu-uat-quarantine',
            // quarantineBucket: 'axistechqurrantine',
        },
    },
    // Add the serverless-webpack plugin
    plugins: ['serverless-webpack','serverless-pseudo-parameters'],
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        stage: "${opt:stage, 'dev'}",
        // @ts-ignore
        region: "${opt:region, 'sa-east-1'}",
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            S3_ACL: 'public-read',
            QUARANTINE_BUCKET: '${self:custom.s3.quarantineBucket}',
            BUCKET_NAME: '${self:custom.s3.bucketName}',
            AWS_ACCOUNT:'825460230961',
            TABLE_NAME: 'S3FileScanner',
            REGION: 'sa-east-1',
            CLAMAV_PUBLIC_IP:'13.212.176.89',
            CLAMAV_PORT:'3310'
        },
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: 's3:ListBucket',
                Resource: [
                    'arn:aws:s3:::${self:custom.s3.bucketName}',
                    'arn:aws:s3:::${self:custom.s3.quarantineBucket}'
                ],
            },
            {
                Effect: 'Allow',
                Action: 's3:*Object',
                Resource: [
                    'arn:aws:s3:::${self:custom.s3.bucketName}/*',
                    'arn:aws:s3:::${self:custom.s3.quarantineBucket}/*'
                ],
            },
            {
                Effect: 'Allow',
                Action: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query', 'dynamodb:UpdateItem'],
                Resource: [
                    'arn:aws:dynamodb:${self:provider.environment.REGION}:${self:provider.environment.AWS_ACCOUNT}:table/${self:provider.environment.TABLE_NAME}',
                    'arn:aws:dynamodb:${self:provider.environment.REGION}:${self:provider.environment.AWS_ACCOUNT}:table/${self:provider.environment.TABLE_NAME}/index/*',
                ],
            },
        ],
    },

    functions: {
        scan: {
            handler: 'handlers/scan.init',
            events: [
                {
                    s3: {
                        bucket: '${self:custom.s3.bucketName}',
                        event: 's3:ObjectCreated:*',
                        rules: [],
                        existing: true,
                    },
                },
            ],
        },
        queryData: {
          handler: 'handlers/scan.queryFileData',
          events: [
            {
              http: {
                path: '/scanResult',
                method: 'post',
                cors: true
              }
            }
          ]
        },
    },
    resources: {
      Resources: {
        s3FileTable: {
          Type: 'AWS::DynamoDB::Table',
          Properties: {
            TableName: '${self:provider.environment.TABLE_NAME}',
            AttributeDefinitions: [
              {
                AttributeName: 'UUID',
                AttributeType: 'S'

              },
              {
                AttributeName: 'bucketName',
                AttributeType: 'S'

              },
              {
                AttributeName: 'fileName',
                AttributeType: 'S'

              }
            ],
            KeySchema: [
              {
                AttributeName: 'UUID',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'bucketName',
                KeyType: 'RANGE'

              }
            ],
            GlobalSecondaryIndexes: [{
              IndexName: 'fileName-index',
              KeySchema: [
                {
                  AttributeName: 'fileName',
                  KeyType: 'HASH'
                }
              ],
              Projection: {
                ProjectionType: 'ALL'
              }

            }],

            BillingMode: 'PAY_PER_REQUEST',

          }
        }
      }
    }
};

module.exports = serverlessConfiguration;
