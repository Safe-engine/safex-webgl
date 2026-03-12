import { defineGetterSetter } from '../../helper/getset'
import { Sprite } from './Sprite'

export const PrototypeSprite = function () {
  const _p = Sprite.prototype

  // Override properties
  defineGetterSetter(_p, 'opacityModifyRGB', _p.isOpacityModifyRGB, _p.setOpacityModifyRGB)
  defineGetterSetter(_p, 'opacity', _p.getOpacity, _p.setOpacity)
  defineGetterSetter(_p, 'color', _p.getColor, _p.setColor)

  // Extended properties
  defineGetterSetter(_p, 'flippedX', _p.isFlippedX, _p.setFlippedX)
  defineGetterSetter(_p, 'flippedY', _p.isFlippedY, _p.setFlippedY)
  defineGetterSetter(_p, 'offsetX', _p._getOffsetX)
  defineGetterSetter(_p, 'offsetY', _p._getOffsetY)
  defineGetterSetter(_p, 'texture', _p.getTexture, _p.setTexture)
  defineGetterSetter(_p, 'textureRectRotated', _p.isTextureRectRotated)
  defineGetterSetter(_p, 'batchNode', _p.getBatchNode, _p.setBatchNode)
  defineGetterSetter(_p, 'quad', _p.getQuad)
}
