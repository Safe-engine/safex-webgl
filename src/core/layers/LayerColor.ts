import { color, director, Node, renderer } from '../..'
import { BlendFunc, Color } from '../platform'
import { Layer } from './Layer'
import { LayerColorWebGLRenderCmd } from './LayerWebGLRenderCmd'

export class LayerColor extends Layer {
  declare _blendFunc: BlendFunc
  declare _renderCmd: LayerColorWebGLRenderCmd

  /**
   * Returns the blend function
   * @return {BlendFunc}
   */
  getBlendFunc() {
    return this._blendFunc
  }

  /**
   * Changes width and height
   * @deprecated since v3.0 please use setContentSize instead
   * @see Node#setContentSize
   * @param {Number} w width
   * @param {Number} h height
   */
  changeWidthAndHeight(w: number, h: number) {
    this.setContentSize(w, h)
  }

  /**
   * Changes width in Points
   * @deprecated since v3.0 please use setContentSize instead
   * @see Node#setContentSize
   * @param {Number} w width
   */
  changeWidth(w: number) {
    this._setWidth(w)
  }

  /**
   * change height in Points
   * @deprecated since v3.0 please use setContentSize instead
   * @see Node#setContentSize
   * @param {Number} h height
   */
  changeHeight(h: number) {
    this._setHeight(h)
  }

  // setOpacityModifyRGB(value: any) {}

  // isOpacityModifyRGB() {
  //   return false
  // }

  /**
   * Constructor of LayerColor
   * @function
   * @param {Color} [c=]
   * @param {Number} [width=]
   * @param {Number} [height=]
   */
  constructor(c?: Color, width?: number, height?: number) {
    super()
    this._blendFunc = BlendFunc._alphaNonPremultiplied()
    this.init(c, width, height)
  }

  /**
   * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
   * @param {Color} [c=]
   * @param {Number} [width=]
   * @param {Number} [height=]
   * @return {Boolean}
   */
  init(c?: Color, width?: number, height?: number) {
    const winSize = director.getWinSize()
    c = c || color(0, 0, 0, 255)
    width = width === undefined ? winSize.width : width
    height = height === undefined ? winSize.height : height

    const locRealColor = this._realColor
    locRealColor.r = c.r
    locRealColor.g = c.g
    locRealColor.b = c.b
    this._realOpacity = c.a
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty | Node._dirtyFlags.opacityDirty)

    super.setContentSize(width, height)
    return true
  }

  visit(parent?: any) {
    const cmd = this._renderCmd,
      parentCmd = parent ? parent._renderCmd : null

    // quick return if not visible
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd)
      return
    }

    cmd.visit(parentCmd)

    if (cmd._isBaked) {
      renderer.pushRenderCommand(cmd._bakeRenderCmd)
      //the bakeSprite is drawing
      cmd._bakeSprite._renderCmd.setDirtyFlag((Node as any)._dirtyFlags.transformDirty)
      cmd._bakeSprite.visit(this)
    } else {
      let i, child
      const children = this._children
      const len = children.length
      if (len > 0) {
        if (this._reorderChildDirty) {
          this.sortAllChildren()
        }
        // draw children zOrder < 0
        for (i = 0; i < len; i++) {
          child = children[i]
          if (child._localZOrder < 0) {
            child.visit(this)
          } else {
            break
          }
        }

        renderer.pushRenderCommand(cmd)
        for (; i < len; i++) {
          children[i].visit(this)
        }
      } else {
        renderer.pushRenderCommand(cmd)
      }
    }

    cmd._dirtyFlag = 0
  }

  /**
   * Sets the blend func, you can pass either a BlendFunc object or source and destination value separately
   * @param {Number|BlendFunc} src
   * @param {Number} [dst]
   */
  setBlendFunc(src: any, dst?: number) {
    const locBlendFunc = this._blendFunc
    if (dst === undefined) {
      locBlendFunc.src = src.src
      locBlendFunc.dst = src.dst
    } else {
      locBlendFunc.src = src
      locBlendFunc.dst = dst
    }
    // this._renderCmd.updateBlendFunc(locBlendFunc)
  }

  _createRenderCmd() {
    return new LayerColorWebGLRenderCmd(this)
  }
}
