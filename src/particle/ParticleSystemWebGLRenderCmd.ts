import { _renderContext } from '..'
import {
  BLEND_DST,
  BLEND_SRC,
  contentScaleFactor,
  degreesToRadians,
  ONE_MINUS_SRC_ALPHA,
  Point,
  Rect,
  SHADER_POSITION_TEXTURECOLOR,
  SRC_ALPHA,
  V3F_C4B_T2F_Quad,
  V3F_C4B_T2F_QuadZero,
  VERTEX_ATTRIB_COLOR,
  VERTEX_ATTRIB_POSITION,
  VERTEX_ATTRIB_TEX_COORDS,
} from '../core'
import { NodeWebGLRenderCmd } from '../core/base-nodes/NodeWebGLRenderCmd'
import { Matrix4 } from '../core/kazmath/mat4'
import { FIX_ARTIFACTS_BY_STRECHING_TEXEL } from '../core/platform/Config'
import { log } from '../helper/Debugger'
import { glBindTexture2D, glBlendFuncForParticle } from '../shaders/GLStateCache'
import { shaderCache } from '../shaders/ShaderCache'
import { Particle } from './Particle'
import type { ParticleSystem } from './ParticleSystem'

export class ParticleSystemWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _matrix: Matrix4
  _buffersVBO: any[] = [0, 0]
  _quads: any[] = []
  _indices: any = []
  _quadsArrayBuffer: ArrayBuffer | null = null
  declare _node: ParticleSystem

  constructor(renderable: any) {
    super(renderable)
    this._needDraw = true
  }

  getDrawMode() {}
  setDrawMode(_drawMode: any) {}
  getShapeType() {}
  setShapeType(_shapeType: any) {}

  setBatchNode(batchNode: Node) {
    const node = this._node
    if (node._batchNode !== batchNode) {
      const oldBatch = node._batchNode
      node._batchNode = batchNode //weak reference

      if (batchNode) {
        const locParticles = node._particles
        for (let i = 0; i < node._totalParticles; i++) locParticles[i].atlasIndex = i
      }

      // NEW: is self render ?
      if (!batchNode) {
        this._allocMemory()
        this.initIndices(node._totalParticles)
        node.setTexture(oldBatch.getTexture())
        this._setupVBO()
      } else if (!oldBatch) {
        // OLD: was it self render cleanup  ?
        // copy current state to batch
        node._batchNode.textureAtlas._copyQuadsToTextureAtlas(this._quads, node.atlasIndex)

        //delete buffer
        _renderContext.deleteBuffer(this._buffersVBO[1]) //where is re-bindBuffer code?
      }
    }
  }

  initIndices(totalParticles: number): void {
    const locIndices = this._indices
    for (let i = 0, len = totalParticles; i < len; ++i) {
      const i6 = i * 6
      const i4 = i * 4
      locIndices[i6 + 0] = i4 + 0
      locIndices[i6 + 1] = i4 + 1
      locIndices[i6 + 2] = i4 + 2

      locIndices[i6 + 5] = i4 + 1
      locIndices[i6 + 4] = i4 + 2
      locIndices[i6 + 3] = i4 + 3
    }
  }

  isDifferentTexture(texture1: any, texture2: any): boolean {
    return texture1 === texture2
  }

  updateParticlePosition(particle: any, position: any): void {
    // IMPORTANT: newPos may not be used as a reference here! (as it is just the temporary tpa point)
    // the implementation of updateQuadWithParticle must use
    // the x and y values directly
    this.updateQuadWithParticle(particle, position)
  }

  updateQuadWithParticle(particle: any, newPosition: Point): void {
    let quad
    const node = this._node
    if (node._batchNode) {
      const batchQuads = node._batchNode.textureAtlas.quads
      quad = batchQuads[node.atlasIndex + particle.atlasIndex]
      node._batchNode.textureAtlas.dirty = true
    } else quad = this._quads[node._particleIdx]

    let r, g, b
    if (node._opacityModifyRGB) {
      r = 0 | ((particle.color.r * particle.color.a) / 255)
      g = 0 | ((particle.color.g * particle.color.a) / 255)
      b = 0 | ((particle.color.b * particle.color.a) / 255)
    } else {
      r = 0 | particle.color.r
      g = 0 | particle.color.g
      b = 0 | particle.color.b
    }
    const a = 0 | particle.color.a

    const blColors = quad.bl.colors,
      brColors = quad.br.colors,
      tlColors = quad.tl.colors,
      trColors = quad.tr.colors
    blColors.r = brColors.r = tlColors.r = trColors.r = r
    blColors.g = brColors.g = tlColors.g = trColors.g = g
    blColors.b = brColors.b = tlColors.b = trColors.b = b
    blColors.a = brColors.a = tlColors.a = trColors.a = a

    // vertices
    const size_2 = particle.size / 2
    if (particle.rotation) {
      const x1 = -size_2,
        y1 = -size_2

      const x2 = size_2,
        y2 = size_2
      const x = newPosition.x,
        y = newPosition.y

      const rad = -degreesToRadians(particle.rotation)
      const cr = Math.cos(rad),
        sr = Math.sin(rad)
      const ax = x1 * cr - y1 * sr + x
      const ay = x1 * sr + y1 * cr + y
      const bx = x2 * cr - y1 * sr + x
      const by = x2 * sr + y1 * cr + y
      const cx = x2 * cr - y2 * sr + x
      const cy = x2 * sr + y2 * cr + y
      const dx = x1 * cr - y2 * sr + x
      const dy = x1 * sr + y2 * cr + y

      // bottom-left
      quad.bl.vertices.x = ax
      quad.bl.vertices.y = ay

      // bottom-right vertex:
      quad.br.vertices.x = bx
      quad.br.vertices.y = by

      // top-left vertex:
      quad.tl.vertices.x = dx
      quad.tl.vertices.y = dy

      // top-right vertex:
      quad.tr.vertices.x = cx
      quad.tr.vertices.y = cy
    } else {
      // bottom-left vertex:
      quad.bl.vertices.x = newPosition.x - size_2
      quad.bl.vertices.y = newPosition.y - size_2

      // bottom-right vertex:
      quad.br.vertices.x = newPosition.x + size_2
      quad.br.vertices.y = newPosition.y - size_2

      // top-left vertex:
      quad.tl.vertices.x = newPosition.x - size_2
      quad.tl.vertices.y = newPosition.y + size_2

      // top-right vertex:
      quad.tr.vertices.x = newPosition.x + size_2
      quad.tr.vertices.y = newPosition.y + size_2
    }
  }

  rendering(ctx: any): void {
    const node: any = this._node
    if (!node._texture) return

    const gl = ctx || _renderContext

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

    this._glProgramState.apply(this._matrix)

    glBindTexture2D(node._texture)
    glBlendFuncForParticle(node._blendFunc.src, node._blendFunc.dst)

    //
    // Using VBO without VAO
    //
    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)

    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0])
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0) // vertices
    gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12) // colors
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16) // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1])
    gl.drawElements(gl.TRIANGLES, node._particleIdx * 6, gl.UNSIGNED_SHORT, 0)
  }

  initTexCoordsWithRect(pointRect: any): void {
    const node: any = this._node
    const texture = node.texture
    const scaleFactor = contentScaleFactor()
    // convert to pixels coords
    const rect = Rect(pointRect.x * scaleFactor, pointRect.y * scaleFactor, pointRect.width * scaleFactor, pointRect.height * scaleFactor)

    let wide = pointRect.width
    let high = pointRect.height

    if (texture) {
      wide = texture.pixelsWidth
      high = texture.pixelsHeight
    }

    let left, bottom, right, top
    if (FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
      left = (rect.x * 2 + 1) / (wide * 2)
      bottom = (rect.y * 2 + 1) / (high * 2)
      right = left + (rect.width * 2 - 2) / (wide * 2)
      top = bottom + (rect.height * 2 - 2) / (high * 2)
    } else {
      left = rect.x / wide
      bottom = rect.y / high
      right = left + rect.width / wide
      top = bottom + rect.height / high
    }

    // Important. Texture in cocos2d are inverted, so the Y component should be inverted
    const temp = top
    top = bottom
    bottom = temp

    let quads
    let start
    let end
    if (node._batchNode) {
      quads = node._batchNode.textureAtlas.quads
      start = node.atlasIndex
      end = node.atlasIndex + node._totalParticles
    } else {
      quads = this._quads
      start = 0
      end = node._totalParticles
    }

    for (let i = start; i < end; i++) {
      if (!quads[i]) quads[i] = V3F_C4B_T2F_QuadZero()

      // bottom-left vertex:
      const selQuad = quads[i]
      selQuad.bl.texCoords.u = left
      selQuad.bl.texCoords.v = bottom
      // bottom-right vertex:
      selQuad.br.texCoords.u = right
      selQuad.br.texCoords.v = bottom
      // top-left vertex:
      selQuad.tl.texCoords.u = left
      selQuad.tl.texCoords.v = top
      // top-right vertex:
      selQuad.tr.texCoords.u = right
      selQuad.tr.texCoords.v = top
    }
  }

  setTotalParticles(tp: number): void {
    const node: any = this._node
    // If we are setting the total numer of particles to a number higher
    // than what is allocated, we need to allocate new arrays
    if (tp > node._allocatedParticles) {
      const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
      // Allocate new memory
      this._indices = new Uint16Array(tp * 6)
      const locQuadsArrayBuffer = new ArrayBuffer(tp * quadSize)
      //TODO need fix
      // Assign pointers
      const locParticles = node._particles
      locParticles.length = 0
      const locQuads = this._quads
      locQuads.length = 0
      for (let j = 0; j < tp; j++) {
        locParticles[j] = new Particle()
        locQuads[j] = new V3F_C4B_T2F_Quad(null, null, null, null, locQuadsArrayBuffer, j * quadSize)
      }
      node._allocatedParticles = tp
      node._totalParticles = tp

      // Init particles
      if (node._batchNode) {
        for (let i = 0; i < tp; i++) locParticles[i].atlasIndex = i
      }

      this._quadsArrayBuffer = locQuadsArrayBuffer
      this.initIndices(tp)
      this._setupVBO()

      //set the texture coord
      if (node._texture) {
        this.initTexCoordsWithRect(Rect(0, 0, node._texture.width, node._texture.height))
      }
    } else node._totalParticles = tp
    node.resetSystem()
  }

  addParticle(): any {
    const node: any = this._node,
      particles = node._particles
    return particles[node.particleCount]
  }

  _setupVBO(): void {
    const gl = _renderContext

    //gl.deleteBuffer(this._buffersVBO[0]);
    this._buffersVBO[0] = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0])
    gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW)

    this._buffersVBO[1] = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1])
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)

    //checkGLErrorDebug();
  }

  _allocMemory(): boolean {
    const node: any = this._node
    //assert((!this._quads && !this._indices), "Memory already allocated");
    if (node._batchNode) {
      log('ParticleSystem._allocMemory(): Memory should not be allocated when not using batchNode')
      return false
    }

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    const totalParticles = node._totalParticles
    const locQuads = this._quads
    locQuads.length = 0
    this._indices = new Uint16Array(totalParticles * 6)
    const locQuadsArrayBuffer = new ArrayBuffer(quadSize * totalParticles)

    for (let i = 0; i < totalParticles; i++) {
      locQuads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, locQuadsArrayBuffer, i * quadSize)
    }
    if (!locQuads || !this._indices) {
      log('cocos2d: Particle system: not enough memory')
      return false
    }
    this._quadsArrayBuffer = locQuadsArrayBuffer
    return true
  }

  postStep(): void {
    const gl = _renderContext
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0])
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._quadsArrayBuffer)
  }

  _setBlendAdditive(): void {
    const node: any = this._node
    const locBlendFunc = node._blendFunc
    const texture = node._texture
    if (texture && !texture.hasPremultipliedAlpha()) {
      locBlendFunc.src = SRC_ALPHA
      locBlendFunc.dst = ONE_MINUS_SRC_ALPHA
    } else {
      locBlendFunc.src = BLEND_SRC
      locBlendFunc.dst = BLEND_DST
    }
  }

  _initWithTotalParticles(totalParticles: number): boolean {
    // allocating data space
    if (!this._allocMemory()) return false

    this.initIndices(totalParticles)
    this._setupVBO()

    this._shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURECOLOR)
    return true
  }

  _updateDeltaColor(selParticle: any, dt: number): void {
    selParticle.color.r += selParticle.deltaColor.r * dt
    selParticle.color.g += selParticle.deltaColor.g * dt
    selParticle.color.b += selParticle.deltaColor.b * dt
    selParticle.color.a += selParticle.deltaColor.a * dt
    selParticle.isChangeColor = true
  }
}
