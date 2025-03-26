import { Annotation, CanvasImage } from "@/types/annotation";
import { unrotatePoint } from "./transform";
import { Shape, ResizeHandle } from "@/types/enums";

export const isPointInAnnotation = (
  x: number,
  y: number,
  annotation: Annotation
): boolean => {
  if (annotation.shape === Shape.Line || annotation.shape === Shape.Arrow) {
    const lineStartX = annotation.x;
    const lineStartY = annotation.y;
    const lineEndX = annotation.x + annotation.width;
    const lineEndY = annotation.y + annotation.height;

    const distance = distanceToLineSegment(
      lineStartX,
      lineStartY,
      lineEndX,
      lineEndY,
      x,
      y
    );

    return distance <= 5;
  }

  if (
    annotation.shape === Shape.Path &&
    annotation.points &&
    annotation.points.length > 1
  ) {
    const isInsideBoundingBox =
      x >= annotation.x &&
      x <= annotation.x + annotation.width &&
      y >= annotation.y &&
      y <= annotation.y + annotation.height;

    if (isInsideBoundingBox) {
      return true;
    }

    for (let i = 0; i < annotation.points.length - 1; i++) {
      const startX = annotation.points[i].x;
      const startY = annotation.points[i].y;
      const endX = annotation.points[i + 1].x;
      const endY = annotation.points[i + 1].y;

      const distance = distanceToLineSegment(startX, startY, endX, endY, x, y);

      if (distance <= 5) {
        return true;
      }
    }
    return false;
  }

  if (
    annotation.rotation &&
    (annotation.shape === Shape.Rectangle ||
      annotation.shape === Shape.Circle ||
      annotation.shape === Shape.Path)
  ) {
    const centerX = annotation.x + annotation.width / 2;
    const centerY = annotation.y + annotation.height / 2;

    const translatedX = x - centerX;
    const translatedY = y - centerY;

    const rotation = annotation.rotation;
    const rotatedX =
      translatedX * Math.cos(-rotation) - translatedY * Math.sin(-rotation);
    const rotatedY =
      translatedX * Math.sin(-rotation) + translatedY * Math.cos(-rotation);

    const finalX = rotatedX + centerX;
    const finalY = rotatedY + centerY;

    if (annotation.shape === Shape.Circle) {
      const radiusX = annotation.width / 2;
      const radiusY = annotation.height / 2;

      return (
        Math.pow(finalX - centerX, 2) / Math.pow(radiusX, 2) +
          Math.pow(finalY - centerY, 2) / Math.pow(radiusY, 2) <=
        1
      );
    }

    return (
      finalX >= annotation.x &&
      finalX <= annotation.x + annotation.width &&
      finalY >= annotation.y &&
      finalY <= annotation.y + annotation.height
    );
  }

  if (annotation.shape === "circle") {
    const centerX = annotation.x + annotation.width / 2;
    const centerY = annotation.y + annotation.height / 2;
    const radiusX = annotation.width / 2;
    const radiusY = annotation.height / 2;

    return (
      Math.pow(x - centerX, 2) / Math.pow(radiusX, 2) +
        Math.pow(y - centerY, 2) / Math.pow(radiusY, 2) <=
      1
    );
  }

  return (
    x >= annotation.x &&
    x <= annotation.x + annotation.width &&
    y >= annotation.y &&
    y <= annotation.y + annotation.height
  );
};

export const distanceToLineSegment = (
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number,
  pointX: number,
  pointY: number
): number => {
  const lengthSquared =
    Math.pow(lineEndX - lineStartX, 2) + Math.pow(lineEndY - lineStartY, 2);

  if (lengthSquared === 0) {
    return Math.sqrt(
      Math.pow(pointX - lineStartX, 2) + Math.pow(pointY - lineStartY, 2)
    );
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((pointX - lineStartX) * (lineEndX - lineStartX) +
        (pointY - lineStartY) * (lineEndY - lineStartY)) /
        lengthSquared
    )
  );

  const projectionX = lineStartX + t * (lineEndX - lineStartX);
  const projectionY = lineStartY + t * (lineEndY - lineStartY);

  return Math.sqrt(
    Math.pow(pointX - projectionX, 2) + Math.pow(pointY - projectionY, 2)
  );
};

