import { MutableRefObject } from "react";
import { Annotation } from "@/types/annotation";
import { AnnotationState } from "@/types/annotation-state";
import { normalizeBox, checkIntersection } from "../useSelectionUtils";
import { Mode, Shape } from "@/types/enums";
import { v4 as uuidv4 } from "uuid";

export function useMouseUp(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  isSharedView = false
) {
  const handleCanvasMouseUp = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = "default";
    }

    if (state.isPanning) {
      state.setIsPanning(false);
    }

    if (!isSharedView) {
      if (state.isResizing) {
        state.setIsResizing(false);
        state.setResizeHandle(null);
        state.setAnnotationBeforeResize(null);

        state.recordChange();
      }

      if (state.isDragging) {
        state.setIsDragging(false);

        state.recordChange();
      }

      if (state.isRotating) {
        state.setIsRotating(false);
        state.setRotateStart(null);

        state.recordChange();
      }

      if (state.isBoxSelecting && state.selectionBox) {
        const normalizedBox = normalizeBox(
          state.selectionBox.x,
          state.selectionBox.y,
          state.selectionBox.width,
          state.selectionBox.height
        );

        const selectedAnnotations = state.annotations.filter((annotation) =>
          checkIntersection(normalizedBox, annotation)
        );

        state.setSelectedAnnotationIds(selectedAnnotations.map((a) => a.id));

        if (selectedAnnotations.length === 1) {
          state.setSelectedAnnotationId(selectedAnnotations[0].id);
        } else {
          state.setSelectedAnnotationId(null);
        }

        state.setSelectionBox(null);
        state.setIsBoxSelecting(false);
      }

      if (state.isDrawing && state.currentAnnotation) {
        if (state.currentAnnotation.shape === Shape.Path) {
          handlePathDrawingCompletion();
          return;
        }

        const { x, y, width, height, shape } = state.currentAnnotation;
        const minSize = 0;

        if (
          x !== undefined &&
          y !== undefined &&
          width !== undefined &&
          height !== undefined &&
          (Math.abs(width) > minSize || Math.abs(height) > minSize)
        ) {
          let newAnnotation: Annotation;

          if (shape === Shape.Line || shape === Shape.Arrow) {
            newAnnotation = {
              id: uuidv4(),
              x,
              y,
              width,
              height,
              shape,
              comments: [],
            };
          } else {
            const normalizedX = width < 0 ? x + width : x;
            const normalizedY = height < 0 ? y + height : y;
            const normalizedWidth = Math.abs(width);
            const normalizedHeight = Math.abs(height);

            newAnnotation = {
              id: uuidv4(),
              x: normalizedX,
              y: normalizedY,
              width: normalizedWidth,
              height: normalizedHeight,
              shape: shape || Shape.Rectangle,
              comments: [],
            };
          }

          state.recordChange();
          state.setAnnotations((prev) => [...prev, newAnnotation]);
          state.setSelectedAnnotationId(newAnnotation.id);
        }

        state.setIsDrawing(false);
        state.setCurrentAnnotation(null);

        if (
          state.mode === Mode.Draw ||
          state.mode === Mode.DrawCircle ||
          state.mode === Mode.DrawLine ||
          state.mode === Mode.DrawArrow
        ) {
          state.setMode(Mode.Select);
        }
      }
    }
  };

  const handlePathDrawingCompletion = () => {
    if (
      !state.currentAnnotation ||
      !state.currentAnnotation.points ||
      state.currentAnnotation.points.length <= 1
    ) {
      state.setIsDrawing(false);
      state.setCurrentAnnotation(null);
      return;
    }

    const newAnnotation: Annotation = {
      id: uuidv4(),
      x: state.currentAnnotation.x || 0,
      y: state.currentAnnotation.y || 0,
      width: state.currentAnnotation.width || 0,
      height: state.currentAnnotation.height || 0,
      shape: Shape.Path,
      points: state.currentAnnotation.points,
      comments: [],
    };

    state.recordChange();
    state.setAnnotations((prev) => [...prev, newAnnotation]);
    state.setSelectedAnnotationId(newAnnotation.id);
    state.setIsDrawing(false);
    state.setCurrentAnnotation(null);
    state.setMode(Mode.Select);
  };

  return { handleCanvasMouseUp, handlePathDrawingCompletion };
}
