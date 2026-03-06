import { defineGetterSetter } from "../core/sprites/SpritesPropertyDefine";
import { Texture2D } from "./TexturesWebGL";


export const PrototypeTexture2D = function () {
  var _p = Texture2D.prototype;
  // Extended properties
  /** @expose */
  // _p.name;
  defineGetterSetter(_p, "name", _p.getName);
  /** @expose */
  // _p.pixelFormat;
  defineGetterSetter(_p, "pixelFormat", _p.getPixelFormat);
  /** @expose */
  // _p.pixelsWidth;
  defineGetterSetter(_p, "pixelsWidth", _p.getPixelsWide);
  /** @expose */
  // _p.pixelsHeight;
  defineGetterSetter(_p, "pixelsHeight", _p.getPixelsHigh);
  //defineGetterSetter(_p, "size", _p.getContentSize, _p.setContentSize);
  /** @expose */
  // _p.width;
  defineGetterSetter(_p, "width", _p._getWidth);
  /** @expose */
  // _p.height;
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
