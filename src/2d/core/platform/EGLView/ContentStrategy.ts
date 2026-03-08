import { director, game } from '../../../..'
import { Rect, Size } from '../../cocoa/Geometry'
import { EGLView } from '../EGLView'

export class ContentStrategy {
  static EXACT_FIT: ExactFit
  // Alias: Strategy to scale the content's size proportionally to maximum size and keeps the whole content area to be visible
  static SHOW_ALL: ShowAll
  // Alias: Strategy to scale the content's size proportionally to fill the whole container area
  static NO_BORDER: NoBorder
  // Alias: Strategy to scale the content's height to container's height and proportionally scale its width
  static FIXED_HEIGHT: FixedHeight
  // Alias: Strategy to scale the content's width to container's width and proportionally scale its height
  static FIXED_WIDTH: FixedWidth

  protected _result: { scale: number[]; viewport: Rect | null } = {
    scale: [1, 1],
    viewport: null,
  }

  protected _buildResult(containerW: number, containerH: number, contentW: number, contentH: number, scaleX: number, scaleY: number) {
    // Makes content fit better the canvas
    if (Math.abs(containerW - contentW) < 2) {
      contentW = containerW
    }
    if (Math.abs(containerH - contentH) < 2) {
      contentH = containerH
    }

    const viewport = new Rect(Math.round((containerW - contentW) / 2), Math.round((containerH - contentH) / 2), contentW, contentH)

    // Translate the content
    if (game.RENDER_TYPE_CANVAS) {
      //TODO: modify something for setTransform
      //(game._renderContext as any).translate(viewport.x, viewport.y + contentH);
    }

    this._result.scale = [scaleX, scaleY]
    this._result.viewport = viewport
    return this._result
  }

  public preApply(view: EGLView) {}

  public apply(view: EGLView, designedResolution: Size): { scale: number[]; viewport: Rect | null } {
    return { scale: [1, 1], viewport: null }
  }

  public postApply(view: EGLView) {}
}

// Content scale strategys
export class ExactFit extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width
    const containerH = game.canvas!.height
    const scaleX = containerW / designedResolution.width
    const scaleY = containerH / designedResolution.height

    return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY)
  }
}

export class ShowAll extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width
    const containerH = game.canvas!.height
    const designW = designedResolution.width
    const designH = designedResolution.height
    const scaleX = containerW / designW
    const scaleY = containerH / designH
    let scale = 0
    let contentW: number
    let contentH: number

    scaleX < scaleY
      ? ((scale = scaleX), (contentW = containerW), (contentH = designH * scale))
      : ((scale = scaleY), (contentW = designW * scale), (contentH = containerH))

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale)
  }
}

export class NoBorder extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width
    const containerH = game.canvas!.height
    const designW = designedResolution.width
    const designH = designedResolution.height
    const scaleX = containerW / designW
    const scaleY = containerH / designH
    let scale: number
    let contentW: number
    let contentH: number

    scaleX < scaleY
      ? ((scale = scaleY), (contentW = designW * scale), (contentH = containerH))
      : ((scale = scaleX), (contentW = containerW), (contentH = designH * scale))

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale)
  }
}

export class FixedHeight extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width
    const containerH = game.canvas!.height
    const designH = designedResolution.height
    const scale = containerH / designH
    const contentW = containerW
    const contentH = containerH

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale)
  }

  postApply(view: EGLView) {
    director._winSizeInPoints = view.getVisibleSize()
  }
}

export class FixedWidth extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width
    const containerH = game.canvas!.height
    const designW = designedResolution.width
    const scale = containerW / designW
    const contentW = containerW
    const contentH = containerH

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale)
  }

  postApply(view: EGLView) {
    director._winSizeInPoints = view.getVisibleSize()
  }
}

ContentStrategy.EXACT_FIT = new ExactFit()
ContentStrategy.SHOW_ALL = new ShowAll()
ContentStrategy.NO_BORDER = new NoBorder()
ContentStrategy.FIXED_HEIGHT = new FixedHeight()
ContentStrategy.FIXED_WIDTH = new FixedWidth()
