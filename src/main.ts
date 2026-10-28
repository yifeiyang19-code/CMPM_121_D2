import type {
  DrawingCommand,
  Point,
  stickerData,
  StrokeData,
} from "./types.ts";
import { tools } from "./tools.ts";
import { renderDrawing as renderCanvas } from "./render.ts";
import { createStickerForm } from "./stickerForm.ts";
import { renderToolButtons } from "./toolbar.ts";
import { exportPng } from "./export.ts";
import { createDrawingCommand } from "./commands.ts";
import {
  getsCanvasPoint,
  handlePointerMove as updatePointerMove,
  handlePointerUp as finishPointerStroke,
} from "./pointer.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
canvas.style.outline = "1px solid black";
canvas.style.width = "100%";
canvas.style.maxWidth = "800px";
canvas.style.height = "auto";
canvas.style.display = "block";
heading.textContent = "D2 project";

let selectedToolId: string = "brush-thin";

const toolbar = document.createElement("div");
toolbar.style.display = "flex";
toolbar.style.flexWrap = "wrap";
toolbar.style.gap = "8px";
toolbar.style.marginBottom = "12px";

const selectedToolMessage = document.createElement("p");
selectedToolMessage.setAttribute("aria-live", "polite");

const stickerForm = createStickerForm(tools, renderToolbar);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Canvas 2D is unavailable");
}

let activePointerId: number | null = null;
let currentPoint: Point | null = null;
let activeStroke: StrokeData | null = null;

const drawingItems: DrawingCommand[] = [];
const redoItems: DrawingCommand[] = [];

function renderDrawing() {
  renderCanvas(canvas, ctx, drawingItems, activeStroke);
}

function selectTool(toolId: string) {
  if (activePointerId !== null) {
    cancelActiveStroke();
  }
  selectedToolId = toolId;
  renderToolbar();
}

function renderToolbar() {
  renderToolButtons(
    toolbar,
    selectedToolMessage,
    tools,
    selectedToolId,
    selectTool,
  );
}

renderToolbar();

function handlePointerMove(event: PointerEvent) {
  updatePointerMove(
    event,
    canvas,
    activePointerId,
    currentPoint,
    activeStroke,
    (point) => {
      currentPoint = point;
    },
    renderDrawing,
  );
}

function handlePointerUp(event: PointerEvent) {
  const previousItemCount = drawingItems.length;

  finishPointerStroke(
    event,
    canvas,
    activePointerId,
    activeStroke,
    drawingItems,
    handlePointerMove,
    () => {
      activeStroke = null;
      activePointerId = null;
      currentPoint = null;
    },
    renderDrawing,
  );

  if (drawingItems.length > previousItemCount) {
    redoItems.length = 0;
    updateUndoRedoButtons();
  }
}

function handlePointerDown(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (event.button !== 0) {
    return;
  }
  if (activePointerId !== null) {
    return;
  }

  const selectedTool = tools.find((t) => t.id === selectedToolId);
  if (!selectedTool) {
    return;
  }

  const { x, y } = getsCanvasPoint(canvas, event);

  if (selectedTool.kind === "sticker") {
    const item: stickerData = {
      kind: "sticker",
      x,
      y,
      text: selectedTool.text,
      fontSize: selectedTool.fontSize,
      fontFamily: selectedTool.fontFamily,
      color: selectedTool.color,
    };
    drawingItems.push(createDrawingCommand(item));

    redoItems.length = 0;
    updateUndoRedoButtons();

    renderDrawing();
    return;
  }

  activePointerId = event.pointerId;
  currentPoint = { x, y };

  activeStroke = {
    kind: "stroke",
    points: [{ x, y }],
    color: selectedTool.color,
    width: selectedTool.width,
  };

  canvas.setPointerCapture(event.pointerId);

  renderDrawing();
}

function cancelActiveStroke() {
  const pointerId = activePointerId;
  activePointerId = null;
  currentPoint = null;
  activeStroke = null;
  if (pointerId !== null && canvas.hasPointerCapture(pointerId)) {
    canvas.releasePointerCapture(pointerId);
  }
  renderDrawing();
}

function handlePointerCancel(event: PointerEvent) {
  if (activePointerId !== event.pointerId) {
    return;
  }
  cancelActiveStroke();
}

function lostPointerCapture(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (activePointerId !== event.pointerId) {
    return;
  }
  cancelActiveStroke();
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerCancel);
canvas.addEventListener("lostpointercapture", lostPointerCapture);

globalThis.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activePointerId !== null) {
    cancelActiveStroke();
  }
});

const redrawButton = document.createElement("button");
redrawButton.type = "button";
redrawButton.textContent = "Redraw";

redrawButton.addEventListener("click", () => {
  renderDrawing();
});

const exportButton = document.createElement("button");
exportButton.type = "button";
exportButton.textContent = "Export PNG";
exportButton.addEventListener("click", () => {
  exportPng(drawingItems, canvas.width, canvas.height);
});

const undoButton = document.createElement("button");
undoButton.type = "button";
undoButton.textContent = "Undo";

undoButton.addEventListener("click", () => {
  if (activePointerId !== null) {
    cancelActiveStroke();
  }

  const lastItem = drawingItems.pop();
  if (!lastItem) {
    return;
  }

  redoItems.push(lastItem);
  updateUndoRedoButtons();
  renderDrawing();
});

const redoButton = document.createElement("button");
redoButton.type = "button";
redoButton.textContent = "Redo";

redoButton.addEventListener("click", () => {
  if (activePointerId !== null) {
    cancelActiveStroke();
  }

  const lastItem = redoItems.pop();
  if (!lastItem) {
    return;
  }

  drawingItems.push(lastItem);
  updateUndoRedoButtons();
  renderDrawing();
});

function updateUndoRedoButtons() {
  undoButton.disabled = drawingItems.length === 0;
  redoButton.disabled = redoItems.length === 0;
}

app.append(
  heading,
  toolbar,
  selectedToolMessage,
  stickerForm,
  undoButton,
  redoButton,
  exportButton,
  redrawButton,
  canvas,
);

updateUndoRedoButtons();

renderDrawing();
