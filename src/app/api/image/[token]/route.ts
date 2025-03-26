import { NextResponse } from "next/server";
import db from "@/db";
import { shareLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { Readable } from "stream";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = (await params).token;

    const shareLink = await db.query.shareLinks.findFirst({
      where: eq(shareLinks.token, token),
      with: {
        image: true,
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Shared link not found" },
        { status: 404 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: shareLink.image.storageKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: "Image not found in storage" },
        { status: 404 }
      );
    }

    const chunks = [];
    for await (const chunk of response.Body as Readable) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": shareLink.image.contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
