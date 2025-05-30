import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./s3-client";

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
