import { NextResponse } from "next/server";
import db from "@/db";
import { images, shareLinks, annotations, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { uploadImage as uploadToStorage } from "@/lib/storage";
import { Comment } from "@/types/annotation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

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

    const requestUrl = new URL(request.url);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${requestUrl.protocol}//${requestUrl.host}`;
    const imageUrl = `${origin}/api/image/${token}`;

    const imageAnnotations = await db.query.annotations.findMany({
      where: eq(annotations.imageId, shareLink.imageId),
      with: {
        comments: true,
      },
    });

    return NextResponse.json({
      image: {
        ...shareLink.image,
        url: imageUrl,
      },
      annotations: imageAnnotations,
    });
  } catch (error) {
    console.error("Error fetching shared view:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared view" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const imageId = formData.get("imageId") as string;

    if (imageId && !file) {
      const imageExists = await db.query.images.findFirst({
        where: eq(images.id, imageId),
      });

      if (!imageExists) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      const annotationsData = formData.get("annotations");
      if (annotationsData) {
        try {
          const parsedAnnotations = JSON.parse(annotationsData as string);

          if (
            Array.isArray(parsedAnnotations) &&
            parsedAnnotations.length > 0
          ) {
            await db
              .delete(annotations)
              .where(eq(annotations.imageId, imageId));

            for (const annotation of parsedAnnotations) {
              const [savedAnnotation] = await db
                .insert(annotations)
                .values({
                  id: annotation.id,
                  imageId: imageId,
                  x: annotation.x,
                  y: annotation.y,
                  width: annotation.width,
                  height: annotation.height,
                  shape: annotation.shape,
                  rotation: annotation.rotation,
                  points: annotation.points,
                })
                .returning();

              if (annotation.comments && annotation.comments.length > 0) {
                await db.insert(comments).values(
                  annotation.comments.map((comment: Comment) => ({
                    id: comment.id,
                    annotationId: savedAnnotation.id,
                    text: comment.text,
                    createdAt: new Date(comment.createdAt),
                  }))
                );
              }
            }

            console.log(
              `Saved ${parsedAnnotations.length} annotations with comments for image ${imageId}`
            );
          }
        } catch (annotationError) {
          console.error("Error processing annotations:", annotationError);
        }
      }

      const token = nanoid(10);
      await db.insert(shareLinks).values({
        imageId,
        token,
      });

      const requestUrl = new URL(request.url);
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ||
        `${requestUrl.protocol}//${requestUrl.host}`;

      const shareUrl = `${origin}/share/${token}`;

      return NextResponse.json({
        shareUrl,
        token,
      });
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file or imageId provided" },
        { status: 400 }
      );
    }

    const { storageKey, contentType } = await uploadToStorage(file);

    const [image] = await db
      .insert(images)
      .values({
        filename: file.name,
        contentType,
        storageKey,
      })
      .returning();

    const token = nanoid(10);
    await db.insert(shareLinks).values({
      imageId: image.id,
      token,
    });

    const annotationsData = formData.get("annotations");
    if (annotationsData) {
      try {
        const parsedAnnotations = JSON.parse(annotationsData as string);

        if (Array.isArray(parsedAnnotations) && parsedAnnotations.length > 0) {
          await db.delete(annotations).where(eq(annotations.imageId, image.id));

          for (const annotation of parsedAnnotations) {
            const [savedAnnotation] = await db
              .insert(annotations)
              .values({
                id: annotation.id,
                imageId: image.id,
                x: annotation.x,
                y: annotation.y,
                width: annotation.width,
                height: annotation.height,
                shape: annotation.shape,
                rotation: annotation.rotation,
                points: annotation.points,
              })
              .returning();

            if (annotation.comments && annotation.comments.length > 0) {
              await db.insert(comments).values(
                annotation.comments.map((comment: Comment) => ({
                  id: comment.id,
                  annotationId: savedAnnotation.id,
                  text: comment.text,
                  createdAt: new Date(comment.createdAt),
                }))
              );
            }
          }

          console.log(
            `Saved ${parsedAnnotations.length} annotations with comments for image ${image.id}`
          );
        }
      } catch (annotationError) {
        console.error("Error processing annotations:", annotationError);
      }
    }

    const requestUrl = new URL(request.url);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${requestUrl.protocol}//${requestUrl.host}`;

    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({
      image,
      shareUrl,
      token,
    });
  } catch (error) {
    console.error("Error processing upload and share:", error);
    return NextResponse.json(
      { error: "Failed to process upload and share" },
      { status: 500 }
    );
  }
}
