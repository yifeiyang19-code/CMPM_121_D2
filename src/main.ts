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

type Point = {
  x: number;
  y: number;
};

type ToolDef = {
  id: string;
  name: string;
  kind: "brush";
  color: string;
  width: number;
};

type stickerDef = {
  id: string;
  name: string;
  kind: "sticker";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
};

type Tool = ToolDef | stickerDef;

type StrokeData = {
  kind: "stroke";
  points: Point[];
  color: string;
  width: number;
};

type stickerData = {
  kind: "sticker";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
};

type DrawingData = StrokeData | stickerData;

const tools: Tool[] = [
  {
    id: "brush-thin",
    name: "Thin Brush",
    kind: "brush",
    color: "Black",
    width: 3,
  },
  {
    id: "brush-thick",
    name: "Thick Brush",
    kind: "brush",
    color: "Black",
    width: 10,
  },
  {
    id: "sticker-hello",
    name: "Hello Sticker",
    kind: "sticker",
    text: "\\(@^0^@)/",
    fontSize: 24,
    fontFamily: "Arial",
    color: "Black",
  },
  {
    id: "sticker-world",
    name: "World Sticker",
    kind: "sticker",
    text: "🌏",
    fontSize: 24,
    fontFamily: "Arial",
    color: "Black",
  },
  {
    id: "sticker-smile",
    name: "Smile Sticker",
    kind: "sticker",
    text: "😊",
    fontSize: 24,
    fontFamily: "Arial",
    color: "Black",
  },
];

let selectedToolId: string = "brush-thin";

// 集中设置 toolbar 样式（display flex, flexWrap wrap, gap 8px, marginBottom 12px）
const toolbar = document.createElement("div");
toolbar.style.display = "flex";
toolbar.style.flexWrap = "wrap";
toolbar.style.gap = "8px";
toolbar.style.marginBottom = "12px";

// 创建当前工具说明段落并设置 aria-live="polite"
const selectedToolMessage = document.createElement("p");
selectedToolMessage.setAttribute("aria-live", "polite");

const stickerForm = document.createElement("form");

const instructionP = document.createElement("p");
instructionP.textContent =
  "Create a reusable sticker tool from text or emoji, then select it from the toolbar.";

const nameGroup = document.createElement("div");
nameGroup.style.marginBottom = "8px";
const nameLabel = document.createElement("label");
const nameInput = document.createElement("input");
nameLabel.textContent = "Tool name";
nameInput.type = "text";
nameInput.id = "tool-name";
nameLabel.htmlFor = "tool-name";
nameInput.placeholder = "My Sticker";
nameLabel.style.display = "block";
nameGroup.append(nameLabel, nameInput);

const textGroup = document.createElement("div");
textGroup.style.marginBottom = "8px";
const textLabel = document.createElement("label");
const textInput = document.createElement("input");
textLabel.textContent = "Sticker text";
textInput.type = "text";
textInput.id = "sticker-text";
textLabel.htmlFor = "sticker-text";
textInput.placeholder = "Enter text or emoji";
textLabel.style.display = "block";
textGroup.append(textLabel, textInput);

const createButton = document.createElement("button");
createButton.textContent = "Create Sticker";
createButton.type = "submit";

const cancelButton = document.createElement("button");
cancelButton.type = "button";
cancelButton.textContent = "Cancel";

const toolMessage = document.createElement("p");
toolMessage.setAttribute("aria-live", "polite");
stickerForm.style.marginBottom = "12px";

stickerForm.append(
  instructionP,
  nameGroup,
  textGroup,
  createButton,
  cancelButton,
  toolMessage,
);

cancelButton.addEventListener("click", () => {
  nameInput.value = "";
  textInput.value = "";
  toolMessage.textContent = "";
  nameInput.focus();
});

stickerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const toolName = nameInput.value.trim();
  const stickerText = textInput.value.trim();

  if (!toolName) {
    toolMessage.textContent = "Enter a tool name and sticker text.";
    nameInput.focus();
    return;
  }
  if (!stickerText) {
    toolMessage.textContent = "Enter a tool name and sticker text.";
    textInput.focus();
    return;
  }

  const newTool: stickerDef = {
    id: crypto.randomUUID(),
    name: toolName,
    kind: "sticker",
    text: stickerText,
    fontSize: 24,
    fontFamily: "Arial",
    color: "Black",
  };

  tools.push(newTool);
  renderToolbar();

  nameInput.value = "";
  textInput.value = "";
  toolMessage.textContent = "Sticker tool created. Select it from the toolbar.";
  nameInput.focus();
});

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Canvas 2D is unavailable");
}

let activePointerId: number | null = null;
let currentPoint: Point | null = null;
let activeStroke: StrokeData | null = null;

const drawingItems: DrawingData[] = [];

// Draw a saved stroke or sticker on the target canvas
function drawItem(
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
function renderDrawing() {
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

  // Redraw all saved drawing items in order
  for (const item of drawingItems) {
    drawItem(ctx, item);
  }

  // Draw the stroke currently being created
  if (activeStroke !== null) {
    drawItem(ctx, activeStroke);
  }

  ctx.restore();
}

function getsCanvasPoint(event: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

function renderToolbar() {
  toolbar.replaceChildren();
  const selectedTool = tools.find((t) => t.id === selectedToolId);
  if (selectedTool) {
    if (selectedTool.kind === "brush") {
      selectedToolMessage.textContent =
        `Selected: ${selectedTool.name} · ${selectedTool.color} · Width: ${selectedTool.width}`;
    } else if (selectedTool.kind === "sticker") {
      selectedToolMessage.textContent =
        `Selected: ${selectedTool.name} · ${selectedTool.text}`;
    }
  }

  tools.forEach((tool) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tool.name;
    button.dataset.toolId = tool.id;

    const isSelected = tool.id === selectedToolId;
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");

    if (isSelected) {
      button.style.fontWeight = "bold";
    }

    button.addEventListener("click", () => {
      if (activePointerId !== null) {
        return;
      }
      selectedToolId = tool.id;
      renderToolbar();

      const targetButton = toolbar.querySelector<HTMLButtonElement>(
        `button[data-tool-id="${tool.id}"]`,
      );
      if (targetButton) {
        targetButton.focus();
      }
    });

    toolbar.appendChild(button);
  });
}

renderToolbar();

function handlePointerMove(event: PointerEvent) {
  if (activePointerId === null || event.pointerId !== activePointerId) {
    return;
  }

  if (currentPoint === null || activeStroke === null) {
    return;
  }

  const { x, y } = getsCanvasPoint(event);

  // Skip duplicate points
  if (x === currentPoint.x && y === currentPoint.y) {
    return;
  }

  // Update the current stroke data
  currentPoint = { x, y };
  activeStroke.points.push(currentPoint);

  // Redraw the canvas using the updated data
  renderDrawing();
}

function handlePointerUp(event: PointerEvent) {
  if (activePointerId !== event.pointerId) {
    return;
  }

  // Record the final pointer position
  handlePointerMove(event);

  if (activeStroke !== null) {
    drawingItems.push(activeStroke);
    console.log("Drawing Data:", structuredClone(drawingItems));
  }

  // Clear temporary drawing state
  activeStroke = null;
  activePointerId = null;
  currentPoint = null;

  // Release pointer capture
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  // Redraw the canvas from saved data
  renderDrawing();
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

  if (selectedTool.kind !== "brush") {
    return;
  }

  const { x, y } = getsCanvasPoint(event);
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
  renderDrawing();
});

app.append(
  heading,
  toolbar,
  selectedToolMessage,
  stickerForm,
  redrawButton,
  canvas,
);

// Render the initial blank canvas
renderDrawing();
