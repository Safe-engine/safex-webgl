import { renderer, view } from '../..'
import { _LogInfos, log } from '../../helper/Debugger'
import { Node } from '../base-nodes/Node'
import { p, size } from '../cocoa/Geometry'
import { color, contentScaleFactor } from '../platform'
import { FontDefinition } from '../platform/FontDefinition'
import { TEXT_ALIGNMENT_CENTER, TEXT_ALIGNMENT_LEFT, VERTICAL_TEXT_ALIGNMENT_TOP } from '../platform/Types'
import { Sprite } from '../sprites/Sprite'
import { PrototypeLabelTTF } from './LabelTTFPropertyDefine'
import { LabelTTFWebGLRenderCmd } from './LabelTTFWebGLRenderCmd'

/**
 * <p>LabelTTF is a subclass of TextureNode that knows how to render text labels with system font or a ttf font file<br/>
 * All features from Sprite are valid in LabelTTF<br/>
 * LabelTTF objects are slow for js-binding on mobile devices.<br/>
 * Consider using LabelAtlas or LabelBMFont instead.<br/>
 * You can create a LabelTTF from a font name, alignment, dimension and font size or a FontDefinition object.</p>
 * @class
 * @extends Sprite
 *
 * @param {String} text
 * @param {String|FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {Size} [dimensions=size(0,0)]
 * @param {Number} [hAlignment=TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=VERTICAL_TEXT_ALIGNMENT_TOP]
 * @example
 * var myLabel = new LabelTTF('label text',  'Times New Roman', 32, size(320,32), TEXT_ALIGNMENT_LEFT);
 *
 * var fontDef = new FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = "32";
 * var myLabel = new LabelTTF('label text',  fontDef);
 *
 * @property {String}       string          - Content string of label
 * @property {Number}       textAlign       - Horizontal Alignment of label: TEXT_ALIGNMENT_LEFT|TEXT_ALIGNMENT_CENTER|TEXT_ALIGNMENT_RIGHT
 * @property {Number}       verticalAlign   - Vertical Alignment of label: VERTICAL_TEXT_ALIGNMENT_TOP|VERTICAL_TEXT_ALIGNMENT_CENTER|VERTICAL_TEXT_ALIGNMENT_BOTTOM
 * @property {Number}       fontSize        - Font size of label
 * @property {String}       fontName        - Font name of label
 * @property {String}       font            - The label font with a style string: e.g. "18px Verdana"
 * @property {Number}       boundingWidth   - Width of the bounding box of label, the real content width is limited by boundingWidth
 * @property {Number}       boundingHeight  - Height of the bounding box of label, the real content height is limited by boundingHeight
 * @property {Color}     fillStyle       - The fill color
 * @property {Color}     strokeStyle     - The stroke color
 * @property {Number}       lineWidth       - The line width for stroke
 * @property {Number}       shadowOffsetX   - The x axis offset of shadow
 * @property {Number}       shadowOffsetY   - The y axis offset of shadow
 * @property {Number}       shadowOpacity   - The opacity of shadow
 * @property {Number}       shadowBlur      - The blur size of shadow
 */
export class LabelTTF extends Sprite {
  _dimensions = null
  _hAlignment = TEXT_ALIGNMENT_CENTER
  _vAlignment = VERTICAL_TEXT_ALIGNMENT_TOP
  _fontName = null
  _fontSize = 0.0
  _string = ''
  _originalText = null
  _onCacheCanvasMode = true

  // font shadow
  _shadowEnabled = false
  _shadowOffset = null
  _shadowOpacity = 0
  _shadowBlur = 0
  _shadowColor = null

  // font stroke
  _strokeEnabled = false
  _strokeColor = null
  _strokeSize = 0

  // font tint
  _textFillColor = null

  _strokeShadowOffsetX = 0
  _strokeShadowOffsetY = 0
  _needUpdateTexture = false

  _lineWidths = null
  _className = 'LabelTTF'

  //for web
  _fontStyle = 'normal'
  _fontWeight = 'normal'
  _lineHeight: any = 'normal'

