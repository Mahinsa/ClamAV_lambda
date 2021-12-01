<<<<<<< Updated upstream
Clamav Lambda (S3 File Scanner)

get file data endpoint payload
 {
    "fileName": bucketName/fileName
 }
=======
## ClamAvSaas

<!-- Aws credentials should update according to the aws profile

deploy.sh file should execute with two arguments event type (Add, Remove) and s3 bucket name

bucket name is exported as an environment variable which will use in ./file-scanner/serverless.ts file

should name the qurantine bucket name and table name in ./file-scanner/serverless.ts file


Table structure

	TableName - S3FileScanner
	Partition Key - UUID (string)

	GlobalSecondaryIndexes:
		indexName - 'fileName-index'
		partition Key - 'fileName' -->
>>>>>>> Stashed changes
