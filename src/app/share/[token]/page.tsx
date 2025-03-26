import { notFound } from "next/navigation";
import { ImageViewer } from "@/components/image-viewer";
import { Annotation } from "@/types/annotation";
import { v4 as uuidv4 } from "uuid";

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/view?token=${token}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  if (!data.image?.url) {
    notFound();
  }

  const validatedAnnotations = (data.annotations || []).map(
    (annotation: Partial<Annotation>) => {
      return {
        ...annotation,
        imageId: data.image.id,
        id: annotation.id || uuidv4(),
        comments: (annotation.comments || []).map((comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        })),
      };
    }
  );

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="h-full w-full">
        <ImageViewer
          initialImage={data.image.url}
          isSharedView={true}
          initialAnnotations={validatedAnnotations}
        />
      </div>
    </div>
  );
}
