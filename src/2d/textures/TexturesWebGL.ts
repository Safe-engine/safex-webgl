import { _renderContext, game } from "../..";
import { _LogInfos, assert, log } from "../../helper/Debugger";
import { loader } from "../../helper/loader";
import { size } from "../core/cocoa/Geometry";
import { contentScaleFactor, SHADER_POSITION_TEXTURE, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from "../core/platform/Macro";
import { glBindTexture2D } from "../shaders/GLStateCache";

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
  _pVRHaveAlphaPremultiplied: boolean;
  _pixelFormat: any;
  _pixelsWide: number;
  _pixelsHigh: number;
  _name: string;
  _contentSize: any;
  maxS: number;
  maxT: number;
  _hasPremultipliedAlpha: boolean;
  _hasMipmaps: boolean;

  shaderProgram: any;

  _textureLoaded: boolean;
  _htmlElementObj: any;
  _webTextureObj: any;

  url: any;

  // runtime-attached event helper methods (added by EventHelper.apply at runtime)
  addEventListener?: (type: any, callback: any, target?: any) => void;
  removeEventTarget?: (type: any, target?: any) => void;
  dispatchEvent?: (type: any) => void;

  constructor() {
    this._pVRHaveAlphaPremultiplied = true;
    this._pixelFormat = null;
    this._pixelsWide = 0;
    this._pixelsHigh = 0;
    this._name = "";
    this._contentSize = null;
    this.maxS = 0;
    this.maxT = 0;
    this._hasPremultipliedAlpha = false;
    this._hasMipmaps = false;

    this.shaderProgram = null;

    this._textureLoaded = false;
    this._htmlElementObj = null;
    this._webTextureObj = null;

    this.url = null;

    // ctor behavior
    this._contentSize = size(0, 0);
    this._pixelFormat = (this.constructor as any).defaultPixelFormat;
  }

  // release texture
  releaseTexture() {
    if (this._webTextureObj) _renderContext.deleteTexture(this._webTextureObj);
    this._htmlElementObj = null;
    loader.release(this.url);
  }

/**
 * pixel format of the texture
 * @return {Number}
 */
  getPixelFormat() {
    return this._pixelFormat;
  }

/**
 * width in pixels
 * @return {Number}
 */
  getPixelsWide() {
    return this._pixelsWide;
  }

/**
 * height in pixels
 * @return {Number}
 */
  getPixelsHigh() {
    return this._pixelsHigh;
  }

/**
 * get WebGLTexture Object
 * @return {WebGLTexture}
 */
  getName() {
    return this._webTextureObj;
  }

/**
 * content size
 * @return {Size}
 */
  getContentSize() {
    return size(this._contentSize.width / contentScaleFactor(), this._contentSize.height / contentScaleFactor());
  }

  _getWidth() {
    return this._contentSize.width / contentScaleFactor();
  }

  _getHeight() {
    return this._contentSize.height / contentScaleFactor();
  }

/**
 * get content size in pixels
 * @return {Size}
 */
  getContentSizeInPixels() {
    return this._contentSize;
  }

/**
 * texture max S
 * @return {Number}
 */
  getMaxS() {
    return this.maxS;
  }

/**
 * set texture max S
 * @param {Number} maxS
 */
  setMaxS(maxS: number) {
    this.maxS = maxS;
  }

/**
 * get texture max T
 * @return {Number}
 */
  getMaxT() {
    return this.maxT;
  }

/**
 * set texture max T
 * @param {Number} maxT
 */
  setMaxT(maxT: number) {
    this.maxT = maxT;
  }

/**
 * return shader program used by drawAtPoint and drawInRect
 * @return {GLProgram}
 */
  getShaderProgram() {
    return this.shaderProgram;
  }

/**
 * set shader program used by drawAtPoint and drawInRect
 * @param {GLProgram} shaderProgram
 */
  setShaderProgram(shaderProgram: any) {
    this.shaderProgram = shaderProgram;
  }

/**
 * whether or not the texture has their Alpha premultiplied
 * @return {Boolean}
 */
  hasPremultipliedAlpha() {
    return this._hasPremultipliedAlpha;
  }

/**
 * whether or not use mipmap
 * @return {Boolean}
 */
  hasMipmaps() {
    return this._hasMipmaps;
  }

/**
 * description
 * @return {string}
 */
  description() {
    const _t: any = this;
    return "<Texture2D | Name = " + _t._name + " | Dimensions = " + _t._pixelsWide + " x " + _t._pixelsHigh + " | Coordinates = (" + _t.maxS + ", " + _t.maxT + ")>";
  }

/**
 * These functions are needed to create mutable textures
 * @param {Array} data
 */
  releaseData(_data: any) {
    _data = null;
  }

  keepData(_data: any, _length?: number) {
    //The texture data mustn't be saved because it isn't a mutable texture.
    return _data;
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
    const self: any = this, tex2d: any = (this.constructor as any);
    const gl: any = _renderContext;
    let format = gl.RGBA, type = gl.UNSIGNED_BYTE;

    const bitsPerPixel = (tex2d._B || [])[pixelFormat];

    const bytesPerRow = pixelsWide * bitsPerPixel / 8;
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
      var self: any = this;
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
    }

    /**
     * draws a texture inside a rect
     * @param {Rect} rect
     */
    drawInRect(rect: any) {
      var self: any = this;
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
    }

    /**
     * Initializes a texture from a UIImage object
     * @param uiImage
     * @return {Boolean}
     */
    initWithImage(uiImage: any) {
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
    }

    /**
     * init with HTML element
     * @param {HTMLImageElement|HTMLCanvasElement} element
     */
    initWithElement(element: any) {
      if (!element) return;
      this._webTextureObj = _renderContext.createTexture();
      this._htmlElementObj = element;
      this._textureLoaded = true;
      // Textures should be loaded with premultiplied alpha in order to avoid gray bleeding
      // when semitransparent textures are interpolated (e.g. when scaled).
      this._hasPremultipliedAlpha = true;
    }

    /**
     * HTMLElement Object getter
     * @return {HTMLElement}
     */
    getHtmlElementObj() {
      return this._htmlElementObj;
    }

    /**
     * whether texture is loaded
     * @return {Boolean}
     */
    isLoaded() {
      return this._textureLoaded;
    }

    /**
     * handler of texture loaded event
     * @param {Boolean} [premultiplied=false]
     */
    handleLoadedTexture(premultiplied?: boolean) {
      var self: any = this;
      premultiplied = (premultiplied !== undefined) ? premultiplied : self._hasPremultipliedAlpha;
      // Not sure about this ! Some texture need to be updated even after loaded
      if (!game._rendererInitialized) return;
      if (!self._htmlElementObj) return;
      if (!self._htmlElementObj.width || !self._htmlElementObj.height) return;

      //upload image to buffer
      var gl = _renderContext;

      glBindTexture2D(self);

      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      if (premultiplied) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

      // Specify OpenGL texture image
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._htmlElementObj);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      self.shaderProgram = shaderCache.programForKey(SHADER_POSITION_TEXTURE);
      glBindTexture2D(null);
      if (premultiplied) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);

      var pixelsWide = self._htmlElementObj.width;
      var pixelsHigh = self._htmlElementObj.height;

      self._pixelsWide = self._contentSize.width = pixelsWide;
      self._pixelsHigh = self._contentSize.height = pixelsHigh;
      self._pixelFormat = (this.constructor as any).PIXEL_FORMAT_RGBA8888;
      self.maxS = 1;
      self.maxT = 1;

      self._hasPremultipliedAlpha = premultiplied;
      self._hasMipmaps = false;
      if ((window as any).ENABLE_IMAEG_POOL) {
        self._htmlElementObj = null;
      }

      //dispatch load event to listener.
      self.dispatchEvent("load");
    }

    /**
     * Initializes a texture from a string with dimensions, alignment, font name and font size (note: initWithString does not support on HTML5)
     */
    initWithString(_text: any, _fontName: any, _fontSize: any, _dimensions: any, _hAlignment: any, _vAlignment: any) {
      log(_LogInfos.Texture2D_initWithString);
      return null;
    }

    initWithETCFile(_file: any) {
      log(_LogInfos.Texture2D_initWithETCFile_2);
      return false;
    }

    initWithPVRFile(_file: any) {
      log(_LogInfos.Texture2D_initWithPVRFile_2);
      return false;
    }

    initWithPVRTCData(_data: any, _level: any, _bpp: any, _hasAlpha: any, _length: any, _pixelFormat: any) {
      log(_LogInfos.Texture2D_initWithPVRTCData_2);
      return false;
    }

    setTexParameters(texParams: any, magFilter?: any, wrapS?: any, wrapT?: any) {
      var _t: any = this;
      var gl: any = _renderContext;

      if (magFilter !== undefined) texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT };

      assert((_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh)) ||
        (texParams.wrapS === gl.CLAMP_TO_EDGE && texParams.wrapT === gl.CLAMP_TO_EDGE),
        "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");

      glBindTexture2D(_t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParams.minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParams.magFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParams.wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParams.wrapT);
    }

    setAntiAliasTexParameters() {
      var gl: any = _renderContext;

      glBindTexture2D(this);
      if (!this._hasMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    setAliasTexParameters() {
      var gl: any = _renderContext;

      glBindTexture2D(this);
      if (!this._hasMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    generateMipmap() {
      var _t: any = this;
      assert(_t._pixelsWide === NextPOT(_t._pixelsWide) && _t._pixelsHigh === NextPOT(_t._pixelsHigh), "Mimpap texture only works in POT textures");

      glBindTexture2D(_t);
      _renderContext.generateMipmap(_renderContext.TEXTURE_2D);
      _t._hasMipmaps = true;
    }

    stringForFormat() {
      return (this.constructor as any)._M[this._pixelFormat];
    }

    bitsPerPixelForFormat(format?: any) {
      format = format || this._pixelFormat;
      var value = (this.constructor as any)._B[format];
      if (value != null) return value;
      log(_LogInfos.Texture2D_bitsPerPixelForFormat, format);
      return -1;
    }

    _initPremultipliedATextureWithImage(uiImage: any, width: any, height: any) {
      var tex2d: any = (this.constructor as any);
      var tempData: any = uiImage.getData();
      var inPixel32: any = null;
      var inPixel8: any = null;

      var hasAlpha: any = uiImage.hasAlpha();
      var imageSize: any = size(uiImage.getWidth(), uiImage.getHeight());
      var pixelFormat: any = tex2d.defaultPixelFormat;
      var bpp: any = uiImage.getBitsPerComponent();

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
      var i: any, length: any = width * height;

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
        tempData = new Uint8Array(width * height);
        inPixel32 = uiImage.getData();

        for (i = 0; i < length; ++i) {
          tempData[i] = (inPixel32 >> 24) & 0xFF;  // A
        }
      }

      if (hasAlpha && pixelFormat === tex2d.PIXEL_FORMAT_RGB888) {
        inPixel32 = uiImage.getData();
        tempData = new Uint8Array(width * height * 3);

        for (i = 0; i < length; ++i) {
          tempData[i * 3] = (inPixel32 >> 0) & 0xFF; // R
          tempData[i * 3 + 1] = (inPixel32 >> 8) & 0xFF; // G
          tempData[i * 3 + 2] = (inPixel32 >> 16) & 0xFF; // B
        }
      }

      this.initWithData(tempData, pixelFormat, width, height, imageSize);

      if (tempData != uiImage.getData()) tempData = null;

      this._hasPremultipliedAlpha = uiImage.isPremultipliedAlpha();
      return true;
    }

    /**
     * add listener for loaded event
     * @param {Function} callback
     * @param {Node} target
     * @deprecated since 3.1, please use addEventListener instead
     */
    addLoadedEventListener(callback: any, target: any) {
      this.addEventListener("load", callback, target);
    }

    /**
     * remove listener from listeners by target
     * @param {Node} target
     */
    removeLoadedEventListener(target: any) {
      this.removeEventTarget("load", target);
    }
  }
