import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
    throw new Error("Missing AWS environment variables");
}

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

export const uploadFile = async (
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

    try {
        await s3.send(command);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error("Failed to upload file:", error);
        throw new Error("Upload operation failed");
    }
};

export const deleteFile = async (fileName: string): Promise<void> => {
    const sizes = [140, 300, 450, 600, 960, 1024];
    for (const size of sizes) {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME as string,
            Key: `${fileName}_${size}.webp`,
        };
        const command = new DeleteObjectCommand(params);
        try {
            const response = await s3.send(command);
            console.log("Delete response:", response);
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    }
};
