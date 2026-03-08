import { _renderContext, Game, game } from '../..'
import { isFunction, isString } from '../../helper/checkType'
import { _LogInfos, assert, log } from '../../helper/Debugger'
import { _renderType } from '../../helper/engine'
import { _tmp } from '../../helper/global'
import { TEXTURE_ATLAS_USE_TRIANGLE_STRIP } from '../core/platform/Config'
import { V3F_C4B_T2F_Quad } from '../core/platform/Types'
import { textureCache } from './TextureCache'
import { Texture2D } from './TexturesWebGL'

export class TextureAtlas {
  // WebGL only
  dirty = false
  texture: any = null

  _indices: Uint16Array | null = null
  // 0: vertex  1: indices
  _buffersVBO: any[] | null = null
  _capacity = 0
  _totalQuads = 0

  _quads: any[] | null = null
  _quadsArrayBuffer: ArrayBuffer | null = null
  _quadsWebBuffer: any = null
  _quadsReader: Uint8Array | null = null

  /**
   * <p>Creates a TextureAtlas with an filename and with an initial capacity for Quads. <br />
   * The TextureAtlas capacity can be increased in runtime. </p>
   * Constructor of TextureAtlas
   * @param {String|Texture2D} fileName
   * @param {Number} capacity
   * @example
   * 1.
   * //creates a TextureAtlas with  filename
   * var textureAtlas = new TextureAtlas("res/hello.png", 3);
   * 2.
   * //creates a TextureAtlas with texture
   * var texture = textureCache.addImage("hello.png");
   * var textureAtlas = new TextureAtlas(texture, 3);
   */
  constructor(fileName?: any, capacity?: number) {
    this._buffersVBO = []

    if (fileName !== undefined) {
      if (isString(fileName)) {
        this.initWithFile(fileName, capacity)
      } else if (fileName instanceof Texture2D) {
        this.initWithTexture(fileName, capacity)
      }
    }
  }

  /**
   * Quantity of quads that are going to be drawn.
   * @return {Number}
   */
  getTotalQuads(): number {
    return this._totalQuads
  }

  /**
   * Quantity of quads that can be stored with the current texture atlas size
   * @return {Number}
   */
  getCapacity(): number {
    return this._capacity
  }

  /**
   * Texture of the texture atlas
   * @return {Image}
   */
  getTexture(): any {
    return this.texture
  }

  /**
   * @param {Image} texture
   */
  setTexture(texture: any): void {
    this.texture = texture
  }

  /**
   * specify if the array buffer of the VBO needs to be updated
   * @param {Boolean} dirty
   */
  setDirty(dirty: boolean): void {
    this.dirty = dirty
  }

  /**
   * whether or not the array buffer of the VBO needs to be updated
   * @returns {boolean}
   */
  isDirty(): boolean {
    return this.dirty
  }

  /**
   * Quads that are going to be rendered
   * @return {Array}
   */
  getQuads(): any[] {
    return this._quads!
  }

  /**
   * @param {Array} quads
   */
  setQuads(quads: any[]): void {
    this._quads = quads
  }

  _copyQuadsToTextureAtlas(quads: any[], index: number): void {
    if (!quads) return

    for (let i = 0; i < quads.length; i++) this._setQuadToArray(quads[i], index + i)
  }

  _setQuadToArray(quad: any, index: number): void {
    const locQuads = this._quads!
    if (!locQuads[index]) {
      locQuads[index] = new V3F_C4B_T2F_Quad(
        quad.tl,
        quad.bl,
        quad.tr,
        quad.br,
        this._quadsArrayBuffer,
        index * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
      )
      return
    }
    locQuads[index].bl = quad.bl
    locQuads[index].br = quad.br
    locQuads[index].tl = quad.tl
    locQuads[index].tr = quad.tr
  }

  /**
   * Description
   * @return {String}
   */
  description(): string {
    return `<TextureAtlas | totalQuads =${this._totalQuads}>`
  }

