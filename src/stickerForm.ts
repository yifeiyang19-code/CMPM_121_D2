import type { stickerDef, Tool } from "./types.ts";

export function createStickerForm(
  tools: Tool[],
  renderToolbar: () => void,
): HTMLFormElement {
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
    toolMessage.textContent =
      "Sticker tool created. Select it from the toolbar.";
    nameInput.focus();
  });

  return stickerForm;
}
