import { game } from '../../..'
import { sys } from '../../../helper/sys'
import { Size } from '../../cocoa/Geometry'
import { EGLView } from '../EGLView'

// Container scale strategys
export class ContainerStrategy {
  static EQUAL_TO_FRAME: EqualToFrame
  static PROPORTION_TO_FRAME: ProportionalToFrame
  static ORIGINAL_CONTAINER: OriginalContainer

  public preApply(view: EGLView) {}

  public apply(view: EGLView, designedResolution: Size) {}

  public postApply(view: EGLView) {}

  protected _setupContainer(view: EGLView, w: number, h: number) {
    const locCanvas = game.canvas!,
      locContainer = game.container!
    if (sys.os === sys.OS_ANDROID) {
      document.body.style.width = `${view._isRotated ? h : w}px`
      document.body.style.height = `${view._isRotated ? w : h}px`
    }

    // Setup style
    locContainer.style.width = locCanvas.style.width = `${w}px`
    locContainer.style.height = locCanvas.style.height = `${h}px`
    // Setup pixel ratio for retina display
    let devicePixelRatio = (view._devicePixelRatio = 1)
    if (view.isRetinaEnabled()) devicePixelRatio = view._devicePixelRatio = Math.min(2, window.devicePixelRatio || 1)
    // Setup canvas
    locCanvas.width = w * devicePixelRatio
    locCanvas.height = h * devicePixelRatio
    ;(game._renderContext as any).resetCache && (game._renderContext as any).resetCache()
  }

  protected _fixContainer() {
    // Add container to document body
    document.body.insertBefore(game.container!, document.body.firstChild)
    // Set body's width height to window's size, and forbid overflow, so that game will be centered
    const bs = document.body.style
    bs.width = `${window.innerWidth}px`
    bs.height = `${window.innerHeight}px`
    bs.overflow = 'hidden'
    // Body size solution doesn't work on all mobile browser so this is the aleternative: fixed container
    const contStyle = game.container!.style
    contStyle.position = 'fixed'
    contStyle.left = contStyle.top = '0px'
    // Reposition body
    document.body.scrollTop = 0
  }
}

export class EqualToFrame extends ContainerStrategy {
  apply(view: EGLView) {
    const frameH = view._frameSize.height
    const containerStyle = game.container!.style
    this._setupContainer(view, view._frameSize.width, view._frameSize.height)
    // Setup container's margin and padding
    if (view._isRotated) {
      containerStyle.margin = `0 0 0 ${frameH}px`
    } else {
      containerStyle.margin = '0px'
    }
  }
}

export class ProportionalToFrame extends ContainerStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const frameW = view._frameSize.width
    const frameH = view._frameSize.height
    const containerStyle = game.container!.style
    const designW = designedResolution.width
    const designH = designedResolution.height
    const scaleX = frameW / designW
    const scaleY = frameH / designH
    let containerW: number
    let containerH: number

    scaleX < scaleY ? ((containerW = frameW), (containerH = designH * scaleX)) : ((containerW = designW * scaleY), (containerH = frameH))

    // Adjust container size with integer value
    const offx = Math.round((frameW - containerW) / 2)
    const offy = Math.round((frameH - containerH) / 2)
    containerW = frameW - 2 * offx
    containerH = frameH - 2 * offy

    this._setupContainer(view, containerW, containerH)
    // Setup container's margin and padding
    if (view._isRotated) {
      containerStyle.margin = `0 0 0 ${frameH}px`
    } else {
      containerStyle.margin = '0px'
    }
    containerStyle.paddingLeft = `${offx}px`
    containerStyle.paddingRight = `${offx}px`
    containerStyle.paddingTop = `${offy}px`
    containerStyle.paddingBottom = `${offy}px`
  }
}

export class EqualToWindow extends EqualToFrame {
  preApply(view: EGLView) {
    super.preApply(view)
    view._frame = document.documentElement
  }

  apply(view: EGLView) {
    super.apply(view)
    this._fixContainer()
  }
}

export class ProportionalToWindow extends ProportionalToFrame {
  preApply(view: EGLView) {
    super.preApply(view)
    view._frame = document.documentElement
  }

  apply(view: EGLView, designedResolution: Size) {
    super.apply(view, designedResolution)
    this._fixContainer()
  }
}

export class OriginalContainer extends ContainerStrategy {
  apply(view: EGLView) {
    this._setupContainer(view, game.canvas!.width, game.canvas!.height)
  }
}

// Initialize static properties after all classes are declared
ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame()
ContainerStrategy.PROPORTION_TO_FRAME = new ProportionalToFrame()
ContainerStrategy.ORIGINAL_CONTAINER = new OriginalContainer()
