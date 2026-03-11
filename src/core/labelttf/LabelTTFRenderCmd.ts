import { game, global, Node, p, Rect, Size, view } from '../..'
import { _renderType } from '../../helper/engine'
import {
  TEXT_ALIGNMENT_CENTER,
  TEXT_ALIGNMENT_RIGHT,
  VERTICAL_TEXT_ALIGNMENT_BOTTOM,
  VERTICAL_TEXT_ALIGNMENT_CENTER,
  VERTICAL_TEXT_ALIGNMENT_TOP,
} from '../platform'
import { FontDefinition } from '../platform/FontDefinition'
import { LabelTTF } from './LabelTTF'

export const LabelTTFRenderCmd = function () {
  this._fontClientHeight = 18
  this._fontStyleStr = ''
  this._shadowColorStr = 'rgba(128, 128, 128, 0.5)'
  this._strokeColorStr = ''
  this._fillColorStr = 'rgba(255,255,255,1)'

  this._labelCanvas = null
  this._labelContext = null
  this._lineWidths = []
  this._strings = []
  this._isMultiLine = false
  this._status = []
  this._renderingIndex = 0

  this._canUseDirtyRegion = true
}
const proto = LabelTTFRenderCmd.prototype
proto.constructor = LabelTTFRenderCmd
proto._labelCmdCtor = LabelTTFRenderCmd

proto._setFontStyle = function (fontNameOrFontDef, fontSize, fontStyle, fontWeight) {
  if (fontNameOrFontDef instanceof FontDefinition) {
    this._fontStyleStr = fontNameOrFontDef._getCanvasFontStr()
    this._fontClientHeight = LabelTTF.__getFontHeightByDiv(fontNameOrFontDef)
  } else {
    const deviceFontSize = fontSize * view.getDevicePixelRatio()
    this._fontStyleStr = `${fontStyle} ${fontWeight} ${deviceFontSize}px '${fontNameOrFontDef}'`
    this._fontClientHeight = LabelTTF.__getFontHeightByDiv(fontNameOrFontDef, fontSize)
  }
}

proto._getFontStyle = function () {
  return this._fontStyleStr
}

proto._getFontClientHeight = function () {
  return this._fontClientHeight
}

proto._updateColor = function () {
  this._setColorsString()
  this._updateTexture()
}

proto._setColorsString = function () {
  const locDisplayColor = this._displayedColor,
    node = this._node,
    locShadowColor = node._shadowColor || this._displayedColor
  const locStrokeColor = node._strokeColor,
    locFontFillColor = node._textFillColor
  const dr = locDisplayColor.r / 255,
    dg = locDisplayColor.g / 255,
    db = locDisplayColor.b / 255

  this._shadowColorStr = `rgba(${0 | (dr * locShadowColor.r)},${0 | (dg * locShadowColor.g)},${0 | (db * locShadowColor.b)},${
    node._shadowOpacity
  })`
  this._fillColorStr = `rgba(${0 | (dr * locFontFillColor.r)},${0 | (dg * locFontFillColor.g)},${0 | (db * locFontFillColor.b)}, 1)`
  this._strokeColorStr = `rgba(${0 | (dr * locStrokeColor.r)},${0 | (dg * locStrokeColor.g)},${0 | (db * locStrokeColor.b)}, 1)`
}

const localBB = new Rect()
proto.getLocalBB = function () {
  const node = this._node
  localBB.x = localBB.y = 0
  const pixelRatio = view.getDevicePixelRatio()
  localBB.width = node._getWidth() * pixelRatio
  localBB.height = node._getHeight() * pixelRatio
  return localBB
}

