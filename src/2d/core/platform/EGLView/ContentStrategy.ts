import { game } from "../../../..";
import { Rect, Size } from "../../cocoa/Geometry";
import { EGLView } from "../EGLView";
import { ExactFit, FixedHeight, FixedWidth, NoBorder, ShowAll } from "./EGLInstance";

export class ContentStrategy {
  static EXACT_FIT = new ExactFit();
  // Alias: Strategy to scale the content's size proportionally to maximum size and keeps the whole content area to be visible
  static SHOW_ALL = new ShowAll();
  // Alias: Strategy to scale the content's size proportionally to fill the whole container area
  static NO_BORDER = new NoBorder();
  // Alias: Strategy to scale the content's height to container's height and proportionally scale its width
  static FIXED_HEIGHT = new FixedHeight();
  // Alias: Strategy to scale the content's width to container's width and proportionally scale its height
  static FIXED_WIDTH = new FixedWidth();


  protected _result: { scale: number[], viewport: Rect | null } = {
    scale: [1, 1],
    viewport: null
  };

  protected _buildResult(containerW: number, containerH: number, contentW: number, contentH: number, scaleX: number, scaleY: number) {
    // Makes content fit better the canvas
    if (Math.abs(containerW - contentW) < 2) {
      contentW = containerW;
    }
    if (Math.abs(containerH - contentH) < 2) {
      contentH = containerH;
    }

    const viewport = new Rect(Math.round((containerW - contentW) / 2),
      Math.round((containerH - contentH) / 2),
      contentW, contentH);

    // Translate the content
    if (game.RENDER_TYPE_CANVAS) {
      //TODO: modify something for setTransform
      //(game._renderContext as any).translate(viewport.x, viewport.y + contentH);
    }

    this._result.scale = [scaleX, scaleY];
    this._result.viewport = viewport;
    return this._result;
  }

  public preApply(view: EGLView) {
  }

  public apply(view: EGLView, designedResolution: Size): { scale: number[], viewport: Rect | null } {
    return { "scale": [1, 1], viewport: null };
  }

  public postApply(view: EGLView) {
  }
}