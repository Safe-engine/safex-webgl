import { defineGetterSetter } from '../helper'
import { Texture2D } from './TexturesWebGL'

export const PrototypeTexture2D = function () {
  const _p = Texture2D.prototype
  // Extended properties
  defineGetterSetter(_p, 'name', _p.getName)
  defineGetterSetter(_p, 'pixelFormat', _p.getPixelFormat)
  defineGetterSetter(_p, 'pixelsWidth', _p.getPixelsWide)
  defineGetterSetter(_p, 'pixelsHeight', _p.getPixelsHigh)
  //defineGetterSetter(_p, "size", _p.getContentSize, _p.setContentSize);
  defineGetterSetter(_p, 'width', _p._getWidth)
  defineGetterSetter(_p, 'height', _p._getHeight)
}
