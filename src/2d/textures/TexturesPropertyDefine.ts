import { defineGetterSetter } from "../core/sprites/SpritesPropertyDefine";
import { Texture2D } from "./TexturesWebGL";

export let PVRHaveAlphaPremultiplied_ = false;

export const PrototypeTexture2D = function () {

  var _c: any = Texture2D;

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
  _c.PVRImagesHavePremultipliedAlpha = function (haveAlphaPremultiplied) {
    PVRHaveAlphaPremultiplied_ = haveAlphaPremultiplied;
  };

  /**
   * 32-bit texture: RGBA8888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGBA8888
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_RGBA8888 = 2;

  /**
   * 24-bit texture: RGBA888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB888
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_RGB888 = 3;

  /**
   * 16-bit texture without Alpha channel
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB565
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_RGB565 = 4;

  /**
   * 8-bit textures used as masks
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_A8
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_A8 = 5;

  /**
   * 8-bit intensity texture
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_I8
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_I8 = 6;

  /**
   * 16-bit textures used as masks
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_AI88
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_AI88 = 7;

  /**
   * 16-bit textures: RGBA4444
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGBA4444
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_RGBA4444 = 8;

  /**
   * 16-bit textures: RGB5A1
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_RGB5A1
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_RGB5A1 = 7;

  /**
   * 4-bit PVRTC-compressed texture: PVRTC4
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC4
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_PVRTC4 = 9;

  /**
   * 2-bit PVRTC-compressed texture: PVRTC2
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC2
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_PVRTC2 = 10;

  /**
   * Default texture format: RGBA8888
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_DEFAULT
   * @static
   * @constant
   * @type {Number}
   */
  _c.PIXEL_FORMAT_DEFAULT = _c.PIXEL_FORMAT_RGBA8888;

  /**
   * The default pixel format
   * @memberOf Texture2D
   * @name PIXEL_FORMAT_PVRTC2
   * @static
   * @type {Number}
   */
  _c.defaultPixelFormat = _c.PIXEL_FORMAT_DEFAULT;

  var _M = Texture2D._M = {};
  _M[_c.PIXEL_FORMAT_RGBA8888] = "RGBA8888";
  _M[_c.PIXEL_FORMAT_RGB888] = "RGB888";
  _M[_c.PIXEL_FORMAT_RGB565] = "RGB565";
  _M[_c.PIXEL_FORMAT_A8] = "A8";
  _M[_c.PIXEL_FORMAT_I8] = "I8";
  _M[_c.PIXEL_FORMAT_AI88] = "AI88";
  _M[_c.PIXEL_FORMAT_RGBA4444] = "RGBA4444";
  _M[_c.PIXEL_FORMAT_RGB5A1] = "RGB5A1";
  _M[_c.PIXEL_FORMAT_PVRTC4] = "PVRTC4";
  _M[_c.PIXEL_FORMAT_PVRTC2] = "PVRTC2";

  var _B = Texture2D._B = {};
  _B[_c.PIXEL_FORMAT_RGBA8888] = 32;
  _B[_c.PIXEL_FORMAT_RGB888] = 24;
  _B[_c.PIXEL_FORMAT_RGB565] = 16;
  _B[_c.PIXEL_FORMAT_A8] = 8;
  _B[_c.PIXEL_FORMAT_I8] = 8;
  _B[_c.PIXEL_FORMAT_AI88] = 16;
  _B[_c.PIXEL_FORMAT_RGBA4444] = 16;
  _B[_c.PIXEL_FORMAT_RGB5A1] = 16;
  _B[_c.PIXEL_FORMAT_PVRTC4] = 4;
  _B[_c.PIXEL_FORMAT_PVRTC2] = 3;

  var _p = Texture2D.prototype;

  // Extended properties
  /** @expose */
  // _p.name;
  defineGetterSetter(_p, "name", _p.getName);
  /** @expose */
  _p.pixelFormat;
  defineGetterSetter(_p, "pixelFormat", _p.getPixelFormat);
  /** @expose */
  _p.pixelsWidth;
  defineGetterSetter(_p, "pixelsWidth", _p.getPixelsWide);
  /** @expose */
  _p.pixelsHeight;
  defineGetterSetter(_p, "pixelsHeight", _p.getPixelsHigh);
  //defineGetterSetter(_p, "size", _p.getContentSize, _p.setContentSize);
  /** @expose */
  _p.width;
  defineGetterSetter(_p, "width", _p._getWidth);
  /** @expose */
  _p.height;
  defineGetterSetter(_p, "height", _p._getHeight);
};

export const PrototypeTextureAtlas = function () {

  var _p = TextureAtlas.prototype;

  // Extended properties
  /** @expose */
  _p.totalQuads;
  defineGetterSetter(_p, "totalQuads", _p.getTotalQuads);
  /** @expose */
  _p.capacity;
  defineGetterSetter(_p, "capacity", _p.getCapacity);
  /** @expose */
  _p.quads;
  defineGetterSetter(_p, "quads", _p.getQuads, _p.setQuads);
};
