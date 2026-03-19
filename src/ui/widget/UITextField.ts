import { Rect, Size } from '../../core'
import { log } from '../../helper/Debugger'
import { defineGetterSetter } from '../../helper/getset'
import { Widget } from '../base/UIWidget'
import { TextFieldRenderer } from './UITextFieldRenderer'

export class TextField extends Widget {
  static EVENT_ATTACH_WITH_IME = 0
  static EVENT_DETACH_WITH_IME = 1
  static EVENT_INSERT_TEXT = 2
  static EVENT_DELETE_BACKWARD = 3
  static RENDERER_ZORDER = -1

  _textFieldRenderer = null
  _touchWidth = 0
  _touchHeight = 0
  _useTouchArea = false
  _textFieldEventListener = null
  _textFieldEventSelector = null
  _passwordStyleText = '*'
  _textFieldRendererAdaptDirty = true
  _fontName = ''
  _fontSize = 12

  _ccEventCallback = null

  /**
   * allocates and initializes a UITextField.
   * Constructor of TextField.
   * @param {string} placeholder
   * @param {string} fontName
   * @param {Number} fontSize
   * @example
   * // example
   * var uiTextField = new TextField();
   */
  constructor(placeholder?: string, fontName?: string, fontSize?: number) {
    super()
    this._initRenderer()
    this.setTouchEnabled(true)
    if (fontName) this.setFontName(fontName)
    if (fontSize) this.setFontSize(fontSize)
    if (placeholder) this.setPlaceHolder(placeholder)
  }

  /**
   * Calls parent class' onEnter and schedules update function.
   * @override
   */
  onEnter() {
    super.onEnter()
    this.scheduleUpdate()
  }

  _initRenderer() {
    this._textFieldRenderer = TextFieldRenderer.create('input words here', 'Thonburi', 20)
    this.addProtectedChild(this._textFieldRenderer, TextField.RENDERER_ZORDER, -1)
  }

  /**
   * Sets touch size of TextField.
   * @param {Size} size
   */
  setTouchSize(size) {
    this._touchWidth = size.width
    this._touchHeight = size.height
  }

  /**
   * Sets whether use touch area.
   * @param enable
   */
  setTouchAreaEnabled(enable) {
    this._useTouchArea = enable
  }

  /**
   * Checks a point if is in TextField's space
   * @param {Point} pt
   * @returns {boolean}
   */
  hitTest(pt) {
    if (this._useTouchArea) {
      const nsp = this.convertToNodeSpace(pt)
      const bb = Rect(
        -this._touchWidth * this._anchorPoint.x,
        -this._touchHeight * this._anchorPoint.y,
        this._touchWidth,
        this._touchHeight,
      )

      return nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height
    } else return super.hitTest(pt)
  }

  /**
   * Returns touch size of TextField.
   * @returns {Size}
   */
  getTouchSize() {
    return Size(this._touchWidth, this._touchHeight)
  }

  /**
   *  Changes the string value of textField.
   * @deprecated since v3.0, please use setString instead.
   * @param {String} text
   */
  setText(text) {
    log('Please use the setString')
    this.setString(text)
  }

