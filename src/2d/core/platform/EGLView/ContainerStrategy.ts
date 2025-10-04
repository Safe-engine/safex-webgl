import { game } from "../../../..";
import { sys } from "../../../../helper/sys";
import { Size } from "../../cocoa/Geometry";
import { EGLView } from "../EGLView";
import { EqualToFrame, OriginalContainer, ProportionalToFrame } from "./EGLInstance";

export class ContainerStrategy {
  static EQUAL_TO_FRAME = new EqualToFrame();
  // Alias: Strategy that scale proportionally the container's size to frame's size
  static PROPORTION_TO_FRAME = new ProportionalToFrame();
  // Alias: Strategy that keeps the original container's size
  static ORIGINAL_CONTAINER = new OriginalContainer();  // Alias: Strategy to scale the content's size to container's size, non proportional


  public preApply(view: EGLView) {
  }

  public apply(view: EGLView, designedResolution: Size) {
  }

  public postApply(view: EGLView) {
  }

  protected _setupContainer(view: EGLView, w: number, h: number) {
    const locCanvas = game.canvas!, locContainer = game.container!;
    if (sys.os === sys.OS_ANDROID) {
      document.body.style.width = (view._isRotated ? h : w) + 'px';
      document.body.style.height = (view._isRotated ? w : h) + 'px';
    }

    // Setup style
    locContainer.style.width = locCanvas.style.width = w + 'px';
    locContainer.style.height = locCanvas.style.height = h + 'px';
    // Setup pixel ratio for retina display
    let devicePixelRatio = view._devicePixelRatio = 1;
    if (view.isRetinaEnabled())
      devicePixelRatio = view._devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
    // Setup canvas
    locCanvas.width = w * devicePixelRatio;
    locCanvas.height = h * devicePixelRatio;
    (game._renderContext as any).resetCache && (game._renderContext as any).resetCache();
  }

  protected _fixContainer() {
    // Add container to document body
    document.body.insertBefore(game.container!, document.body.firstChild);
    // Set body's width height to window's size, and forbid overflow, so that game will be centered
    const bs = document.body.style;
    bs.width = window.innerWidth + "px";
    bs.height = window.innerHeight + "px";
    bs.overflow = "hidden";
    // Body size solution doesn't work on all mobile browser so this is the aleternative: fixed container
    const contStyle = game.container!.style;
    contStyle.position = "fixed";
    contStyle.left = contStyle.top = "0px";
    // Reposition body
    document.body.scrollTop = 0;
  }
}