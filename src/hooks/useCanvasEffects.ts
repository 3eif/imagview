import { useEffect, MutableRefObject } from "react";
import { renderCanvas } from "@/utils/canvas-render";
import { AnnotationState } from "@/types/annotation-state";

export function useCanvasEffects(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  containerRef: MutableRefObject<HTMLDivElement | null>,
  isSharedView = false
) {
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        state.setCanvasSize({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [state.setCanvasSize]);

  useEffect(() => {
    renderCanvas(
      canvasRef.current,
      state.currentImage,
      state.annotations,
      state.offset,
      state.scale,
      state.selectedAnnotationId,
      state.currentAnnotation,
      state.isDrawing,
      state.resizeHandle,
      state.selectionBox,
      state.selectedAnnotationIds,
      isSharedView
    );
  }, [
    state.currentImage,
    state.annotations,
    state.offset,
    state.scale,
    state.selectedAnnotationId,
    state.selectedAnnotationIds,
    state.canvasSize,
    state.currentAnnotation,
    state.resizeHandle,
    state.isDrawing,
    state.isRotating,
    state.selectionBox,
    isSharedView,
  ]);
}