proto._updateTTF = function () {
  const node = this._node
  const pixelRatio = view.getDevicePixelRatio()
  const locDimensionsWidth = node._dimensions.width * pixelRatio
  let i
  let strLength
  const locLineWidth = this._lineWidths
  locLineWidth.length = 0

  this._isMultiLine = false
  this._measureConfig()
  const textWidthCache = {}
  if (locDimensionsWidth !== 0) {
    // Content processing
    this._strings = node._string.split('\n')

    for (i = 0; i < this._strings.length; i++) {
      this._checkWarp(this._strings, i, locDimensionsWidth)
    }
  } else {
    this._strings = node._string.split('\n')
    for (i = 0, strLength = this._strings.length; i < strLength; i++) {
      if (this._strings[i]) {
        const measuredWidth = this._measure(this._strings[i])
        locLineWidth.push(measuredWidth)
        textWidthCache[this._strings[i]] = measuredWidth
      } else {
        locLineWidth.push(0)
      }
    }
  }

  if (this._strings.length > 1) this._isMultiLine = true

  let locSize,
    locStrokeShadowOffsetX = 0,
    locStrokeShadowOffsetY = 0
  if (node._strokeEnabled) locStrokeShadowOffsetX = locStrokeShadowOffsetY = node._strokeSize * 2
  if (node._shadowEnabled) {
    const locOffsetSize = node._shadowOffset
    locStrokeShadowOffsetX += Math.abs(locOffsetSize.x) * 2
    locStrokeShadowOffsetY += Math.abs(locOffsetSize.y) * 2
  }

  //get offset for stroke and shadow
  if (locDimensionsWidth === 0) {
    if (this._isMultiLine) {
      locSize = Size(
        Math.ceil(Math.max(...locLineWidth) + locStrokeShadowOffsetX),
        Math.ceil(this._fontClientHeight * pixelRatio * this._strings.length + locStrokeShadowOffsetY),
      )
    } else {
      let measuredWidth = textWidthCache[node._string]
      if (!measuredWidth && node._string) {
        measuredWidth = this._measure(node._string)
      }
      locSize = Size(
        Math.ceil((measuredWidth ? measuredWidth : 0) + locStrokeShadowOffsetX),
        Math.ceil(this._fontClientHeight * pixelRatio + locStrokeShadowOffsetY),
      )
    }
  } else {
    if (node._dimensions.height === 0) {
      if (this._isMultiLine)
        locSize = Size(
          Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
          Math.ceil(node.getLineHeight() * pixelRatio * this._strings.length + locStrokeShadowOffsetY),
        )
      else
        locSize = Size(
          Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
          Math.ceil(node.getLineHeight() * pixelRatio + locStrokeShadowOffsetY),
        )
    } else {
      //dimension is already set, contentSize must be same as dimension
      locSize = Size(
        Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
        Math.ceil(node._dimensions.height * pixelRatio + locStrokeShadowOffsetY),
      )
    }
  }
  if (node._getFontStyle() !== 'normal') {
    //add width for 'italic' and 'oblique'
    locSize.width = Math.ceil(locSize.width + node._fontSize * 0.3)
  }
  node.setContentSize(locSize)
  node._strokeShadowOffsetX = locStrokeShadowOffsetX
  node._strokeShadowOffsetY = locStrokeShadowOffsetY

  // need computing _anchorPointInPoints
  const locAP = node._anchorPoint
  this._anchorPointInPoints.x = locStrokeShadowOffsetX * 0.5 + (locSize.width - locStrokeShadowOffsetX) * locAP.x
  this._anchorPointInPoints.y = locStrokeShadowOffsetY * 0.5 + (locSize.height - locStrokeShadowOffsetY) * locAP.y
}

proto._saveStatus = function () {
  const node = this._node
  const scale = view.getDevicePixelRatio()
  const locStrokeShadowOffsetX = node._strokeShadowOffsetX,
    locStrokeShadowOffsetY = node._strokeShadowOffsetY
  const locContentSizeHeight = node._contentSize.height - locStrokeShadowOffsetY,
    locVAlignment = node._vAlignment,
    locHAlignment = node._hAlignment
  const dx = locStrokeShadowOffsetX * 0.5,
    dy = locContentSizeHeight + locStrokeShadowOffsetY * 0.5
  let xOffset = 0
  let yOffset = 0
  const OffsetYArray = []
  const locContentWidth = node._contentSize.width - locStrokeShadowOffsetX

  //lineHeight
  const lineHeight = node.getLineHeight() * scale
  const transformTop = (lineHeight - this._fontClientHeight * scale) / 2

  if (locHAlignment === TEXT_ALIGNMENT_RIGHT) xOffset += locContentWidth
  else if (locHAlignment === TEXT_ALIGNMENT_CENTER) xOffset += locContentWidth / 2
  else xOffset += 0

  if (this._isMultiLine) {
    const locStrLen = this._strings.length
    if (locVAlignment === VERTICAL_TEXT_ALIGNMENT_BOTTOM)
      yOffset = lineHeight - transformTop * 2 + locContentSizeHeight - lineHeight * locStrLen
    else if (locVAlignment === VERTICAL_TEXT_ALIGNMENT_CENTER)
      yOffset = (lineHeight - transformTop * 2) / 2 + (locContentSizeHeight - lineHeight * locStrLen) / 2

    for (let i = 0; i < locStrLen; i++) {
      const tmpOffsetY = -locContentSizeHeight + (lineHeight * i + transformTop) + yOffset
      OffsetYArray.push(tmpOffsetY)
    }
  } else {
    if (locVAlignment === VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
      //do nothing
    } else if (locVAlignment === VERTICAL_TEXT_ALIGNMENT_TOP) {
      yOffset -= locContentSizeHeight
    } else {
      yOffset -= locContentSizeHeight * 0.5
    }
    OffsetYArray.push(yOffset)
  }
  const tmpStatus = {
    contextTransform: p(dx, dy),
    xOffset: xOffset,
    OffsetYArray: OffsetYArray,
  }
  this._status.push(tmpStatus)
}

