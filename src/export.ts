import type { DrawingCommand } from "./types.ts";

export function exportPng(
  items: readonly DrawingCommand[],
  documentWidth: number,
  documentHeight: number,
) {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = documentWidth * 2;
  exportCanvas.height = documentHeight * 2;
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) {
    throw new Error("Export Canvas 2D is unavailable");
  }

  exportCtx.fillStyle = "white";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.scale(2, 2);

  for (const item of items) {
    item.render(exportCtx);
  }

  exportCanvas.toBlob((blob) => {
    if (!blob) {
      throw new Error("Failed to export PNG blob");
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sticker-sketchpad.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, "image/png");
}
