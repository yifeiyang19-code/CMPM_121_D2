import type { DrawingCommand, DrawingData } from "./types.ts";
import { drawItem } from "./render.ts";

export function createDrawingCommand(data: DrawingData): DrawingCommand {
  const snapshot = structuredClone(data);
  return {
    data: snapshot,
    render(ctx: CanvasRenderingContext2D) {
      drawItem(ctx, snapshot);
    },
  };
}
