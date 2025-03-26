import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT } from "./s3-client";

export async function uploadImage(
  file: File
): Promise<{ storageKey: string; contentType: string }> {
  const buffer = await file.arrayBuffer();
  const storageKey = `${Date.now()}-${file.name}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })
  );

  return {
    storageKey,
    contentType: file.type,
  };
}

export async function getImageUrl(storageKey: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 604800 }); // URL expires in 1 week (7 days)
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    // Fallback to a direct URL
    return `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/${storageKey}`;
  }
}

export async function deleteImage(storageKey: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
      })
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}
