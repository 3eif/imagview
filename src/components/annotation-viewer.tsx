import { useEffect, useState } from "react";
import { Annotation } from "@/types/annotation";
import { AnnotationState } from "@/types/annotation-state";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shape } from "@/types/enums";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { AnnotationComments } from "./annotation-comments";

interface AnnotationViewerProps {
  state: AnnotationState;
  isSharedView?: boolean;
}

export function AnnotationViewer({
  state,
  isSharedView = false,
}: AnnotationViewerProps) {
  const [visibleAnnotations, setVisibleAnnotations] = useState<Annotation[]>(
    []
  );
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setVisibleAnnotations(state.annotations);
  }, [state.annotations]);

  const handleAnnotationClick = (id: string) => {
    state.setSelectedAnnotationIds([]);
    state.setSelectedAnnotationId(id);

    const annotation = state.annotations.find((a) => a.id === id);
    if (annotation) {
      if (!isSharedView) {
        const centerX = annotation.x + annotation.width / 2;
        const centerY = annotation.y + annotation.height / 2;

        const newOffsetX = state.canvasSize.width / 2 - centerX * state.scale;
        const newOffsetY = state.canvasSize.height / 2 - centerY * state.scale;

        state.setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  const handleDeleteAnnotation = (id: string, e: React.MouseEvent) => {
    if (isSharedView) return;
    e.stopPropagation();
    state.setSelectedAnnotationId(id);
    state.deleteSelectedAnnotation();
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const getShapeIcon = (shape: Shape) => {
    switch (shape) {
      case Shape.Rectangle:
        return "□";
      case Shape.Circle:
        return "○";
      case Shape.Line:
        return "╱";
      case Shape.Arrow:
        return "→";
      case Shape.Path:
        return "✎";
      default:
        return "?";
    }
  };

  const getSelectedAnnotation = () => {
    if (!state.selectedAnnotationId) return null;

    return (
      visibleAnnotations.find((a) => a.id === state.selectedAnnotationId) ||
      null
    );
  };

  const selectedAnnotation = getSelectedAnnotation();

  if (visibleAnnotations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="bg-zinc-900/60 backdrop-blur-md border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[calc(100vh-240px)]">
        <div
          className="sticky top-0 flex items-center justify-between p-2 px-3 border-b z-10 bg-zinc-800/75 backdrop-blur-sm cursor-pointer"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-2">
            {minimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <h3 className="text-sm font-medium">
              Annotations{" "}
              <span className="text-xs text-muted-foreground">
                ({visibleAnnotations.length})
              </span>
            </h3>
          </div>
        </div>
        {!minimized && (
          <ScrollArea className="flex-1 overflow-y-auto" type="always">
            <div className="space-y-1 p-2">
              {visibleAnnotations.length > 0 ? (
                visibleAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`flex items-center justify-between py-0.5 px-2 rounded-md text-xs cursor-pointer hover:bg-accent/20 group ${
                      state.selectedAnnotationId === annotation.id
                        ? "bg-accent/40 border"
                        : ""
                    }`}
                    onClick={() => handleAnnotationClick(annotation.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={annotation.shape}>
                        {getShapeIcon(annotation.shape)}
                      </span>
                      <span>
                        {annotation.shape} ({Math.round(annotation.width)} ×{" "}
                        {Math.round(annotation.height)})
                        {annotation.comments?.length ? (
                          <span className="ml-1 text-zinc-400">
                            ({annotation.comments.length})
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {!isSharedView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 cursor-pointer"
                        onClick={(e) =>
                          handleDeleteAnnotation(annotation.id, e)
                        }
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-xs text-zinc-400">
                  No annotations yet
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {selectedAnnotation && (
        <AnnotationComments
          annotation={selectedAnnotation}
          state={state}
          isSharedView={isSharedView}
        />
      )}
    </div>
  );
}
