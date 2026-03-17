import {
  _renderContext,
  affineTransformMake,
  affineTransformRotate,
  affineTransformScale,
  p,
  pAngleSigned,
  pointApplyAffineTransform,
  Rect,
  rectApplyAffineTransformIn,
  view,
} from '@safe-engine/webgl'
import { defineGetterSetter } from '../../helper/getset'
import { glBlendFunc } from '../../shaders/GLStateCache'
import { Node } from '../base-nodes/Node'
import { Matrix4 } from '../kazmath/mat4'
import { Color, color, radiansToDegrees, VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION } from '../platform'
import { LayerColor } from './LayerColor'
import { LayerColorWebGLRenderCmd } from './LayerWebGLRenderCmd'

/**
 * <p>
 * CCLayerGradient is a subclass of LayerColor that draws gradients across the background.<br/>
 *<br/>
 * All features from LayerColor are valid, plus the following new features:<br/>
 * <ul><li>direction</li>
 * <li>final color</li>
 * <li>interpolation mode</li></ul>
 * <br/>
 * Color is interpolated between the startColor and endColor along the given<br/>
 * vector (starting at the origin, ending at the terminus).  If no vector is<br/>
 * supplied, it defaults to (0, -1) -- a fade from top to bottom.<br/>
 * <br/>
 * If 'compressedInterpolation' is disabled, you will not see either the start or end color for<br/>
 * non-cardinal vectors; a smooth gradient implying both end points will be still<br/>
 * be drawn, however.<br/>
 *<br/>
 * If 'compressedInterpolation' is enabled (default mode) you will see both the start and end colors of the gradient.
 * </p>
 * @class
 * @extends LayerColor
 *
 * @param {Color} start Starting color
 * @param {Color} end Ending color
 * @param {Point} [v=p(0, -1)] A vector defines the gradient direction, default direction is from top to bottom
 *
 * @property {Color} startColor              - Start color of the color gradient
 * @property {Color} endColor                - End color of the color gradient
 * @property {Number}   startOpacity            - Start opacity of the color gradient
 * @property {Number}   endOpacity              - End opacity of the color gradient
 * @property {Number}   vector                  - Direction vector of the color gradient
 * @property {Number}   compressedInterpolation  - Indicate whether or not the interpolation will be compressed
 */
