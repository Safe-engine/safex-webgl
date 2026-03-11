import { inject } from '../../ui/base/ProtectedNodeWebGLRenderCmd'
import { SpriteWebGLRenderCmd } from '../sprites/SpriteWebGLRenderCmd'
import { LabelTTFCacheRenderCmd } from './LabelTTFCacheRenderCmd'

export const LabelTTFWebGLRenderCmd = function (renderable) {
  this._spriteCmdCtor(renderable)
  this._cacheCmdCtor()
}
const proto = (LabelTTFWebGLRenderCmd.prototype = Object.create(SpriteWebGLRenderCmd.prototype))

inject(LabelTTFCacheRenderCmd.prototype, proto)
proto.constructor = LabelTTFWebGLRenderCmd
proto._updateColor = function () {}
