import { incrementGLDraws, NodeWebGLRenderCmd } from '../core'
import { KM_GL_MODELVIEW, KM_GL_PROJECTION, kmGLGetMatrix, kmMat4Multiply, Matrix4 } from '../core/kazmath'
import { UNIFORM_MVMATRIX_S, UNIFORM_MVPMATRIX_S } from '../core/platform/Macro'
import { MeshNode } from './MeshNode'

export class MeshWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _node: MeshNode

  constructor(node: MeshNode) {
    super(node)
    this._node = node
    this._needDraw = true
  }

  public rendering(ctx: WebGLRenderingContext) {
    const gl = ctx
    const node = this._node

    if (!node.texture || !node.texture.isLoaded()) return

    const program = node.shaderProgram
    program.use()

    const matrixP = new Matrix4()
    const matrixMV = new Matrix4()
    const matrixMVP = new Matrix4()

    kmGLGetMatrix(KM_GL_PROJECTION, matrixP)
    kmGLGetMatrix(KM_GL_MODELVIEW, matrixMV)

    // Calculate node's world transform matrix
    const wt = this._worldTransform
    const wtMatrix = new Matrix4()
    wtMatrix.mat[0] = wt.a
    wtMatrix.mat[4] = wt.c
    wtMatrix.mat[8] = 0
    wtMatrix.mat[12] = wt.tx
    wtMatrix.mat[1] = wt.b
    wtMatrix.mat[5] = wt.d
    wtMatrix.mat[9] = 0
    wtMatrix.mat[13] = wt.ty
    wtMatrix.mat[2] = 0
    wtMatrix.mat[6] = 0
    wtMatrix.mat[10] = 1
    wtMatrix.mat[14] = 0
    wtMatrix.mat[3] = 0
    wtMatrix.mat[7] = 0
    wtMatrix.mat[11] = 0
    wtMatrix.mat[15] = 1

    const finalMV = new Matrix4()
    kmMat4Multiply(finalMV, matrixMV, wtMatrix)
    kmMat4Multiply(matrixMVP, matrixP, finalMV)

    // Set engine built-in uniforms FIRST (this sets time, random, identity MV, identity MVP, etc.)
    program.setUniformsForBuiltins()

    // Override MVP and MV with our custom derived matrices
    program.setUniformLocationWithMatrix4fv(UNIFORM_MVMATRIX_S, finalMV.mat)
    program.setUniformLocationWithMatrix4fv(UNIFORM_MVPMATRIX_S, matrixMVP.mat)

    // texture
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, node.texture._webTextureObj)

    const glProgram = program.getProgram()

    // position
    const posLoc = gl.getAttribLocation(glProgram, 'a_position')
    gl.bindBuffer(gl.ARRAY_BUFFER, node.vertexBuffer)
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // uv
    const uvLoc = gl.getAttribLocation(glProgram, 'a_texCoord')
    gl.bindBuffer(gl.ARRAY_BUFFER, node.uvBuffer)
    gl.enableVertexAttribArray(uvLoc)
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0)

    // draw
    const count = node.vertices.length / 2
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, count)

    incrementGLDraws(1)
  }
}
