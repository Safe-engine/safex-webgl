import { _renderContext, game } from "../..";
import { _LogInfos, assert, log } from "../../helper/Debugger";
import { _tmp, global } from "../../helper/global";
import { loader } from "../../helper/loader";
import { path } from "../../helper/path";
import { size } from "../core/cocoa/Geometry";
import { TEXTURE_ATLAS_USE_TRIANGLE_STRIP } from "../core/platform/Config";
import { contentScaleFactor, SHADER_POSITION_TEXTURE, VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from "../core/platform/Macro";
import { Texture2D } from "./Texture2D";
import { textureCache } from "./TextureCache";

_tmp.WebGLTexture2D = function () {

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
  export class Texture2D {
    // By default PVR images are treated as if they don't have the alpha channel premultiplied
    _pVRHaveAlphaPremultiplied: true,
    _pixelFormat: null,
    _pixelsWide: 0,
    _pixelsHigh: 0,
    _name: "",
    _contentSize: null,
    maxS: 0,
    maxT: 0,
    _hasPremultipliedAlpha: false,
    _hasMipmaps: false,

    shaderProgram: null,

    _textureLoaded: false,
    _htmlElementObj: null,
    _webTextureObj: null,

    url: null,

    /**
     * constructor of Texture2D
     */
    ctor: function () {
    this._contentSize = size(0, 0);
    this._pixelFormat = Texture2D.defaultPixelFormat;
  },

  /**
   * release texture
   */
  releaseTexture: function () {
    if (this._webTextureObj)
      _renderContext.deleteTexture(this._webTextureObj);
    this._htmlElementObj = null;
    loader.release(this.url);
  },

  /**
   * pixel format of the texture
   * @return {Number}
   */
  getPixelFormat: function () {
    return this._pixelFormat;
  },

  /**
   * width in pixels
   * @return {Number}
   */
  getPixelsWide: function () {
    return this._pixelsWide;
  },

  /**
   * height in pixels
   * @return {Number}
   */
  getPixelsHigh: function () {
    return this._pixelsHigh;
  },

  /**
   * get WebGLTexture Object
   * @return {WebGLTexture}
   */
  getName: function () {
    return this._webTextureObj;
  },

  /**
   * content size
   * @return {Size}
   */
  getContentSize: function () {
    return size(this._contentSize.width / contentScaleFactor(), this._contentSize.height / contentScaleFactor());
  },

  _getWidth: function () {
    return this._contentSize.width / contentScaleFactor();
  },
  _getHeight: function () {
    return this._contentSize.height / contentScaleFactor();
  },

  /**
   * get content size in pixels
   * @return {Size}
   */
  getContentSizeInPixels: function () {
    return this._contentSize;
  },

  /**
   * texture max S
   * @return {Number}
   */
  getMaxS: function () {
    return this.maxS;
  },

  /**
   * set texture max S
   * @param {Number} maxS
   */
  setMaxS: function (maxS) {
    this.maxS = maxS;
  },

  /**
   * get texture max T
   * @return {Number}
   */
  getMaxT: function () {
    return this.maxT;
  },

  /**
   * set texture max T
   * @param {Number} maxT
   */
  setMaxT: function (maxT) {
    this.maxT = maxT;
  },

  /**
   * return shader program used by drawAtPoint and drawInRect
   * @return {GLProgram}
   */
  getShaderProgram: function () {
    return this.shaderProgram;
  },

  /**
   * set shader program used by drawAtPoint and drawInRect
   * @param {GLProgram} shaderProgram
   */
  setShaderProgram: function (shaderProgram) {
    this.shaderProgram = shaderProgram;
  },

  /**
   * whether or not the texture has their Alpha premultiplied
   * @return {Boolean}
   */
  hasPremultipliedAlpha: function () {
    return this._hasPremultipliedAlpha;
  },

  /**
   * whether or not use mipmap
   * @return {Boolean}
   */
  hasMipmaps: function () {
    return this._hasMipmaps;
  },

  /**
   * description
   * @return {string}
   */
  description: function () {
    var _t = this;
    return "<Texture2D | Name = " + _t._name + " | Dimensions = " + _t._pixelsWide + " x " + _t._pixelsHigh
      + " | Coordinates = (" + _t.maxS + ", " + _t.maxT + ")>";
  },

  /**
   * These functions are needed to create mutable textures
   * @param {Array} data
   */
  releaseData: function (data) {
    data = null;
  },

  keepData: function (data, length) {
    //The texture data mustn't be saved because it isn't a mutable texture.
    return data;
  },

  /**
   * Intializes with a texture2d with data
   * @param {Array} data
   * @param {Number} pixelFormat
   * @param {Number} pixelsWide
   * @param {Number} pixelsHigh
   * @param {Size} contentSize
   * @return {Boolean}
   */
  initWithData: function (data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
    var self = this, tex2d = Texture2D;
    var gl = _renderContext;
    var format = gl.RGBA, type = gl.UNSIGNED_BYTE;

    var bitsPerPixel = Texture2D._B[pixelFormat];

    var bytesPerRow = pixelsWide * bitsPerPixel / 8;
    if (bytesPerRow % 8 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8);
    } else if (bytesPerRow % 4 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    } else if (bytesPerRow % 2 === 0) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
    } else {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    }

    self._webTextureObj = gl.createTexture();
    glBindTexture2D(self);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Specify OpenGL texture image
    switch (pixelFormat) {
      case tex2d.PIXEL_FORMAT_RGBA8888:
        format = gl.RGBA;
        break;
      case tex2d.PIXEL_FORMAT_RGB888:
        format = gl.RGB;
        break;
      case tex2d.PIXEL_FORMAT_RGBA4444:
        type = gl.UNSIGNED_SHORT_4_4_4_4;
        break;
      case tex2d.PIXEL_FORMAT_RGB5A1:
        type = gl.UNSIGNED_SHORT_5_5_5_1;
        break;
      case tex2d.PIXEL_FORMAT_RGB565:
        type = gl.UNSIGNED_SHORT_5_6_5;
        break;
      case tex2d.PIXEL_FORMAT_AI88:
        format = gl.LUMINANCE_ALPHA;
        break;
      case tex2d.PIXEL_FORMAT_A8:
        format = gl.ALPHA;
        break;
      case tex2d.PIXEL_FORMAT_I8:
        format = gl.LUMINANCE;
        break;
      default:
        assert(0, _LogInfos.Texture2D_initWithData);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, format, pixelsWide, pixelsHigh, 0, format, type, data);


    self._contentSize.width = contentSize.width;
    self._contentSize.height = contentSize.height;
    self._pixelsWide = pixelsWide;
    self._pixelsHigh = pixelsHigh;
    self._pixelFormat = pixelFormat;
    self.maxS = contentSize.width / pixelsWide;
    self.maxT = contentSize.height / pixelsHigh;

    self._hasPremultipliedAlpha = false;
    self._hasMipmaps = false;
    self.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE);

    self._textureLoaded = true;

    return true;
  },

  /**
   Drawing extensions to make it easy to draw basic quads using a CCTexture2D object.
   These functions require gl.TEXTURE_2D and both gl.VERTEX_ARRAY and gl.TEXTURE_COORD_ARRAY client states to be enabled.
   */

  /**
   * draws a texture at a given point
   * @param {Point} point
   */
  drawAtPoint: function (point) {
    var self = this;
    var coordinates = [
      0.0, self.maxT,
      self.maxS, self.maxT,
      0.0, 0.0,
      self.maxS, 0.0],
      gl = _renderContext;

    var width = self._pixelsWide * self.maxS,
      height = self._pixelsHigh * self.maxT;

    var vertices = [
      point.x, point.y, 0.0,
      width + point.x, point.y, 0.0,
      point.x, height + point.y, 0.0,
      width + point.x, height + point.y, 0.0];

    self._glProgramState.apply();
    self._glProgramState._glprogram.setUniformsForBuiltins();

    glBindTexture2D(self);

    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  /**
   * draws a texture inside a rect
   * @param {Rect} rect
   */
  drawInRect: function (rect) {
    var self = this;
    var coordinates = [
      0.0, self.maxT,
      self.maxS, self.maxT,
      0.0, 0.0,
      self.maxS, 0.0];

    var vertices = [rect.x, rect.y, /*0.0,*/
    rect.x + rect.width, rect.y, /*0.0,*/
    rect.x, rect.y + rect.height, /*0.0,*/
    rect.x + rect.width, rect.y + rect.height        /*0.0*/];

    self._glProgramState.apply();
    self._glProgramState._glprogram.setUniformsForBuiltins();

    glBindTexture2D(self);

    var gl = _renderContext;
    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  /**
   Extensions to make it easy to create a CCTexture2D object from an image file.
   Note that RGBA type textures will have their alpha premultiplied - use the blending mode (gl.ONE, gl.ONE_MINUS_SRC_ALPHA).
   */

  /**
   * Initializes a texture from a UIImage object
   * @param uiImage
   * @return {Boolean}
   */
  initWithImage: function (uiImage) {
    if (uiImage == null) {
      log(_LogInfos.Texture2D_initWithImage);
      return false;
    }

    var imageWidth = uiImage.getWidth();
    var imageHeight = uiImage.getHeight();

    var maxTextureSize = configuration.getMaxTextureSize();
    if (imageWidth > maxTextureSize || imageHeight > maxTextureSize) {
      log(_LogInfos.Texture2D_initWithImage_2, imageWidth, imageHeight, maxTextureSize, maxTextureSize);
      return false;
    }
    this._textureLoaded = true;

    // always load premultiplied images
    return this._initPremultipliedATextureWithImage(uiImage, imageWidth, imageHeight);
  },

  /**
   * init with HTML element
   * @param {HTMLImageElement|HTMLCanvasElement} element
   */
  initWithElement: function (element) {
    if (!element)
      return;
    this._webTextureObj = _renderContext.createTexture();
    this._htmlElementObj = element;
    this._textureLoaded = true;
    // Textures should be loaded with premultiplied alpha in order to avoid gray bleeding
    // when semitransparent textures are interpolated (e.g. when scaled).
    this._hasPremultipliedAlpha = true;
  },

  /**
   * HTMLElement Object getter
   * @return {HTMLElement}
   */
  getHtmlElementObj: function () {
    return this._htmlElementObj;
  },

  /**
   * whether texture is loaded
   * @return {Boolean}
   */
  isLoaded: function () {
    return this._textureLoaded;
  },

  /**
   * handler of texture loaded event
   * @param {Boolean} [premultiplied=false]
   */
  handleLoadedTexture: function (premultiplied) {
    var self = this;
    premultiplied =
      (premultiplied !== undefined)
        ? premultiplied
        : self._hasPremultipliedAlpha;
    // Not sure about this ! Some texture need to be updated even after loaded
    if (!game._rendererInitialized)
      return;
    if (!self._htmlElementObj)
      return;
    if (!self._htmlElementObj.width || !self._htmlElementObj.height)
      return;

    //upload image to buffer
    var gl = _renderContext;

    glBindTexture2D(self);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    if (premultiplied)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

    // Specify OpenGL texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._htmlElementObj);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    self.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE);
    glBindTexture2D(null);
    if (premultiplied)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);

    var pixelsWide = self._htmlElementObj.width;
    var pixelsHigh = self._htmlElementObj.height;

    self._pixelsWide = self._contentSize.width = pixelsWide;
    self._pixelsHigh = self._contentSize.height = pixelsHigh;
    self._pixelFormat = Texture2D.PIXEL_FORMAT_RGBA8888;
    self.maxS = 1;
    self.maxT = 1;

    self._hasPremultipliedAlpha = premultiplied;
    self._hasMipmaps = false;
    if (window.ENABLE_IMAEG_POOL) {
      self._htmlElementObj = null;
    }

    //dispatch load event to listener.
    self.dispatchEvent("load");
  },

  /**
   Extensions to make it easy to create a Texture2D object from a string of text.
   Note that the generated textures are of type A8 - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
   */
  /**
   * Initializes a texture from a string with dimensions, alignment, font name and font size (note: initWithString does not support on HTML5)
   * @param {String} text
   * @param {String | FontDefinition} fontName or fontDefinition
   * @param {Number} fontSize
   * @param {Size} dimensions
   * @param {Number} hAlignment
   * @param {Number} vAlignment
   * @return {Boolean}
   */
  initWithString: function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
    log(_LogInfos.Texture2D_initWithString);
    return null;
  },

  /**
   * Initializes a texture from a ETC file  (note: initWithETCFile does not support on HTML5)
   * @note Compatible to Cocos2d-x
   * @param {String} file
   * @return {Boolean}
   */
  initWithETCFile: function (file) {
    log(_LogInfos.Texture2D_initWithETCFile_2);
    return false;
  },

  /**
   * Initializes a texture from a PVR file
   * @param {String} file
   * @return {Boolean}
   */
  initWithPVRFile: function (file) {
    log(_LogInfos.Texture2D_initWithPVRFile_2);
    return false;
  },

  /**
   Extensions to make it easy to create a Texture2D object from a PVRTC file
   Note that the generated textures don't have their alpha premultiplied - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
   */
  /**
   * Initializes a texture from a PVRTC buffer
   * @note compatible to cocos2d-iphone interface.
   * @param {Array} data
   * @param {Number} level
   * @param {Number} bpp
   * @param {Boolean} hasAlpha
   * @param {Number} length
   * @param {Number} pixelFormat
   * @return {Boolean}
   */
  initWithPVRTCData: function (data, level, bpp, hasAlpha, length, pixelFormat) {
    log(_LogInfos.Texture2D_initWithPVRTCData_2);
    return false;
  },

  /**
   * sets the min filter, mag filter, wrap s and wrap t texture parameters. <br/>
   * If the texture size is NPOT (non power of 2), then in can only use gl.CLAMP_TO_EDGE in gl.TEXTURE_WRAP_{S,T}.
   * @param {Object|Number} texParams texParams object or minFilter
   * @param {Number} [magFilter]
   * @param {Number} [wrapS]
   * @param {Number} [wrapT]
   */
  setTexParameters: function (texParams, magFilter, wrapS, wrapT) {
    var _t = this;
    var gl = _renderContext;

    if (magFilter !== undefined)
      texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT };

    assert((_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh)) ||
      (texParams.wrapS === gl.CLAMP_TO_EDGE && texParams.wrapT === gl.CLAMP_TO_EDGE),
      "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");

    glBindTexture2D(_t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParams.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParams.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParams.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParams.wrapT);
  },

  /**
   * sets antialias texture parameters:              <br/>
   *  - GL_TEXTURE_MIN_FILTER = GL_NEAREST           <br/>
   *  - GL_TEXTURE_MAG_FILTER = GL_NEAREST
   */
  setAntiAliasTexParameters: function () {
    var gl = _renderContext;

    glBindTexture2D(this);
    if (!this._hasMipmaps)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    else
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  },

  /**
   *  sets alias texture parameters:
   *   GL_TEXTURE_MIN_FILTER = GL_NEAREST
   *   GL_TEXTURE_MAG_FILTER = GL_NEAREST
   */
  setAliasTexParameters: function () {
    var gl = _renderContext;

    glBindTexture2D(this);
    if (!this._hasMipmaps)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    else
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  },

  /**
   *  Generates mipmap images for the texture.<br/>
   *  It only works if the texture size is POT (power of 2).
   */
  generateMipmap: function () {
    var _t = this;
    assert(_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh), "Mimpap texture only works in POT textures");

    glBindTexture2D(_t);
    _renderContext.generateMipmap(_renderContext.TEXTURE_2D);
    _t._hasMipmaps = true;
  },

  /**
   * returns the pixel format.
   * @return {String}
   */
  stringForFormat: function () {
    return Texture2D._M[this._pixelFormat];
  },

  /**
   * returns the bits-per-pixel of the in-memory OpenGL texture
   * @return {Number}
   */
  bitsPerPixelForFormat: function (format) {//TODO I want to delete the format argument, use this._pixelFormat
    format = format || this._pixelFormat;
    var value = Texture2D._B[format];
    if (value != null) return value;
    log(_LogInfos.Texture2D_bitsPerPixelForFormat, format);
    return -1;
  },

  _initPremultipliedATextureWithImage: function (uiImage, width, height) {
    var tex2d = Texture2D;
    var tempData = uiImage.getData();
    var inPixel32 = null;
    var inPixel8 = null;
    var outPixel16 = null;
    var hasAlpha = uiImage.hasAlpha();
    var imageSize = size(uiImage.getWidth(), uiImage.getHeight());
    var pixelFormat = tex2d.defaultPixelFormat;
    var bpp = uiImage.getBitsPerComponent();

    // compute pixel format
    if (!hasAlpha) {
      if (bpp >= 8) {
        pixelFormat = tex2d.PIXEL_FORMAT_RGB888;
      } else {
        log(_LogInfos.Texture2D__initPremultipliedATextureWithImage);
        pixelFormat = tex2d.PIXEL_FORMAT_RGB565;
      }
    }

    // Repack the pixel data into the right format
    var i, length = width * height;

    if (pixelFormat === tex2d.PIXEL_FORMAT_RGB565) {
      if (hasAlpha) {
        // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGGBBBBB"
        tempData = new Uint16Array(width * height);
        inPixel32 = uiImage.getData();

        for (i = 0; i < length; ++i) {
          tempData[i] =
            ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
            ((((inPixel32[i] >> 8) & 0xFF) >> 2) << 5) | // G
            ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 0);    // B
        }
      } else {
        // Convert "RRRRRRRRRGGGGGGGGBBBBBBBB" to "RRRRRGGGGGGBBBBB"
        tempData = new Uint16Array(width * height);
        inPixel8 = uiImage.getData();

        for (i = 0; i < length; ++i) {
          tempData[i] =
            (((inPixel8[i] & 0xFF) >> 3) << 11) | // R
            (((inPixel8[i] & 0xFF) >> 2) << 5) | // G
            (((inPixel8[i] & 0xFF) >> 3) << 0);    // B
        }
      }
    } else if (pixelFormat === tex2d.PIXEL_FORMAT_RGBA4444) {
      // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRGGGGBBBBAAAA"
      tempData = new Uint16Array(width * height);
      inPixel32 = uiImage.getData();

      for (i = 0; i < length; ++i) {
        tempData[i] =
          ((((inPixel32[i] >> 0) & 0xFF) >> 4) << 12) | // R
          ((((inPixel32[i] >> 8) & 0xFF) >> 4) << 8) | // G
          ((((inPixel32[i] >> 16) & 0xFF) >> 4) << 4) | // B
          ((((inPixel32[i] >> 24) & 0xFF) >> 4) << 0);  // A
      }
    } else if (pixelFormat === tex2d.PIXEL_FORMAT_RGB5A1) {
      // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGBBBBBA"
      tempData = new Uint16Array(width * height);
      inPixel32 = uiImage.getData();

      for (i = 0; i < length; ++i) {
        tempData[i] =
          ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
          ((((inPixel32[i] >> 8) & 0xFF) >> 3) << 6) | // G
          ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 1) | // B
          ((((inPixel32[i] >> 24) & 0xFF) >> 7) << 0);  // A
      }
    } else if (pixelFormat === tex2d.PIXEL_FORMAT_A8) {
      // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "AAAAAAAA"
      tempData = new Uint8Array(width * height);
      inPixel32 = uiImage.getData();

      for (i = 0; i < length; ++i) {
        tempData[i] = (inPixel32 >> 24) & 0xFF;  // A
      }
    }

    if (hasAlpha && pixelFormat === tex2d.PIXEL_FORMAT_RGB888) {
      // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRRRRGGGGGGGGBBBBBBBB"
      inPixel32 = uiImage.getData();
      tempData = new Uint8Array(width * height * 3);

      for (i = 0; i < length; ++i) {
        tempData[i * 3] = (inPixel32 >> 0) & 0xFF; // R
        tempData[i * 3 + 1] = (inPixel32 >> 8) & 0xFF; // G
        tempData[i * 3 + 2] = (inPixel32 >> 16) & 0xFF; // B
      }
    }

    this.initWithData(tempData, pixelFormat, width, height, imageSize);

    if (tempData != uiImage.getData())
      tempData = null;

    this._hasPremultipliedAlpha = uiImage.isPremultipliedAlpha();
    return true;
  },

  /**
   * add listener for loaded event
   * @param {Function} callback
   * @param {Node} target
   * @deprecated since 3.1, please use addEventListener instead
   */
  addLoadedEventListener: function (callback, target) {
    this.addEventListener("load", callback, target);
  },

  /**
   * remove listener from listeners by target
   * @param {Node} target
   */
  removeLoadedEventListener: function (target) {
    this.removeEventTarget("load", target);
  }
});
};

