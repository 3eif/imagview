import { useState } from "react";
import { Annotation } from "@/types/annotation";

export type HistoryState = {
  past: Annotation[][];
  future: Annotation[][];
};

export function useHistoryState() {
  const [state, setState] = useState<HistoryState>({
    past: [],
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const recordChange = (currentAnnotations: Annotation[]) => {
    setState((prevState) => ({
      past: [...prevState.past, currentAnnotations],
      future: [],
    }));
  };

  const undo = (currentAnnotations: Annotation[]) => {
    if (!canUndo) return currentAnnotations;

    const newPast = [...state.past];
    const prevAnnotations = newPast.pop();

    setState({
      past: newPast,
      future: [currentAnnotations, ...state.future],
    });

    return prevAnnotations || [];
  };

  const redo = (currentAnnotations: Annotation[]) => {
    if (!canRedo) return currentAnnotations;

    const newFuture = [...state.future];
    const nextAnnotations = newFuture.shift();

    setState({
      past: [...state.past, currentAnnotations],
      future: newFuture,
    });

    return nextAnnotations || [];
  };

  const clearHistory = () => {
    setState({
      past: [],
      future: [],
    });
  };

  return {
    recordChange,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  };
}
