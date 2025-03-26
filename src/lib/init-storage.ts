import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "http://localhost:9000",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  region: "us-east-1",
  forcePathStyle: true,
});

const BUCKET_NAME = "images";

export async function initializeStorage() {
  try {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log("Storage bucket already exists");
      return;
    } catch {
      console.log("Bucket doesn't exist, creating...");
    }

    await s3Client.send(
      new CreateBucketCommand({
        Bucket: BUCKET_NAME,
      })
    );
    console.log("Storage bucket created successfully");
  } catch (error) {
    console.error("Error initializing storage bucket:", error);
  }
}
