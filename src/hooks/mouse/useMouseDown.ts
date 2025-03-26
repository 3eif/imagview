import { MouseEvent, MutableRefObject } from "react";
import { AnnotationState } from "@/types/annotation-state";
import {
  isPointInAnnotation,
  isMouseOverAnnotationBorder,
  getResizeHandleAtPosition,
} from "@/utils/canvas";
import { Mode, Shape } from "@/types/enums";

export function useMouseDown(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  isSharedView = false
) {
  const handleCanvasMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY, button } = e;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left - state.offset.x) / state.scale;
    const mouseY = (clientY - rect.top - state.offset.y) / state.scale;

    // Support middle-click panning (always allowed)
    if (button === 1) {
      state.setPanStart({ x: clientX, y: clientY });
      state.setIsPanning(true);
      e.preventDefault();
      return;
    }

    // Handle pan mode before checking annotations
    if (state.mode === Mode.Pan) {
      state.setPanStart({ x: clientX, y: clientY });
      state.setIsPanning(true);
      e.preventDefault();
      return;
    }

    if (isSharedView) {
      if (state.mode === Mode.Select) {
        let clickedAnnotation = false;

        for (let i = state.annotations.length - 1; i >= 0; i--) {
          const anno = state.annotations[i];
          if (
            isPointInAnnotation(mouseX, mouseY, anno) ||
            isMouseOverAnnotationBorder(mouseX, mouseY, anno, state.scale)
          ) {
            if (!e.shiftKey) {
              state.setSelectedAnnotationIds([]);
              state.setSelectedAnnotationId(anno.id);
            } else {
              if (state.selectedAnnotationIds.includes(anno.id)) {
                state.setSelectedAnnotationIds(
                  state.selectedAnnotationIds.filter((id) => id !== anno.id)
                );
              } else {
                state.setSelectedAnnotationIds([
                  ...state.selectedAnnotationIds,
                  anno.id,
                ]);
              }
              state.setSelectedAnnotationId(null);
            }
            clickedAnnotation = true;
            break;
          }
        }

        if (!clickedAnnotation && !e.shiftKey) {
          state.setSelectedAnnotationId(null);
          state.setSelectedAnnotationIds([]);
        }
      }
      return;
    }

    // Regular (non-shared view) handling continues below
    if (state.selectedAnnotationId) {
      const selectedAnnotation = state.annotations.find(
        (a) => a.id === state.selectedAnnotationId
      );

      if (selectedAnnotation) {
        const handle = getResizeHandleAtPosition(
          mouseX,
          mouseY,
          selectedAnnotation,
          state.scale
        );

        if (handle) {
          if (handle === "rotate") {
            state.recordChange();
            state.setIsDragging(false);
            state.setIsRotating(true);

            const centerX = selectedAnnotation.x + selectedAnnotation.width / 2;
            const centerY =
              selectedAnnotation.y + selectedAnnotation.height / 2;

            state.setRotateStart({
              x: mouseX,
              y: mouseY,
              centerX,
              centerY,
              startAngle: selectedAnnotation.rotation || 0,
              initialAngle: Math.atan2(mouseY - centerY, mouseX - centerX),
            });
            return;
          } else {
            state.recordChange();
            state.setResizeHandle(handle);
            state.setResizeStart({ x: mouseX, y: mouseY });
            state.setAnnotationBeforeResize({ ...selectedAnnotation });
            state.setIsResizing(true);
            return;
          }
        }

        if (
          isPointInAnnotation(mouseX, mouseY, selectedAnnotation) ||
          isMouseOverAnnotationBorder(
            mouseX,
            mouseY,
            selectedAnnotation,
            state.scale
          )
        ) {
          state.recordChange();
          state.setDragStart({ x: mouseX, y: mouseY });
          state.setIsDragging(true);
          return;
        }
      }
    }

    if (state.mode === Mode.Select) {
      let clickedAnnotation = false;

      for (let i = state.annotations.length - 1; i >= 0; i--) {
        const anno = state.annotations[i];
        if (
          isPointInAnnotation(mouseX, mouseY, anno) ||
          isMouseOverAnnotationBorder(mouseX, mouseY, anno, state.scale)
        ) {
          if (!e.shiftKey) {
            state.setSelectedAnnotationIds([]);
            state.setSelectedAnnotationId(anno.id);
          } else {
            if (state.selectedAnnotationIds.includes(anno.id)) {
              state.setSelectedAnnotationIds(
                state.selectedAnnotationIds.filter((id) => id !== anno.id)
              );
            } else {
              state.setSelectedAnnotationIds([
                ...state.selectedAnnotationIds,
                anno.id,
              ]);
            }
            state.setSelectedAnnotationId(null);
          }

          if (isMouseOverAnnotationBorder(mouseX, mouseY, anno, state.scale)) {
            state.setDragStart({ x: mouseX, y: mouseY });
            state.setIsDragging(true);
            state.recordChange();
          }

          clickedAnnotation = true;
          break;
        }
      }

      if (!clickedAnnotation) {
        if (
          !e.shiftKey &&
          (state.selectedAnnotationId || state.selectedAnnotationIds.length > 0)
        ) {
          state.setSelectedAnnotationId(null);
          state.setSelectedAnnotationIds([]);
        }

        state.setIsBoxSelecting(true);
        state.setDragStart({ x: mouseX, y: mouseY });
        state.setSelectionBox({
          x: mouseX,
          y: mouseY,
          width: 0,
          height: 0,
        });
      }
    }

    if (
      (state.mode === Mode.Draw ||
        state.mode === Mode.DrawCircle ||
        state.mode === Mode.DrawLine ||
        state.mode === Mode.DrawArrow ||
        state.mode === Mode.DrawPen) &&
      state.currentImage
    ) {
      // Check if mouse is within image bounds
      if (
        mouseX >= state.currentImage.x &&
        mouseX <= state.currentImage.x + state.currentImage.width &&
        mouseY >= state.currentImage.y &&
        mouseY <= state.currentImage.y + state.currentImage.height
      ) {
        state.setSelectedAnnotationId(null);
        state.setSelectedAnnotationIds([]);

        if (state.mode === Mode.DrawPen) {
          state.setCurrentAnnotation({
            x: mouseX,
            y: mouseY,
            width: 0,
            height: 0,
            shape: Shape.Path,
            points: [{ x: mouseX, y: mouseY }],
          });
          state.setIsDrawing(true);
        } else {
          state.setDrawStart({ x: mouseX, y: mouseY });
          state.setCurrentAnnotation({
            x: mouseX,
            y: mouseY,
            width: 0,
            height: 0,
            shape:
              state.mode === Mode.DrawCircle
                ? Shape.Circle
                : state.mode === Mode.DrawLine
                ? Shape.Line
                : state.mode === Mode.DrawArrow
                ? Shape.Arrow
                : Shape.Rectangle,
          });
          state.setIsDrawing(true);
        }
      }
    }
  };

  return { handleCanvasMouseDown };
}
