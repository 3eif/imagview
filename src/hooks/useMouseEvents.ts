import { useRef } from "react";
import { AnnotationState } from "@/types/annotation-state";
import { useMouseDown } from "./mouse/useMouseDown";
import { useMouseMove } from "./mouse/useMouseMove";
import { useMouseUp } from "./mouse/useMouseUp";
import { useWheelZoom } from "./mouse/useWheelZoom";

export function useMouseEvents(
  state: AnnotationState,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  isSharedView = false
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { handleCanvasMouseDown } = useMouseDown(
    state,
    canvasRef,
    isSharedView
  );
  const { handleCanvasMouseMove } = useMouseMove(
    state,
    canvasRef,
    isSharedView
  );
  const { handleCanvasMouseUp } = useMouseUp(state, canvasRef, isSharedView);
  const { handleWheel } = useWheelZoom(state, canvasRef);

  return {
    containerRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleWheel,
  };
}
