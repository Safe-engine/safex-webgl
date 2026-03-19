import { V3F_C4B_T2F_Quad } from '../platform/Types'

const VERTICES_SIZE = 888

export class GlobalVertexBuffer {
  declare gl: WebGLRenderingContext
  declare vertexBuffer: WebGLBuffer | null
  declare size: number
  declare byteLength: number
  declare data: ArrayBuffer | null
  declare dataArray: Float32Array | null
  declare _dirty: boolean
  declare _spaces: Record<number, number>

  constructor(gl: WebGLRenderingContext, byteLength?: number) {
    // WebGL buffer
    this.gl = gl
    this.vertexBuffer = gl.createBuffer()

    this.size = VERTICES_SIZE
    this.byteLength = byteLength || VERTICES_SIZE * 4 * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT

    // buffer data and views
    this.data = new ArrayBuffer(this.byteLength)
    this.dataArray = new Float32Array(this.data)

    // Init buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.dataArray, gl.DYNAMIC_DRAW)

    this._dirty = false
    this._spaces = {
      0: this.byteLength,
    }
  }

  allocBuffer(offset: number, size: number): boolean {
    const space = this._spaces[offset]
    if (space && space >= size) {
      // Remove the space
      delete this._spaces[offset]
      if (space > size) {
        const newOffset = offset + size
        this._spaces[newOffset] = space - size
      }
      return true
    } else {
      return false
    }
  }

  requestBuffer(size: number): number {
    let key: string
    let offset: number
    let available: number
    for (key in this._spaces) {
      offset = parseInt(key)
      available = this._spaces[key]
      if (available >= size && this.allocBuffer(offset, size)) {
        return offset
      }
    }
    return -1
  }

  freeBuffer(offset: number, size: number) {
    const spaces = this._spaces
    let i: number
    let key: string
    // Merge with previous space
    for (key in spaces) {
      i = parseInt(key)
      if (i > offset) {
        break
      }
      if (i + spaces[key] >= offset) {
        size = size + offset - i
        offset = i
        break
      }
    }

    const end = offset + size
    // Merge with next space
    if (this._spaces[end]) {
      size += this._spaces[end]
      delete this._spaces[end]
    }

    this._spaces[offset] = size
  }

  setDirty() {
    this._dirty = true
  }

  update() {
    if (this._dirty && this.vertexBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
      // Note: Can memorize different dirty zones and update them separately, maybe faster
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.dataArray!)
      this._dirty = false
    }
  }

  updateSubData(offset: number, dataArray: ArrayBufferView) {
    if (this.vertexBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, dataArray)
    }
  }

  destroy() {
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer)
    }

    this.data = null
    this.dataArray = null
    this.vertexBuffer = null
  }
}
