import {
    S3Client,
    PutObjectCommand,
    ObjectCannedACL,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION ||
    !process.env.S3_BUCKET_NAME
) {
    throw new Error("Missing AWS environment variables");
}

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

const uploadFile = async (
    fileContent: Buffer,
    fileName: string,
    mimeType: string
): Promise<string> => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME as string,
        Key: fileName,
        Body: fileContent,
        ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export default uploadFile;
