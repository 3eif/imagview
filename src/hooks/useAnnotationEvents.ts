import { MutableRefObject, useState, useRef } from "react";
import { AnnotationState } from "@/types/annotation-state";
import { useMouseEvents } from "./useMouseEvents";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useCanvasEffects } from "./useCanvasEffects";
import { Mode } from "@/types/enums";
import { useWheelZoom } from "./mouse/useWheelZoom";

export function useAnnotationEvents(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  isSharedView = false
) {
  const [currentMode, setCurrentMode] = useState<Mode>(state.mode);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useKeyboardShortcuts({
    onModeChange: (mode) => {
      state.setMode(mode);
      setCurrentMode(mode);
    },
    currentMode,
    annotationState: state,
    isSharedView,
  });

  const { handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp } =
    useMouseEvents(state, canvasRef, isSharedView);

  const { handleWheel } = useWheelZoom(state, canvasRef);

  useCanvasEffects(state, canvasRef, containerRef, isSharedView);

  return {
    containerRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleWheel,
  };
}
