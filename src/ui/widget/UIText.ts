import { Size } from '../../core/cocoa/Geometry'
import { LabelTTF } from '../../core/labelttf/LabelTTF'
import { log } from '../../helper/Debugger'
import { ProtectedNode } from '../base/ProtectedNode'
import { Widget } from '../base/UIWidget'

export class Text extends Widget {
  _touchScaleChangeEnabled = false
  _normalScaleValueX = 1
  _normalScaleValueY = 1
  _fontName = 'Arial'
  _fontSize = 16
  _onSelectedScaleOffset = 0.5
  _labelRenderer: any = null
  _textAreaSize: any = null
  _textVerticalAlignment = 0
  _textHorizontalAlignment = 0
  _className = 'Text'
  _type: any = null
  _labelRendererAdaptDirty = true

  constructor(textContent?: string, fontName?: string, fontSize?: number) {
    super()
    this._type = Text.Type.SYSTEM
    this._textAreaSize = Size(0, 0)

    if (fontSize !== undefined) {
      this.setFontName(fontName!)
      this.setFontSize(fontSize)
      this.setString(textContent!)
    } else {
      this.setFontName(this._fontName)
    }
  }

  // legacy helper for codebases that relied on Widget.extend-style API
  static create(textContent?: string, fontName?: string, fontSize?: number) {
    return new Text(textContent, fontName, fontSize)
  }

  _initRenderer() {
    this._labelRenderer = new LabelTTF()
    this.addProtectedChild(this._labelRenderer, Text.RENDERER_ZORDER, -1)
  }

  setText(text: string) {
    log('Please use the setString')
    this.setString(text)
  }