_tmp.WebGLTextureAtlas = function () {
  var _p = TextureAtlas.prototype;
  _p._setupVBO = function () {
    var _t = this;
    var gl = _renderContext;
    //create WebGLBuffer
    _t._buffersVBO[0] = gl.createBuffer();
    _t._buffersVBO[1] = gl.createBuffer();

    _t._quadsWebBuffer = gl.createBuffer();
    _t._mapBuffers();
  };

  _p._mapBuffers = function () {
    var _t = this;
    var gl = _renderContext;

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadsWebBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, _t._quadsArrayBuffer, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _t._indices, gl.STATIC_DRAW);

    //checkGLErrorDebug();
  };

  /**
   * <p>Draws n quads from an index (offset). <br />
   * n + start can't be greater than the capacity of the atlas</p>
   * @param {Number} n
   * @param {Number} start
   */
  _p.drawNumberOfQuads = function (n, start) {
    var _t = this;
    start = start || 0;
    if (0 === n || !_t.texture || !_t.texture.isLoaded())
      return;

    var gl = _renderContext;
    glBindTexture2D(_t.texture);

    //
    // Using VBO without VAO
    //
    //vertices
    //gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
    // XXX: update is done in draw... perhaps it should be done in a timer

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadsWebBuffer);
    if (_t.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, _t._quadsArrayBuffer, gl.DYNAMIC_DRAW);
      _t.dirty = false;
    }

    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);

    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
    gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);

    if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP)
      gl.drawElements(gl.TRIANGLE_STRIP, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);
    else
      gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);

    global.g_NumberOfDraws++;
    //checkGLErrorDebug();
  };
};

