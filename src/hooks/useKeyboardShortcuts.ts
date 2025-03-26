import { useEffect } from "react";
import { Mode } from "@/types/enums";
import { AnnotationState } from "@/types/annotation-state";
import { MODE_SHORTCUTS } from "@/utils/keyboard-shortcuts";

interface UseKeyboardShortcutsProps {
  onModeChange: (mode: Mode) => void;
  currentMode: Mode;
  annotationState?: AnnotationState;
  isSharedView?: boolean;
}

export function useKeyboardShortcuts({
  onModeChange,
  currentMode,
  annotationState,
  isSharedView = false,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        isSharedView &&
        (e.ctrlKey || e.metaKey) &&
        (e.key === "z" || e.key === "y")
      ) {
        e.preventDefault();
        return;
      }

      if (
        !isSharedView &&
        (e.key === "Delete" || e.key === "Backspace") &&
        annotationState
      ) {
        annotationState.deleteSelectedAnnotation();
        return;
      }

      if (isSharedView) {
        if (e.key === MODE_SHORTCUTS[Mode.Select]) {
          onModeChange(Mode.Select);
          return;
        } else if (e.key === MODE_SHORTCUTS[Mode.Pan]) {
          onModeChange(Mode.Pan);
          return;
        }
      } else {
        const entries = Object.entries(MODE_SHORTCUTS) as [Mode, string][];
        for (const [mode, shortcut] of entries) {
          if (e.key === shortcut) {
            onModeChange(mode);
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onModeChange, currentMode, annotationState, isSharedView]);
}