export const LayerGradient = LayerColor.extend(
  /** @lends LayerGradient# */ {
    _endColor: null,
    _startOpacity: 255,
    _endOpacity: 255,
    _alongVector: null,
    _compressedInterpolation: false,
    _className: 'LayerGradient',
    _colorStops: [],

    /**
     * Constructor of LayerGradient
     * @param {Color} start
     * @param {Color} end
     * @param {Point} [v=p(0, -1)]
     * @param {Array|Null} stops
     *
     * @example Using ColorStops argument:
     * //startColor & endColor are for default and backward compatibility
     * var layerGradient = new LayerGradient(color.RED, new Color(255,0,0,0), p(0, -1),
     *                                          [{p:0, color: color.RED},
     *                                           {p:.5, color: new Color(0,0,0,0)},
     *                                           {p:1, color: color.RED}]);
     * //where p = A value between 0.0 and 1.0 that represents the position between start and end in a gradient
     *
     */
    ctor: function (start, end, v, stops) {
      LayerColor.prototype.ctor.call(this)
      this._endColor = color(0, 0, 0, 255)
      this._alongVector = p(0, -1)
      this._startOpacity = 255
      this._endOpacity = 255

      if (stops && stops instanceof Array) {
        this._colorStops = stops
        stops.splice(0, 0, { p: 0, color: start || Color.BLACK })
        stops.push({ p: 1, color: end || Color.BLACK })
      } else
        this._colorStops = [
          { p: 0, color: start || Color.BLACK },
          { p: 1, color: end || Color.BLACK },
        ]

      LayerGradient.prototype.init.call(this, start, end, v, stops)
    },

    /**
     * Initialization of the layer, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer
     * @param {Color} start starting color
     * @param {Color} end
     * @param {Point|Null} v
     * @param {Array|Null} stops
     * @return {Boolean}
     */
    init: function (start, end, v, stops) {
      start = start || color(0, 0, 0, 255)
      end = end || color(0, 0, 0, 255)
      v = v || p(0, -1)
      // Initializes the CCLayer with a gradient between start and end in the direction of v.
      const locEndColor = this._endColor
      this._startOpacity = start.a

      locEndColor.r = end.r
      locEndColor.g = end.g
      locEndColor.b = end.b
      this._endOpacity = end.a

      this._alongVector = v
      this._compressedInterpolation = true

      LayerColor.prototype.init.call(this, color(start.r, start.g, start.b, 255))
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty | Node._dirtyFlags.opacityDirty | Node._dirtyFlags.gradientDirty)
      return true
    },

    /**
     * Sets the untransformed size of the LayerGradient.
     * @param {Size|Number} size The untransformed size of the LayerGradient or The untransformed size's width of the LayerGradient.
     * @param {Number} [height] The untransformed size's height of the LayerGradient.
     */
    setContentSize: function (size, height) {
      LayerColor.prototype.setContentSize.call(this, size, height)
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.gradientDirty)
    },

    _setWidth: function (width) {
      LayerColor.prototype._setWidth.call(this, width)
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.gradientDirty)
    },
    _setHeight: function (height) {
      LayerColor.prototype._setHeight.call(this, height)
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.gradientDirty)
    },

    /**
     * Returns the starting color
     * @return {Color}
     */
    getStartColor: function () {
      return color(this._realColor)
    },

    /**
     * Sets the starting color
     * @param {Color} color
     * @example
     * // Example
     * myGradientLayer.setStartColor(color(255,0,0));
     * //set the starting gradient to red
     */
    setStartColor: function (color) {
      this.color = color
      //update the color stops
      const stops = this._colorStops
      if (stops && stops.length > 0) {
        const selColor = stops[0].color
        selColor.r = color.r
        selColor.g = color.g
        selColor.b = color.b
      }
    },

    /**
     * Sets the end gradient color
     * @param {Color} color
     * @example
     * // Example
     * myGradientLayer.setEndColor(color(255,0,0));
     * //set the ending gradient to red
     */
    setEndColor: function (color) {
      const locColor = this._endColor
      locColor.r = color.r
      locColor.g = color.g
      locColor.b = color.b
      //update the color stops
      const stops = this._colorStops
      if (stops && stops.length > 0) {
        const selColor = stops[stops.length - 1].color
        selColor.r = color.r
        selColor.g = color.g
        selColor.b = color.b
      }
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty)
    },

    /**
     * Returns the end color
     * @return {Color}
     */
    getEndColor: function () {
      return color(this._endColor)
    },

    /**
     * Sets starting gradient opacity
     * @param {Number} o from 0 to 255, 0 is transparent
     */
    setStartOpacity: function (o) {
      this._startOpacity = o
      //update the color stops
      const stops = this._colorStops
      if (stops && stops.length > 0) stops[0].color.a = o
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty)
    },

    /**
     * Returns the starting gradient opacity
     * @return {Number}
     */
    getStartOpacity: function () {
      return this._startOpacity
    },

    /**
     * Sets the end gradient opacity
     * @param {Number} o
     */
    setEndOpacity: function (o) {
      this._endOpacity = o
      const stops = this._colorStops
      if (stops && stops.length > 0) stops[stops.length - 1].color.a = o
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty)
    },

    /**
     * Returns the end gradient opacity
     * @return {Number}
     */
    getEndOpacity: function () {
      return this._endOpacity
    },

    /**
     * Sets the direction vector of the gradient
     * @param {Point} Var
     */
    setVector: function (Var) {
      this._alongVector.x = Var.x
      this._alongVector.y = Var.y
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.gradientDirty)
    },

    /**
     * Returns the direction vector of the gradient
     * @return {Point}
     */
    getVector: function () {
      return p(this._alongVector.x, this._alongVector.y)
    },

    /**
     * Returns whether compressed interpolation is enabled
     * @return {Boolean}
     */
    isCompressedInterpolation: function () {
      return this._compressedInterpolation
    },

    /**
     * Sets whether compressed interpolation is enabled
     * @param {Boolean} compress
     */
    setCompressedInterpolation: function (compress) {
      this._compressedInterpolation = compress
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.gradientDirty)
    },

    /**
     * Return an array of Object representing a colorStop for the gradient, if no stops was specified
     * start & endColor will be provided as default values
     * @example
     * [{p: 0, color: color.RED},{p: 1, color: color.RED},...]
     * @returns {Array}
     */
    getColorStops: function () {
      return this._colorStops
    },
    /**
     * Set the colorStops to create the gradient using multiple point & color
     *
     * @param colorStops
     *
     * @example
     * //startColor & endColor are for default and backward compatibility
     * var layerGradient = new LayerGradient(color.RED, new Color(255,0,0,0), p(0, -1));
     * layerGradient.setColorStops([{p:0, color: color.RED},
     *                              {p:.5, color: new Color(0,0,0,0)},
     *                              {p:1, color: color.RED}]);
     * //where p = A value between 0.0 and 1.0 that represents the position between start and end in a gradient
     *
     */
    setColorStops: function (colorStops) {
      this._colorStops = colorStops
      //todo need update  the start color and end color
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty | Node._dirtyFlags.opacityDirty | Node._dirtyFlags.gradientDirty)
    },

    _createRenderCmd: function () {
      return new LayerGradientWebGLRenderCmd(this)
    },
  },
)