export const isMouseOverAnnotationBorder = (
  x: number,
  y: number,
  annotation: Annotation,
  scale: number
): boolean => {
  const borderThreshold = 5 / scale;

  if (annotation.shape === "line" || annotation.shape === "arrow") {
    const lineStartX = annotation.x;
    const lineStartY = annotation.y;
    const lineEndX = annotation.x + annotation.width;
    const lineEndY = annotation.y + annotation.height;

    const distance = distanceToLineSegment(
      lineStartX,
      lineStartY,
      lineEndX,
      lineEndY,
      x,
      y
    );

    return distance <= borderThreshold;
  }

  if (
    annotation.shape === "path" &&
    annotation.points &&
    annotation.points.length > 1
  ) {
    for (let i = 0; i < annotation.points.length - 1; i++) {
      const startX = annotation.points[i].x;
      const startY = annotation.points[i].y;
      const endX = annotation.points[i + 1].x;
      const endY = annotation.points[i + 1].y;

      const distance = distanceToLineSegment(startX, startY, endX, endY, x, y);

      if (distance <= borderThreshold) {
        return true;
      }
    }
    return false;
  }

  if (
    annotation.rotation &&
    (annotation.shape === "rectangle" ||
      annotation.shape === "circle" ||
      annotation.shape === "path")
  ) {
    const centerX = annotation.x + annotation.width / 2;
    const centerY = annotation.y + annotation.height / 2;

    const translatedX = x - centerX;
    const translatedY = y - centerY;

    const rotation = annotation.rotation;
    const rotatedX =
      translatedX * Math.cos(-rotation) - translatedY * Math.sin(-rotation);
    const rotatedY =
      translatedX * Math.sin(-rotation) + translatedY * Math.cos(-rotation);

    const finalX = rotatedX + centerX;
    const finalY = rotatedY + centerY;

    if (annotation.shape === "circle") {
      const radiusX = annotation.width / 2;
      const radiusY = annotation.height / 2;

      const normalizedDistance = Math.sqrt(
        Math.pow(finalX - centerX, 2) / Math.pow(radiusX, 2) +
          Math.pow(finalY - centerY, 2) / Math.pow(radiusY, 2)
      );

      return (
        Math.abs(normalizedDistance - 1) <=
        borderThreshold / Math.min(radiusX, radiusY)
      );
    }

    const { x: annoX, y: annoY, width, height } = annotation;

    const nearLeftBorder =
      Math.abs(finalX - annoX) <= borderThreshold &&
      finalY >= annoY &&
      finalY <= annoY + height;

    const nearRightBorder =
      Math.abs(finalX - (annoX + width)) <= borderThreshold &&
      finalY >= annoY &&
      finalY <= annoY + height;

    const nearTopBorder =
      Math.abs(finalY - annoY) <= borderThreshold &&
      finalX >= annoX &&
      finalX <= annoX + width;

    const nearBottomBorder =
      Math.abs(finalY - (annoY + height)) <= borderThreshold &&
      finalX >= annoX &&
      finalX <= annoX + width;

    return (
      nearLeftBorder || nearRightBorder || nearTopBorder || nearBottomBorder
    );
  }

  const { x: annoX, y: annoY, width, height } = annotation;

  const nearLeftBorder =
    Math.abs(x - annoX) <= borderThreshold && y >= annoY && y <= annoY + height;

  const nearRightBorder =
    Math.abs(x - (annoX + width)) <= borderThreshold &&
    y >= annoY &&
    y <= annoY + height;

  const nearTopBorder =
    Math.abs(y - annoY) <= borderThreshold && x >= annoX && x <= annoX + width;

  const nearBottomBorder =
    Math.abs(y - (annoY + height)) <= borderThreshold &&
    x >= annoX &&
    x <= annoX + width;

  return nearLeftBorder || nearRightBorder || nearTopBorder || nearBottomBorder;
};

