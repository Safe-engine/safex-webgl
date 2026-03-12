import { defineGetterSetter } from '../../helper/getset'
import { Sprite } from './Sprite'

export const PrototypeSprite = function () {
  const _p = Sprite.prototype

  // Override properties
  defineGetterSetter(_p, 'opacityModifyRGB', _p.isOpacityModifyRGB, _p.setOpacityModifyRGB)
  defineGetterSetter(_p, 'opacity', _p.getOpacity, _p.setOpacity)
  defineGetterSetter(_p, 'color', _p.getColor, _p.setColor)

  // Extended properties
  /** @expose */
  _p.dirty
  /** @expose */
  // _p.flippedX;
  defineGetterSetter(_p, 'flippedX', _p.isFlippedX, _p.setFlippedX)
  /** @expose */
  // _p.flippedY;
  defineGetterSetter(_p, 'flippedY', _p.isFlippedY, _p.setFlippedY)
  /** @expose */
  // _p.offsetX;
  defineGetterSetter(_p, 'offsetX', _p._getOffsetX)
  /** @expose */
  // _p.offsetY;
  defineGetterSetter(_p, 'offsetY', _p._getOffsetY)
  /** @expose */
  _p.atlasIndex
  /** @expose */
  _p.texture
  defineGetterSetter(_p, 'texture', _p.getTexture, _p.setTexture)
  /** @expose */
  // _p.textureRectRotated;
  defineGetterSetter(_p, 'textureRectRotated', _p.isTextureRectRotated)
  /** @expose */
  _p.textureAtlas
  /** @expose */
  // _p.batchNode;
  defineGetterSetter(_p, 'batchNode', _p.getBatchNode, _p.setBatchNode)
  /** @expose */
  // _p.quad;
  defineGetterSetter(_p, 'quad', _p.getQuad)
}