//LayerGradient - Getter Setter
;(function () {
  const proto = LayerGradient.prototype
  // Extended properties
  defineGetterSetter(proto, 'startColor', proto.getStartColor, proto.setStartColor)
  defineGetterSetter(proto, 'endColor', proto.getEndColor, proto.setEndColor)
  defineGetterSetter(proto, 'startOpacity', proto.getStartOpacity, proto.setStartOpacity)
  defineGetterSetter(proto, 'endOpacity', proto.getEndOpacity, proto.setEndOpacity)
  defineGetterSetter(proto, 'vector', proto.getVector, proto.setVector)
  defineGetterSetter(proto, 'colorStops', proto.getColorStops, proto.setColorStops)
})()

/**
 * LayerGradient's rendering objects of WebGL
 */
const FLOAT_PER_VERTEX = 4

export const LayerGradientWebGLRenderCmd = function (renderable) {
  LayerColorWebGLRenderCmd.call(this, renderable)
  this._needDraw = true
  this._clipRect = Rect()
  this._clippingRectDirty = false
}
const proto = (LayerGradientWebGLRenderCmd.prototype = Object.create(LayerColorWebGLRenderCmd.prototype))
proto.constructor = LayerGradientWebGLRenderCmd

proto.updateStatus = function () {
  const flags = Node._dirtyFlags,
    locFlag = this._dirtyFlag
  if (locFlag & flags.gradientDirty) {
    this._dirtyFlag |= flags.colorDirty
    this._updateVertex()
    this._dirtyFlag &= ~flags.gradientDirty
  }

  this.originUpdateStatus()
}

proto._syncStatus = function (parentCmd) {
  const flags = Node._dirtyFlags,
    locFlag = this._dirtyFlag
  if (locFlag & flags.gradientDirty) {
    this._dirtyFlag |= flags.colorDirty
    this._updateVertex()
    this._dirtyFlag &= ~flags.gradientDirty
  }

  this._originSyncStatus(parentCmd)
}

proto.transform = function (parentCmd, recursive) {
  this.originTransform(parentCmd, recursive)
  this._updateVertex()
}

