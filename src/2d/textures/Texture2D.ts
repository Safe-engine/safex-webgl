import { game } from "../..";
import { isFunction } from "../../helper/checkType";
import { _LogInfos, assert, log } from "../../helper/Debugger";
import { _renderType } from "../../helper/engine";
import { _tmp } from "../../helper/global";
import { loader } from "../../helper/loader";
import { sys } from "../../helper/sys";
import { rect, size } from "../core/cocoa/Geometry";
import { EventHelper } from "../core/event-manager/EventHelper";
import { contentScaleFactor, REPEAT } from "../core/platform/Macro";
import { textureCache } from "./TextureCache";

export const ALIGN_CENTER = 0x33;
export const ALIGN_TOP = 0x13;
export const ALIGN_TOP_RIGHT = 0x12;
export const ALIGN_RIGHT = 0x32;
export const ALIGN_BOTTOM_RIGHT = 0x22;
export const ALIGN_BOTTOM = 0x23;
export const ALIGN_BOTTOM_LEFT = 0x21;
export const ALIGN_LEFT = 0x31;
export const ALIGN_TOP_LEFT = 0x11;
export const PVRHaveAlphaPremultiplied_ = false;

export class Texture2D extends EventHelper {
  _contentSize: any;
  _textureLoaded: boolean;
  _htmlElementObj: any;
  url: any;
  _pattern: string;
  _pixelsWide: number;
  _pixelsHigh: number;
  channelCache: any;
  _grayElementObj: any = null;
  _backupElement: any = null;
  _isGray: boolean = false;

  constructor() {
    super();
    this._contentSize = size(0, 0);
    this._textureLoaded = false;
    this._htmlElementObj = null;
    this._pattern = "";
    this._pixelsWide = 0;
    this._pixelsHigh = 0;
  }

  getPixelsWide() {
    return this._pixelsWide;
  }

  getPixelsHigh() {
    return this._pixelsHigh;
  }

  getContentSize() {
    const locScaleFactor = contentScaleFactor();
    return size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
  }

  _getWidth() {
    return this._contentSize.width / contentScaleFactor();
  }

  _getHeight() {
    return this._contentSize.height / contentScaleFactor();
  }

  getContentSizeInPixels() {
    return this._contentSize;
  }

  initWithElement(element: any) {
    if (!element) return;
    this._htmlElementObj = element;
    this._pixelsWide = this._contentSize.width = element.width;
    this._pixelsHigh = this._contentSize.height = element.height;
    this._textureLoaded = true;
  }

  getHtmlElementObj() {
    return this._htmlElementObj;
  }

  isLoaded() {
    return this._textureLoaded;
  }

  handleLoadedTexture() {
    if (!this._htmlElementObj) return;
    const locElement = this._htmlElementObj;
    this._pixelsWide = this._contentSize.width = locElement.width;
    this._pixelsHigh = this._contentSize.height = locElement.height;
    this.dispatchEvent("load");
  }

  description() {
    return "<Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height + ">";
  }

  initWithData(data: any, pixelFormat: any, pixelsWide: number, pixelsHigh: number, contentSize: any) {
    return false;
  }

  initWithImage(uiImage: any) {
    return false;
  }

  initWithString(text: string, fontName: string, fontSize: any, dimensions: any, hAlignment: any, vAlignment: any) {
    return false;
  }

  releaseTexture() {
    this._htmlElementObj = null;
    loader.release(this.url);
  }

  getName() {
    return null;
  }

  getMaxS() {
    return 1;
  }

  setMaxS(maxS: any) { }

  getMaxT() {
    return 1;
  }

  setMaxT(maxT: any) { }

  getPixelFormat() {
    return null;
  }

  getShaderProgram() {
    return null;
  }

  setShaderProgram(shaderProgram: any) { }

  hasPremultipliedAlpha() {
    return false;
  }

  hasMipmaps() {
    return false;
  }

  releaseData(data: any) {
    data = null;
  }