  /**
   * Initializes the LabelTTF with a font name, alignment, dimension and font size, do not call it by yourself,
   * you should pass the correct arguments in constructor to initialize the label.
   * @param {String} label string
   * @param {String} fontName
   * @param {Number} fontSize
   * @param {Size} [dimensions=]
   * @param {Number} [hAlignment=]
   * @param {Number} [vAlignment=]
   * @return {Boolean} return false on error
   */
  initWithString(label, fontName?, fontSize?, dimensions?, hAlignment?, vAlignment?) {
    let strInfo
    if (label) strInfo = `${label}`
    else strInfo = ''

    fontSize = fontSize || 16
    dimensions = dimensions || size(0, 0 /*fontSize*/)
    hAlignment = hAlignment || TEXT_ALIGNMENT_LEFT
    vAlignment = vAlignment || VERTICAL_TEXT_ALIGNMENT_TOP

    this._opacityModifyRGB = false
    this._dimensions = size(dimensions.width, dimensions.height)
    this._fontName = fontName || 'Arial'
    this._hAlignment = hAlignment
    this._vAlignment = vAlignment

    this._fontSize = fontSize
    this._renderCmd._setFontStyle(this._fontName, fontSize, this._fontStyle, this._fontWeight)
    this.setString(strInfo)
    this._renderCmd._setColorsString()
    this._renderCmd._updateTexture()
    this._setUpdateTextureDirty()

    // Needed for high dpi text.
    // In order to render it crisp, we request devicePixelRatio times the
    // font size and scale it down 1/devicePixelRatio.
    this._scaleX = this._scaleY = 1 / view.getDevicePixelRatio()
    return true
  }

