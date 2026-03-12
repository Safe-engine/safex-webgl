import { defineGetterSetter } from '../../helper/getset'
import { LabelTTF } from './LabelTTF'

export const PrototypeLabelTTF = function () {
  const _p = LabelTTF.prototype

  // Override properties
  defineGetterSetter(_p, 'color', _p.getColor, _p.setColor)
  defineGetterSetter(_p, 'opacity', _p.getOpacity, _p.setOpacity)

  // Extended properties

  defineGetterSetter(_p, 'string', _p.getString, _p.setString)

  defineGetterSetter(_p, 'textAlign', _p.getHorizontalAlignment, _p.setHorizontalAlignment)

  defineGetterSetter(_p, 'verticalAlign', _p.getVerticalAlignment, _p.setVerticalAlignment)

  defineGetterSetter(_p, 'fontSize', _p.getFontSize, _p.setFontSize)

  defineGetterSetter(_p, 'fontName', _p.getFontName, _p.setFontName)

  defineGetterSetter(_p, 'font', _p._getFont, _p._setFont)

  //defineGetterSetter(_p, "boundingSize", _p.getDimensions, _p.setDimensions);

  defineGetterSetter(_p, 'boundingWidth', _p._getBoundingWidth, _p._setBoundingWidth)

  defineGetterSetter(_p, 'boundingHeight', _p._getBoundingHeight, _p._setBoundingHeight)

  defineGetterSetter(_p, 'fillStyle', _p._getFillStyle, _p.setFontFillColor)

  defineGetterSetter(_p, 'strokeStyle', _p._getStrokeStyle, _p._setStrokeStyle)

  defineGetterSetter(_p, 'lineWidth', _p._getLineWidth, _p._setLineWidth)

  //defineGetterSetter(_p, "shadowOffset", _p._getShadowOffset, _p._setShadowOffset);

  defineGetterSetter(_p, 'shadowOffsetX', _p._getShadowOffsetX, _p._setShadowOffsetX)

  defineGetterSetter(_p, 'shadowOffsetY', _p._getShadowOffsetY, _p._setShadowOffsetY)

  defineGetterSetter(_p, 'shadowOpacity', _p._getShadowOpacity, _p._setShadowOpacity)

  defineGetterSetter(_p, 'shadowBlur', _p._getShadowBlur, _p._setShadowBlur)
}
