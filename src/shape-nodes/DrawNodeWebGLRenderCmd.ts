import { NodeWebGLRenderCmd } from '../core/base-nodes/NodeWebGLRenderCmd'
import { Matrix4 } from '../core/kazmath/mat4'
import { glBlendFunc } from '../shaders/GLStateCache'

export const DrawNodeWebGLRenderCmd = function (renderableObject) {
  this._rootCtor(renderableObject)
  this._needDraw = true
  this._matrix = new Matrix4()
  this._matrix.identity()
}

DrawNodeWebGLRenderCmd.prototype = Object.create(NodeWebGLRenderCmd.prototype)
DrawNodeWebGLRenderCmd.prototype.constructor = DrawNodeWebGLRenderCmd

DrawNodeWebGLRenderCmd.prototype.rendering = function (ctx) {
  const node = this._node
  if (node._vertexCount > 0) {
    const wt = this._worldTransform
    this._matrix.mat[0] = wt.a
    this._matrix.mat[4] = wt.c
    this._matrix.mat[12] = wt.tx
    this._matrix.mat[1] = wt.b
    this._matrix.mat[5] = wt.d
    this._matrix.mat[13] = wt.ty

    glBlendFunc(node._blendFunc.src, node._blendFunc.dst)
    this._glProgramState.apply(this._matrix)
    node._render()
  }
}
