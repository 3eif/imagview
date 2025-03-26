"use client";

import { useRef, useEffect } from "react";
import { Toolbar } from "./toolbar";
import { useAnnotationState } from "@/hooks/useAnnotationState";
import { useAnnotationEvents } from "@/hooks/useAnnotationEvents";
import { AnnotationState } from "@/types/annotation-state";
import { StatusBar } from "./status-bar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AnnotationViewer } from "./annotation-viewer";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mode } from "@/types/enums";
import { Annotation } from "@/types/annotation";
import { centerImageInCanvas } from "@/utils/canvas";

interface ImageViewerProps {
  initialImage?: string | null;
  noImageMode?: boolean;
  onUploadClick?: () => void;
  uploadError?: string | null;
  isSharedView?: boolean;
  currentFile?: File | null;
  initialAnnotations?: Annotation[];
}

export function ImageViewer({
  initialImage,
  noImageMode = false,
  onUploadClick,
  uploadError,
  isSharedView = false,
  currentFile = null,
  initialAnnotations = [],
}: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const state = useAnnotationState(initialImage);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.annotations.length > 0) {
        const message =
          "You have unsaved changes. Are you sure you want to leave? Changes can be saved by getting a share link.";
        e.returnValue = message;
        return message;
      }
    };

    if (!isSharedView) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.annotations, isSharedView]);

  useEffect(() => {
    if (initialAnnotations && initialAnnotations.length > 0) {
      state.setAnnotations(() => initialAnnotations);
    }
  }, [initialAnnotations]);

  useEffect(() => {
    if (
      isSharedView &&
      initialImage &&
      containerRef.current &&
      state.currentImage
    ) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const scaleX = width / state.currentImage.width;
      const scaleY = height / state.currentImage.height;

      const scale = Math.min(scaleX, scaleY, 1);

      const centerOffset = centerImageInCanvas(
        state.currentImage,
        width,
        height
      );

      requestAnimationFrame(() => {
        state.setOffset(centerOffset);
        state.setScale(scale);

        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      });
    }
  }, [isSharedView, initialImage]);

  const {
    containerRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleWheel,
  } = useAnnotationEvents(state as AnnotationState, canvasRef, isSharedView);

  useKeyboardShortcuts({
    onModeChange: (mode: Mode) => {
      if (isSharedView) {
        if (mode === Mode.Select || mode === Mode.Pan) {
          state.setMode(mode);
        }
      } else {
        state.setMode(mode);
      }
    },
    currentMode: state.mode,
    annotationState: state,
    isSharedView: isSharedView,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSharedView) {
      window.location.href = "/";
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    state.handleFileUpload(files);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    if (isSharedView) {
      window.location.href = "/";
      return;
    }

    if (onUploadClick) {
      onUploadClick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleModeChange = (mode: Mode) => {
    if (isSharedView) {
      if (mode === Mode.Select || mode === Mode.Pan) {
        state.setMode(mode);
      }
    } else if (!noImageMode) {
      state.setMode(mode);
    }
  };

  const handleZoomIn = () => {
    if (!noImageMode) {
      state.handleZoomIn();
    }
  };

  const handleZoomOut = () => {
    if (!noImageMode) {
      state.handleZoomOut();
    }
  };

  const handleZoomReset = () => {
    if (!noImageMode) {
      state.setScale(1);
    }
  };

  return (
    <div className="relative w-full h-full flex" ref={containerRef}>
      <div className="relative flex-1 overflow-hidden">
        {!onUploadClick && !isSharedView && (
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        )}

        <div className="absolute top-4 left-0 right-0 mx-auto w-fit z-20">
          <Toolbar
            mode={state.mode}
            onModeChange={handleModeChange}
            onFileUpload={handleUploadClick}
            canUndo={!noImageMode && !isSharedView && state.canUndo}
            canRedo={!noImageMode && !isSharedView && state.canRedo}
            onUndo={state.undo}
            onRedo={state.redo}
            isDisabled={noImageMode}
            isSharedView={isSharedView}
            currentFile={currentFile}
            annotations={state.annotations}
          />
        </div>

        <div className="absolute top-4 left-4 z-40 w-72 max-h-[calc(100vh-300px)]">
          <AnnotationViewer
            state={state as AnnotationState}
            isSharedView={isSharedView}
          />
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={noImageMode ? undefined : handleCanvasMouseDown}
          onMouseMove={noImageMode ? undefined : handleCanvasMouseMove}
          onMouseUp={noImageMode ? undefined : handleCanvasMouseUp}
          onMouseLeave={noImageMode ? undefined : handleCanvasMouseUp}
          onWheel={noImageMode ? undefined : handleWheel}
        />

        {noImageMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">ImagViewer</div>
              <div className="text-xs text-muted-foreground">
                No image loaded
              </div>
              {uploadError && (
                <div className="text-xs text-red-500">{uploadError}</div>
              )}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="default"
                  onClick={handleUploadClick}
                  className="mt-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-950 text-white pointer-events-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>
        )}

        <StatusBar
          mode={state.mode}
          scale={state.scale}
          selectedImage={state.currentImage}
          annotationCount={state.annotations.length}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          isDisabled={noImageMode}
          isSharedView={isSharedView}
        />
      </div>
    </div>
  );
}
