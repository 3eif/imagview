import { Annotation, CanvasImage, ResizeHandle } from "./annotation";
import { Mode } from "./enums";

export type AnnotationState = {
  currentImage: CanvasImage | null;
  setCurrentImage: (image: CanvasImage | null) => void;
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: (id: string | null) => void;
  selectedAnnotationIds: string[];
  setSelectedAnnotationIds: (ids: string[]) => void;
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isRotating: boolean;
  setIsRotating: (isRotating: boolean) => void;
  isBoxSelecting: boolean;
  setIsBoxSelecting: (isBoxSelecting: boolean) => void;
  dragStart: { x: number; y: number };
  setDragStart: (dragStart: { x: number; y: number }) => void;
  drawStart: { x: number; y: number };
  setDrawStart: (drawStart: { x: number; y: number }) => void;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  setSelectionBox: (
    selectionBox: { x: number; y: number; width: number; height: number } | null
  ) => void;
  resizeHandle: ResizeHandle | null;
  setResizeHandle: (resizeHandle: ResizeHandle | null) => void;
  resizeStart: { x: number; y: number };
  setResizeStart: (resizeStart: { x: number; y: number }) => void;
  rotateStart: {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    initialAngle: number;
  } | null;
  setRotateStart: (
    rotateStart: {
      x: number;
      y: number;
      centerX: number;
      centerY: number;
      startAngle: number;
      initialAngle: number;
    } | null
  ) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  panStart: { x: number; y: number };
  setPanStart: (panStart: { x: number; y: number }) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  scale: number;
  setScale: (scale: number) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
  currentAnnotation: Partial<Annotation> | null;
  setCurrentAnnotation: (currentAnnotation: Partial<Annotation> | null) => void;
  annotationBeforeResize: Annotation | null;
  setAnnotationBeforeResize: (annotation: Annotation | null) => void;
  hoverHandle: ResizeHandle | null;
  setHoverHandle: (handle: ResizeHandle | null) => void;
  deleteSelectedAnnotation: () => void;
  startTemporaryPan: () => void;
  endTemporaryPan: () => void;
  handleFileUpload: (files: FileList) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordChange: () => void;
  setAnnotations: (fn: (annotations: Annotation[]) => Annotation[]) => void;
};