  keepData(data: any, length: any) {
    return data;
  }

  drawAtPoint(point: any) { }

  drawInRect(r: any) { }

  initWithETCFile(file: any) {
    log(_LogInfos.Texture2D_initWithETCFile);
    return false;
  }

  initWithPVRFile(file: any) {
    log(_LogInfos.Texture2D_initWithPVRFile);
    return false;
  }

  initWithPVRTCData(data: any, level: any, bpp: any, hasAlpha: any, length: any, pixelFormat: any) {
    log(_LogInfos.Texture2D_initWithPVRTCData);
    return false;
  }

  setTexParameters(texParams: any, magFilter?: any, wrapS?: any, wrapT?: any) {
    if (magFilter !== undefined) texParams = { minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT };
    if (texParams.wrapS === REPEAT && texParams.wrapT === REPEAT) {
      this._pattern = "repeat";
      return;
    }
    if (texParams.wrapS === REPEAT) {
      this._pattern = "repeat-x";
      return;
    }
    if (texParams.wrapT === REPEAT) {
      this._pattern = "repeat-y";
      return;
    }
    this._pattern = "";
  }

  setAntiAliasTexParameters() { }

  setAliasTexParameters() { }

  generateMipmap() { }

  stringForFormat() {
    return "";
  }

  bitsPerPixelForFormat(format: any) {
    return -1;
  }

  addLoadedEventListener(callback: any, target: any) {
    this.addEventListener("load", callback, target);
  }

  removeLoadedEventListener(target: any) {
    this.removeEventTarget("load", target);
  }

  _generateTextureCacheForColor() {
    if (this.channelCache) return this.channelCache;
    const textureCacheArr = [
      document.createElement("canvas"),
      document.createElement("canvas"),
      document.createElement("canvas"),
      document.createElement("canvas")
    ];
    renderToCache(this._htmlElementObj, textureCacheArr);
    return (this.channelCache = textureCacheArr);
  }

  _switchToGray(toGray: boolean) {
    if (!this._textureLoaded || this._isGray === toGray) return;
    this._isGray = toGray;
    if (this._isGray) {
      this._backupElement = this._htmlElementObj;
      if (!this._grayElementObj) this._grayElementObj = Texture2D._generateGrayTexture(this._htmlElementObj);
      this._htmlElementObj = this._grayElementObj;
    } else {
      if (this._backupElement !== null) this._htmlElementObj = this._backupElement;
    }
  }

  _generateGrayTexture() {
    if (!this._textureLoaded) return null;
    const grayElement = Texture2D._generateGrayTexture(this._htmlElementObj);
    const newTexture = new Texture2D();
    newTexture.initWithElement(grayElement);
    newTexture.handleLoadedTexture();
    return newTexture;
  }