  /**
   *  Changes the string value of textField.
   * @param {String} text
   */
  setString(text) {
    if (text == null) return

    text = String(text)
    if (this.isMaxLengthEnabled()) text = text.substr(0, this.getMaxLength())
    if (this.isPasswordEnabled()) {
      this._textFieldRenderer.setPasswordText(text)
      this._textFieldRenderer.setString('')
      this._textFieldRenderer.insertText(text, text.length)
    } else this._textFieldRenderer.setString(text)
    this._textFieldRendererAdaptDirty = true
    this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())
  }

  /**
   * Sets the placeholder string. <br />
   * display this string if string equal "".
   * @param {String} value
   */
  setPlaceHolder(value) {
    this._textFieldRenderer.setPlaceHolder(value)
    this._textFieldRendererAdaptDirty = true
    this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())
  }

  /**
   * Returns the placeholder string.
   * @returns {String}
   */
  getPlaceHolder() {
    return this._textFieldRenderer.getPlaceHolder()
  }

  /**
   * Returns the color of TextField's place holder.
   * @returns {Color}
   */
  getPlaceHolderColor() {
    return this._textFieldRenderer.getPlaceHolderColor()
  }

  /**
   * Sets the place holder color to TextField.
   * @param color
   */
  setPlaceHolderColor(color) {
    this._textFieldRenderer.setColorSpaceHolder(color)
  }

  /**
   * Sets the text color to TextField
   * @param textColor
   */
  setTextColor(textColor) {
    this._textFieldRenderer.setTextColor(textColor)
  }

  /**
   * Sets font size for TextField.
   * @param {Number} size
   */
  setFontSize(size) {
    this._textFieldRenderer.setFontSize(size)
    this._fontSize = size
    this._textFieldRendererAdaptDirty = true
    this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())
  }

  /**
   * Gets font size of TextField.
   * @return {Number} size
   */
  getFontSize() {
    return this._fontSize
  }

  /**
   * Sets font name for TextField
   * @param {String} name
   */
  setFontName(name) {
    this._textFieldRenderer.setFontName(name)
    this._fontName = name
    this._textFieldRendererAdaptDirty = true
    this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())
  }

  /**
   * Returns font name of TextField.
   * @return {String} font name
   */
  getFontName() {
    return this._fontName
  }

  /**
   * detach with IME
   */
  didNotSelectSelf() {
    this._textFieldRenderer.detachWithIME()
  }

  /**
   * Returns textField string value
   * @deprecated since v3.0, please use getString instead.
   * @returns {String}
   */
  getStringValue() {
    log('Please use the getString')
    return this.getString()
  }

  /**
   * Returns string value of TextField.
   * @returns {String}
   */
  getString() {
    return this._textFieldRenderer.getString()
  }

  /**
   * Returns the length of TextField.
   * @returns {Number}
   */
  getStringLength() {
    return this._textFieldRenderer.getStringLength()
  }

  /**
   * The touch began event callback handler.
   * @param {Point} touchPoint
   */
  onTouchBegan(touchPoint, unusedEvent) {
    const pass = super.onTouchBegan(touchPoint, unusedEvent)
    if (this._hit) {
      setTimeout(() => {
        this._textFieldRenderer.attachWithIME()
      }, 0)
    } else {
      setTimeout(() => {
        this._textFieldRenderer.detachWithIME()
      }, 0)
    }
    return pass
  }

  /**
   * Sets Whether to open string length limit for TextField.
   * @param {Boolean} enable
   */
  setMaxLengthEnabled(enable) {
    this._textFieldRenderer.setMaxLengthEnabled(enable)
  }

  /**
   * Returns Whether to open string length limit.
   * @returns {Boolean}
   */
  isMaxLengthEnabled() {
    return this._textFieldRenderer.isMaxLengthEnabled()
  }

  /**
   * Sets the max length of TextField. Only when you turn on the string length limit, it is valid.
   * @param {number} length
   */
  setMaxLength(length) {
    this._textFieldRenderer.setMaxLength(length)
    this.setString(this.getString())
  }

  /**
   * Returns the max length of TextField.
   * @returns {number} length
   */
  getMaxLength() {
    return this._textFieldRenderer.getMaxLength()
  }

  /**
   * Sets whether to open setting string as password character.
   * @param {Boolean} enable
   */
  setPasswordEnabled(enable) {
    this._textFieldRenderer.setPasswordEnabled(enable)
  }

  /**
   * Returns whether to open setting string as password character.
   * @returns {Boolean}
   */
  isPasswordEnabled() {
    return this._textFieldRenderer.isPasswordEnabled()
  }

  /**
   * Sets the password style character, Only when you turn on setting string as password character, it is valid.
   * @param styleText
   */
  setPasswordStyleText(styleText) {
    this._textFieldRenderer.setPasswordStyleText(styleText)
    this._passwordStyleText = styleText

    this.setString(this.getString())
  }

  /**
   * Returns the password style character.
   * @returns {String}
   */
  getPasswordStyleText() {
    return this._passwordStyleText
  }

  update(dt) {
    if (this.getDetachWithIME()) {
      this._detachWithIMEEvent()
      this.setDetachWithIME(false)
    }
    if (this.getAttachWithIME()) {
      this._attachWithIMEEvent()
      this.setAttachWithIME(false)
    }
    if (this.getInsertText()) {
      this._textFieldRendererAdaptDirty = true
      this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())

      this._insertTextEvent()
      this.setInsertText(false)
    }
    if (this.getDeleteBackward()) {
      this._textFieldRendererAdaptDirty = true
      this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize())

      this._deleteBackwardEvent()
      this.setDeleteBackward(false)
    }
  }

  /**
   * Returns whether attach with IME.
   * @returns {Boolean}
   */
  getAttachWithIME() {
    return this._textFieldRenderer.getAttachWithIME()
  }

  /**
   * Sets attach with IME.
   * @param {Boolean} attach
   */
  setAttachWithIME(attach) {
    this._textFieldRenderer.setAttachWithIME(attach)
  }

  /**
   * Returns whether detach with IME.
   * @returns {Boolean}
   */
  getDetachWithIME() {
    return this._textFieldRenderer.getDetachWithIME()
  }

  /**
   * Sets detach with IME.
   * @param {Boolean} detach
   */
  setDetachWithIME(detach) {
    this._textFieldRenderer.setDetachWithIME(detach)
  }

  /**
   * Returns insertText string of TextField.
   * @returns {String}
   */
  getInsertText() {
    return this._textFieldRenderer.getInsertText()
  }

  /**
   * Sets insertText string to TextField.
   * @param {String} insertText
   */
  setInsertText(insertText) {
    this._textFieldRenderer.setInsertText(insertText)
  }

  /**
   * Returns the delete backward of TextField.
   * @returns {Boolean}
   */
  getDeleteBackward() {
    return this._textFieldRenderer.getDeleteBackward()
  }

  /**
   * Sets the delete backward of TextField.
   * @param {Boolean} deleteBackward
   */
  setDeleteBackward(deleteBackward) {
    this._textFieldRenderer.setDeleteBackward(deleteBackward)
  }

  _attachWithIMEEvent() {
    if (this._textFieldEventSelector) {
      if (this._textFieldEventListener)
        this._textFieldEventSelector.call(this._textFieldEventListener, this, TextField.EVENT_ATTACH_WITH_IME)
      else this._textFieldEventSelector(this, TextField.EVENT_ATTACH_WITH_IME)
    }
    if (this._ccEventCallback) {
      this._ccEventCallback(this, TextField.EVENT_ATTACH_WITH_IME)
    }
  }

  _detachWithIMEEvent() {
    if (this._textFieldEventSelector) {
      if (this._textFieldEventListener)
        this._textFieldEventSelector.call(this._textFieldEventListener, this, TextField.EVENT_DETACH_WITH_IME)
      else this._textFieldEventSelector(this, TextField.EVENT_DETACH_WITH_IME)
    }
    if (this._ccEventCallback) this._ccEventCallback(this, TextField.EVENT_DETACH_WITH_IME)
  }

  _insertTextEvent() {
    if (this._textFieldEventSelector) {
      if (this._textFieldEventListener) this._textFieldEventSelector.call(this._textFieldEventListener, this, TextField.EVENT_INSERT_TEXT)
      else this._textFieldEventSelector(this, TextField.EVENT_INSERT_TEXT) //eventCallback
    }
    if (this._ccEventCallback) this._ccEventCallback(this, TextField.EVENT_INSERT_TEXT)
  }

  _deleteBackwardEvent() {
    if (this._textFieldEventSelector) {
      if (this._textFieldEventListener)
        this._textFieldEventSelector.call(this._textFieldEventListener, this, TextField.EVENT_DELETE_BACKWARD)
      else this._textFieldEventSelector(this, TextField.EVENT_DELETE_BACKWARD) //eventCallback
    }
    if (this._ccEventCallback) this._ccEventCallback(this, TextField.EVENT_DELETE_BACKWARD)
  }

  /**
   * Adds event listener to cuci.TextField.
   * @param {Object} [target=]
   * @param {Function} selector
   * @deprecated since v3.0, please use addEventListener instead.
   */
  addEventListenerTextField(selector, target) {
    this.addEventListener(selector, target)
  }

  /**
   * Adds event listener callback.
   * @param {Object} [target=]
   * @param {Function} selector
   */
  addEventListener(selector, target) {
    this._textFieldEventSelector = selector //when target is undefined, _textFieldEventSelector is ccEventCallback.
    this._textFieldEventListener = target
  }

  _onSizeChanged() {
    super._onSizeChanged()
    this._textFieldRendererAdaptDirty = true
  }

  _adaptRenderers() {
    if (this._textFieldRendererAdaptDirty) {
      this._textFieldRendererScaleChangedWithSize()
      this._textFieldRendererAdaptDirty = false
    }
  }

  _textFieldRendererScaleChangedWithSize() {
    if (!this._ignoreSize) this._textFieldRenderer.setDimensions(this._contentSize)
    this._textFieldRenderer.setPosition(this._contentSize.width / 2, this._contentSize.height / 2)
  }

  //@since v3.3
  getAutoRenderSize() {
    let virtualSize = this._textFieldRenderer.getContentSize()
    if (!this._ignoreSize) {
      this._textFieldRenderer.setDimensions(0, 0)
      virtualSize = this._textFieldRenderer.getContentSize()
      this._textFieldRenderer.setDimensions(this._contentSize.width, this._contentSize.height)
    }
    return virtualSize
  }

  /**
   * Returns the TextField's content size.
   * @returns {Size}
   */
  getVirtualRendererSize() {
    return this._textFieldRenderer.getContentSize()
  }

  /**
   * Returns the renderer of TextField.
   * @returns {Node}
   */
  getVirtualRenderer() {
    return this._textFieldRenderer
  }

  /**
   * Returns the "class name" of TextField.
   * @returns {string}
   */
  getDescription() {
    return 'TextField'
  }

  /**
   * Open keyboard and receive input text.
   * @return {Boolean}
   */
  attachWithIME() {
    this._textFieldRenderer.attachWithIME()
  }

  _createCloneInstance() {
    return new TextField()
  }

  _copySpecialProperties(textField) {
    this.setString(textField.TextFieldRenderer.getString())
    this.setPlaceHolder(textField.getString())
    this.setFontSize(textField.TextFieldRenderer.getFontSize())
    this.setFontName(textField.TextFieldRenderer.getFontName())
    this.setMaxLengthEnabled(textField.isMaxLengthEnabled())
    this.setMaxLength(textField.getMaxLength())
    this.setPasswordEnabled(textField.isPasswordEnabled())
    this.setPasswordStyleText(textField._passwordStyleText)
    this.setAttachWithIME(textField.getAttachWithIME())
    this.setDetachWithIME(textField.getDetachWithIME())
    this.setInsertText(textField.getInsertText())
    this.setDeleteBackward(textField.getDeleteBackward())
    this._ccEventCallback = textField._ccEventCallback
    this._textFieldEventListener = textField._textFieldEventListener
    this._textFieldEventSelector = textField._textFieldEventSelector
  }

  /**
   * Sets the text area size to TextField.
   * @param {Size} size
   */
  setTextAreaSize(size) {
    this.setContentSize(size)
  }

  /**
   * Sets the text horizontal alignment of TextField.
   * @param alignment
   */
  setTextHorizontalAlignment(alignment) {
    this._textFieldRenderer.setHorizontalAlignment(alignment)
  }

  /**
   * Sets the text vertical alignment of TextField.
   * @param alignment
   */
  setTextVerticalAlignment(alignment) {
    this._textFieldRenderer.setVerticalAlignment(alignment)
  }

  _setFont(font) {
    this._textFieldRenderer._setFont(font)
    this._textFieldRendererAdaptDirty = true
  }

  _getFont() {
    return this._textFieldRenderer._getFont()
  }

  _changePosition() {
    this._adaptRenderers()
  }
}

const _p = TextField.prototype

defineGetterSetter(_p, 'string', _p.getString, _p.setString)
defineGetterSetter(_p, 'placeHolder', _p.getPlaceHolder, _p.setPlaceHolder)
defineGetterSetter(_p, 'font', _p._getFont, _p._setFont)
defineGetterSetter(_p, 'fontSize', _p.getFontSize, _p.setFontSize)
defineGetterSetter(_p, 'fontName', _p.getFontName, _p.setFontName)
defineGetterSetter(_p, 'maxLengthEnabled', _p.isMaxLengthEnabled, _p.setMaxLengthEnabled)
defineGetterSetter(_p, 'maxLength', _p.getMaxLength, _p.setMaxLength)
defineGetterSetter(_p, 'passwordEnabled', _p.isPasswordEnabled, _p.setPasswordEnabled)
