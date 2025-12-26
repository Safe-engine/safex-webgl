import { color } from "../platform/Color";

export const NodeWebGLRenderCmd = function (renderable) {
  this._node = renderable;
  this._anchorPointInPoints = { x: 0, y: 0 };
  this._displayedColor = color(255, 255, 255, 255);
  this._glProgramState = null;
};
