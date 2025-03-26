import { WheelEvent, MutableRefObject } from "react";
import { AnnotationState } from "@/types/annotation-state";

export function useWheelZoom(
  state: AnnotationState,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
) {
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomIntensity = 0.025;
    const delta = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(delta * zoomIntensity);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const minScale = 0.1;
    const maxScale = 10;
    const newScale = Math.min(Math.max(state.scale * zoom, minScale), maxScale);

    if (
      (state.scale === minScale && newScale === minScale) ||
      (state.scale === maxScale && newScale === maxScale)
    ) {
      return;
    }

    const newOffsetX =
      mouseX - (mouseX - state.offset.x) * (newScale / state.scale);
    const newOffsetY =
      mouseY - (mouseY - state.offset.y) * (newScale / state.scale);

    state.setScale(newScale);
    state.setOffset({ x: newOffsetX, y: newOffsetY });
  };

  return { handleWheel };
}
