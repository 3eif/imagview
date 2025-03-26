export const rotatePoint = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angle: number
): { x: number; y: number } => {
  const translatedX = x - centerX;
  const translatedY = y - centerY;

  const rotatedX =
    translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
  const rotatedY =
    translatedX * Math.sin(angle) + translatedY * Math.cos(angle);

  return {
    x: rotatedX + centerX,
    y: rotatedY + centerY,
  };
};

export const unrotatePoint = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angle: number
): { x: number; y: number } => {
  return rotatePoint(x, y, centerX, centerY, -angle);
};
