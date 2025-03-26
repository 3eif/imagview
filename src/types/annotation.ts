import { Shape, ResizeHandle } from "./enums";

export interface Comment {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // Angle in radians
  shape: Shape;
  points?: { x: number; y: number }[]; // For path shape
  comments?: Comment[];
  minimizedComments?: boolean;
}

export interface CanvasImage {
  id: string;
  file: File;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export type { ResizeHandle };
