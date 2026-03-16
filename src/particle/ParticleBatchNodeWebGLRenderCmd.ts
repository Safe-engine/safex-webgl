import { SHADER_POSITION_TEXTURECOLOR } from '../core'
import { NodeWebGLRenderCmd } from '../core/base-nodes/NodeWebGLRenderCmd'
import { Matrix4 } from '../core/kazmath/mat4'
import { glBlendFuncForParticle } from '../shaders/GLStateCache'
import { shaderCache } from '../shaders/ShaderCache'

export const ParticleBatchNodeWebGLRenderCmd = function (renderable) {
  this._rootCtor(renderable)
  this._needDraw = true
  this._matrix = new Matrix4()
  this._matrix.identity()
}

const proto = (ParticleBatchNodeWebGLRenderCmd.prototype = Object.create(NodeWebGLRenderCmd.prototype))
proto.constructor = ParticleBatchNodeWebGLRenderCmd

proto.rendering = function (ctx) {
  const _t = this._node
  if (_t.textureAtlas.totalQuads === 0) return

  const wt = this._worldTransform
  this._matrix.mat[0] = wt.a
  this._matrix.mat[4] = wt.c
  this._matrix.mat[12] = wt.tx
  this._matrix.mat[1] = wt.b
  this._matrix.mat[5] = wt.d
  this._matrix.mat[13] = wt.ty

  this._glProgramState.apply(this._matrix)
  glBlendFuncForParticle(_t._blendFunc.src, _t._blendFunc.dst)
  _t.textureAtlas.drawQuads()
}

proto._initWithTexture = function () {
  this._shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURECOLOR)
}
