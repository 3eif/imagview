import { Mode } from "@/types/enums";
import { CanvasImage } from "@/types/annotation";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getModeShortcut } from "@/utils/keyboard-shortcuts";

interface StatusBarProps {
  mode: Mode;
  scale: number;
  selectedImage: CanvasImage | null;
  annotationCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isDisabled?: boolean;
  isSharedView?: boolean;
}

export function StatusBar({
  mode,
  scale,
  selectedImage,
  annotationCount,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isDisabled = false,
  isSharedView = false,
}: StatusBarProps) {
  const [showZoomControls, setShowZoomControls] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-zinc-900/60 backdrop-blur-md border-t flex items-center justify-between px-4 text-xs text-white/70">
      <div className="flex gap-3">
        <div>
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          <span className="ml-1 text-white/40">({getModeShortcut(mode)})</span>
        </div>
        {selectedImage && (
          <>
            <div>{selectedImage.file.name}</div>
            <div>
              {selectedImage.width} × {selectedImage.height}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {isSharedView && (
          <div className="text-yellow-400 font-medium">Read-only view</div>
        )}
        <div>Annotations: {annotationCount}</div>

        <div className="relative">
          <div
            className={isDisabled ? "" : "cursor-pointer hover:text-white"}
            onClick={() =>
              !isDisabled && setShowZoomControls(!showZoomControls)
            }
            style={isDisabled ? { cursor: "not-allowed" } : undefined}
          >
            Zoom: {Math.round(scale * 100)}%
          </div>

          {showZoomControls && (
            <div className="absolute bottom-6 right-0 bg-zinc-900/90 backdrop-blur-md border rounded-lg shadow-lg p-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomIn}
                className="flex items-center gap-1 h-7 px-2"
                disabled={isDisabled}
                style={isDisabled ? { cursor: "not-allowed" } : undefined}
              >
                <ZoomIn className="h-3 w-3" /> Zoom In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomOut}
                className="flex items-center gap-1 h-7 px-2"
                disabled={isDisabled}
                style={isDisabled ? { cursor: "not-allowed" } : undefined}
              >
                <ZoomOut className="h-3 w-3" /> Zoom Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomReset}
                className="flex items-center gap-1 h-7 px-2"
                disabled={isDisabled}
                style={isDisabled ? { cursor: "not-allowed" } : undefined}
              >
                <RotateCcw className="h-3 w-3" /> Reset Zoom
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
