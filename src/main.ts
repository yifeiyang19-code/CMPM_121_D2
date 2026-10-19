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
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }

  const { x, y } = getsCanvasPoint(event);

  ctx.beginPath();
  ctx.moveTo(currentPoint.x, currentPoint.y);
  ctx.lineTo(x, y);
  ctx.strokeStyle = activeStroke.color;
  ctx.lineWidth = activeStroke.width;
  ctx.lineCap = "round";
  ctx.stroke();

  currentPoint = { x, y };
  activeStroke.points.push(currentPoint);
}

function drawPoint(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (!activeStroke) {
    return;
  }

  const { x, y } = getsCanvasPoint(event);
  ctx.fillStyle = activeStroke.color;
  ctx.beginPath();
  ctx.arc(x, y, activeStroke.width / 2, 0, Math.PI * 2);
  ctx.fill();
}

function handlePointerUp(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (activePointerId !== event.pointerId) {
    return;
  }
  handlePointerMove(event);

  if (activeStroke !== null) {
    drawingItems.push(activeStroke);
    console.log("Drawing Data:", structuredClone(drawingItems));
    activeStroke = null;
  }

  activePointerId = null;
  currentPoint = null;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
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
  drawPoint(event);
}

function handlePointerCancel(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (activePointerId !== event.pointerId) {
    return;
  }
  activePointerId = null;
  currentPoint = null;
  activeStroke = null;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function lostPointerCapture(event: PointerEvent) {
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  if (activePointerId !== event.pointerId) {
    return;
  }
  activePointerId = null;
  currentPoint = null;
  activeStroke = null;
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerCancel);
canvas.addEventListener("lostpointercapture", lostPointerCapture);

app.append(heading, toolbar, selectedToolMessage, stickerForm, canvas);
