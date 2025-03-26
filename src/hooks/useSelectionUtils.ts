import { Annotation } from "@/types/annotation";

export const normalizeBox = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  let normalizedX = x;
  let normalizedY = y;
  let normalizedWidth = width;
  let normalizedHeight = height;

  if (width < 0) {
    normalizedX = x + width;
    normalizedWidth = Math.abs(width);
  }
  if (height < 0) {
    normalizedY = y + height;
    normalizedHeight = Math.abs(height);
  }

  return {
    x: normalizedX,
    y: normalizedY,
    width: normalizedWidth,
    height: normalizedHeight,
  };
};

export const checkIntersection = (
  selectionBox: { x: number; y: number; width: number; height: number },
  annotation: Annotation
) => {
  if (annotation.shape === "line" || annotation.shape === "arrow") {
    const lineStartX = annotation.x;
    const lineStartY = annotation.y;
    const lineEndX = annotation.x + annotation.width;
    const lineEndY = annotation.y + annotation.height;

    const startInBox =
      lineStartX >= selectionBox.x &&
      lineStartX <= selectionBox.x + selectionBox.width &&
      lineStartY >= selectionBox.y &&
      lineStartY <= selectionBox.y + selectionBox.height;

    const endInBox =
      lineEndX >= selectionBox.x &&
      lineEndX <= selectionBox.x + selectionBox.width &&
      lineEndY >= selectionBox.y &&
      lineEndY <= selectionBox.y + selectionBox.height;

    // If either endpoint is in the box, the line intersects
    if (startInBox || endInBox) {
      return true;
    }

    // Check if the line intersects any of the selection box edges
    // Line segments to check against (the 4 sides of the box)
    const boxLines = [
      // top edge
      {
        x1: selectionBox.x,
        y1: selectionBox.y,
        x2: selectionBox.x + selectionBox.width,
        y2: selectionBox.y,
      },
      // right edge
      {
        x1: selectionBox.x + selectionBox.width,
        y1: selectionBox.y,
        x2: selectionBox.x + selectionBox.width,
        y2: selectionBox.y + selectionBox.height,
      },
      // bottom edge
      {
        x1: selectionBox.x,
        y1: selectionBox.y + selectionBox.height,
        x2: selectionBox.x + selectionBox.width,
        y2: selectionBox.y + selectionBox.height,
      },
      // left edge
      {
        x1: selectionBox.x,
        y1: selectionBox.y,
        x2: selectionBox.x,
        y2: selectionBox.y + selectionBox.height,
      },
    ];

    // Check for intersection with any box edge
    for (const boxLine of boxLines) {
      if (
        lineSegmentsIntersect(
          lineStartX,
          lineStartY,
          lineEndX,
          lineEndY,
          boxLine.x1,
          boxLine.y1,
          boxLine.x2,
          boxLine.y2
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // Standard box intersection for other shapes
  return !(
    selectionBox.x + selectionBox.width < annotation.x ||
    selectionBox.x > annotation.x + annotation.width ||
    selectionBox.y + selectionBox.height < annotation.y ||
    selectionBox.y > annotation.y + annotation.height
  );
};

export const lineSegmentsIntersect = (
  a1x: number,
  a1y: number,
  a2x: number,
  a2y: number,
  b1x: number,
  b1y: number,
  b2x: number,
  b2y: number
): boolean => {
  // Calculate direction vectors
  const dxa = a2x - a1x;
  const dya = a2y - a1y;
  const dxb = b2x - b1x;
  const dyb = b2y - b1y;

  // Calculate the cross product of the direction vectors
  const crossProduct = dxa * dyb - dya * dxb;

  // If lines are parallel (or nearly so), they don't intersect
  if (Math.abs(crossProduct) < 0.0001) {
    return false;
  }

  // Calculate the parameters of intersection
  const t = ((b1x - a1x) * dyb - (b1y - a1y) * dxb) / crossProduct;
  const u = ((b1x - a1x) * dya - (b1y - a1y) * dxa) / crossProduct;

  // Check if the intersection point is within both line segments
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};
