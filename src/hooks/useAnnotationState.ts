import { useState, useEffect, useRef } from "react";
import { CanvasImage, Annotation, ResizeHandle } from "@/types/annotation";
import { Mode } from "@/types/enums";
import { centerImageInCanvas } from "@/utils/canvas";
import { useHistoryState } from "@/hooks/useHistoryState";
import { v4 as uuidv4 } from "uuid";

function generateUUID() {
  return uuidv4();
}

export function useAnnotationState(initialImage?: string | null) {
  const [currentImage, setCurrentImage] = useState<CanvasImage | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>(
    []
  );
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [rotateStart, setRotateStart] = useState<{
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    initialAngle: number;
  } | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.Select);
  const [previousMode, setPreviousMode] = useState<Mode>(Mode.Select);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentAnnotation, setCurrentAnnotation] =
    useState<Partial<Annotation> | null>(null);
  const [annotationBeforeResize, setAnnotationBeforeResize] =
    useState<Annotation | null>(null);
  const [hoverHandle, setHoverHandle] = useState<ResizeHandle | null>(null);

  const history = useHistoryState();

  const initialImageLoadedRef = useRef(false);

  const recordChange = () => {
    history.recordChange([...annotations]);
  };

  const updateAnnotations = (
    fn: (annotations: Annotation[]) => Annotation[]
  ) => {
    if (!isDragging && !isResizing && !isRotating) {
      recordChange();
    }
    setAnnotations(fn);
  };

  useEffect(() => {
    if (initialImage && !initialImageLoadedRef.current) {
      const img = new Image();

      img.onload = () => {
        initialImageLoadedRef.current = true;

        const aspectRatio = img.width / img.height;
        const imageId = generateUUID();
        const newImage: CanvasImage = {
          id: imageId,
          file: new File([], "initial-image.jpg"),
          dataUrl: initialImage,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          aspectRatio,
        };

        setCurrentImage(newImage);

        const newOffset = centerImageInCanvas(
          newImage,
          canvasSize.width,
          canvasSize.height
        );
        setOffset(newOffset);

        setScale(1);
      };

      img.onerror = () => {
        console.error("Failed to load initial image");
        initialImageLoadedRef.current = true;
      };

      img.src = initialImage;
    }
  }, [initialImage, canvasSize]);

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      if (annotations.length > 0) {
        const confirmed = window.confirm(
          "Uploading a new image will delete all your current annotations. Do you want to continue?"
        );
        if (!confirmed) return;
      }

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;

        setAnnotations([]);

        history.clearHistory();

        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const id = generateUUID();
          const newImage: CanvasImage = {
            id,
            file,
            dataUrl: event.target?.result as string,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            aspectRatio,
          };

          setCurrentImage(newImage);

          const newOffset = centerImageInCanvas(
            newImage,
            canvasSize.width,
            canvasSize.height
          );
          setOffset(newOffset);
          setScale(1);

          setSelectedAnnotationId(null);
          setSelectedAnnotationIds([]);
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotationIds.length > 0) {
      recordChange();
      setAnnotations((prev) =>
        prev.filter((anno) => !selectedAnnotationIds.includes(anno.id))
      );
      setSelectedAnnotationIds([]);
      setSelectedAnnotationId(null);
    } else if (selectedAnnotationId) {
      recordChange();
      setAnnotations((prev) =>
        prev.filter((anno) => anno.id !== selectedAnnotationId)
      );
      setSelectedAnnotationId(null);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 10));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1));
  };

  const updateMode = (newMode: Mode) => {
    if (mode !== Mode.Pan) {
      setPreviousMode(mode);
    }

    if (newMode === Mode.Pan) {
      setSelectedAnnotationId(null);
      setSelectedAnnotationIds([]);
    }
    setMode(newMode);
  };

  const startTemporaryPan = () => {
    if (mode !== Mode.Pan) {
      setPreviousMode(mode);
      setMode(Mode.Pan);
    }
  };

  const endTemporaryPan = () => {
    if (previousMode && mode === Mode.Pan) {
      setMode(previousMode);
    }
  };

  const undo = () => {
    if (history.canUndo) {
      const prevAnnotations = history.undo([...annotations]);

      setAnnotations(prevAnnotations);

      setSelectedAnnotationId(null);
      setSelectedAnnotationIds([]);
    }
  };

  const redo = () => {
    if (history.canRedo) {
      const nextAnnotations = history.redo([...annotations]);

      setAnnotations(nextAnnotations);

      setSelectedAnnotationId(null);
      setSelectedAnnotationIds([]);
    }
  };

  return {
    currentImage,
    setCurrentImage,
    annotations,
    setAnnotations: updateAnnotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedAnnotationIds,
    setSelectedAnnotationIds,
    isPanning,
    setIsPanning,
    isDrawing,
    setIsDrawing,
    isResizing,
    setIsResizing,
    isDragging,
    setIsDragging,
    isRotating,
    setIsRotating,
    isBoxSelecting,
    setIsBoxSelecting,
    dragStart,
    setDragStart,
    selectionBox,
    setSelectionBox,
    resizeHandle,
    setResizeHandle,
    resizeStart,
    setResizeStart,
    rotateStart,
    setRotateStart,
    mode,
    setMode: updateMode,
    drawStart,
    setDrawStart,
    panStart,
    setPanStart,
    offset,
    setOffset,
    scale,
    setScale,
    canvasSize,
    setCanvasSize,
    currentAnnotation,
    setCurrentAnnotation,
    annotationBeforeResize,
    setAnnotationBeforeResize,
    hoverHandle,
    setHoverHandle,
    deleteSelectedAnnotation,
    initialImage,
    startTemporaryPan,
    endTemporaryPan,
    handleFileUpload,
    handleZoomIn,
    handleZoomOut,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo,
    redo,
    recordChange,
  };
}
