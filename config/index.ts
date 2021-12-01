export interface IEnv {
    QUARANTINE_BUCKET: string;
    CLEAN_BUCKET: string
    S3_ACL: string;
    TABLE_NAME:string;
    REGION: string;

}
const config: { env: IEnv } = {
    env: {
        QUARANTINE_BUCKET: process.env.QUARANTINE_BUCKET,
        CLEAN_BUCKET: process.env.CLEAN_BUCKET,
        S3_ACL: process.env.S3_ACL || 'public-read',
        TABLE_NAME: process.env.TABLE_NAME,
        REGION: process.env.REGION

    },
};

export default config;