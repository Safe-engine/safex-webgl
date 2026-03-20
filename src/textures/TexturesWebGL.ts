import { _renderContext, game } from '..'
import { Size } from '../core/cocoa/Geometry'
import { configuration } from '../core/Configuration'
import { EventHelper } from '../core/event-manager/EventHelper'
import { contentScaleFactor, SHADER_POSITION_TEXTURE, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from '../core/platform/Macro'
import { _LogInfos, assert, log } from '../helper/Debugger'
import { loader } from '../helper/loader'
import { NextPOT } from '../render-texture/RenderTexture'
import { GLProgram, GLProgramState } from '../shaders'
import { glBindTexture2D } from '../shaders/GLStateCache'
import { shaderCache } from '../shaders/ShaderCache'

/**
 * <p>
 * This class allows to easily create OpenGL or Canvas 2D textures from images, text or raw data.                                    <br/>
 * The created Texture2D object will always have power-of-two dimensions.                                                <br/>
 * Depending on how you create the Texture2D object, the actual image area of the texture might be smaller than the texture dimensions <br/>
 *  i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).                                           <br/>
 * Be aware that the content of the generated textures will be upside-down! </p>
 * @name Texture2D
 * @class
 * @extends Class
 *
 * @property {WebGLTexture}     name            - <@readonly> WebGLTexture Object
 * @property {Number}           pixelFormat     - <@readonly> Pixel format of the texture
 * @property {Number}           pixelsWidth     - <@readonly> Width in pixels
 * @property {Number}           pixelsHeight    - <@readonly> Height in pixels
 * @property {Number}           width           - Content width in points
 * @property {Number}           height          - Content height in points
 * @property {GLProgram}     shaderProgram   - The shader program used by drawAtPoint and drawInRect
 * @property {Number}           maxS            - Texture max S
 * @property {Number}           maxT            - Texture max T
 */
//Original : Texture2DWebGL
export let PVRHaveAlphaPremultiplied_ = false
export class Texture2D extends EventHelper {
  /**
   * <p>
   *    treats (or not) PVR files as if they have alpha premultiplied.                                                <br/>
   *    Since it is impossible to know at runtime if the PVR images have the alpha channel premultiplied, it is       <br/>
   *    possible load them as if they have (or not) the alpha channel premultiplied.                                  <br/>
   *                                                                                                                  <br/>
   *    By default it is disabled.                                                                                    <br/>
   * </p>
   * @param haveAlphaPremultiplied
   */
  static PVRImagesHavePremultipliedAlpha = function (haveAlphaPremultiplied) {
    PVRHaveAlphaPremultiplied_ = haveAlphaPremultiplied
  }

  /**
   * 32-bit texture: RGBA8888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGBA8888
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_RGBA8888 = 2

  /**
   * 24-bit texture: RGBA888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB888
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_RGB888 = 3

  /**
   * 16-bit texture without Alpha channel
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB565
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_RGB565 = 4

  /**
   * 8-bit textures used as masks
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_A8
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_A8 = 5

  /**
   * 8-bit intensity texture
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_I8
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_I8 = 6

  /**
   * 16-bit textures used as masks
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_AI88
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_AI88 = 7

  /**
   * 16-bit textures: RGBA4444
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGBA4444
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_RGBA4444 = 8

  /**
   * 16-bit textures: RGB5A1
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB5A1
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_RGB5A1 = 7

  /**
   * 4-bit PVRTC-compressed texture: PVRTC4
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC4
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_PVRTC4 = 9

  /**
   * 2-bit PVRTC-compressed texture: PVRTC2
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC2
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_PVRTC2 = 10

  /**
   * Default texture format: RGBA8888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_DEFAULT
   * @static
   * @constant
   * @type {Number}
   */
  static PIXEL_FORMAT_DEFAULT = Texture2D.PIXEL_FORMAT_RGBA8888

  /**
   * The default pixel format
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC2
   * @static
   * @type {Number}
   */
  static defaultPixelFormat = Texture2D.PIXEL_FORMAT_DEFAULT

  static _M = {
    [Texture2D.PIXEL_FORMAT_RGBA8888]: 'RGBA8888',
    [Texture2D.PIXEL_FORMAT_RGB888]: 'RGB888',
    [Texture2D.PIXEL_FORMAT_RGB565]: 'RGB565',
    [Texture2D.PIXEL_FORMAT_A8]: 'A8',
    [Texture2D.PIXEL_FORMAT_I8]: 'I8',
    [Texture2D.PIXEL_FORMAT_AI88]: 'AI88',
    [Texture2D.PIXEL_FORMAT_RGBA4444]: 'RGBA4444',
    [Texture2D.PIXEL_FORMAT_RGB5A1]: 'RGB5A1',
    [Texture2D.PIXEL_FORMAT_PVRTC4]: 'PVRTC4',
    [Texture2D.PIXEL_FORMAT_PVRTC2]: 'PVRTC2',
  }

  static _B = {
    [Texture2D.PIXEL_FORMAT_RGBA8888]: 32,
    [Texture2D.PIXEL_FORMAT_RGB888]: 24,
    [Texture2D.PIXEL_FORMAT_RGB565]: 16,
    [Texture2D.PIXEL_FORMAT_A8]: 8,
    [Texture2D.PIXEL_FORMAT_I8]: 8,
    [Texture2D.PIXEL_FORMAT_AI88]: 16,
    [Texture2D.PIXEL_FORMAT_RGBA4444]: 16,
    [Texture2D.PIXEL_FORMAT_RGB5A1]: 16,
    [Texture2D.PIXEL_FORMAT_PVRTC4]: 4,
    [Texture2D.PIXEL_FORMAT_PVRTC2]: 3,
  }

  // By default PVR images are treated as if they don't have the alpha channel premultiplied
  _pVRHaveAlphaPremultiplied: boolean
  _pixelFormat: any
  _pixelsWide: number
  _pixelsHigh: number
  _name: string
  _contentSize: Size
  maxS: number
  maxT: number
  _hasPremultipliedAlpha: boolean
  _hasMipmaps: boolean

  shaderProgram: GLProgram

  // _textureLoaded: boolean
  _htmlElementObj: any
  _webTextureObj: WebGLTexture

  url: string
  _glProgramState: GLProgramState
  _vertexBuffer: WebGLBuffer
  _texBuffer: WebGLBuffer

  // runtime-attached event helper methods (added by EventHelper.apply at runtime)
  // addEventListener?: (type: any, callback: any, target?: any) => void;
  // removeEventTarget?: (type: any, target?: any) => void;
  // dispatchEvent?: (type: any) => void;

  constructor() {
    super()
    this._pVRHaveAlphaPremultiplied = true
    this._pixelFormat = null
    this._pixelsWide = 0
    this._pixelsHigh = 0
    this._name = ''
    this._contentSize = null
    this.maxS = 0
    this.maxT = 0
    this._hasPremultipliedAlpha = false
    this._hasMipmaps = false

    this.shaderProgram = null

    this._textureLoaded = false
    this._htmlElementObj = null
    this._webTextureObj = null

    this.url = null

    // ctor behavior
    this._contentSize = Size(0, 0)
    this._pixelFormat = Texture2D.defaultPixelFormat
    const gl = _renderContext
    this._vertexBuffer = gl.createBuffer()
    this._texBuffer = gl.createBuffer()
  }

  // release texture
  releaseTexture() {
    if (this._webTextureObj) _renderContext.deleteTexture(this._webTextureObj)
    this._htmlElementObj = null
    loader.release(this.url)
  }

  /**
   * pixel format of the texture
   * @return {Number}
   */
  getPixelFormat() {
    return this._pixelFormat
  }

  /**
   * width in pixels
   * @return {Number}
   */
  getPixelsWide() {
    return this._pixelsWide
  }

  /**
   * height in pixels
   * @return {Number}
   */
  getPixelsHigh() {
    return this._pixelsHigh
  }

  /**
   * get WebGLTexture Object
   * @return {WebGLTexture}
   */
  getName() {
    return this._webTextureObj
  }

  /**
   * content size
   * @return {Size}
   */
  getContentSize() {
    return Size(this._contentSize.width / contentScaleFactor(), this._contentSize.height / contentScaleFactor())
  }

  _getWidth() {
    return this._contentSize.width / contentScaleFactor()
  }

  _getHeight() {
    return this._contentSize.height / contentScaleFactor()
  }

  /**
   * get content size in pixels
   * @return {Size}
   */
  getContentSizeInPixels() {
    return this._contentSize
  }

  /**
   * texture max S
   * @return {Number}
   */
  getMaxS() {
    return this.maxS
  }

  /**
   * set texture max S
   * @param {Number} maxS
   */
  setMaxS(maxS: number) {
    this.maxS = maxS
  }

  /**
   * get texture max T
   * @return {Number}
   */
  getMaxT() {
    return this.maxT
  }

  /**
   * set texture max T
   * @param {Number} maxT
   */
  setMaxT(maxT: number) {
    this.maxT = maxT
  }

  /**
   * return shader program used by drawAtPoint and drawInRect
   * @return {GLProgram}
   */
  getShaderProgram() {
    return this.shaderProgram
  }

  /**
   * set shader program used by drawAtPoint and drawInRect
   * @param {GLProgram} shaderProgram
   */
  setShaderProgram(shaderProgram: GLProgram) {
    this.shaderProgram = shaderProgram
  }

  /**
   * whether or not the texture has their Alpha premultiplied
   * @return {Boolean}
   */
  hasPremultipliedAlpha() {
    return this._hasPremultipliedAlpha
  }

  /**
   * whether or not use mipmap
   * @return {Boolean}
   */
  hasMipmaps() {
    return this._hasMipmaps
  }

  /**
   * description
   * @return {string}
   */
  description() {
    return `<Texture2D | Name = ${this._name} | Dimensions = ${this._pixelsWide} x ${this._pixelsHigh} | Coordinates = (${this.maxS}, ${this.maxT})>`
  }

  /**
   * These functions are needed to create mutable textures
   * @param {Array} data
   */
  releaseData(_data: any) {
    _data = null
  }

  keepData(_data: any, _length?: number) {
    //The texture data mustn't be saved because it isn't a mutable texture.
    return _data
  }

  /**
   * Intializes with a texture2d with data
   * @param {Array} data
   * @param {Number} pixelFormat
   * @param {Number} pixelsWide
   * @param {Number} pixelsHigh
   * @param {Size} contentSize
   * @return {Boolean}
   */
  initWithData(data: any, pixelFormat: any, pixelsWide: number, pixelsHigh: number, contentSize: any) {
    const gl = _renderContext
    let format: number = gl.RGBA,
      type: number = gl.UNSIGNED_BYTE

    const bitsPerPixel = (Texture2D._B || [])[pixelFormat]

    const bytesPerRow = (pixelsWide * bitsPerPixel) / 8
    if (bytesPerRow % 8 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8)
    } else if (bytesPerRow % 4 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    } else if (bytesPerRow % 2 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2)
    } else {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    }

    this._webTextureObj = gl.createTexture()
    glBindTexture2D(this)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // Specify OpenGL texture image
    switch (pixelFormat) {
      case Texture2D.PIXEL_FORMAT_RGBA8888:
        format = gl.RGBA
        break
      case Texture2D.PIXEL_FORMAT_RGB888:
        format = gl.RGB
        break
      case Texture2D.PIXEL_FORMAT_RGBA4444:
        type = gl.UNSIGNED_SHORT_4_4_4_4
        break
      case Texture2D.PIXEL_FORMAT_RGB5A1:
        type = gl.UNSIGNED_SHORT_5_5_5_1
        break
      case Texture2D.PIXEL_FORMAT_RGB565:
        type = gl.UNSIGNED_SHORT_5_6_5
        break
      case Texture2D.PIXEL_FORMAT_AI88:
        format = gl.LUMINANCE_ALPHA
        break
      case Texture2D.PIXEL_FORMAT_A8:
        format = gl.ALPHA
        break
      case Texture2D.PIXEL_FORMAT_I8:
        format = gl.LUMINANCE
        break
      default:
        assert(0, _LogInfos.Texture2D_initWithData)
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, format, pixelsWide, pixelsHigh, 0, format, type, data)

    this._contentSize.width = contentSize.width
    this._contentSize.height = contentSize.height
    this._pixelsWide = pixelsWide
    this._pixelsHigh = pixelsHigh
    this._pixelFormat = pixelFormat
    this.maxS = contentSize.width / pixelsWide
    this.maxT = contentSize.height / pixelsHigh

    this._hasPremultipliedAlpha = false
    this._hasMipmaps = false
    this.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE)

    this._textureLoaded = true

    return true
  }
  /**
   Drawing extensions to make it easy to draw basic quads using a CCTexture2D object.
   These functions require gl.TEXTURE_2D and both gl.VERTEX_ARRAY and gl.TEXTURE_COORD_ARRAY client states to be enabled.
   */

  /**
   * draws a texture at a given point
   * @param {Point} point
   */
  drawAtPoint(point: any) {
    const gl = _renderContext

    const width = this._pixelsWide * this.maxS
    const height = this._pixelsHigh * this.maxT

    const vertices = new Float32Array([
      point.x,
      point.y,
      point.x + width,
      point.y,
      point.x,
      point.y + height,
      point.x + width,
      point.y + height,
    ])

    const coordinates = new Float32Array([0.0, this.maxT, this.maxS, this.maxT, 0.0, 0.0, this.maxS, 0.0])

    this._glProgramState.apply()
    this._glProgramState._glprogram.setUniformsForBuiltins()

    glBindTexture2D(this)

    // vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, 0)

    // texcoord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, coordinates, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  /**
   * draws a texture inside a rect
   * @param {Rect} rect
   */
  drawInRect(rect: any) {
    const gl = _renderContext

    const vertices = new Float32Array([
      rect.x,
      rect.y,
      rect.x + rect.width,
      rect.y,
      rect.x,
      rect.y + rect.height,
      rect.x + rect.width,
      rect.y + rect.height,
    ])

    const coordinates = new Float32Array([0.0, this.maxT, this.maxS, this.maxT, 0.0, 0.0, this.maxS, 0.0])

    this._glProgramState.apply()
    this._glProgramState._glprogram.setUniformsForBuiltins()

    glBindTexture2D(this)

    // vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, 0)

    // texcoord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, coordinates, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  /**
   * Initializes a texture from a UIImage object
   * @param uiImage
   * @return {Boolean}
   */
  initWithImage(uiImage: any) {
    if (uiImage == null) {
      log(_LogInfos.Texture2D_initWithImage)
      return false
    }

    const imageWidth = uiImage.getWidth()
    const imageHeight = uiImage.getHeight()

    const maxTextureSize = configuration.getMaxTextureSize()
    if (imageWidth > maxTextureSize || imageHeight > maxTextureSize) {
      log(_LogInfos.Texture2D_initWithImage_2, imageWidth, imageHeight, maxTextureSize, maxTextureSize)
      return false
    }
    this._textureLoaded = true

    // always load premultiplied images
    return this._initPremultipliedATextureWithImage(uiImage, imageWidth, imageHeight)
  }

  /**
   * init with HTML element
   * @param {HTMLImageElement|HTMLCanvasElement} element
   */
  initWithElement(element: any) {
    if (!element) return
    this._webTextureObj = _renderContext.createTexture()
    this._htmlElementObj = element
    this._textureLoaded = true
    // Textures should be loaded with premultiplied alpha in order to avoid gray bleeding
    // when semitransparent textures are interpolated (e.g. when scaled).
    this._hasPremultipliedAlpha = true
  }

  /**
   * HTMLElement Object getter
   * @return {HTMLElement}
   */
  getHtmlElementObj() {
    return this._htmlElementObj
  }

  /**
   * whether texture is loaded
   * @return {Boolean}
   */
  isLoaded() {
    return this._textureLoaded
  }

  /**
   * handler of texture loaded event
   * @param {Boolean} [premultiplied=false]
   */
  handleLoadedTexture(premultiplied?: boolean) {
    premultiplied = premultiplied !== undefined ? premultiplied : this._hasPremultipliedAlpha
    // Not sure about this ! Some texture need to be updated even after loaded
    if (!game._rendererInitialized) return
    if (!this._htmlElementObj) return
    if (!this._htmlElementObj.width || !this._htmlElementObj.height) return

    //upload image to buffer
    const gl = _renderContext

    glBindTexture2D(this)

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    if (premultiplied) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)

    // Specify OpenGL texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._htmlElementObj)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    this.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE)
    glBindTexture2D(null)
    if (premultiplied) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0)

    const pixelsWide = this._htmlElementObj.width
    const pixelsHigh = this._htmlElementObj.height

    this._pixelsWide = this._contentSize.width = pixelsWide
    this._pixelsHigh = this._contentSize.height = pixelsHigh
    this._pixelFormat = Texture2D.PIXEL_FORMAT_RGBA8888
    this.maxS = 1
    this.maxT = 1

    this._hasPremultipliedAlpha = premultiplied
    this._hasMipmaps = false
    if (window.ENABLE_IMAGE_POOL) {
      this._htmlElementObj = null
    }

    //dispatch load event to listener.
    this.dispatchEvent('load')
  }

  /**
   * Initializes a texture from a string with dimensions, alignment, font name and font size (note: initWithString does not support on HTML5)
   */
  initWithString(_text: any, _fontName: any, _fontSize: any, _dimensions: any, _hAlignment: any, _vAlignment: any) {
    log(_LogInfos.Texture2D_initWithString)
    return null
  }

  initWithETCFile(_file: any) {
    log(_LogInfos.Texture2D_initWithETCFile_2)
    return false
  }

  initWithPVRFile(_file: any) {
    log(_LogInfos.Texture2D_initWithPVRFile_2)
    return false
  }

  initWithPVRTCData(_data: any, _level: any, _bpp: any, _hasAlpha: any, _length: any, _pixelFormat: any) {
    log(_LogInfos.Texture2D_initWithPVRTCData_2)
    return false
  }

  setTexParameters(texParams: any, magFilter?: any, wrapS?: any, wrapT?: any) {
    const gl = _renderContext

    if (magFilter !== undefined) texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT }

    assert(
      (this._pixelsWide === NextPOT(this._pixelsWide) && this._pixelsHigh === NextPOT(this._pixelsHigh)) ||
        (texParams.wrapS === gl.CLAMP_TO_EDGE && texParams.wrapT === gl.CLAMP_TO_EDGE),
      'WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures',
    )

    glBindTexture2D(this)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParams.minFilter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParams.magFilter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParams.wrapS)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParams.wrapT)
  }

  setAntiAliasTexParameters() {
    const gl = _renderContext
    glBindTexture2D(this)
    if (!this._hasMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  }

  setAliasTexParameters() {
    const gl: any = _renderContext

    glBindTexture2D(this)
    if (!this._hasMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  }

  generateMipmap() {
    assert(
      this._pixelsWide === NextPOT(this._pixelsWide) && this._pixelsHigh === NextPOT(this._pixelsHigh),
      'Mimpap texture only works in POT textures',
    )

    glBindTexture2D(this)
    _renderContext.generateMipmap(_renderContext.TEXTURE_2D)
    this._hasMipmaps = true
  }

  stringForFormat() {
    return (this.constructor as any)._M[this._pixelFormat]
  }

  bitsPerPixelForFormat(format?: any) {
    format = format || this._pixelFormat
    const value = (this.constructor as any)._B[format]
    if (value != null) return value
    log(_LogInfos.Texture2D_bitsPerPixelForFormat, format)
    return -1
  }

  _initPremultipliedATextureWithImage(uiImage: any, width: number, height: number) {
    let tempData: any = uiImage.getData()
    let inPixel32: any
    let inPixel8: any

    const hasAlpha: any = uiImage.hasAlpha()
    const imageSize = Size(uiImage.getWidth(), uiImage.getHeight())
    let pixelFormat: any = Texture2D.defaultPixelFormat
    const bpp = uiImage.getBitsPerComponent()

    // compute pixel format
    if (!hasAlpha) {
      if (bpp >= 8) {
        pixelFormat = Texture2D.PIXEL_FORMAT_RGB888
      } else {
        log(_LogInfos.Texture2D__initPremultipliedATextureWithImage)
        pixelFormat = Texture2D.PIXEL_FORMAT_RGB565
      }
    }

    // Repack the pixel data into the right format
    let i: number
    const length: number = width * height

    if (pixelFormat === Texture2D.PIXEL_FORMAT_RGB565) {
      if (hasAlpha) {
        // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGGBBBBB"
        tempData = new Uint16Array(width * height)
        inPixel32 = uiImage.getData()

        for (i = 0; i < length; ++i) {
          tempData[i] =
            ((((inPixel32[i] >> 0) & 0xff) >> 3) << 11) | // R
            ((((inPixel32[i] >> 8) & 0xff) >> 2) << 5) | // G
            ((((inPixel32[i] >> 16) & 0xff) >> 3) << 0) // B
        }
      } else {
        // Convert "RRRRRRRRRGGGGGGGGBBBBBBBB" to "RRRRRGGGGGGBBBBB"
        tempData = new Uint16Array(width * height)
        inPixel8 = uiImage.getData()

        for (i = 0; i < length; ++i) {
          tempData[i] =
            (((inPixel8[i] & 0xff) >> 3) << 11) | // R
            (((inPixel8[i] & 0xff) >> 2) << 5) | // G
            (((inPixel8[i] & 0xff) >> 3) << 0) // B
        }
      }
    } else if (pixelFormat === Texture2D.PIXEL_FORMAT_RGBA4444) {
      tempData = new Uint16Array(width * height)
      inPixel32 = uiImage.getData()

      for (i = 0; i < length; ++i) {
        tempData[i] =
          ((((inPixel32[i] >> 0) & 0xff) >> 4) << 12) | // R
          ((((inPixel32[i] >> 8) & 0xff) >> 4) << 8) | // G
          ((((inPixel32[i] >> 16) & 0xff) >> 4) << 4) | // B
          ((((inPixel32[i] >> 24) & 0xff) >> 4) << 0) // A
      }
    } else if (pixelFormat === Texture2D.PIXEL_FORMAT_RGB5A1) {
      tempData = new Uint16Array(width * height)
      inPixel32 = uiImage.getData()

      for (i = 0; i < length; ++i) {
        tempData[i] =
          ((((inPixel32[i] >> 0) & 0xff) >> 3) << 11) | // R
          ((((inPixel32[i] >> 8) & 0xff) >> 3) << 6) | // G
          ((((inPixel32[i] >> 16) & 0xff) >> 3) << 1) | // B
          ((((inPixel32[i] >> 24) & 0xff) >> 7) << 0) // A
      }
    } else if (pixelFormat === Texture2D.PIXEL_FORMAT_A8) {
      tempData = new Uint8Array(width * height)
      inPixel32 = uiImage.getData()

      for (i = 0; i < length; ++i) {
        tempData[i] = (inPixel32 >> 24) & 0xff // A
      }
    }

    if (hasAlpha && pixelFormat === Texture2D.PIXEL_FORMAT_RGB888) {
      inPixel32 = uiImage.getData()
      tempData = new Uint8Array(width * height * 3)

      for (i = 0; i < length; ++i) {
        tempData[i * 3] = (inPixel32 >> 0) & 0xff // R
        tempData[i * 3 + 1] = (inPixel32 >> 8) & 0xff // G
        tempData[i * 3 + 2] = (inPixel32 >> 16) & 0xff // B
      }
    }

    this.initWithData(tempData, pixelFormat, width, height, imageSize)

    // if (tempData != uiImage.getData()) tempData = null

    this._hasPremultipliedAlpha = uiImage.isPremultipliedAlpha()
    return true
  }

  /**
   * add listener for loaded event
   * @param {Function} callback
   * @param {Node} target
   * @deprecated since 3.1, please use addEventListener instead
   */
  addLoadedEventListener(callback: any, target?: any) {
    this.addEventListener('load', callback, target)
  }

  /**
   * remove listener from listeners by target
   * @param {Node} target
   */
  removeLoadedEventListener(target: any) {
    this.removeEventTarget('load', target)
  }
}