_tmp.WebGLTextureCache = function () {
  var _p = textureCache;

  _p.handleLoadedTexture = function (url, img) {
    var locTexs = this._textures, tex, ext;
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore;
    }
    tex = locTexs[url];
    if (!tex) {
      tex = locTexs[url] = new Texture2D();
      tex.url = url;
    }
    tex.initWithElement(img);
    ext = path.extname(url);
    if (ext === ".png") {
      tex.handleLoadedTexture(true);
    }
    else {
      tex.handleLoadedTexture();
    }
    return tex;
  };

  /**
   * <p>Returns a Texture2D object given an file image <br />
   * If the file image was not previously loaded, it will create a new Texture2D <br />
   *  object and it will return it. It will use the filename as a key.<br />
   * Otherwise it will return a reference of a previously loaded image. <br />
   * Supported image extensions: .png, .jpg, .gif</p>
   * @param {String} url
   * @param {Function} cb
   * @param {Object} target
   * @return {Texture2D}
   * @example
   * //example
   * textureCache.addImage("hello.png");
   */
  _p.addImage = function (url, cb, target) {
    assert(url, _LogInfos.Texture2D_addImage_2);

    var locTexs = this._textures;
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore;
    }
    var tex = locTexs[url] || locTexs[loader._getAliase(url)];
    if (tex) {
      if (tex.isLoaded()) {
        cb && cb.call(target, tex);
        return tex;
      }
      else {
        tex.addEventListener("load", function () {
          cb && cb.call(target, tex);
        }, target);
        return tex;
      }
    }

    tex = locTexs[url] = new Texture2D();
    tex.url = url;
    var basePath = loader.getBasePath ? loader.getBasePath() : loader.resPath;
    loader.loadImg(path.join(basePath || "", url), function (err, img) {
      if (err)
        return cb && cb.call(target, err);

      var texResult = textureCache.handleLoadedTexture(url, img);
      cb && cb.call(target, texResult);
    });

    return tex;
  };

  _p.addImageAsync = _p.addImage;
  _p = null;
};
