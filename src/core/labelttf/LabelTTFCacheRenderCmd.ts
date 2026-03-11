import { Texture2D } from '../../textures'
import { inject } from '../../ui/base/ProtectedNodeWebGLRenderCmd'
import { Node } from '../base-nodes/Node'
import { rect } from '../cocoa/Geometry'
import { LabelTTF } from './LabelTTF'

export const LabelTTFCacheRenderCmd = function () {
  this._labelCmdCtor()
  const locCanvas = (this._labelCanvas = document.createElement('canvas'))
  locCanvas.width = 1
  locCanvas.height = 1
  this._labelContext = locCanvas.getContext('2d')
}

LabelTTFCacheRenderCmd.prototype = Object.create(LabelTTF.RenderCmd.prototype)
inject(LabelTTF.RenderCmd.prototype, LabelTTFCacheRenderCmd.prototype)

const proto = LabelTTFCacheRenderCmd.prototype
proto.constructor = LabelTTFCacheRenderCmd
proto._cacheCmdCtor = LabelTTFCacheRenderCmd

proto._updateTexture = function () {
  this._dirtyFlag = (this._dirtyFlag & Node._dirtyFlags.textDirty) ^ this._dirtyFlag
  const node = this._node
  node._needUpdateTexture = false
  const locContentSize = node._contentSize
  this._updateTTF()
  const width = locContentSize.width,
    height = locContentSize.height

  const locContext = this._labelContext,
    locLabelCanvas = this._labelCanvas

  if (!node._texture) {
    const labelTexture = new Texture2D()
    labelTexture.initWithElement(this._labelCanvas)
    node.setTexture(labelTexture)
  }

  if (node._string.length === 0) {
    locLabelCanvas.width = 1
    locLabelCanvas.height = locContentSize.height || 1
    if (node._texture) {
      node._texture._htmlElementObj = this._labelCanvas
      node._texture.handleLoadedTexture()
    }
    node.setTextureRect(rect(0, 0, 1, locContentSize.height))
    return true
  }

  //set size for labelCanvas
  locContext.font = this._fontStyleStr

  const flag = locLabelCanvas.width === width && locLabelCanvas.height === height
  locLabelCanvas.width = width
  locLabelCanvas.height = height
  if (flag) locContext.clearRect(0, 0, width, height)
  this._saveStatus()
  this._drawTTFInCanvas(locContext)
  if (node._texture) {
    node._texture._htmlElementObj = this._labelCanvas
    node._texture.handleLoadedTexture()
  }
  node.setTextureRect(rect(0, 0, width, height))
  return true
}

proto._measureConfig = function () {
  this._labelContext.font = this._fontStyleStr
}

proto._measure = function (text) {
  if (text) {
    return this._labelContext.measureText(text).width
  } else {
    return 0
  }
}
