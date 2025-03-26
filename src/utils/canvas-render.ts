import { Annotation, CanvasImage, ResizeHandle } from "@/types/annotation";

export const drawImage = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImage,
  isSelected = false
) => {
  const image = new Image();
  image.src = img.dataUrl;
  ctx.drawImage(image, img.x, img.y, img.width, img.height);

  if (isSelected) {
    ctx.strokeStyle = "#FFFFFFFF";
    ctx.lineWidth = 1;
    ctx.strokeRect(img.x, img.y, img.width, img.height);
  }
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected = false,
  scale: number,
  image: CanvasImage | null = null
) => {
  console.log("Drawing annotation:", {
    annotation,
    isSelected,
    scale,
    imageOffset: image ? { x: image.x, y: image.y } : null,
  });

  ctx.strokeStyle = isSelected ? "#ff0000" : "#ffcc00";
  ctx.fillStyle = isSelected
    ? "rgba(255, 0, 0, 0.2)"
    : "rgba(255, 204, 0, 0.2)";

  ctx.lineWidth = 2 / scale;

  if (annotation.shape === "path") {
    ctx.lineWidth = 4 / scale;
  }

  ctx.save();

  if (image) {
    console.log("Applying image offset:", { x: image.x, y: image.y });
    ctx.translate(image.x, image.y);
  }

  if (
    annotation.rotation &&
    (annotation.shape === "rectangle" ||
      annotation.shape === "circle" ||
      annotation.shape === "path")
  ) {
    const centerX = Number(annotation.x) + Number(annotation.width) / 2;
    const centerY = Number(annotation.y) + Number(annotation.height) / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(annotation.rotation);
    ctx.translate(-centerX, -centerY);
  }

  if (annotation.shape === "circle") {
    const centerX = Number(annotation.x) + Number(annotation.width) / 2;
    const centerY = Number(annotation.y) + Number(annotation.height) / 2;
    const radiusX = Number(annotation.width) / 2;
    const radiusY = Number(annotation.height) / 2;

    console.log("Drawing circle:", {
      centerX,
      centerY,
      radiusX,
      radiusY,
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
    });

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (annotation.shape === "line") {
    const startX = Number(annotation.x);
    const startY = Number(annotation.y);
    const endX = Number(annotation.x) + Number(annotation.width);
    const endY = Number(annotation.y) + Number(annotation.height);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (annotation.shape === "arrow") {
    const startX = Number(annotation.x);
    const startY = Number(annotation.y);
    const endX = Number(annotation.x) + Number(annotation.width);
    const endY = Number(annotation.y) + Number(annotation.height);

    const angle = Math.atan2(endY - startY, endX - startX);

    const arrowHeadLength = 15 / scale;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = isSelected ? "#ff0000" : "#ffcc00";
    ctx.fill();
    ctx.stroke();
  } else if (
    annotation.shape === "path" &&
    annotation.points &&
    annotation.points.length > 0
  ) {
    ctx.beginPath();
    ctx.moveTo(Number(annotation.points[0].x), Number(annotation.points[0].y));

    for (let i = 1; i < annotation.points.length; i++) {
      ctx.lineTo(
        Number(annotation.points[i].x),
        Number(annotation.points[i].y)
      );
    }

    ctx.stroke();
  } else {
    console.log("Drawing rectangle:", {
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
    });

    ctx.fillRect(
      Number(annotation.x),
      Number(annotation.y),
      Number(annotation.width),
      Number(annotation.height)
    );
    ctx.strokeRect(
      Number(annotation.x),
      Number(annotation.y),
      Number(annotation.width),
      Number(annotation.height)
    );
  }

  ctx.restore();
};

export const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  selectionBox: { x: number; y: number; width: number; height: number },
  scale: number
) => {
  ctx.strokeStyle = "#3366ff";
  ctx.fillStyle = "rgba(51, 102, 255, 0.1)";
  ctx.lineWidth = 1 / scale;
  ctx.setLineDash([5 / scale, 5 / scale]);

  ctx.fillRect(
    selectionBox.x,
    selectionBox.y,
    selectionBox.width,
    selectionBox.height
  );
  ctx.strokeRect(
    selectionBox.x,
    selectionBox.y,
    selectionBox.width,
    selectionBox.height
  );

  ctx.setLineDash([]);
};

export const drawResizeHandles = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  resizeHandle: ResizeHandle | null,
  scale: number,
  image: CanvasImage | null = null
) => {
  const { x, y, width, height, shape, rotation } = annotation;
  const handleSize = 8 / scale;

  ctx.save();
  if (image) {
    ctx.translate(image.x, image.y);
  }

  if (shape === "line" || shape === "arrow") {
    const startX = x;
    const startY = y;
    const endX = x + width;
    const endY = y + height;

    const handles = {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };

    Object.entries(handles).forEach(([key, pos]) => {
      const isHovered =
        (key === "start" && resizeHandle === "nw") ||
        (key === "end" && resizeHandle === "se");
      ctx.fillStyle = isHovered ? "#ff0000" : "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.5 / scale;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else {
    ctx.save();

    if (
      rotation &&
      (shape === "rectangle" || shape === "circle" || shape === "path")
    ) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);
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

    ctx.setLineDash([3 / scale, 3 / scale]);
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1 / scale;
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    Object.entries(handles).forEach(([key, pos]) => {
      const isHovered = key === resizeHandle;
      ctx.fillStyle = isHovered ? "#ff0000" : "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1 / scale;

      ctx.beginPath();
      ctx.rect(
        pos.x - handleSize / 2,
        pos.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();

    if (shape === "rectangle" || shape === "circle" || shape === "path") {
      ctx.save();

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      if (rotation) {
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.translate(-centerX, -centerY);
      }

      const rotateHandleX = centerX;
      const rotateHandleY = y - 20 / scale;
      const rotateHandleSize = 10 / scale;

      ctx.beginPath();
      ctx.moveTo(centerX, y);
      ctx.lineTo(rotateHandleX, rotateHandleY);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1 / scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        rotateHandleX,
        rotateHandleY,
        rotateHandleSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = resizeHandle === "rotate" ? "#ff0000" : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        rotateHandleX,
        rotateHandleY,
        rotateHandleSize / 4,
        0,
        1.5 * Math.PI
      );
      ctx.strokeStyle = "#555555";
      ctx.lineWidth = 1 / scale;
      ctx.stroke();

      const arrowX = rotateHandleX;
      const arrowY = rotateHandleY - rotateHandleSize / 4;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX + rotateHandleSize / 6, arrowY + rotateHandleSize / 6);
      ctx.lineTo(arrowX - rotateHandleSize / 6, arrowY + rotateHandleSize / 6);
      ctx.closePath();
      ctx.fillStyle = "#555555";
      ctx.fill();

      ctx.restore();
    }
  }

  ctx.restore();
};

export const drawCurrentAnnotation = (
  ctx: CanvasRenderingContext2D,
  currentAnnotation: Partial<Annotation>,
  scale: number,
  image: CanvasImage | null = null
) => {
  if (!currentAnnotation || !currentAnnotation.x || !currentAnnotation.y)
    return;

  ctx.strokeStyle = "#ffcc00";
  ctx.fillStyle = "rgba(255, 204, 0, 0.2)";
  ctx.lineWidth = 2 / scale;

  if (currentAnnotation.shape === "path") {
    ctx.lineWidth = 4 / scale;
  }

  ctx.save();
  if (image) {
    ctx.translate(image.x, image.y);
  }

  if (
    currentAnnotation.shape === "path" &&
    currentAnnotation.points &&
    currentAnnotation.points.length > 0
  ) {
    ctx.beginPath();
    ctx.moveTo(currentAnnotation.points[0].x, currentAnnotation.points[0].y);

    for (let i = 1; i < currentAnnotation.points.length; i++) {
      ctx.lineTo(currentAnnotation.points[i].x, currentAnnotation.points[i].y);
    }

    ctx.stroke();
  } else if (currentAnnotation.width && currentAnnotation.height) {
    if (currentAnnotation.shape === "circle") {
      const centerX = currentAnnotation.x + currentAnnotation.width / 2;
      const centerY = currentAnnotation.y + currentAnnotation.height / 2;
      const radiusX = Math.abs(currentAnnotation.width) / 2;
      const radiusY = Math.abs(currentAnnotation.height) / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (currentAnnotation.shape === "line") {
      const startX = currentAnnotation.x;
      const startY = currentAnnotation.y;
      const endX = currentAnnotation.x + currentAnnotation.width;
      const endY = currentAnnotation.y + currentAnnotation.height;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (currentAnnotation.shape === "arrow") {
      const startX = currentAnnotation.x;
      const startY = currentAnnotation.y;
      const endX = currentAnnotation.x + currentAnnotation.width;
      const endY = currentAnnotation.y + currentAnnotation.height;

      const angle = Math.atan2(endY - startY, endX - startX);

      const arrowHeadLength = 15 / scale;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
        endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
        endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = "#ffcc00";
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(
        currentAnnotation.x,
        currentAnnotation.y,
        currentAnnotation.width,
        currentAnnotation.height
      );
      ctx.strokeRect(
        currentAnnotation.x,
        currentAnnotation.y,
        currentAnnotation.width,
        currentAnnotation.height
      );
    }
  }

  ctx.restore();
};

export const renderCanvas = (
  canvas: HTMLCanvasElement | null,
  currentImage: CanvasImage | null,
  annotations: Annotation[],
  offset: { x: number; y: number },
  scale: number,
  selectedAnnotationId: string | null,
  currentAnnotation: Partial<Annotation> | null,
  isDrawing: boolean,
  resizeHandle: ResizeHandle | null,
  selectionBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null,
  selectedAnnotationIds: string[] = [],
  isSharedView = false
) => {
  if (!canvas) {
    console.log("Canvas is null");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log("Could not get canvas context");
    return;
  }

  console.log("Rendering canvas with:", {
    imageExists: !!currentImage,
    annotationCount: annotations.length,
    offset,
    scale,
    isSharedView,
    canvasSize: { width: canvas.width, height: canvas.height },
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);

  if (currentImage) {
    const img = new Image();
    img.src = currentImage.dataUrl;

    if (img.complete) {
      console.log("Image is loaded, drawing...");
      drawImage(ctx, currentImage, true);

      console.log("Drawing annotations:", annotations);
      annotations.forEach((anno) => {
        const isSelected =
          anno.id === selectedAnnotationId ||
          selectedAnnotationIds.includes(anno.id);
        drawAnnotation(ctx, anno, isSelected, scale, currentImage);

        if (anno.id === selectedAnnotationId && !isSharedView) {
          drawResizeHandles(ctx, anno, resizeHandle, scale, currentImage);
        }
      });

      if (currentAnnotation && isDrawing) {
        drawCurrentAnnotation(ctx, currentAnnotation, scale, currentImage);
      }

      if (selectionBox) {
        drawSelectionBox(ctx, selectionBox, scale);
      }
    } else {
      console.log("Image not loaded yet, waiting...");
      img.onload = () => {
        console.log("Image loaded, drawing...");
        drawImage(ctx, currentImage, true);

        console.log("Drawing annotations:", annotations);
        annotations.forEach((anno) => {
          const isSelected =
            anno.id === selectedAnnotationId ||
            selectedAnnotationIds.includes(anno.id);
          drawAnnotation(ctx, anno, isSelected, scale, currentImage);

          if (anno.id === selectedAnnotationId && !isSharedView) {
            drawResizeHandles(ctx, anno, resizeHandle, scale, currentImage);
          }
        });

        if (currentAnnotation && isDrawing) {
          drawCurrentAnnotation(ctx, currentAnnotation, scale, currentImage);
        }

        if (selectionBox) {
          drawSelectionBox(ctx, selectionBox, scale);
        }
      };
    }
  } else {
    console.log("No current image available");
  }

  ctx.restore();
};