  _setupIndices(): void {
    if (this._capacity === 0) return
    const locIndices = this._indices!,
      locCapacity = this._capacity
    for (let i = 0; i < locCapacity; i++) {
      if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP) {
        locIndices[i * 6 + 0] = i * 4 + 0
        locIndices[i * 6 + 1] = i * 4 + 0
        locIndices[i * 6 + 2] = i * 4 + 2
        locIndices[i * 6 + 3] = i * 4 + 1
        locIndices[i * 6 + 4] = i * 4 + 3
        locIndices[i * 6 + 5] = i * 4 + 3
      } else {
        locIndices[i * 6 + 0] = i * 4 + 0
        locIndices[i * 6 + 1] = i * 4 + 1
        locIndices[i * 6 + 2] = i * 4 + 2

        // inverted index. issue #179
        locIndices[i * 6 + 3] = i * 4 + 3
        locIndices[i * 6 + 4] = i * 4 + 2
        locIndices[i * 6 + 5] = i * 4 + 1
      }
    }
  }

  _setupVBO(): void {
    const gl = _renderContext
    //create WebGLBuffer
    this._buffersVBO![0] = gl.createBuffer()
    this._buffersVBO![1] = gl.createBuffer()

    this._quadsWebBuffer = gl.createBuffer()
    this._mapBuffers()
  }

  _mapBuffers(): void {
    const gl = _renderContext

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO![1])
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)
  }

  /**
   * <p>Initializes a TextureAtlas with a filename and with a certain capacity for Quads.<br />
   * The TextureAtlas capacity can be increased in runtime.<br />
   * WARNING: Do not reinitialize the TextureAtlas because it will leak memory. </p>
   * @param {String} file
   * @param {Number} capacity
   * @return {Boolean}
   * @example
   * //example
   * var textureAtlas = new TextureAtlas();
   * textureAtlas.initWithTexture("hello.png", 3);
   */
  initWithFile(file: string, capacity: number): boolean {
    // retained in property
    const texture = textureCache.addImage(file)
    if (texture) return this.initWithTexture(texture, capacity)
    else {
      log(_LogInfos.TextureAtlas_initWithFile, file)
      return false
    }
  }

  /**
   * <p>Initializes a TextureAtlas with a previously initialized Texture2D object, and<br />
   * with an initial capacity for Quads.<br />
   * The TextureAtlas capacity can be increased in runtime.<br />
   * WARNING: Do not reinitialize the TextureAtlas because it will leak memory</p>
   * @param {Image} texture
   * @param {Number} capacity
   * @return {Boolean}
   * @example
   * //example
   * var texture = textureCache.addImage("hello.png");
   * var textureAtlas = new TextureAtlas();
   * textureAtlas.initWithTexture(texture, 3);
   */
  initWithTexture(texture: any, capacity: number): boolean {
    assert(texture, _LogInfos.TextureAtlas_initWithTexture)

    capacity = 0 | capacity
    this._capacity = capacity
    this._totalQuads = 0

    // retained in property
    this.texture = texture

    // Re-initialization is not allowed
    this._quads = []
    this._indices = new Uint16Array(capacity * 6)
    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    this._quadsArrayBuffer = new ArrayBuffer(quadSize * capacity)
    this._quadsReader = new Uint8Array(this._quadsArrayBuffer)

    if (!(this._quads && this._indices) && capacity > 0) return false

    const locQuads = this._quads
    for (let i = 0; i < capacity; i++) locQuads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, i * quadSize)

    this._setupIndices()
    this._setupVBO()
    this.dirty = true
    return true
  }

  /**
   * <p>Updates a Quad (texture, vertex and color) at a certain index <br />
   * index must be between 0 and the atlas capacity - 1 </p>
   * @param {V3F_C4B_T2F_Quad} quad
   * @param {Number} index
   */
  updateQuad(quad: any, index: number): void {
    assert(quad, _LogInfos.TextureAtlas_updateQuad)
    assert(index >= 0 && index < this._capacity, _LogInfos.TextureAtlas_updateQuad_2)

    this._totalQuads = Math.max(index + 1, this._totalQuads)
    this._setQuadToArray(quad, index)
    this.dirty = true
  }

  /**
   * <p>Inserts a Quad (texture, vertex and color) at a certain index<br />
   * index must be between 0 and the atlas capacity - 1 </p>
   * @param {V3F_C4B_T2F_Quad} quad
   * @param {Number} index
   */
  insertQuad(quad: any, index: number): void {
    assert(index < this._capacity, _LogInfos.TextureAtlas_insertQuad_2)

    this._totalQuads++
    if (this._totalQuads > this._capacity) {
      log(_LogInfos.TextureAtlas_insertQuad)
      return
    }
    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    // issue #575. index can be > totalQuads
    const remaining = this._totalQuads - 1 - index
    const startOffset = index * quadSize
    const moveLength = remaining * quadSize
    this._quads![this._totalQuads - 1] = new V3F_C4B_T2F_Quad(
      null,
      null,
      null,
      null,
      this._quadsArrayBuffer,
      (this._totalQuads - 1) * quadSize,
    )
    this._quadsReader!.set(this._quadsReader!.subarray(startOffset, startOffset + moveLength), startOffset + quadSize)

    this._setQuadToArray(quad, index)
    this.dirty = true
  }

  /**
   * <p>
   *      Inserts a c array of quads at a given index                                           <br />
   *      index must be between 0 and the atlas capacity - 1                                    <br />
   *      this method doesn't enlarge the array when amount + index > totalQuads                <br />
   * </p>
   * @param {Array} quads
   * @param {Number} index
   * @param {Number} amount
   */
  insertQuads(quads: any[], index: number, amount?: number): void {
    amount = amount || quads.length

    assert(index + amount <= this._capacity, _LogInfos.TextureAtlas_insertQuads)

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    this._totalQuads += amount
    if (this._totalQuads > this._capacity) {
      log(_LogInfos.TextureAtlas_insertQuad)
      return
    }

    // issue #575. index can be > totalQuads
    const remaining = this._totalQuads - 1 - index - amount
    const startOffset = index * quadSize
    const moveLength = remaining * quadSize
    const lastIndex = this._totalQuads - 1 - amount

    let i
    for (i = 0; i < amount; i++)
      this._quads![lastIndex + i] = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * quadSize)
    this._quadsReader!.set(this._quadsReader!.subarray(startOffset, startOffset + moveLength), startOffset + quadSize * amount)
    for (i = 0; i < amount; i++) this._setQuadToArray(quads[i], index + i)

    this.dirty = true
  }

  /**
   * <p>Removes the quad that is located at a certain index and inserts it at a new index <br />
   * This operation is faster than removing and inserting in a quad in 2 different steps</p>
   * @param {Number} fromIndex
   * @param {Number} newIndex
   */
  insertQuadFromIndex(fromIndex: number, newIndex: number): void {
    if (fromIndex === newIndex) return

    assert(newIndex >= 0 || newIndex < this._totalQuads, _LogInfos.TextureAtlas_insertQuadFromIndex)

    assert(fromIndex >= 0 || fromIndex < this._totalQuads, _LogInfos.TextureAtlas_insertQuadFromIndex_2)

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    const locQuadsReader = this._quadsReader!
    const sourceArr = locQuadsReader.subarray(fromIndex * quadSize, quadSize)
    let startOffset, moveLength
    if (fromIndex > newIndex) {
      startOffset = newIndex * quadSize
      moveLength = (fromIndex - newIndex) * quadSize
      locQuadsReader.set(locQuadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize)
      locQuadsReader.set(sourceArr, startOffset)
    } else {
      startOffset = (fromIndex + 1) * quadSize
      moveLength = (newIndex - fromIndex) * quadSize
      locQuadsReader.set(locQuadsReader.subarray(startOffset, startOffset + moveLength), startOffset - quadSize)
      locQuadsReader.set(sourceArr, newIndex * quadSize)
    }
    this.dirty = true
  }

  /**
   * <p>Removes a quad at a given index number.<br />
   * The capacity remains the same, but the total number of quads to be drawn is reduced in 1 </p>
   * @param {Number} index
   */
  removeQuadAtIndex(index: number): void {
    assert(index < this._totalQuads, _LogInfos.TextureAtlas_removeQuadAtIndex)

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    this._totalQuads--
    this._quads!.length = this._totalQuads
    if (index !== this._totalQuads) {
      //move data
      const startOffset = (index + 1) * quadSize
      const moveLength = (this._totalQuads - index) * quadSize
      this._quadsReader!.set(this._quadsReader!.subarray(startOffset, startOffset + moveLength), startOffset - quadSize)
    }
    this.dirty = true
  }

  /**
   * Removes a given number of quads at a given index
   * @param {Number} index
   * @param {Number} amount
   */
  removeQuadsAtIndex(index: number, amount: number): void {
    assert(index + amount <= this._totalQuads, _LogInfos.TextureAtlas_removeQuadsAtIndex)

    this._totalQuads -= amount

    if (index !== this._totalQuads) {
      //move data
      const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
      const srcOffset = (index + amount) * quadSize
      const moveLength = (this._totalQuads - index) * quadSize
      const dstOffset = index * quadSize
      this._quadsReader!.set(this._quadsReader!.subarray(srcOffset, srcOffset + moveLength), dstOffset)
    }
    this.dirty = true
  }

  /**
   * <p>Removes all Quads. <br />
   * The TextureAtlas capacity remains untouched. No memory is freed.<br />
   * The total number of quads to be drawn will be 0</p>
   */
  removeAllQuads(): void {
    this._quads!.length = 0
    this._totalQuads = 0
  }

  _setDirty(dirty: boolean): void {
    this.dirty = dirty
  }

  /**
   * <p>Resize the capacity of the CCTextureAtlas.<br />
   * The new capacity can be lower or higher than the current one<br />
   * It returns YES if the resize was successful. <br />
   * If it fails to resize the capacity it will return NO with a new capacity of 0. <br />
   * no used for js</p>
   * @param {Number} newCapacity
   * @return {Boolean}
   */
  resizeCapacity(newCapacity: number): boolean {
    if (newCapacity === this._capacity) return true

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    const oldCapacity = this._capacity
    // update capacity and totolQuads
    this._totalQuads = Math.min(this._totalQuads, newCapacity)
    this._capacity = 0 | newCapacity
    let i
    const capacity = this._capacity
    const locTotalQuads = this._totalQuads

    if (this._quads === null) {
      this._quads = []
      this._quadsArrayBuffer = new ArrayBuffer(quadSize * capacity)
      this._quadsReader = new Uint8Array(this._quadsArrayBuffer)
      for (i = 0; i < capacity; i++) this._quads = new V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, i * quadSize)
    } else {
      let newQuads
      let newArrayBuffer
      const quads = this._quads
      if (capacity > oldCapacity) {
        newQuads = []
        newArrayBuffer = new ArrayBuffer(quadSize * capacity)
        for (i = 0; i < locTotalQuads; i++) {
          newQuads[i] = new V3F_C4B_T2F_Quad(quads[i].tl, quads[i].bl, quads[i].tr, quads[i].br, newArrayBuffer, i * quadSize)
        }
        for (; i < capacity; i++) newQuads[i] = new V3F_C4B_T2F_Quad(null, null, null, null, newArrayBuffer, i * quadSize)

        this._quadsReader = new Uint8Array(newArrayBuffer)
        this._quads = newQuads
        this._quadsArrayBuffer = newArrayBuffer
      } else {
        const count = Math.max(locTotalQuads, capacity)
        newQuads = []
        newArrayBuffer = new ArrayBuffer(quadSize * capacity)
        for (i = 0; i < count; i++) {
          newQuads[i] = new V3F_C4B_T2F_Quad(quads[i].tl, quads[i].bl, quads[i].tr, quads[i].br, newArrayBuffer, i * quadSize)
        }
        this._quadsReader = new Uint8Array(newArrayBuffer)
        this._quads = newQuads
        this._quadsArrayBuffer = newArrayBuffer
      }
    }

    if (this._indices === null) {
      this._indices = new Uint16Array(capacity * 6)
    } else {
      if (capacity > oldCapacity) {
        const tempIndices = new Uint16Array(capacity * 6)
        tempIndices.set(this._indices, 0)
        this._indices = tempIndices
      } else {
        this._indices = this._indices.subarray(0, capacity * 6)
      }
    }

    this._setupIndices()
    this._mapBuffers()
    this.dirty = true
    return true
  }

  /**
   * Used internally by CCParticleBatchNode                                    <br/>
   * don't use this unless you know what you're doing
   * @param {Number} amount
   */
  increaseTotalQuadsWith(amount: number): void {
    this._totalQuads += amount
  }

  /**
   * Moves an amount of quads from oldIndex at newIndex
   * @param {Number} oldIndex
   * @param {Number} amount
   * @param {Number} newIndex
   */
  moveQuadsFromIndex(oldIndex: number, amount: number, newIndex?: number): void {
    if (newIndex === undefined) {
      newIndex = amount
      amount = this._totalQuads - oldIndex

      assert(newIndex + (this._totalQuads - oldIndex) <= this._capacity, _LogInfos.TextureAtlas_moveQuadsFromIndex)

      if (amount === 0) return
    } else {
      assert(newIndex + amount <= this._totalQuads, _LogInfos.TextureAtlas_moveQuadsFromIndex_2)
      assert(oldIndex < this._totalQuads, _LogInfos.TextureAtlas_moveQuadsFromIndex_3)

      if (oldIndex === newIndex) return
    }

    const quadSize = V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    const srcOffset = oldIndex * quadSize
    const srcLength = amount * quadSize
    const locQuadsReader = this._quadsReader!
    const sourceArr = locQuadsReader.subarray(srcOffset, srcOffset + srcLength)
    const dstOffset = newIndex * quadSize
    let moveLength, moveStart
    if (newIndex < oldIndex) {
      moveLength = (oldIndex - newIndex) * quadSize
      moveStart = newIndex * quadSize
      locQuadsReader.set(locQuadsReader.subarray(moveStart, moveStart + moveLength), moveStart + srcLength)
    } else {
      moveLength = (newIndex - oldIndex) * quadSize
      moveStart = (oldIndex + amount) * quadSize
      locQuadsReader.set(locQuadsReader.subarray(moveStart, moveStart + moveLength), srcOffset)
    }
    locQuadsReader.set(sourceArr, dstOffset)
    this.dirty = true
  }

  /**
   * Ensures that after a realloc quads are still empty                                <br/>
   * Used internally by CCParticleBatchNode
   * @param {Number} index
   * @param {Number} amount
   */
  fillWithEmptyQuadsFromIndex(index: number, amount: number): void {
    const count = amount * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT
    const clearReader = new Uint8Array(this._quadsArrayBuffer!, index * V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, count)
    for (let i = 0; i < count; i++) clearReader[i] = 0
  }

  // TextureAtlas - Drawing

  /**
   * Draws all the Atlas's Quads
   */
  drawQuads(): void {
    this.drawNumberOfQuads(this._totalQuads, 0)
  }

  _releaseBuffer(): void {
    const gl = _renderContext
    if (this._buffersVBO) {
      if (this._buffersVBO[0]) gl.deleteBuffer(this._buffersVBO[0])
      if (this._buffersVBO[1]) gl.deleteBuffer(this._buffersVBO[1])
    }
    if (this._quadsWebBuffer) gl.deleteBuffer(this._quadsWebBuffer)
  }

  // Getters and setters
  get totalQuads(): number {
    return this.getTotalQuads()
  }

  get capacity(): number {
    return this.getCapacity()
  }

  get quads(): any[] {
    return this.getQuads()
  }

  set quads(quads: any[]) {
    this.setQuads(quads)
  }

  // Static methods
  static create(fileName: any, capacity: number): TextureAtlas {
    return new TextureAtlas(fileName, capacity)
  }

  static createWithTexture = TextureAtlas.create
}

// Assign to global cc

game.addEventListener(Game.EVENT_RENDERER_INITD, function () {
  if (_renderType === game.RENDER_TYPE_WEBGL) {
    assert(isFunction(_tmp.WebGLTextureAtlas), _LogInfos.MissingFile, 'TexturesWebGL.js')
    _tmp.WebGLTextureAtlas()
    delete _tmp.WebGLTextureAtlas
  }
})

assert(isFunction(_tmp.PrototypeTextureAtlas), _LogInfos.MissingFile, 'TexturesPropertyDefine.js')
_tmp.PrototypeTextureAtlas()
delete _tmp.PrototypeTextureAtlas
