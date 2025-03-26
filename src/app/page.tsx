"use client";

import { Suspense } from "react";
import { ImageViewer } from "@/components/image-viewer";
import { ErrorBoundary } from "@/components/error-boundary";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function NeuralTissueVisualizationTool() {
  const {
    uploadedImage,
    error,
    fileInputRef,
    handleImageUpload,
    triggerFileInput,
    currentFile,
  } = useImageUpload();

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="h-full w-full">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="text-muted-foreground">Loading viewer...</div>
            </div>
          }
        >
          <div className="h-full w-full">
            <ErrorBoundary>
              <ImageViewer
                initialImage={uploadedImage}
                noImageMode={!uploadedImage}
                onUploadClick={triggerFileInput}
                uploadError={error}
                currentFile={currentFile}
              />
            </ErrorBoundary>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </Suspense>
      </div>
    </div>
  );
}
