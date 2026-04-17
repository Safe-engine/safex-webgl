import { _renderContext, Node } from '..'
import { GLProgram } from '../shaders'
import { Texture2D, textureCache } from '../textures'
import { MeshWebGLRenderCmd } from './MeshWebGLRenderCmd'

export class MeshNode extends Node {
  declare vertices: Float32Array
  declare uvs: Float32Array

  declare texture: Texture2D

  declare vertexBuffer: WebGLBuffer
  declare uvBuffer: WebGLBuffer

  declare shaderProgram: GLProgram

  initMesh(texturePath: string, vertices: Float32Array, uvs: Float32Array) {
    if (vertices.length !== uvs.length) {
      throw new Error('vertices và uvs phải cùng length')
    }

    this.vertices = vertices
    this.uvs = uvs

    this.initTexture(texturePath)
    this.initGL()
  }

  private initTexture(path: string) {
    this.texture = textureCache.addImage(path)
  }

  private initGL() {
    const gl: WebGLRenderingContext = _renderContext

    // buffers
    this.vertexBuffer = gl.createBuffer()
    this.uvBuffer = gl.createBuffer()

    this.updateBuffers()

    // shader
    const vertSrc = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;

            void main() {
                gl_Position = CC_PMatrix * CC_MVMatrix * vec4(a_position, 0.0, 1.0);
                v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
            }
        `

    const fragSrc = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;

            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `

    this.shaderProgram = new GLProgram()
    this.shaderProgram.initWithString(vertSrc, fragSrc)
    this.shaderProgram.link()
    this.shaderProgram.updateUniforms()
  }

  public updateBuffers() {
    const gl: WebGLRenderingContext = _renderContext

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW)
  }

  public updateVertices(vertices: Float32Array) {
    this.vertices = vertices
    this.updateBuffers()
  }

  _createRenderCmd() {
    return new MeshWebGLRenderCmd(this)
  }
}
