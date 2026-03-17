import { director, game, Node, renderer } from '../..'
import { _renderType } from '../../helper/engine'
import { defineGetterSetter } from '../../helper/getset'
import { BlendFunc } from '../platform'
import { Layer } from './Layer'

export const LayerColor = Layer.extend(
  /** @lends LayerColor# */ {
    _blendFunc: null,
    _className: 'LayerColor',

    /**
     * Returns the blend function
     * @return {BlendFunc}
     */
    getBlendFunc: function () {
      return this._blendFunc
    },

    /**
     * Changes width and height
     * @deprecated since v3.0 please use setContentSize instead
     * @see Node#setContentSize
     * @param {Number} w width
     * @param {Number} h height
     */
    changeWidthAndHeight: function (w, h) {
      this.width = w
      this.height = h
    },

    /**
     * Changes width in Points
     * @deprecated since v3.0 please use setContentSize instead
     * @see Node#setContentSize
     * @param {Number} w width
     */
    changeWidth: function (w) {
      this.width = w
    },

    /**
     * change height in Points
     * @deprecated since v3.0 please use setContentSize instead
     * @see Node#setContentSize
     * @param {Number} h height
     */
    changeHeight: function (h) {
      this.height = h
    },

    setOpacityModifyRGB: function (value) {},

    isOpacityModifyRGB: function () {
      return false
    },

    /**
     * Constructor of LayerColor
     * @function
     * @param {Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     */
    ctor: function (color, width, height) {
      Layer.prototype.ctor.call(this)
      this._blendFunc = BlendFunc._alphaNonPremultiplied()
      LayerColor.prototype.init.call(this, color, width, height)
    },

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {Color} [color=]
     * @param {Number} [width=]
     * @param {Number} [height=]
     * @return {Boolean}
     */
    init: function (color, width, height) {
      const winSize = director.getWinSize()
      color = color || color(0, 0, 0, 255)
      width = width === undefined ? winSize.width : width
      height = height === undefined ? winSize.height : height

      const locRealColor = this._realColor
      locRealColor.r = color.r
      locRealColor.g = color.g
      locRealColor.b = color.b
      this._realOpacity = color.a
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty | Node._dirtyFlags.opacityDirty)

      LayerColor.prototype.setContentSize.call(this, width, height)
      return true
    },

    visit: function (parent) {
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
        cmd._bakeSprite._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
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
    },

    /**
     * Sets the blend func, you can pass either a BlendFunc object or source and destination value separately
     * @param {Number|BlendFunc} src
     * @param {Number} [dst]
     */
    setBlendFunc: function (src, dst) {
      const locBlendFunc = this._blendFunc
      if (dst === undefined) {
        locBlendFunc.src = src.src
        locBlendFunc.dst = src.dst
      } else {
        locBlendFunc.src = src
        locBlendFunc.dst = dst
      }
      this._renderCmd.updateBlendFunc(locBlendFunc)
    },

    _createRenderCmd: function () {
      if (_renderType === game.RENDER_TYPE_CANVAS) return new LayerColor.CanvasRenderCmd(this)
      else return new LayerColor.WebGLRenderCmd(this)
    },
  },
)

//LayerColor - Getter Setter
;(function () {
  const proto = LayerColor.prototype
  defineGetterSetter(proto, 'width', proto._getWidth, proto._setWidth)
  defineGetterSetter(proto, 'height', proto._getHeight, proto._setHeight)
})()
