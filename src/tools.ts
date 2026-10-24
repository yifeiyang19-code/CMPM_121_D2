import type { Tool } from "./types.ts";

export const tools: Tool[] = [
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