export const getResizeHandleAtPosition = (
  mouseX: number,
  mouseY: number,
  annotation: Annotation,
  scale: number
): ResizeHandle | null => {
  const { x, y, width, height, shape, rotation } = annotation;
  const handleSize = 8 / scale;

  if (shape === "line" || shape === "arrow") {
    const startX = x;
    const startY = y;
    const endX = x + width;
    const endY = y + height;

    if (
      Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2)) <=
      handleSize
    ) {
      return ResizeHandle.NW;
    }

    if (
      Math.sqrt(Math.pow(mouseX - endX, 2) + Math.pow(mouseY - endY, 2)) <=
      handleSize
    ) {
      return ResizeHandle.SE;
    }

    return null;
  }

  if (
    shape === Shape.Rectangle ||
    shape === Shape.Circle ||
    shape === Shape.Path
  ) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const localTopY = y;
    const rotateHandleDistanceFromTop = 20 / scale;

    let rotateHandleX = centerX;
    let rotateHandleY = localTopY - rotateHandleDistanceFromTop;

    if (rotation) {
      const relX = 0;
      const relY = -height / 2 - rotateHandleDistanceFromTop;

      const rotatedRelX = relX * Math.cos(rotation) - relY * Math.sin(rotation);
      const rotatedRelY = relX * Math.sin(rotation) + relY * Math.cos(rotation);

      rotateHandleX = centerX + rotatedRelX;
      rotateHandleY = centerY + rotatedRelY;
    }

    const rotateHandleSize = 10 / scale;

    if (
      Math.sqrt(
        Math.pow(mouseX - rotateHandleX, 2) +
          Math.pow(mouseY - rotateHandleY, 2)
      ) <=
      rotateHandleSize / 2
    ) {
      return ResizeHandle.Rotate;
    }
  }

  if (
    rotation &&
    (shape === "rectangle" || shape === "circle" || shape === "path")
  ) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const localMouse = unrotatePoint(
      mouseX,
      mouseY,
      centerX,
      centerY,
      rotation
    );

    const localHandles = {
      nw: { x, y },
      n: { x: x + width / 2, y },
      ne: { x: x + width, y },
      e: { x: x + width, y: y + height / 2 },
      se: { x: x + width, y: y + height },
      s: { x: x + width / 2, y: y + height },
      sw: { x, y: y + height },
      w: { x, y: y + height / 2 },
    };

    for (const [handle, pos] of Object.entries(localHandles)) {
      if (
        Math.abs(localMouse.x - pos.x) <= handleSize &&
        Math.abs(localMouse.y - pos.y) <= handleSize
      ) {
        return handle as ResizeHandle;
      }
    }

    return null;
  }

  const handles = {
    nw: { x, y },
    n: { x: x + width / 2, y },
    ne: { x: x + width, y },
    e: { x: x + width, y: y + height / 2 },
    se: { x: x + width, y: y + height },
    s: { x: x + width / 2, y: y + height },
    sw: { x, y: y + height },
    w: { x, y: y + height / 2 },
  };

  for (const [handle, pos] of Object.entries(handles) as [
    ResizeHandle,
    { x: number; y: number }
  ][]) {
    if (
      mouseX >= pos.x - handleSize &&
      mouseX <= pos.x + handleSize &&
      mouseY >= pos.y - handleSize &&
      mouseY <= pos.y + handleSize
    ) {
      return handle;
    }
  }

  return null;
};

export const centerImageInCanvas = (
  image: CanvasImage,
  canvasWidth: number,
  canvasHeight: number
) => {
  // Calculate the scale needed to fit the image in the canvas
  const scaleX = canvasWidth / image.width;
  const scaleY = canvasHeight / image.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up images larger than 100%

  // Calculate the centered position
  const centerX = canvasWidth / 2 - (image.width * scale) / 2;
  const centerY = canvasHeight / 2 - (image.height * scale) / 2;

  return { x: centerX, y: centerY };
};
