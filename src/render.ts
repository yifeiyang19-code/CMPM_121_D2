import type { DrawingCommand, DrawingData, StrokeData } from "./types.ts";

// Draw a saved stroke or sticker on the target canvas
export function drawItem(
  target: CanvasRenderingContext2D,
  item: DrawingData,
) {
  // Save the current drawing settings
  target.save();

  if (item.kind === "stroke") {
    target.strokeStyle = item.color;
    target.fillStyle = item.color;
    target.lineWidth = item.width;
    target.lineCap = "round";
    target.lineJoin = "round";

    if (item.points.length === 1) {
      // Draw a dot for a single point
      const point = item.points[0]!;

      target.beginPath();
      target.arc(
        point.x,
        point.y,
        item.width / 2,
        0,
        Math.PI * 2,
      );
      target.fill();
    } else if (item.points.length > 1) {
      // Connect all saved points
      target.beginPath();

      const firstPoint = item.points[0]!;
      target.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < item.points.length; i++) {
        const point = item.points[i]!;
        target.lineTo(point.x, point.y);
      }

      target.stroke();
    }
  } else if (item.kind === "sticker") {
    // Draw text or emoji centered at the saved position
    target.fillStyle = item.color;
    target.font = `${item.fontSize}px ${item.fontFamily}`;

    // Center the sticker horizontally and vertically
    target.textAlign = "center";
    target.textBaseline = "middle";

    target.fillText(item.text, item.x, item.y);
  }

  // Restore the previous drawing settings
  target.restore();
}

// Redraw the entire canvas from saved drawing data
export function renderDrawing(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D | null,
  drawingItems: DrawingCommand[],
  activeStroke: StrokeData | null,
) {
  // Check if the canvas context is available
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }

  ctx.save();

  // Reset transformations and clear the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Redraw all saved drawing commands in order
  for (const item of drawingItems) {
    item.render(ctx);
  }

  // Draw the stroke currently being created
  if (activeStroke !== null) {
    drawItem(ctx, activeStroke);
  }

  ctx.restore();
}
