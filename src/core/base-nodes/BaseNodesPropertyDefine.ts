import { defineGetterSetter } from '../../helper/getset'
import { Node } from './Node'

export const PrototypeCCNode = function () {
  const _p = Node.prototype

  defineGetterSetter(_p, 'x', _p.getPositionX, _p.setPositionX)
  defineGetterSetter(_p, 'y', _p.getPositionY, _p.setPositionY)
  defineGetterSetter(_p, 'width', _p._getWidth, _p._setWidth)
  defineGetterSetter(_p, 'height', _p._getHeight, _p._setHeight)
  defineGetterSetter(_p, 'anchorX', _p._getAnchorX, _p._setAnchorX)
  defineGetterSetter(_p, 'anchorY', _p._getAnchorY, _p._setAnchorY)
  defineGetterSetter(_p, 'skewX', _p.getSkewX, _p.setSkewX)
  defineGetterSetter(_p, 'skewY', _p.getSkewY, _p.setSkewY)
  defineGetterSetter(_p, 'zIndex', _p.getLocalZOrder, _p.setLocalZOrder)
  defineGetterSetter(_p, 'vertexZ', _p.getVertexZ, _p.setVertexZ)
  defineGetterSetter(_p, 'rotation', _p.getRotation, _p.setRotation)
  defineGetterSetter(_p, 'rotationX', _p.getRotationX, _p.setRotationX)
  defineGetterSetter(_p, 'rotationY', _p.getRotationY, _p.setRotationY)
  defineGetterSetter(_p, 'scale', _p.getScale, _p.setScale)
  defineGetterSetter(_p, 'scaleX', _p.getScaleX, _p.setScaleX)
  defineGetterSetter(_p, 'scaleY', _p.getScaleY, _p.setScaleY)
  defineGetterSetter(_p, 'children', _p.getChildren)
  defineGetterSetter(_p, 'childrenCount', _p.getChildrenCount)
  defineGetterSetter(_p, 'parent', _p.getParent, _p.setParent)
  defineGetterSetter(_p, 'visible', _p.isVisible, _p.setVisible)
  defineGetterSetter(_p, 'running', _p.isRunning)
  defineGetterSetter(_p, 'ignoreAnchor', _p.isIgnoreAnchorPointForPosition, _p.ignoreAnchorPointForPosition)
  defineGetterSetter(_p, 'actionManager', _p.getActionManager, _p.setActionManager)
  defineGetterSetter(_p, 'scheduler', _p.getScheduler, _p.setScheduler)
  //defineGetterSetter(_p, "boundingBox", _p.getBoundingBox);
  defineGetterSetter(_p, 'shaderProgram', _p.getShaderProgram, _p.setShaderProgram)

  defineGetterSetter(_p, 'opacity', _p.getOpacity, _p.setOpacity)
  defineGetterSetter(_p, 'opacityModifyRGB', _p.isOpacityModifyRGB)
  defineGetterSetter(_p, 'cascadeOpacity', _p.isCascadeOpacityEnabled, _p.setCascadeOpacityEnabled)
  defineGetterSetter(_p, 'color', _p.getColor, _p.setColor)
  defineGetterSetter(_p, 'cascadeColor', _p.isCascadeColorEnabled, _p.setCascadeColorEnabled)
}