proto._drawTTFInCanvas = function (context) {
  if (!context) return
  const locStatus = this._status.pop()
  context.setTransform(1, 0, 0, 1, locStatus.contextTransform.x, locStatus.contextTransform.y)
  const xOffset = locStatus.xOffset
  const yOffsetArray = locStatus.OffsetYArray
  this.drawLabels(context, xOffset, yOffsetArray)
}

proto._checkWarp = function (strArr, i, maxWidth) {
  const text = strArr[i]
  const allWidth = this._measure(text)
  if (allWidth > maxWidth && text.length > 1) {
    let fuzzyLen = (text.length * (maxWidth / allWidth)) | 0
    let tmpText = text.substr(fuzzyLen)
    let width = allWidth - this._measure(tmpText)
    let sLine
    let pushNum = 0

    //Increased while cycle maximum ceiling. default 100 time
    let checkWhile = 0

    //Exceeded the size
    while (width > maxWidth && checkWhile++ < 100) {
      fuzzyLen *= maxWidth / width
      fuzzyLen = fuzzyLen | 0
      tmpText = text.substr(fuzzyLen)
      width = allWidth - this._measure(tmpText)
    }

    checkWhile = 0

    //Find the truncation point
    while (width < maxWidth && checkWhile++ < 100) {
      if (tmpText) {
        const exec = LabelTTF._wordRex.exec(tmpText)
        pushNum = exec ? exec[0].length : 1
        sLine = tmpText
      }

      fuzzyLen = fuzzyLen + pushNum
      tmpText = text.substr(fuzzyLen)
      width = allWidth - this._measure(tmpText)
    }

    fuzzyLen -= pushNum
    if (fuzzyLen === 0) {
      fuzzyLen = 1
      sLine = sLine.substr(1)
    }

    let sText = text.substr(0, fuzzyLen),
      result

    //symbol in the first
    if (LabelTTF.wrapInspection) {
      if (LabelTTF._symbolRex.test(sLine || tmpText)) {
        result = LabelTTF._lastWordRex.exec(sText)
        fuzzyLen -= result ? result[0].length : 0
        if (fuzzyLen === 0) fuzzyLen = 1

        sLine = text.substr(fuzzyLen)
        sText = text.substr(0, fuzzyLen)
      }
    }

    //To judge whether a English words are truncated
    if (LabelTTF._firstEnglish.test(sLine)) {
      result = LabelTTF._lastEnglish.exec(sText)
      if (result && sText !== result[0]) {
        fuzzyLen -= result[0].length
        sLine = text.substr(fuzzyLen)
        sText = text.substr(0, fuzzyLen)
      }
    }

    strArr[i] = sLine || tmpText
    strArr.splice(i, 0, sText)
  }
}

proto.updateStatus = function () {
  const flags = Node._dirtyFlags,
    locFlag = this._dirtyFlag

  if (locFlag & flags.textDirty) this._updateTexture()

  this.originUpdateStatus()
}

proto._syncStatus = function (parentCmd) {
  const flags = Node._dirtyFlags,
    locFlag = this._dirtyFlag

  if (locFlag & flags.textDirty) this._updateTexture()

  this._originSyncStatus(parentCmd)

  if (_renderType === game.RENDER_TYPE_WEBGL || locFlag & flags.transformDirty) this.transform(parentCmd)
}

proto.drawLabels = function (context, xOffset, yOffsetArray) {
  const node = this._node
  //shadow style setup
  if (node._shadowEnabled) {
    const locShadowOffset = node._shadowOffset
    context.shadowColor = this._shadowColorStr
    context.shadowOffsetX = locShadowOffset.x
    context.shadowOffsetY = -locShadowOffset.y
    context.shadowBlur = node._shadowBlur
  }

  const locHAlignment = node._hAlignment,
    locVAlignment = node._vAlignment,
    locStrokeSize = node._strokeSize

  //this is fillText for canvas
  if (context.font !== this._fontStyleStr) context.font = this._fontStyleStr
  context.fillStyle = this._fillColorStr

  //stroke style setup
  const locStrokeEnabled = node._strokeEnabled
  if (locStrokeEnabled) {
    context.lineWidth = locStrokeSize * 2
    context.strokeStyle = this._strokeColorStr
  }

  context.textBaseline = LabelTTF._textBaseline[locVAlignment]
  context.textAlign = LabelTTF._textAlign[locHAlignment]

  const locStrLen = this._strings.length
  for (let i = 0; i < locStrLen; i++) {
    const line = this._strings[i]
    if (locStrokeEnabled) {
      context.lineJoin = 'round'
      context.strokeText(line, xOffset, yOffsetArray[i])
    }
    context.fillText(line, xOffset, yOffsetArray[i])
  }
  global.g_NumberOfDraws++
}
