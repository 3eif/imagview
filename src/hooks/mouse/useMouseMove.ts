import { MouseEvent, MutableRefObject } from "react";
import { AnnotationState } from "@/types/annotation-state";
import {
  getResizeHandleAtPosition,
  isPointInAnnotation,
  isMouseOverAnnotationBorder,
} from "@/utils/canvas";
import { unrotatePoint } from "../../utils/transform";
import { Annotation } from "@/types/annotation";
import { Mode, Shape, ResizeHandle, CursorStyle } from "@/types/enums";

export function useMouseMove(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  isSharedView = false
) {
  const handleCanvasMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = e;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left - state.offset.x) / state.scale;
    const mouseY = (clientY - rect.top - state.offset.y) / state.scale;

    canvas.style.cursor = CursorStyle.Default;

    // Always allow panning
    if (state.isPanning) {
      const dx = clientX - state.panStart.x;
      const dy = clientY - state.panStart.y;

      state.setOffset({
        x: state.offset.x + dx,
        y: state.offset.y + dy,
      });
      state.setPanStart({ x: clientX, y: clientY });
      canvas.style.cursor = CursorStyle.Grabbing;
      return;
    } else if (state.mode === Mode.Pan) {
      canvas.style.cursor = CursorStyle.Grab;
    }

    if (isSharedView && state.mode === Mode.Select) {
      for (const anno of state.annotations) {
        if (
          isPointInAnnotation(mouseX, mouseY, anno) ||
          isMouseOverAnnotationBorder(mouseX, mouseY, anno, state.scale)
        ) {
          canvas.style.cursor = "pointer";
          break;
        }
      }
      return;
    }

    if (!isSharedView) {
      if (
        state.selectedAnnotationId &&
        !state.isResizing &&
        !state.isPanning &&
        !state.isDragging
      ) {
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
          state.setHoverHandle(handle);

          if (handle) {
            let cursor = CursorStyle.Default;
            switch (handle) {
              case ResizeHandle.NW:
              case ResizeHandle.SE:
                cursor = CursorStyle.NwseResize;
                break;
              case ResizeHandle.NE:
              case ResizeHandle.SW:
                cursor = CursorStyle.NeswResize;
                break;
              case ResizeHandle.N:
              case ResizeHandle.S:
                cursor = CursorStyle.NsResize;
                break;
              case ResizeHandle.E:
              case ResizeHandle.W:
                cursor = CursorStyle.EwResize;
                break;
              case ResizeHandle.Rotate:
                cursor = CursorStyle.Grab;
                break;
            }
            canvas.style.cursor = cursor;
          }
        }
      }

      if (state.isBoxSelecting) {
        const width = mouseX - state.dragStart.x;
        const height = mouseY - state.dragStart.y;

        state.setSelectionBox({
          x: state.dragStart.x,
          y: state.dragStart.y,
          width,
          height,
        });

        canvas.style.cursor = CursorStyle.Crosshair;
      } else if (state.isDragging && state.selectedAnnotationId) {
        const deltaX = mouseX - state.dragStart.x;
        const deltaY = mouseY - state.dragStart.y;

        state.setAnnotations((prev) =>
          prev.map((anno) => {
            if (anno.id === state.selectedAnnotationId) {
              if (
                anno.shape === Shape.Path &&
                anno.points &&
                anno.points.length > 0
              ) {
                const newPoints = anno.points.map((point) => ({
                  x: point.x + deltaX,
                  y: point.y + deltaY,
                }));

                let minX = Infinity,
                  minY = Infinity,
                  maxX = -Infinity,
                  maxY = -Infinity;
                for (const point of newPoints) {
                  minX = Math.min(minX, point.x);
                  minY = Math.min(minY, point.y);
                  maxX = Math.max(maxX, point.x);
                  maxY = Math.max(maxY, point.y);
                }

                return {
                  ...anno,
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY,
                  points: newPoints,
                };
              }

              return {
                ...anno,
                x: anno.x + deltaX,
                y: anno.y + deltaY,
              };
            }
            return anno;
          })
        );

        state.setDragStart({ x: mouseX, y: mouseY });
      } else if (
        state.isResizing &&
        state.resizeHandle &&
        state.annotationBeforeResize
      ) {
        handleResize(mouseX, mouseY, state);
      } else if (
        state.isDrawing &&
        (state.mode === Mode.Draw ||
          state.mode === Mode.DrawCircle ||
          state.mode === Mode.DrawLine ||
          state.mode === Mode.DrawArrow)
      ) {
        if (!state.currentAnnotation) return;

        const width = mouseX - state.drawStart.x;
        const height = mouseY - state.drawStart.y;

        state.setCurrentAnnotation({
          ...state.currentAnnotation,
          width,
          height,
        });
      }

      if (state.isRotating && state.rotateStart && state.selectedAnnotationId) {
        const { centerX, centerY, initialAngle, startAngle } =
          state.rotateStart;

        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
        const angleChange = currentAngle - initialAngle;
        const newRotation = startAngle + angleChange;

        state.setAnnotations((prev) =>
          prev.map((anno) =>
            anno.id === state.selectedAnnotationId
              ? { ...anno, rotation: newRotation }
              : anno
          )
        );

        canvas.style.cursor = CursorStyle.Grabbing;
        return;
      }

      if (
        state.isDrawing &&
        state.currentAnnotation &&
        state.currentAnnotation.shape === Shape.Path
      ) {
        if (state.currentAnnotation.points) {
          const newPoints = [
            ...state.currentAnnotation.points,
            { x: mouseX, y: mouseY },
          ];

          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          for (const point of newPoints) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          }

          state.setCurrentAnnotation({
            ...state.currentAnnotation,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            points: newPoints,
          });
        }
      }
    }
  };

  const handleResize = (
    mouseX: number,
    mouseY: number,
    state: AnnotationState
  ) => {
    if (!state.resizeHandle || !state.annotationBeforeResize) return;

    const originalAnnotation = state.annotationBeforeResize;
    const newAnnotation = { ...originalAnnotation };

    if (
      originalAnnotation.rotation &&
      (originalAnnotation.shape === Shape.Rectangle ||
        originalAnnotation.shape === Shape.Circle ||
        originalAnnotation.shape === Shape.Path)
    ) {
      const centerX = originalAnnotation.x + originalAnnotation.width / 2;
      const centerY = originalAnnotation.y + originalAnnotation.height / 2;

      const localMouse = unrotatePoint(
        mouseX,
        mouseY,
        centerX,
        centerY,
        originalAnnotation.rotation
      );
      const localResizeStart = unrotatePoint(
        state.resizeStart.x,
        state.resizeStart.y,
        centerX,
        centerY,
        originalAnnotation.rotation
      );

      const localDeltaX = localMouse.x - localResizeStart.x;
      const localDeltaY = localMouse.y - localResizeStart.y;

      handleResizeWithDeltas(
        localDeltaX,
        localDeltaY,
        state,
        originalAnnotation,
        newAnnotation
      );

      // After resizing, ensure the center point stays in place for rotated objects
      if (
        newAnnotation.shape !== Shape.Line &&
        newAnnotation.shape !== Shape.Arrow
      ) {
        const newCenterX = newAnnotation.x + newAnnotation.width / 2;
        const newCenterY = newAnnotation.y + newAnnotation.height / 2;

        // Adjust position to keep the center point in the same place
        if (newCenterX !== centerX || newCenterY !== centerY) {
          newAnnotation.x += centerX - newCenterX;
          newAnnotation.y += centerY - newCenterY;
        }
      }
    } else {
      // Standard resize without rotation
      const deltaX = mouseX - state.resizeStart.x;
      const deltaY = mouseY - state.resizeStart.y;

      handleResizeWithDeltas(
        deltaX,
        deltaY,
        state,
        originalAnnotation,
        newAnnotation
      );
    }

    state.setAnnotations((prev) =>
      prev.map((a) => (a.id === state.selectedAnnotationId ? newAnnotation : a))
    );
  };

  const handleResizeWithDeltas = (
    deltaX: number,
    deltaY: number,
    state: AnnotationState,
    originalAnnotation: Annotation,
    newAnnotation: Annotation
  ) => {
    if (originalAnnotation.shape === Shape.Path && originalAnnotation.points) {
      // For path shape scale all points
      const centerX = originalAnnotation.x + originalAnnotation.width / 2;
      const centerY = originalAnnotation.y + originalAnnotation.height / 2;

      let scaleX = 1;
      let scaleY = 1;

      let mirrorX = false;
      let mirrorY = false;

      switch (state.resizeHandle) {
        case ResizeHandle.NW:
          scaleX =
            (originalAnnotation.width - deltaX) / originalAnnotation.width;
          scaleY =
            (originalAnnotation.height - deltaY) / originalAnnotation.height;
          if (scaleX < 0) mirrorX = true;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.N:
          scaleY =
            (originalAnnotation.height - deltaY) / originalAnnotation.height;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.NE:
          scaleX =
            (originalAnnotation.width + deltaX) / originalAnnotation.width;
          scaleY =
            (originalAnnotation.height - deltaY) / originalAnnotation.height;
          if (scaleX < 0) mirrorX = true;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.E:
          scaleX =
            (originalAnnotation.width + deltaX) / originalAnnotation.width;
          if (scaleX < 0) mirrorX = true;
          break;
        case ResizeHandle.SE:
          scaleX =
            (originalAnnotation.width + deltaX) / originalAnnotation.width;
          scaleY =
            (originalAnnotation.height + deltaY) / originalAnnotation.height;
          if (scaleX < 0) mirrorX = true;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.S:
          scaleY =
            (originalAnnotation.height + deltaY) / originalAnnotation.height;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.SW:
          scaleX =
            (originalAnnotation.width - deltaX) / originalAnnotation.width;
          scaleY =
            (originalAnnotation.height + deltaY) / originalAnnotation.height;
          if (scaleX < 0) mirrorX = true;
          if (scaleY < 0) mirrorY = true;
          break;
        case ResizeHandle.W:
          scaleX =
            (originalAnnotation.width - deltaX) / originalAnnotation.width;
          if (scaleX < 0) mirrorX = true;
          break;
      }

      scaleX = Math.abs(scaleX);
      scaleY = Math.abs(scaleY);

      scaleX = Math.max(0.0001, scaleX);
      scaleY = Math.max(0.0001, scaleY);

      const newPoints = originalAnnotation.points.map(
        (point: { x: number; y: number }) => {
          const dx = point.x - centerX;
          const dy = point.y - centerY;

          const mirroredDx = mirrorX ? -dx : dx;
          const mirroredDy = mirrorY ? -dy : dy;

          return {
            x: centerX + mirroredDx * scaleX,
            y: centerY + mirroredDy * scaleY,
          };
        }
      );

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const point of newPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }

      newAnnotation.x = minX;
      newAnnotation.y = minY;
      newAnnotation.width = maxX - minX;
      newAnnotation.height = maxY - minY;
      newAnnotation.points = newPoints;
    }
    // Handle lines and arrows specially to maintain direction
    else if (
      originalAnnotation.shape === Shape.Line ||
      originalAnnotation.shape === Shape.Arrow
    ) {
      if (state.resizeHandle === ResizeHandle.NW) {
        newAnnotation.x = originalAnnotation.x + deltaX;
        newAnnotation.y = originalAnnotation.y + deltaY;
        newAnnotation.width = originalAnnotation.width - deltaX;
        newAnnotation.height = originalAnnotation.height - deltaY;
      } else if (state.resizeHandle === ResizeHandle.SE) {
        newAnnotation.width = originalAnnotation.width + deltaX;
        newAnnotation.height = originalAnnotation.height + deltaY;
      }
    } else {
      // Standard resize handling for rectangles and circles
      switch (state.resizeHandle) {
        case ResizeHandle.NW:
          newAnnotation.x = originalAnnotation.x + deltaX;
          newAnnotation.width = originalAnnotation.width - deltaX;
          newAnnotation.y = originalAnnotation.y + deltaY;
          newAnnotation.height = originalAnnotation.height - deltaY;
          break;
        case ResizeHandle.N:
          newAnnotation.y = originalAnnotation.y + deltaY;
          newAnnotation.height = originalAnnotation.height - deltaY;
          break;
        case ResizeHandle.NE:
          newAnnotation.width = originalAnnotation.width + deltaX;
          newAnnotation.y = originalAnnotation.y + deltaY;
          newAnnotation.height = originalAnnotation.height - deltaY;
          break;
        case ResizeHandle.E:
          newAnnotation.width = originalAnnotation.width + deltaX;
          break;
        case ResizeHandle.SE:
          newAnnotation.width = originalAnnotation.width + deltaX;
          newAnnotation.height = originalAnnotation.height + deltaY;
          break;
        case ResizeHandle.S:
          newAnnotation.height = originalAnnotation.height + deltaY;
          break;
        case ResizeHandle.SW:
          newAnnotation.x = originalAnnotation.x + deltaX;
          newAnnotation.width = originalAnnotation.width - deltaX;
          newAnnotation.height = originalAnnotation.height + deltaY;
          break;
        case ResizeHandle.W:
          newAnnotation.x = originalAnnotation.x + deltaX;
          newAnnotation.width = originalAnnotation.width - deltaX;
          break;
      }
    }

    // If width or height becomes negative, flip the annotation
    if (newAnnotation.width < 0) {
      if (
        newAnnotation.shape === Shape.Line ||
        newAnnotation.shape === Shape.Arrow
      ) {
        const oldStartX = newAnnotation.x;
        const oldStartY = newAnnotation.y;
        const oldEndX = newAnnotation.x + newAnnotation.width; // This is negative
        const oldEndY = newAnnotation.y + newAnnotation.height;

        newAnnotation.x = oldEndX;
        newAnnotation.y = oldEndY;
        // Flip width and height
        newAnnotation.width = -newAnnotation.width;

        if (newAnnotation.height !== 0) {
          const heightRatio = (oldStartY - oldEndY) / (oldStartX - oldEndX);
          newAnnotation.height = newAnnotation.width * heightRatio;
        }
      } else {
        newAnnotation.x += newAnnotation.width;
        newAnnotation.width = Math.abs(newAnnotation.width);
      }
    }

    if (
      newAnnotation.height < 0 &&
      newAnnotation.shape !== Shape.Line &&
      newAnnotation.shape !== Shape.Arrow
    ) {
      newAnnotation.y += newAnnotation.height;
      newAnnotation.height = Math.abs(newAnnotation.height);
    }
  };

  return { handleCanvasMouseMove };
}
