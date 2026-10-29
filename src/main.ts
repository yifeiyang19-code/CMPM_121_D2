import type { DrawingData, Point, stickerData, StrokeData } from "./types.ts";
import { tools } from "./tools.ts";
import { renderDrawing as renderCanvas } from "./render.ts";
import { createStickerForm } from "./stickerForm.ts";
import { renderToolButtons } from "./toolbar.ts";
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

const drawingItems: DrawingData[] = [];
const redoItems: DrawingData[] = [];

function renderDrawing() {
  renderCanvas(canvas, ctx, drawingItems, activeStroke);
}

function selectTool(toolId: string) {
  selectedToolId = toolId;
  renderToolbar();
}

function renderToolbar() {
  renderToolButtons(
    toolbar,
    selectedToolMessage,
    tools,
    selectedToolId,
    () => activePointerId !== null,
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

  // Clear redo history when a new stroke is completed
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
    drawingItems.push(item);

    // Clear redo history when a new sticker is placed
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

  // Render the starting point of the stroke
  renderDrawing();
}

function handlePointerCancel(event: PointerEvent) {
  if (activePointerId !== event.pointerId) {
    return;
  }

  // Discard the unfinished stroke
  activePointerId = null;
  currentPoint = null;
  activeStroke = null;

  // Release pointer capture if needed
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  // Redraw without the canceled stroke
  renderDrawing();
}

function lostPointerCapture(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (activePointerId !== event.pointerId) {
    return;
  }

  // Discard the unfinished stroke
  activePointerId = null;
  currentPoint = null;
  activeStroke = null;

  // Redraw the canvas after losing pointer capture
  renderDrawing();
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerCancel);
canvas.addEventListener("lostpointercapture", lostPointerCapture);

// Create a button to redraw the canvas
const redrawButton = document.createElement("button");
redrawButton.type = "button";
redrawButton.textContent = "Redraw";

// Redraw without deleting saved drawing data
redrawButton.addEventListener("click", () => {
  if (activePointerId !== null) {
    return;
  }

  drawingItems.length = 0;
  redoItems.length = 0;

  renderDrawing();
  updateUndoRedoButtons();
});

// Create an Undo button
const undoButton = document.createElement("button");
undoButton.type = "button";
undoButton.textContent = "Undo";

// Undo the most recent drawing action
undoButton.addEventListener("click", () => {
  if (activePointerId !== null) {
    return;
  }

  const lastItem = drawingItems.pop();
  if (!lastItem) {
    return;
  }

  redoItems.push(lastItem);
  updateUndoRedoButtons();
  renderDrawing();
});

// Create a Redo button
const redoButton = document.createElement("button");
redoButton.type = "button";
redoButton.textContent = "Redo";

// Redo the most recently undone drawing action
redoButton.addEventListener("click", () => {
  if (activePointerId !== null) {
    return;
  }

  const lastItem = redoItems.pop();
  if (!lastItem) {
    return;
  }

  drawingItems.push(lastItem);
  updateUndoRedoButtons();
  renderDrawing();
});

// Update Undo and Redo button states
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
  redrawButton,
  canvas,
);

// Initialize button states
updateUndoRedoButtons();

// Render the initial blank canvas
renderDrawing();