  _setUpdateTextureDirty() {
    this._needUpdateTexture = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.textDirty)
  }

  constructor(text?, fontName?, fontSize?, dimensions?, hAlignment?, vAlignment?) {
    super()
    this._dimensions = size(0, 0)
    this._hAlignment = TEXT_ALIGNMENT_LEFT
    this._vAlignment = VERTICAL_TEXT_ALIGNMENT_TOP
    this._opacityModifyRGB = false
    this._fontName = 'Arial'

    this._shadowEnabled = false
    this._shadowOffset = p(0, 0)
    this._shadowOpacity = 0
    this._shadowBlur = 0

    this._strokeEnabled = false
    this._strokeColor = color(255, 255, 255, 255)
    this._strokeSize = 0

    this._textFillColor = color(255, 255, 255, 255)
    this._strokeShadowOffsetX = 0
    this._strokeShadowOffsetY = 0
    this._needUpdateTexture = false

    this._lineWidths = []
    this._renderCmd._setColorsString()
    this._textureLoaded = true

    if (fontName && fontName instanceof FontDefinition) {
      this.initWithStringAndTextDefinition(text, fontName)
    } else {
      LabelTTF.prototype.initWithString.call(this, text, fontName, fontSize, dimensions, hAlignment, vAlignment)
    }
  }

  init() {
    return this.initWithString(' ', this._fontName, this._fontSize)
  }

  description() {
    return `<LabelTTF | FontName =${this._fontName} FontSize = ${this._fontSize.toFixed(1)}>`
  }

  getLineHeight() {
    return !this._lineHeight || this._lineHeight.charAt
      ? this._renderCmd._getFontClientHeight()
      : this._lineHeight || this._renderCmd._getFontClientHeight()
  }

  setLineHeight(lineHeight) {
    this._lineHeight = lineHeight
  }

  /**
   * Returns the text of the label
   * @return {String}
   */
  getString() {
    return this._string
  }

  /**
   * Returns Horizontal Alignment of LabelTTF
   * @return {TEXT_ALIGNMENT_LEFT|TEXT_ALIGNMENT_CENTER|TEXT_ALIGNMENT_RIGHT}
   */
  getHorizontalAlignment() {
    return this._hAlignment
  }

  /**
   * Returns Vertical Alignment of LabelTTF
   * @return {VERTICAL_TEXT_ALIGNMENT_TOP|VERTICAL_TEXT_ALIGNMENT_CENTER|VERTICAL_TEXT_ALIGNMENT_BOTTOM}
   */
  getVerticalAlignment() {
    return this._vAlignment
  }

  /**
   * Returns the dimensions of LabelTTF, the dimension is the maximum size of the label, set it so that label will automatically change lines when necessary.
   * @see LabelTTF#setDimensions, LabelTTF#boundingWidth and LabelTTF#boundingHeight
   * @return {Size}
   */
  getDimensions() {
    return size(this._dimensions)
  }

  /**
   * Returns font size of LabelTTF
   * @return {Number}
   */
  getFontSize() {
    return this._fontSize
  }

  /**
   * Returns font name of LabelTTF
   * @return {String}
   */
  getFontName() {
    return this._fontName
  }

  /**
   * Initializes the CCLabelTTF with a font name, alignment, dimension and font size, do not call it by yourself, you should pass the correct arguments in constructor to initialize the label.
   * @param {String} text
   * @param {FontDefinition} textDefinition
   * @return {Boolean}
   */
  initWithStringAndTextDefinition(text, textDefinition) {
    // prepare everything needed to render the label
    this._updateWithTextDefinition(textDefinition, false)
    // set the string
    this.setString(text)
    return true
  }

  /**
   * Sets the text definition used by this label
   * @param {FontDefinition} theDefinition
   */
  setTextDefinition(theDefinition) {
    if (theDefinition) this._updateWithTextDefinition(theDefinition, true)
  }

  /**
   * Extract the text definition used by this label
   * @return {FontDefinition}
   */
  getTextDefinition() {
    return this._prepareTextDefinition(false)
  }

  /**
   * Enable or disable shadow for the label
   * @param {Color | Number} a Color or The x axis offset of the shadow
   * @param {Size | Number} b Size or The y axis offset of the shadow
   * @param {Number} c The blur size of the shadow or The opacity of the shadow (0 to 1)
   * @param {null | Number} d Null or The blur size of the shadow
   * @example
   *   old:
   *     labelttf.enableShadow(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur);
   *   new:
   *     labelttf.enableShadow(shadowColor, offset, blurRadius);
   */
  enableShadow(a, b, c, d) {
    if (a.r != null && a.g != null && a.b != null && a.a != null) {
      this._enableShadow(a, b, c)
    } else {
      this._enableShadowNoneColor(a, b, c, d)
    }
  }

  _enableShadowNoneColor(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur) {
    shadowOpacity = shadowOpacity || 0.5
    if (false === this._shadowEnabled) this._shadowEnabled = true

    const locShadowOffset = this._shadowOffset
    if ((locShadowOffset && locShadowOffset.x !== shadowOffsetX) || locShadowOffset._y !== shadowOffsetY) {
      locShadowOffset.x = shadowOffsetX
      locShadowOffset.y = shadowOffsetY
    }

    if (this._shadowOpacity !== shadowOpacity) {
      this._shadowOpacity = shadowOpacity
    }
    this._renderCmd._setColorsString()

    if (this._shadowBlur !== shadowBlur) this._shadowBlur = shadowBlur
    this._setUpdateTextureDirty()
  }

  _enableShadow(shadowColor, offset, blurRadius) {
    if (!this._shadowColor) {
      this._shadowColor = color(255, 255, 255, 128)
    }
    this._shadowColor.r = shadowColor.r
    this._shadowColor.g = shadowColor.g
    this._shadowColor.b = shadowColor.b

    const x = offset.width || offset.x || 0
    const y = offset.height || offset.y || 0
    const a = shadowColor.a != null ? shadowColor.a / 255 : 0.5
    const b = blurRadius

    this._enableShadowNoneColor(x, y, a, b)
  }

  _getShadowOffsetX() {
    return this._shadowOffset.x
  }
  _setShadowOffsetX(x) {
    if (false === this._shadowEnabled) this._shadowEnabled = true

    if (this._shadowOffset.x !== x) {
      this._shadowOffset.x = x
      this._setUpdateTextureDirty()
    }
  }

  _getShadowOffsetY() {
    return this._shadowOffset._y
  }
  _setShadowOffsetY(y) {
    if (false === this._shadowEnabled) this._shadowEnabled = true

    if (this._shadowOffset._y !== y) {
      this._shadowOffset._y = y
      this._setUpdateTextureDirty()
    }
  }

  _getShadowOffset() {
    return p(this._shadowOffset.x, this._shadowOffset.y)
  }
  _setShadowOffset(offset) {
    if (false === this._shadowEnabled) this._shadowEnabled = true

    if (this._shadowOffset.x !== offset.x || this._shadowOffset.y !== offset.y) {
      this._shadowOffset.x = offset.x
      this._shadowOffset.y = offset.y
      this._setUpdateTextureDirty()
    }
  }

  _getShadowOpacity() {
    return this._shadowOpacity
  }
  _setShadowOpacity(shadowOpacity) {
    if (false === this._shadowEnabled) this._shadowEnabled = true

    if (this._shadowOpacity !== shadowOpacity) {
      this._shadowOpacity = shadowOpacity
      this._renderCmd._setColorsString()
      this._setUpdateTextureDirty()
    }
  }

  _getShadowBlur() {
    return this._shadowBlur
  }
  _setShadowBlur(shadowBlur) {
    if (false === this._shadowEnabled) this._shadowEnabled = true

    if (this._shadowBlur !== shadowBlur) {
      this._shadowBlur = shadowBlur
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Disable shadow rendering
   */
  disableShadow() {
    if (this._shadowEnabled) {
      this._shadowEnabled = false
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Enable label stroke with stroke parameters
   * @param {Color} strokeColor The color of stroke
   * @param {Number} strokeSize The size of stroke
   */
  enableStroke(strokeColor, strokeSize) {
    if (this._strokeEnabled === false) this._strokeEnabled = true

    const locStrokeColor = this._strokeColor
    if (locStrokeColor.r !== strokeColor.r || locStrokeColor.g !== strokeColor.g || locStrokeColor.b !== strokeColor.b) {
      locStrokeColor.r = strokeColor.r
      locStrokeColor.g = strokeColor.g
      locStrokeColor.b = strokeColor.b
      this._renderCmd._setColorsString()
    }

    if (this._strokeSize !== strokeSize) this._strokeSize = strokeSize || 0
    this._setUpdateTextureDirty()
  }

  _getStrokeStyle() {
    return this._strokeColor
  }
  _setStrokeStyle(strokeStyle) {
    if (this._strokeEnabled === false) this._strokeEnabled = true

    const locStrokeColor = this._strokeColor
    if (locStrokeColor.r !== strokeStyle.r || locStrokeColor.g !== strokeStyle.g || locStrokeColor.b !== strokeStyle.b) {
      locStrokeColor.r = strokeStyle.r
      locStrokeColor.g = strokeStyle.g
      locStrokeColor.b = strokeStyle.b
      this._renderCmd._setColorsString()
      this._setUpdateTextureDirty()
    }
  }

  _getLineWidth() {
    return this._strokeSize
  }
  _setLineWidth(lineWidth) {
    if (this._strokeEnabled === false) this._strokeEnabled = true
    if (this._strokeSize !== lineWidth) {
      this._strokeSize = lineWidth || 0
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Disable label stroke
   */
  disableStroke() {
    if (this._strokeEnabled) {
      this._strokeEnabled = false
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Sets the text fill color
   * @function
   * @param {Color} fillColor The fill color of the label
   */
  setFontFillColor(fillColor) {
    const locTextFillColor = this._textFillColor
    if (locTextFillColor.r !== fillColor.r || locTextFillColor.g !== fillColor.g || locTextFillColor.b !== fillColor.b) {
      locTextFillColor.r = fillColor.r
      locTextFillColor.g = fillColor.g
      locTextFillColor.b = fillColor.b
      this._renderCmd._setColorsString()
      this._needUpdateTexture = true
    }
  }

  _getFillStyle() {
    return this._textFillColor
  }

  //set the text definition for this label
  _updateWithTextDefinition(textDefinition, mustUpdateTexture) {
    if (textDefinition.fontDimensions) {
      this._dimensions.width = textDefinition.boundingWidth
      this._dimensions.height = textDefinition.boundingHeight
    } else {
      this._dimensions.width = 0
      this._dimensions.height = 0
    }

    this._hAlignment = textDefinition.textAlign
    this._vAlignment = textDefinition.verticalAlign

    this._fontName = textDefinition.fontName
    this._fontSize = textDefinition.fontSize || 12

    if (textDefinition.lineHeight) this._lineHeight = textDefinition.lineHeight
    else this._lineHeight = this._fontSize

    this._renderCmd._setFontStyle(textDefinition)

    // shadow
    if (textDefinition.shadowEnabled)
      this.enableShadow(textDefinition.shadowOffsetX, textDefinition.shadowOffsetY, textDefinition.shadowOpacity, textDefinition.shadowBlur)

    // stroke
    if (textDefinition.strokeEnabled) this.enableStroke(textDefinition.strokeStyle, textDefinition.lineWidth)

    // fill color
    this.setFontFillColor(textDefinition.fillStyle)

    if (mustUpdateTexture) this._renderCmd._updateTexture()
    const flags = Node._dirtyFlags
    this._renderCmd.setDirtyFlag(flags.colorDirty | flags.opacityDirty | flags.textDirty)
  }

  _prepareTextDefinition(adjustForResolution) {
    const texDef: any = new FontDefinition()

    if (adjustForResolution) {
      texDef.fontSize = this._fontSize
      texDef.boundingWidth = contentScaleFactor() * this._dimensions.width
      texDef.boundingHeight = contentScaleFactor() * this._dimensions.height
    } else {
      texDef.fontSize = this._fontSize
      texDef.boundingWidth = this._dimensions.width
      texDef.boundingHeight = this._dimensions.height
    }

    texDef.fontName = this._fontName
    texDef.textAlign = this._hAlignment
    texDef.verticalAlign = this._vAlignment

    // stroke
    if (this._strokeEnabled) {
      texDef.strokeEnabled = true
      const locStrokeColor = this._strokeColor
      texDef.strokeStyle = color(locStrokeColor.r, locStrokeColor.g, locStrokeColor.b)
      texDef.lineWidth = this._strokeSize
    } else texDef.strokeEnabled = false

    // shadow
    if (this._shadowEnabled) {
      texDef.shadowEnabled = true
      texDef.shadowBlur = this._shadowBlur
      texDef.shadowOpacity = this._shadowOpacity

      texDef.shadowOffsetX = (adjustForResolution ? contentScaleFactor() : 1) * this._shadowOffset.x
      texDef.shadowOffsetY = (adjustForResolution ? contentScaleFactor() : 1) * this._shadowOffset.y
    } else texDef._shadowEnabled = false

    // text tint
    const locTextFillColor = this._textFillColor
    texDef.fillStyle = color(locTextFillColor.r, locTextFillColor.g, locTextFillColor.b)
    return texDef
  }

  /*
   * BEGIN SCALE METHODS
   *
   * In order to make the value of scaleX and scaleY consistent across
   * screens, we provide patched versions that return the same values as if
   * the screen was not HiDPI.
   */

  /**
   * Returns the scale factor of the node.
   * @warning: Assertion will fail when _scaleX != _scaleY.
   * @function
   * @return {Number} The scale factor
   */
  getScale() {
    if (this._scaleX !== this._scaleY) log(_LogInfos.Node_getScale)
    return this._scaleX * view.getDevicePixelRatio()
  }

  /**
   * Sets the scale factor of the node. 1.0 is the default scale factor. This function can modify the X and Y scale at the same time.
   * @function
   * @param {Number} scale or scaleX value
   * @param {Number} [scaleY=]
   */
  setScale(scale, scaleY) {
    const ratio = view.getDevicePixelRatio()
    this._scaleX = scale / ratio
    this._scaleY = (scaleY || scaleY === 0 ? scaleY : scale) / ratio
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  /**
   * Returns the scale factor on X axis of this node
   * @function
   * @return {Number} The scale factor on X axis.
   */
  getScaleX() {
    return this._scaleX * view.getDevicePixelRatio()
  }

  /**
   * <p>
   *     Changes the scale factor on X axis of this node                                   <br/>
   *     The default value is 1.0 if you haven't changed it before
   * </p>
   * @function
   * @param {Number} newScaleX The scale factor on X axis.
   */
  setScaleX(newScaleX) {
    this._scaleX = newScaleX / view.getDevicePixelRatio()
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  /**
   * Returns the scale factor on Y axis of this node
   * @function
   * @return {Number} The scale factor on Y axis.
   */
  getScaleY() {
    return this._scaleY * view.getDevicePixelRatio()
  }

  /**
   * <p>
   *     Changes the scale factor on Y axis of this node                                            <br/>
   *     The Default value is 1.0 if you haven't changed it before.
   * </p>
   * @function
   * @param {Number} newScaleY The scale factor on Y axis.
   */
  setScaleY(newScaleY) {
    this._scaleY = newScaleY / view.getDevicePixelRatio()
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  /*
   * END SCALE METHODS
   */

  /**
   * Changes the text content of the label
   * @warning Changing the string is as expensive as creating a new LabelTTF. To obtain better performance use LabelAtlas
   * @param {String} text Text content for the label
   */
  setString(text) {
    text = String(text)
    if (this._originalText !== text) {
      this._originalText = `${text}`

      this._updateString()

      // Force update
      this._setUpdateTextureDirty()
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
    }
  }
  _updateString() {
    if ((!this._string || this._string === '') && this._string !== this._originalText) renderer.childrenOrderDirty = true
    this._string = this._originalText
  }

  /**
   * Sets Horizontal Alignment of LabelTTF
   * @param {TEXT_ALIGNMENT_LEFT|TEXT_ALIGNMENT_CENTER|TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
   */
  setHorizontalAlignment(alignment) {
    if (alignment !== this._hAlignment) {
      this._hAlignment = alignment
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Sets Vertical Alignment of LabelTTF
   * @param {VERTICAL_TEXT_ALIGNMENT_TOP|VERTICAL_TEXT_ALIGNMENT_CENTER|VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
   */
  setVerticalAlignment(verticalAlignment) {
    if (verticalAlignment !== this._vAlignment) {
      this._vAlignment = verticalAlignment

      // Force update
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Set Dimensions of LabelTTF, the dimension is the maximum size of the label, set it so that label will automatically change lines when necessary.
   * @param {Size|Number} dim dimensions or width of dimensions
   * @param {Number} [height] height of dimensions
   */
  setDimensions(dim, height) {
    let width
    if (height === undefined) {
      width = dim.width
      height = dim.height
    } else width = dim

    if (width !== this._dimensions.width || height !== this._dimensions.height) {
      this._dimensions.width = width
      this._dimensions.height = height
      this._updateString()
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  _getBoundingWidth() {
    return this._dimensions.width
  }
  _setBoundingWidth(width) {
    if (width !== this._dimensions.width) {
      this._dimensions.width = width
      this._updateString()
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  _getBoundingHeight() {
    return this._dimensions.height
  }
  _setBoundingHeight(height) {
    if (height !== this._dimensions.height) {
      this._dimensions.height = height
      this._updateString()
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Sets font size of LabelTTF
   * @param {Number} fontSize
   */
  setFontSize(fontSize) {
    if (this._fontSize !== fontSize) {
      this._fontSize = fontSize
      this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight)
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Sets font name of LabelTTF
   * @param {String} fontName
   */
  setFontName(fontName) {
    if (this._fontName && this._fontName !== fontName) {
      this._fontName = fontName
      this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight)
      // Force update
      this._setUpdateTextureDirty()
    }
  }

  _getFont() {
    return this._renderCmd._getFontStyle()
  }
  _setFont(fontStyle) {
    const res = LabelTTF._fontStyleRE.exec(fontStyle)
    if (res) {
      this._fontSize = parseInt(res[1])
      this._fontName = res[2]
      this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight)

      // Force update
      this._setUpdateTextureDirty()
    }
  }

  /**
   * Returns the actual content size of the label, the content size is the real size that the label occupied while dimension is the outer bounding box of the label.
   * @returns {Size} The content size
   */
  getContentSize() {
    if (this._needUpdateTexture) this._renderCmd._updateTTF()
    const ratio = view.getDevicePixelRatio()
    return size(this._contentSize.width / ratio, this._contentSize.height / ratio)
  }

  _getWidth() {
    if (this._needUpdateTexture) this._renderCmd._updateTTF()
    return this._contentSize.width / view.getDevicePixelRatio()
  }
  _getHeight() {
    if (this._needUpdateTexture) this._renderCmd._updateTTF()
    return this._contentSize.height / view.getDevicePixelRatio()
  }

  setTextureRect(rect, rotated, untrimmedSize) {
    this._rectRotated = rotated || false
    this.setContentSize(untrimmedSize || rect)

    const locRect = this._rect
    locRect.x = rect.x
    locRect.y = rect.y
    locRect.width = rect.width
    locRect.height = rect.height
    this._renderCmd._setTextureCoords(rect, false)

    let relativeOffsetX = this._unflippedOffsetPositionFromCenter.x,
      relativeOffsetY = this._unflippedOffsetPositionFromCenter.y
    if (this._flippedX) relativeOffsetX = -relativeOffsetX
    if (this._flippedY) relativeOffsetY = -relativeOffsetY
    this._offsetPosition.x = relativeOffsetX + (rect.width - locRect.width) / 2
    this._offsetPosition.y = relativeOffsetY + (rect.height - locRect.height) / 2
  }

  /**
   * set Target to draw on
   * @param boolean onCanvas
   */
  setDrawMode(onCacheMode) {
    this._onCacheCanvasMode = onCacheMode
  }

  _createRenderCmd() {
    return new LabelTTFWebGLRenderCmd(this)
  }

  //For web only
  _setFontStyle(fontStyle) {
    if (this._fontStyle !== fontStyle) {
      this._fontStyle = fontStyle
      this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight)
      this._setUpdateTextureDirty()
    }
  }

  _getFontStyle() {
    return this._fontStyle
  }

  _setFontWeight(fontWeight) {
    if (this._fontWeight !== fontWeight) {
      this._fontWeight = fontWeight
      this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight)
      this._setUpdateTextureDirty()
    }
  }

  _getFontWeight() {
    return this._fontWeight
  }
  static _fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/

  /**
   * Returns the height of text with an specified font family and font size, in
   * device independent pixels.
   *
   * @param {string|FontDefinition} fontName
   * @param {number} fontSize
   * @returns {number}
   * @private
   */
  static __getFontHeightByDiv = function (fontName, fontSize) {
    let clientHeight
    const labelDiv = __labelHeightDiv
    if (fontName instanceof FontDefinition) {
      /** @type FontDefinition */
      const fontDef = fontName
      clientHeight = LabelTTF.__fontHeightCache[fontDef._getCanvasFontStr()]
      if (clientHeight > 0) return clientHeight
      labelDiv.innerHTML = 'ajghl~!'
      labelDiv.style.fontFamily = fontDef.fontName
      labelDiv.style.fontSize = `${fontDef.fontSize}px`
      labelDiv.style.fontStyle = fontDef.fontStyle
      labelDiv.style.fontWeight = fontDef.fontWeight

      clientHeight = labelDiv.clientHeight
      LabelTTF.__fontHeightCache[fontDef._getCanvasFontStr()] = clientHeight
      labelDiv.innerHTML = ''
    } else {
      //Default
      clientHeight = LabelTTF.__fontHeightCache[`${fontName}.${fontSize}`]
      if (clientHeight > 0) return clientHeight
      labelDiv.innerHTML = 'ajghl~!'
      labelDiv.style.fontFamily = fontName
      labelDiv.style.fontSize = `${fontSize}px`
      clientHeight = labelDiv.clientHeight
      LabelTTF.__fontHeightCache[`${fontName}.${fontSize}`] = clientHeight
      labelDiv.innerHTML = ''
    }
    return clientHeight
  }

  static __fontHeightCache = {}
}

PrototypeLabelTTF()

// Only support style in this format: "18px Verdana" or "18px 'Helvetica Neue'"

const __labelHeightDiv = document.createElement('div')
__labelHeightDiv.style.fontFamily = 'Arial'
__labelHeightDiv.style.position = 'absolute'
__labelHeightDiv.style.left = '-100px'
__labelHeightDiv.style.top = '-100px'
__labelHeightDiv.style.lineHeight = 'normal'

function appendDiv() {
  document.body.appendChild(__labelHeightDiv)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', appendDiv, { once: true })
} else {
  appendDiv()
}