proto._updateVertex = function () {
  const node = this._node,
    stops = node._colorStops
  if (!stops || stops.length < 2) return

  this._clippingRectDirty = true
  let i
  const stopsLen = stops.length
  const verticesLen = stopsLen * 2
  const contentSize = node._contentSize
  if (this._positionView.length / FLOAT_PER_VERTEX < verticesLen) {
    this.initData(verticesLen)
  }

  //init vertex
  const angle = Math.PI + pAngleSigned(p(0, -1), node._alongVector),
    locAnchor = p(contentSize.width / 2, contentSize.height / 2)
  const degrees = Math.round(radiansToDegrees(angle))
  let transMat = affineTransformMake(1, 0, 0, 1, locAnchor.x, locAnchor.y)
  transMat = affineTransformRotate(transMat, angle)
  let a, b
  if (degrees < 90) {
    a = p(-locAnchor.x, locAnchor.y)
    b = p(locAnchor.x, locAnchor.y)
  } else if (degrees < 180) {
    a = p(locAnchor.x, locAnchor.y)
    b = p(locAnchor.x, -locAnchor.y)
  } else if (degrees < 270) {
    a = p(locAnchor.x, -locAnchor.y)
    b = p(-locAnchor.x, -locAnchor.y)
  } else {
    a = p(-locAnchor.x, -locAnchor.y)
    b = p(-locAnchor.x, locAnchor.y)
  }

  const sin = Math.sin(angle),
    cos = Math.cos(angle)
  const tx = Math.abs((a.x * cos - a.y * sin) / locAnchor.x),
    ty = Math.abs((b.x * sin + b.y * cos) / locAnchor.y)
  transMat = affineTransformScale(transMat, tx, ty)
  const pos = this._positionView
  for (i = 0; i < stopsLen; i++) {
    const stop = stops[i],
      y = stop.p * contentSize.height
    const p0 = pointApplyAffineTransform(-locAnchor.x, y - locAnchor.y, transMat)
    let offset = i * 2 * FLOAT_PER_VERTEX
    pos[offset] = p0.x
    pos[offset + 1] = p0.y
    pos[offset + 2] = node._vertexZ
    const p1 = pointApplyAffineTransform(contentSize.width - locAnchor.x, y - locAnchor.y, transMat)
    offset += FLOAT_PER_VERTEX
    pos[offset] = p1.x
    pos[offset + 1] = p1.y
    pos[offset + 2] = node._vertexZ
  }

  this._dataDirty = true
}

proto._updateColor = function () {
  const node = this._node,
    stops = node._colorStops
  if (!stops || stops.length < 2) return

  const stopsLen = stops.length
  let stopColor
  let offset, i
  const colors = this._colorView
  const opacityf = this._displayedOpacity / 255
  for (i = 0; i < stopsLen; i++) {
    stopColor = stops[i].color
    this._color[0] = ((stopColor.a * opacityf) << 24) | (stopColor.b << 16) | (stopColor.g << 8) | stopColor.r

    offset = i * 2 * FLOAT_PER_VERTEX
    colors[offset + 3] = this._color[0]
    offset += FLOAT_PER_VERTEX
    colors[offset + 3] = this._color[0]
  }
  this._dataDirty = true
}

proto.rendering = function (ctx) {
  const context = ctx || _renderContext,
    node = this._node

  if (!this._matrix) {
    this._matrix = new Matrix4()
    this._matrix.identity()
  }

  //it is too expensive to use stencil to clip, so it use Scissor,
  //but it has a bug when layer rotated and layer's content size less than canvas's size.
  const clippingRect = this._getClippingRect()
  context.enable(context.SCISSOR_TEST)
  view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height)

  const wt = this._worldTransform
  this._matrix.mat[0] = wt.a
  this._matrix.mat[4] = wt.c
  this._matrix.mat[12] = wt.tx
  this._matrix.mat[1] = wt.b
  this._matrix.mat[5] = wt.d
  this._matrix.mat[13] = wt.ty

  const gl = _renderContext
  if (this._dataDirty) {
    if (!this._vertexBuffer) {
      this._vertexBuffer = gl.createBuffer()
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW)
    this._dataDirty = false
  }

  //draw gradient layer
  this._glProgramState.apply(this._matrix)
  glBlendFunc(node._blendFunc.src, node._blendFunc.dst)

  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
  gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
  gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)

  gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  context.disable(context.SCISSOR_TEST)
}

proto._getClippingRect = function () {
  if (this._clippingRectDirty) {
    const node = this._node
    const rect = Rect(0, 0, node._contentSize.width, node._contentSize.height)
    const trans = node.getNodeToWorldTransform()
    this._clipRect = rectApplyAffineTransformIn(rect, trans)
  }
  return this._clipRect
}
