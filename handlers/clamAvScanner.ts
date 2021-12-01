import NodeClam from 'clamscan';
import * as AWS from 'aws-sdk';

const S3 = new AWS.S3();

class ClamAvScanner {
    async fileScan(Bucket: string, Key: string): Promise<any> {
        console.log('inside clamav scanner', { Bucket, Key });
        try {
            //s3 file stream
            const s3Stream = S3.getObject({ Bucket: Bucket, Key: Key }).createReadStream();
            console.log('s3Stream', s3Stream);
            const options = {
                clamdscan: {
                    host: process.env.CLAMAV_PUBLIC_IP,
                    port: process.env.CLAMAV_PORT,
                    timeout: 300000,
                    bypass_test: true,
                },
            };
            console.log('options', options);
            const clamscan = await new NodeClam().init(options);
            console.log('clamscan', clamscan);

            const data = await clamscan.scan_stream(s3Stream);
            console.log('data', data);
            return data;
        } catch (error) {
            console.log('fileScan-Error', error);
            throw error;
            
        }
    }
}
export const clamAvScanner = new ClamAvScanner();
