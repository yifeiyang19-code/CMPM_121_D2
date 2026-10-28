export type Point = {
  x: number;
  y: number;
};

export type ToolDef = {
  id: string;
  name: string;
  kind: "brush";
  color: string;
  width: number;
};

export type stickerDef = {
  id: string;
  name: string;
  kind: "sticker";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
};

export type Tool = ToolDef | stickerDef;

export type StrokeData = {
  kind: "stroke";
  points: Point[];
  color: string;
  width: number;
};

export type stickerData = {
  kind: "sticker";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
};

export type DrawingData = StrokeData | stickerData;

export interface DrawingCommand {
  readonly data: DrawingData;
  render(ctx: CanvasRenderingContext2D): void;
}
