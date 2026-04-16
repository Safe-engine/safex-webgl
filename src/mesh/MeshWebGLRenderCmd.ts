import { incrementGLDraws, NodeWebGLRenderCmd } from '../core'
import { MeshNode } from './MeshNode'

export class MeshWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _node: MeshNode

  constructor(node: MeshNode) {
    super(node)
    this._node = node
  }

  public rendering(ctx: WebGLRenderingContext) {
    console.log('rendering mesh')
    const gl = ctx

    const node = this._node

    if (!node.texture || !node.texture.isLoaded()) return

    const program = node.shaderProgram
    program.use()
    program.setUniformsForBuiltins()

    // texture
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, node.texture.getName())

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
