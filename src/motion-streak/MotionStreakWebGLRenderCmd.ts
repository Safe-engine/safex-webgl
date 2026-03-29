import { _renderContext, global } from '..'
import { NodeWebGLRenderCmd } from '../core/base-nodes/NodeWebGLRenderCmd'
import { Matrix4 } from '../core/kazmath/mat4'
import { SHADER_POSITION_TEXTURECOLOR, VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from '../core/platform'
import { glBindTexture2D, glBlendFunc } from '../shaders/GLStateCache'
import { shaderCache } from '../shaders/ShaderCache'
import { MotionStreak } from './MotionStreak'

export class MotionStreakWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _matrix: Matrix4
  declare _node: MotionStreak

  constructor(renderableObject: MotionStreak) {
    super(renderableObject)
    this._needDraw = true
    this._matrix = new Matrix4()
    this._matrix.identity()
    this._shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURECOLOR)
  }

  rendering() {
    const node = this._node
    if (node._nuPoints <= 1) return

    if (node.texture && node.texture.isLoaded()) {
      const ctx = _renderContext

      const wt = this._worldTransform
      this._matrix.mat[0] = wt.a
      this._matrix.mat[4] = wt.c
      this._matrix.mat[12] = wt.tx
      this._matrix.mat[1] = wt.b
      this._matrix.mat[5] = wt.d
      this._matrix.mat[13] = wt.ty

      this._glProgramState.apply(this._matrix)
      glBlendFunc(node._blendFunc.src, node._blendFunc.dst)

      glBindTexture2D(node.texture)

      ctx.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
      ctx.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)
      ctx.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)

      //position
      ctx.bindBuffer(ctx.ARRAY_BUFFER, node._verticesBuffer)
      ctx.bufferData(ctx.ARRAY_BUFFER, node._vertices, ctx.DYNAMIC_DRAW)
      ctx.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0)

      //texcoords
      ctx.bindBuffer(ctx.ARRAY_BUFFER, node._texCoordsBuffer)
      ctx.bufferData(ctx.ARRAY_BUFFER, node._texCoords, ctx.DYNAMIC_DRAW)
      ctx.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0)

      //colors
      ctx.bindBuffer(ctx.ARRAY_BUFFER, node._colorPointerBuffer)
      ctx.bufferData(ctx.ARRAY_BUFFER, node._colorPointer, ctx.DYNAMIC_DRAW)
      ctx.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0)

      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, node._nuPoints * 2)
      global.g_NumberOfDraws++
    }
  }
}
