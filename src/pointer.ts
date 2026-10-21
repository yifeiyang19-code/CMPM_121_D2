import type { DrawingData, Point, StrokeData } from "./types.ts";

// Convert pointer coordinates to canvas coordinates
export function getsCanvasPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): Point {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

// Handle pointer movement while drawing
export function handlePointerMove(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  activePointerId: number | null,
  currentPoint: Point | null,
  activeStroke: StrokeData | null,
  setCurrentPoint: (point: Point) => void,
  renderDrawing: () => void,
) {
  if (activePointerId === null || event.pointerId !== activePointerId) {
    return;
  }

  if (currentPoint === null || activeStroke === null) {
    return;
  }

  const { x, y } = getsCanvasPoint(canvas, event);

  // Skip duplicate points
  if (x === currentPoint.x && y === currentPoint.y) {
    return;
  }

  // Update the current stroke data
  const nextPoint = { x, y };
  setCurrentPoint(nextPoint);
  activeStroke.points.push(nextPoint);

  // Redraw the canvas using the updated data
  renderDrawing();
}

// Handle pointer release and save the completed stroke
export function handlePointerUp(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  activePointerId: number | null,
  activeStroke: StrokeData | null,
  drawingItems: DrawingData[],
  onPointerMove: (event: PointerEvent) => void,
  clearPointerState: () => void,
  renderDrawing: () => void,
) {
  if (activePointerId !== event.pointerId) {
    return;
  }

  // Record the final pointer position
  onPointerMove(event);

  if (activeStroke !== null) {
    drawingItems.push(activeStroke);
    console.log("Drawing Data:", structuredClone(drawingItems));
  }

  // Clear temporary drawing state
  clearPointerState();

  // Release pointer capture
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  // Redraw the canvas from saved data
  renderDrawing();
}