  _generateColorTexture(r: number, g: number, b: number, rectArg?: any, canvas?: any) {
    // keep original implementation behavior as much as possible
    if (sys._supportCanvasNewBlendModes) {
      let onlyCanvas = false;
      if (canvas) onlyCanvas = true;
      else canvas = document.createElement("canvas");
      const textureImage = this._htmlElementObj;
      if (!rectArg) rectArg = rect(0, 0, textureImage.width, textureImage.height);
      canvas.width = rectArg.width;
      canvas.height = rectArg.height;
      const context = canvas.getContext("2d");
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
      context.fillRect(0, 0, rectArg.width, rectArg.height);
      context.globalCompositeOperation = "multiply";
      context.drawImage(
        textureImage,
        rectArg.x, rectArg.y, rectArg.width, rectArg.height,
        0, 0, rectArg.width, rectArg.height
      );
      context.globalCompositeOperation = "destination-atop";
      context.drawImage(
        textureImage,
        rectArg.x, rectArg.y, rectArg.width, rectArg.height,
        0, 0, rectArg.width, rectArg.height
      );
      if (onlyCanvas) return canvas;
      const newTexture = new Texture2D();
      newTexture.initWithElement(canvas);
      newTexture.handleLoadedTexture();
      return newTexture;
    } else {
      let onlyCanvas = false;
      if (canvas) onlyCanvas = true;
      else canvas = document.createElement("canvas");
      const textureImage = this._htmlElementObj;
      if (!rectArg) rectArg = rect(0, 0, textureImage.width, textureImage.height);
      let x = rectArg.x, y = rectArg.y, w = rectArg.width, h = rectArg.height;
      if (!w || !h) return;
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext("2d");
      const tintedImgCache = textureCache.getTextureColors(this);
      context.globalCompositeOperation = 'lighter';
      context.drawImage(tintedImgCache[3], x, y, w, h, 0, 0, w, h);
      if (r > 0) {
        context.globalAlpha = r / 255;
        context.drawImage(tintedImgCache[0], x, y, w, h, 0, 0, w, h);
      }
      if (g > 0) {
        context.globalAlpha = g / 255;
        context.drawImage(tintedImgCache[1], x, y, w, h, 0, 0, w, h);
      }
      if (b > 0) {
        context.globalAlpha = b / 255;
        context.drawImage(tintedImgCache[2], x, y, w, h, 0, 0, w, h);
      }
      if (onlyCanvas) return canvas;
      const newTexture = new Texture2D();
      newTexture.initWithElement(canvas);
      newTexture.handleLoadedTexture();
      return newTexture;
    }
  }

  static _generateGrayTexture(texture: any, rectArg?: any, renderCanvas?: any) {
    if (texture === null) return null;
    renderCanvas = renderCanvas || document.createElement("canvas");
    rectArg = rectArg || rect(0, 0, texture.width, texture.height);
    renderCanvas.width = rectArg.width;
    renderCanvas.height = rectArg.height;
    const context = renderCanvas.getContext("2d");
    context.drawImage(texture, rectArg.x, rectArg.y, rectArg.width, rectArg.height, 0, 0, rectArg.width, rectArg.height);
    const imgData = context.getImageData(0, 0, rectArg.width, rectArg.height);
    const data = imgData.data;
    for (let i = 0, len = data.length; i < len; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    }
    context.putImageData(imgData, 0, 0);
    return renderCanvas;
  }
}

var renderToCache = function (image: any, cache: any[]) {
  var w = image.width;
  var h = image.height;
  cache[0].width = w;
  cache[0].height = h;
  cache[1].width = w;
  cache[1].height = h;
  cache[2].width = w;
  cache[2].height = h;
  cache[3].width = w;
  cache[3].height = h;
  var cacheCtx = cache[3].getContext("2d");
  cacheCtx.drawImage(image, 0, 0);
  var pixels = cacheCtx.getImageData(0, 0, w, h).data;
  var ctx;
  for (var rgbI = 0; rgbI < 4; rgbI++) {
    ctx = cache[rgbI].getContext("2d");
    var to = ctx.getImageData(0, 0, w, h);
    var data = to.data;
    for (var i = 0; i < pixels.length; i += 4) {
      data[i] = (rgbI === 0) ? pixels[i] : 0;
      data[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
      data[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
      data[i + 3] = pixels[i + 3];
    }
    ctx.putImageData(to, 0, 0);
  }
  image.onload = null;
};

game.addEventListener(game.EVENT_RENDERER_INITED, function () {
  if (_renderType === game.RENDER_TYPE_CANVAS) {
    var proto = {
    }
  } else if (_renderType === game.RENDER_TYPE_WEBGL) {
    assert(isFunction(_tmp.WebGLTexture2D), _LogInfos.MissingFile, "TexturesWebGL.js");
    _tmp.WebGLTexture2D();
    delete _tmp.WebGLTexture2D;
  }
  // EventHelper.prototype.apply(Texture2D.prototype);
  assert(isFunction(_tmp.PrototypeTexture2D), _LogInfos.MissingFile, "TexturesPropertyDefine.js");
  _tmp.PrototypeTexture2D();
  delete _tmp.PrototypeTexture2D;
});
