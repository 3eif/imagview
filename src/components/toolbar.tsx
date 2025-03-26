import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Square,
  Hand,
  MousePointer,
  Circle,
  Minus,
  ArrowRight,
  Undo2,
  Redo2,
  PenTool,
} from "lucide-react";
import { Mode } from "@/types/enums";
import { MODE_SHORTCUTS } from "@/utils/keyboard-shortcuts";
import { ShareButton } from "./share-button";
import { Annotation } from "@/types/annotation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onFileUpload: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isDisabled?: boolean;
  isSharedView?: boolean;
  imageId?: string | null;
  currentFile?: File | null;
  annotations?: Annotation[];
}

export function Toolbar({
  mode,
  onModeChange,
  onFileUpload,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isDisabled = false,
  isSharedView = false,
  imageId = null,
  currentFile = null,
  annotations = [],
}: ToolbarProps) {
  return (
    <div className="flex gap-2 bg-zinc-900/60 border backdrop-blur-md p-2 rounded-lg shadow-lg">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onFileUpload}
            title="Upload Images"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col">
            <span>Upload Image</span>
            <span className="text-xs text-zinc-400">
              Uploading a new image will replace the current one
            </span>
          </div>
        </TooltipContent>
      </Tooltip>

      <ShareButton
        imageId={imageId}
        isDisabled={isDisabled}
        currentFile={currentFile}
        annotations={annotations}
        isSharedView={isSharedView}
      />

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant={mode === Mode.Select ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.Select)}
        title={`Select Mode (${MODE_SHORTCUTS[Mode.Select]})`}
        className="relative"
        disabled={isDisabled}
        style={isDisabled ? { cursor: "not-allowed" } : undefined}
      >
        <MousePointer className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.Select]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.Pan ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.Pan)}
        title={`Pan Mode (${MODE_SHORTCUTS[Mode.Pan]})`}
        className="relative"
        disabled={isDisabled}
        style={isDisabled ? { cursor: "not-allowed" } : undefined}
      >
        <Hand className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.Pan]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.Draw ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.Draw)}
        title={`Draw Rectangle (${MODE_SHORTCUTS[Mode.Draw]})`}
        className="relative"
        disabled={isDisabled || isSharedView}
        style={
          isDisabled || isSharedView ? { cursor: "not-allowed" } : undefined
        }
      >
        <Square className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.Draw]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.DrawCircle ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.DrawCircle)}
        title={`Draw Circle (${MODE_SHORTCUTS[Mode.DrawCircle]})`}
        className="relative"
        disabled={isDisabled || isSharedView}
        style={
          isDisabled || isSharedView ? { cursor: "not-allowed" } : undefined
        }
      >
        <Circle className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.DrawCircle]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.DrawArrow ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.DrawArrow)}
        title={`Draw Arrow (${MODE_SHORTCUTS[Mode.DrawArrow]})`}
        className="relative"
        disabled={isDisabled || isSharedView}
        style={
          isDisabled || isSharedView ? { cursor: "not-allowed" } : undefined
        }
      >
        <ArrowRight className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.DrawArrow]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.DrawLine ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.DrawLine)}
        title={`Draw Line (${MODE_SHORTCUTS[Mode.DrawLine]})`}
        className="relative"
        disabled={isDisabled || isSharedView}
        style={
          isDisabled || isSharedView ? { cursor: "not-allowed" } : undefined
        }
      >
        <Minus className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.DrawLine]}
        </span>
      </Button>
      <Button
        variant={mode === Mode.DrawPen ? "default" : "outline"}
        size="icon"
        onClick={() => onModeChange(Mode.DrawPen)}
        title={`Draw Pen (${MODE_SHORTCUTS[Mode.DrawPen]})`}
        className="relative"
        disabled={isDisabled || isSharedView}
        style={
          isDisabled || isSharedView ? { cursor: "not-allowed" } : undefined
        }
      >
        <PenTool className="h-4 w-4" />
        <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-70">
          {MODE_SHORTCUTS[Mode.DrawPen]}
        </span>
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo || isDisabled || isSharedView}
        style={
          !canUndo || isDisabled || isSharedView
            ? { cursor: "not-allowed" }
            : undefined
        }
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo || isDisabled || isSharedView}
        style={
          !canRedo || isDisabled || isSharedView
            ? { cursor: "not-allowed" }
            : undefined
        }
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
