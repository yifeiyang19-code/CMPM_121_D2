import type { Tool } from "./types.ts";

export function renderToolButtons(
  toolbar: HTMLDivElement,
  selectedToolMessage: HTMLParagraphElement,
  tools: Tool[],
  selectedToolId: string,
  isPointerActive: () => boolean,
  selectTool: (toolId: string) => void,
) {
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
      if (isPointerActive()) {
        return;
      }
      selectTool(tool.id);

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