  setString(text: string) {
    if (text === this._labelRenderer.getString()) return
    this._setString(text)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setString(text: string) {
    this._labelRenderer.setString(text)
    this._labelRendererAdaptDirty = true
  }

  getStringValue() {
    log('Please use the getString')
    return this._labelRenderer.getString()
  }

  getString() {
    return this._labelRenderer.getString()
  }

  getStringLength() {
    return this._labelRenderer.getStringLength()
  }

  setFontSize(size: number) {
    this._setFontSize(size)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setFontSize(size: number) {
    this._labelRenderer.setFontSize(size)
    this._fontSize = size
    this._labelRendererAdaptDirty = true
  }

  getFontSize() {
    return this._fontSize
  }

  setFontName(name: string) {
    this._setFontName(name)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setFontName(name: string) {
    this._fontName = name
    this._labelRenderer.setFontName(name)
    this._labelRendererAdaptDirty = true
  }

  _updateUITextContentSize() {
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  getFontName() {
    return this._fontName
  }

  _setFont(font: string) {
    const res = LabelTTF._fontStyleRE.exec(font)
    if (res) {
      this._fontSize = parseInt(res[1])
      this._fontName = res[2]
      this._labelRenderer._setFont(font)
      this._labelScaleChangedWithSize()
    }
  }

  _getFont() {
    return this._labelRenderer._getFont()
  }

  getType() {
    return this._type
  }

  setTextAreaSize(size: any) {
    this._setTextAreaSize(size)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setTextAreaSize(size: any) {
    this._labelRenderer.setDimensions(size)
    if (!this._ignoreSize) {
      this._customSize = size
    }
    this._labelRendererAdaptDirty = true
  }

  getTextAreaSize() {
    return this._labelRenderer.getDimensions()
  }

  setTextHorizontalAlignment(alignment: number) {
    this._setTextHorizontalAlignment(alignment)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setTextHorizontalAlignment(alignment: number) {
    this._labelRenderer.setHorizontalAlignment(alignment)
    this._labelRendererAdaptDirty = true
  }

  getTextHorizontalAlignment() {
    return this._labelRenderer.getHorizontalAlignment()
  }

  setTextVerticalAlignment(alignment: number) {
    this._setTextVerticalAlignment(alignment)
    this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize())
  }

  _setTextVerticalAlignment(alignment: number) {
    this._labelRenderer.setVerticalAlignment(alignment)
    this._labelRendererAdaptDirty = true
  }

  getTextVerticalAlignment() {
    return this._labelRenderer.getVerticalAlignment()
  }

  setTouchScaleChangeEnabled(enable: boolean) {
    this._touchScaleChangeEnabled = enable
  }

  isTouchScaleChangeEnabled() {
    return this._touchScaleChangeEnabled
  }

  _onPressStateChangedToNormal() {
    if (!this._touchScaleChangeEnabled) return
    this._labelRenderer.setScaleX(this._normalScaleValueX)
    this._labelRenderer.setScaleY(this._normalScaleValueY)
  }

  _onPressStateChangedToPressed() {
    if (!this._touchScaleChangeEnabled) return
    this._labelRenderer.setScaleX(this._normalScaleValueX + this._onSelectedScaleOffset)
    this._labelRenderer.setScaleY(this._normalScaleValueY + this._onSelectedScaleOffset)
  }

  _onPressStateChangedToDisabled() {}

  _onSizeChanged() {
    super._onSizeChanged()
    this._labelRendererAdaptDirty = true
  }

  _adaptRenderers() {
    if (this._labelRendererAdaptDirty) {
      this._labelScaleChangedWithSize()
      this._labelRendererAdaptDirty = false
    }
  }

  getVirtualRendererSize() {
    return this._labelRenderer.getContentSize()
  }

  getVirtualRenderer() {
    return this._labelRenderer
  }

  getAutoRenderSize() {
    let virtualSize = this._labelRenderer.getContentSize()
    if (!this._ignoreSize) {
      this._labelRenderer.setDimensions(0, 0)
      virtualSize = this._labelRenderer.getContentSize()
      this._labelRenderer.setDimensions(this._contentSize.width, this._contentSize.height)
    }
    return virtualSize
  }

  _labelScaleChangedWithSize() {
    const locContentSize = this._contentSize
    if (this._ignoreSize) {
      this._labelRenderer.setScale(1.0)
      this._normalScaleValueX = this._normalScaleValueY = 1
    } else {
      this._labelRenderer.setDimensions(Size(locContentSize.width, locContentSize.height))
      const textureSize = this._labelRenderer.getContentSize()
      if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
        this._labelRenderer.setScale(1.0)
        return
      }
      const scaleX = locContentSize.width / textureSize.width
      const scaleY = locContentSize.height / textureSize.height
      this._labelRenderer.setScaleX(scaleX)
      this._labelRenderer.setScaleY(scaleY)
      this._normalScaleValueX = scaleX
      this._normalScaleValueY = scaleY
    }
    this._labelRenderer.setPosition(locContentSize.width / 2.0, locContentSize.height / 2.0)
  }

  getDescription() {
    return 'Label'
  }

  enableShadow(shadowColor: any, offset: any, blurRadius: number) {
    this._labelRenderer.enableShadow(shadowColor, offset, blurRadius)
  }

  enableOutline(outlineColor: any, outlineSize: any) {
    this._labelRenderer.enableStroke(outlineColor, outlineSize)
  }

  enableGlow(glowColor: any) {
    if (this._type === Text.Type.TTF) this._labelRenderer.enableGlow(glowColor)
  }

  disableEffect() {
    if (this._labelRenderer.disableEffect) this._labelRenderer.disableEffect()
  }

  _createCloneInstance() {
    return new Text()
  }

  _copySpecialProperties(uiLabel: any) {
    if (uiLabel instanceof Text) {
      this.setFontName(uiLabel._fontName)
      this.setFontSize(uiLabel.getFontSize())
      this.setString(uiLabel.getString())
      this.setTouchScaleChangeEnabled(uiLabel.isTouchScaleChangeEnabled())
      this.setTextAreaSize(uiLabel._textAreaSize)
      this.setTextHorizontalAlignment(uiLabel._labelRenderer.getHorizontalAlignment())
      this.setTextVerticalAlignment(uiLabel._labelRenderer.getVerticalAlignment())
      this.setContentSize(uiLabel.getContentSize())
      this.setTextColor(uiLabel.getTextColor())
    }
  }

  _setBoundingWidth(value: number) {
    this._textAreaSize.width = value
    this._labelRenderer._setBoundingWidth(value)
    this._labelScaleChangedWithSize()
  }
  _setBoundingHeight(value: number) {
    this._textAreaSize.height = value
    this._labelRenderer._setBoundingHeight(value)
    this._labelScaleChangedWithSize()
  }
  _getBoundingWidth() {
    return this._textAreaSize.width
  }
  _getBoundingHeight() {
    return this._textAreaSize.height
  }

  _changePosition() {
    this._adaptRenderers()
  }

  setColor(color: any) {
    ProtectedNode.prototype.setColor.call(this, color)
    this._labelRenderer.setColor(color)
  }

  setTextColor(color: any) {
    this._labelRenderer.setFontFillColor(color)
  }

  getTextColor() {
    return this._labelRenderer._getFillStyle()
  }

  // property accessors moved inside class using TypeScript getters/setters
  get boundingWidth() {
    return this._getBoundingWidth()
  }
  set boundingWidth(value: number) {
    this._setBoundingWidth(value)
  }

  get boundingHeight() {
    return this._getBoundingHeight()
  }
  set boundingHeight(value: number) {
    this._setBoundingHeight(value)
  }

  get string() {
    return this.getString()
  }
  set string(v: string) {
    this.setString(v)
  }

  get stringLength() {
    return this.getStringLength()
  }

  get font() {
    return this._getFont()
  }
  set font(v: string) {
    this._setFont(v)
  }

  get fontSize() {
    return this.getFontSize()
  }
  set fontSize(v: number) {
    this.setFontSize(v)
  }

  get fontName() {
    return this.getFontName()
  }
  set fontName(v: string) {
    this.setFontName(v)
  }

  get textAlign() {
    return this.getTextHorizontalAlignment()
  }
  set textAlign(v: number) {
    this.setTextHorizontalAlignment(v)
  }

  get verticalAlign() {
    return this.getTextVerticalAlignment()
  }
  set verticalAlign(v: number) {
    this.setTextVerticalAlignment(v)
  }

  // static helpers
  static RENDERER_ZORDER = -1

  /**
   * @ignore
   */
  static Type = {
    SYSTEM: 0,
    TTF: 1,
  }
}
