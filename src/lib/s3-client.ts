import { S3Client } from "@aws-sdk/client-s3";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://localhost:9000";
export const PUBLIC_ENDPOINT =
  process.env.PUBLIC_MINIO_ENDPOINT || MINIO_ENDPOINT;
export const BUCKET_NAME = "images";

export const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  region: "us-east-1", // MinIO doesn't care about region
  forcePathStyle: true, // Required for MinIO
});
