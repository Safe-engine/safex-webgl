import { inject } from '../../ui/base/ProtectedNodeWebGLRenderCmd'
import { SpriteWebGLRenderCmd } from '../sprites/SpriteWebGLRenderCmd'
import { LabelTTFCacheRenderCmd } from './LabelTTFCacheRenderCmd'

export class LabelTTFWebGLRenderCmd extends SpriteWebGLRenderCmd {
  declare _cacheCmdCtor: any
  constructor(renderable) {
    super(renderable)
    // this._spriteCmdCtor(renderable)
    this._cacheCmdCtor()
  }
}
const proto = LabelTTFWebGLRenderCmd.prototype

inject(LabelTTFCacheRenderCmd.prototype, proto)
// proto.constructor = LabelTTFWebGLRenderCmd
// proto._updateColor = function () {}
