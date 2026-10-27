# Sticker Sketchpad

A browser-based hand-drawing and sticker composition tool. It supports variable-width brushes, preset stickers, and user-created custom text or emoji tools.

## Play Online

[Open Sticker Sketchpad](https://yifeiyang19-code.github.io/CMPM_121_D2/)

## How to Use

- **Draw:** Select Thin Brush or Thick Brush, hold down the primary mouse button and drag, then release to finish.

- **Place stickers:** Select a sticker tool and click once on the canvas to place one.

- **Create a tool:** Fill in Tool name and Sticker text, then click Create Sticker. Select the new tool from the toolbar to place it repeatedly.

- **Cancel:** Clear unsaved form inputs without deleting created tools or drawings.

- **Redraw:** Restore the canvas from saved drawing data without deleting content.

- **Undo:** Click Undo to remove the most recent brush stroke or sticker. Multiple actions can be undone.

- **Redo** Click Redo to restore the most recently undone action. Drawing a new stroke or placing a new sticker will clear the redo history.

## Session Data

Drawings and custom tools are only saved in the current browser session. Refreshing or closing the page will not automatically restore them. Please keep this in mind to avoid expecting automatic persistence.

## Run Locally

Install Git and Deno 2.9.7:

- [Git Downloads](https://git-scm.com/downloads)

- [Deno Installation Guide](https://docs.deno.com/runtime/getting_started/installation/)

Clone the repository using Git:

```bash
git clone https://github.com/yifeiyang19-code/CMPM_121_D2.git
```

Navigate into the cloned `CMPM_121_D2` folder.

Run `deno task setup` once for each new clone to configure pre-commit checks.

Run `deno task dev` and open the local URL printed in the terminal.

## Build and Preview

`deno task ci`: Checks formatting, linting, and TypeScript, then builds the project into the `dist` directory.

`deno task preview`: Starts a local preview of the production build. Requires an existing build and does not automatically rebuild or deploy.

Please note that actual interactive behavior still requires manual testing, and passing checks does not guarantee all features are completely correct.

## Network Requirements

Initial source acquisition and dependency downloads require an internet connection.

Whether building can be done offline once dependency caches are fully populated requires actual verification before making promises.

Current drawing uses browser Canvas and system fonts, and does not rely on online image assets.

The online website does not have offline caching guarantees, and reopening it offline is not promised to work.

## What Gongjue Sun did

- **Unified Rendering:** Created a shared rendering system for brush strokes and sticker using saved drawing data.

- **Redraw Functionality:** Added a Redraw button to restore the canvas without losing existing drawings.

- **Code Modularizaion:** Split the original main.ts into separate moduled, including types.ts, tools.ts, render.ts, stickerForm.ts, toolbar.ts, and pointer.ts, to make the code easier to maintain.

- **Undo and Redo** Added Undo and Redo buttons for both brush strokes and stickers. Creating a new drawing action after undoing also clears the redo history.

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 D1 starter](https://github.com/ucsc-cmpm-121-f26/d1-starter/tree/d949e744b0f9fb7c133a5316f86f2b7fe54529ad), derived from the [S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da). Those repositories have no explicit repository license; no new license is assigned to that material. The D2 scaffold was authored with OpenCode/OpenAI GPT-6.1 Sol assistance. Dependencies retain their respective licenses.

The README body was written by Yifei Yang; Codex assisted only with Markdown formatting, link completion, and restoration of source links.
