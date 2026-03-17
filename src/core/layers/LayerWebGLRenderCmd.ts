import { _renderContext } from '../..'
import { glBlendFunc } from '../../shaders/GLStateCache'
import { shaderCache } from '../../shaders/ShaderCache'
import { NodeWebGLRenderCmd } from '../base-nodes/NodeWebGLRenderCmd'
import { Matrix4 } from '../kazmath/mat4'
import { SHADER_POSITION_COLOR, VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION } from '../platform'

export const LayerWebGLRenderCmd = function (renderable) {
  this._rootCtor(renderable)
  this._isBaked = false
}

const proto = (LayerWebGLRenderCmd.prototype = Object.create(NodeWebGLRenderCmd.prototype))
proto.constructor = LayerWebGLRenderCmd
proto._layerCmdCtor = LayerWebGLRenderCmd

proto.bake = function () {}

proto.unbake = function () {}

proto._bakeForAddChild = function () {}

/**
 * LayerColor's rendering objects of WebGL
 */
const FLOAT_PER_VERTEX = 4

export const LayerColorWebGLRenderCmd = function (renderable) {
  this._layerCmdCtor(renderable)
  this._needDraw = true

  this._matrix = null

  this.initData(4)
  this._color = new Uint32Array(1)
  this._vertexBuffer = null

  this._shaderProgram = shaderCache.programForKey(SHADER_POSITION_COLOR)
}
const proto = (LayerColorWebGLRenderCmd.prototype = Object.create(LayerWebGLRenderCmd.prototype))
proto.constructor = LayerColorWebGLRenderCmd

proto.initData = function (vertexCount) {
  this._data = new ArrayBuffer(16 * vertexCount)
  this._positionView = new Float32Array(this._data)
  this._colorView = new Uint32Array(this._data)
  this._dataDirty = true
}

proto.transform = function (parentCmd, recursive) {
  this.originTransform(parentCmd, recursive)

  const node = this._node,
    width = node._contentSize.width,
    height = node._contentSize.height

  const pos = this._positionView
  pos[FLOAT_PER_VERTEX] = width // br.x
  pos[FLOAT_PER_VERTEX * 2 + 1] = height // tl.y
  pos[FLOAT_PER_VERTEX * 3] = width // tr.x
  pos[FLOAT_PER_VERTEX * 3 + 1] = height // tr.y
  pos[2].z = pos[FLOAT_PER_VERTEX + 2] = pos[FLOAT_PER_VERTEX * 2 + 2] = pos[FLOAT_PER_VERTEX * 3 + 2] = node._vertexZ

  this._dataDirty = true
}

proto._updateColor = function () {
  const color = this._displayedColor
  this._color[0] = (this._displayedOpacity << 24) | (color.b << 16) | (color.g << 8) | color.r

  const colors = this._colorView
  for (let i = 0; i < 4; i++) {
    colors[i * FLOAT_PER_VERTEX + 3] = this._color[0]
  }
  this._dataDirty = true
}

proto.rendering = function (ctx) {
  const gl = ctx || _renderContext
  const node = this._node

  if (!this._matrix) {
    this._matrix = new Matrix4()
    this._matrix.identity()
  }

  const wt = this._worldTransform
  this._matrix.mat[0] = wt.a
  this._matrix.mat[4] = wt.c
  this._matrix.mat[12] = wt.tx
  this._matrix.mat[1] = wt.b
  this._matrix.mat[5] = wt.d
  this._matrix.mat[13] = wt.ty

  if (this._dataDirty) {
    if (!this._vertexBuffer) {
      this._vertexBuffer = gl.createBuffer()
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW)
    this._dataDirty = false
  }

  this._glProgramState.apply(this._matrix)
  glBlendFunc(node._blendFunc.src, node._blendFunc.dst)

  gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
  gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
  gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)

  gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

proto.updateBlendFunc = function (blendFunc) {}
