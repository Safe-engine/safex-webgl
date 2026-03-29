import { LabelTTF, color } from '../core'
import { defineGetterSetter } from '../helper/getset'
import { imeDispatcher } from './IMEDispatcher'

export class TextFieldDelegate {
  /**
   * If the sender doesn't want to attach with IME, return true;
   * @param {TextFieldTTF} sender
   * @return {Boolean}
   */
  onTextFieldAttachWithIME(sender) {
    return false
  }

  /**
   * If the sender doesn't want to detach with IME, return true;
   * @param {TextFieldTTF} sender
   * @return {Boolean}
   */
  onTextFieldDetachWithIME(sender) {
    return false
  }

  /**
   * If the sender doesn't want to insert the text, return true;
   * @param {TextFieldTTF} sender
   * @param {String} text
   * @param {Number} len
   * @return {Boolean}
   */
  onTextFieldInsertText(sender, text, len) {
    return false
  }

  /**
   * If the sender doesn't want to delete the delText, return true;
   * @param {TextFieldTTF} sender
   * @param {String} delText
   * @param {Number} len
   * @return {Boolean}
   */
  onTextFieldDeleteBackward(sender, delText, len) {
    return false
  }

  /**
   * If doesn't want draw sender as default, return true.
   * @param {TextFieldTTF} sender
   * @return {Boolean}
   */
  onDraw(sender) {
    return false
  }
}

/**
 * A simple text input field with TTF font.
 * @class
 * @extends LabelTTF
 *
 * @property {Node}      delegate            - Delegate
 * @property {Number}       charCount           - <@readonly> Characators count
 * @property {String}       placeHolder         - Place holder for the field
 * @property {Color}     colorSpaceHolder
 *
 * @param {String} placeholder
 * @param {Size} dimensions
 * @param {Number} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 *
 * @example
 * //example
 * // When five parameters
 * var textField = new TextFieldTTF("<click here for input>", size(100,50), TEXT_ALIGNMENT_LEFT,"Arial", 32);
 * // When three parameters
 * var textField = new TextFieldTTF("<click here for input>", "Arial", 32);
 */
export class TextFieldTTF extends LabelTTF {
  declare delegate
  declare colorSpaceHolder
  declare _colorText
  declare _lens
  _inputText = ''
  _placeHolder = ''
  _charCount = 0

  /**
   * Constructor function.
   * @param {String} placeholder
   * @param {Size} dimensions
   * @param {Number} alignment
   * @param {String} fontName
   * @param {Number} fontSize
   */
  constructor(placeholder?, dimensions?, alignment?, fontName?, fontSize?) {
    super()

    this.colorSpaceHolder = color(127, 127, 127)
    this._colorText = color(255, 255, 255, 255)

    const hasPlaceholder = placeholder != null
    // Case 1: đủ 5 params
    if (fontSize !== undefined) {
      this.initWithPlaceHolder('', dimensions, alignment, fontName, fontSize)
    }
    // Case 2: (placeholder, fontName, fontSize)
    else if (alignment !== undefined && fontName === undefined) {
      this.initWithString('', dimensions, alignment)
    }
    if (hasPlaceholder) {
      this.setPlaceHolder(placeholder)
    }
  }

  onEnter() {
    LabelTTF.prototype.onEnter.call(this)
    imeDispatcher.addDelegate(this)
  }

  onExit() {
    LabelTTF.prototype.onExit.call(this)
    imeDispatcher.removeDelegate(this)
  }

  /**
   * Gets the delegate.
   * @return {Node}
   */
  getDelegate() {
    return this.delegate
  }

  /**
   * Set the delegate.
   * @param {Node} value
   */
  setDelegate(value) {
    this.delegate = value
  }

  /**
   * Gets the char count.
   * @return {Number}
   */
  getCharCount() {
    return this._charCount
  }

  /**
   * Returns the color of space holder.
   * @return {Color}
   */
  getColorSpaceHolder() {
    return color(this.colorSpaceHolder)
  }

  /**
   * Sets the color of space holder.
   * @param {Color} value
   */
  setColorSpaceHolder(value) {
    this.colorSpaceHolder.r = value.r
    this.colorSpaceHolder.g = value.g
    this.colorSpaceHolder.b = value.b
    this.colorSpaceHolder.a = value.a ?? 255
    if (!this._inputText.length) this.setColor(this.colorSpaceHolder)
  }

  /**
   * Sets the color of TextFieldTTF's text.
   * @param {Color} textColor
   */
  setTextColor(textColor) {
    this._colorText.r = textColor.r
    this._colorText.g = textColor.g
    this._colorText.b = textColor.b
    this._colorText.a = textColor.a ?? 255
    if (this._inputText.length) this.setColor(this._colorText)
  }

  /**
   * Initializes the TextFieldTTF with a font name, alignment, dimension and font size
   * @param {String} placeholder
   * @param {Size} dimensions
   * @param {Number} alignment
   * @param {String} fontName
   * @param {Number} fontSize
   * @return {Boolean}
   * @example
   * //example
   * var  textField = new TextFieldTTF();
   * // When five parameters
   * textField.initWithPlaceHolder("<click here for input>", size(100,50), TEXT_ALIGNMENT_LEFT,"Arial", 32);
   * // When three parameters
   * textField.initWithPlaceHolder("<click here for input>", "Arial", 32);
   */
  initWithPlaceHolder(placeholder, ...args) {
    if (placeholder) this.setPlaceHolder(placeholder)

    if (args.length === 2) {
      // (fontName, fontSize)
      return this.initWithString(this._placeHolder, args[0], args[1])
    }

    if (args.length === 4) {
      // (dimensions, alignment, fontName, fontSize)
      return this.initWithString(this._placeHolder, args[2], args[3], args[0], args[1])
    }

    throw new Error('Argument must be non-nil')
  }

  /**
   * Input text property
   * @param {String} text
   */
  setString(text = '') {
    this._inputText = text
    // if there is no input text, display placeholder instead
    if (!this._inputText.length) {
      super.setString(this._placeHolder)
      this.setColor(this.colorSpaceHolder)
    } else {
      super.setString(this._inputText)
      this.setColor(this._colorText)
    }
    this._charCount = this._inputText.length
  }

  /**
   * Gets the string
   * @return {String}
   */
  getString() {
    return this._inputText
  }

  /**
   * Set the place holder. <br />
   * display this string if string equal "".
   * @param {String} text
   */
  setPlaceHolder(text = '') {
    this._placeHolder = text
    if (!this._inputText.length) {
      super.setString(this._placeHolder)
      this.setColor(this.colorSpaceHolder)
    }
  }

  /**
   * Gets the place holder. <br />
   * default display string.
   * @return {String}
   */
  getPlaceHolder() {
    return this._placeHolder
  }

  /**
   * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function.
   * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context
   */
  draw() {
    //console.log("size",this._contentSize);
    // const context = _renderContext
    if (this.delegate && this.delegate.onDraw(this)) return
    // LabelTTF.prototype.draw.call(this, context)
  }

  //////////////////////////////////////////////////////////////////////////
  // CCIMEDelegate interface
  //////////////////////////////////////////////////////////////////////////
  /**
   * Open keyboard and receive input text.
   * @return {Boolean}
   */
  attachWithIME() {
    return imeDispatcher.attachDelegateWithIME(this)
  }

  /**
   * End text input  and close keyboard.
   * @return {Boolean}
   */
  detachWithIME() {
    return imeDispatcher.detachDelegateWithIME(this)
  }

  /**
   * Return whether to allow attach with IME.
   * @return {Boolean}
   */
  canAttachWithIME() {
    return this.delegate ? !this.delegate.onTextFieldAttachWithIME(this) : true
  }

  /**
   * When the delegate detach with IME, this method call by CCIMEDispatcher.
   */
  didAttachWithIME() {}

  /**
   * Return whether to allow detach with IME.
   * @return {Boolean}
   */
  canDetachWithIME() {
    return this.delegate ? !this.delegate.onTextFieldDetachWithIME(this) : true
  }

  /**
   * When the delegate detach with IME, this method call by CCIMEDispatcher.
   */
  didDetachWithIME() {}

  /**
   * Delete backward
   */
  deleteBackward() {
    const strLen = this._inputText.length
    if (strLen === 0) return

    // get the delete byte number
    const deleteLen = 1 // default, erase 1 byte

    if (this.delegate && this.delegate.onTextFieldDeleteBackward(this, this._inputText[strLen - deleteLen], deleteLen)) {
      // delegate don't want delete backward
      return
    }

    // if delete all text, show space holder string
    if (strLen <= deleteLen) {
      this._inputText = ''
      this._charCount = 0
      LabelTTF.prototype.setString.call(this, this._placeHolder)
      this.setColor(this.colorSpaceHolder)
      return
    }

    // set new input text
    this.setString(this._inputText.substring(0, strLen - deleteLen))
  }

  /**
   *  Remove delegate
   */
  removeDelegate() {
    imeDispatcher.removeDelegate(this)
  }

  _tipMessage = 'please enter your word:'
  /**
   * Sets the input tip message to show on mobile browser.  (mobile Web only)
   * @param {string} tipMessage
   */
  setTipMessage(tipMessage) {
    if (tipMessage == null) return
    this._tipMessage = tipMessage
  }

  /**
   * Gets the input tip message to show on mobile browser.   (mobile Web only)
   * @returns {string}
   */
  getTipMessage() {
    return this._tipMessage
  }

  /**
   * Append the text. <br />
   * Input the character.
   * @param {String} text
   * @param {Number} len
   */
  insertText(text, len) {
    let sInsert = text

    // insert \n means input end
    const pos = sInsert.indexOf('\n')
    if (pos > -1) {
      sInsert = sInsert.substring(0, pos)
    }

    if (sInsert.length > 0) {
      if (this.delegate && this.delegate.onTextFieldInsertText(this, sInsert, sInsert.length)) {
        // delegate doesn't want insert text
        return
      }

      const sText = this._inputText + sInsert
      this._charCount = sText.length
      this.setString(sText)
    }

    if (pos === -1) return

    // '\n' has inserted,  let delegate process first
    if (this.delegate && this.delegate.onTextFieldInsertText(this, '\n', 1)) return

    // if delegate hasn't process, detach with ime as default
    this.detachWithIME()
  }

  /**
   * Gets the input text.
   * @return {String}
   */
  getContentText() {
    return this._inputText
  }

  //////////////////////////////////////////////////////////////////////////
  // keyboard show/hide notification
  //////////////////////////////////////////////////////////////////////////
  keyboardWillShow(info) {}
  keyboardDidShow(info) {}
  keyboardWillHide(info) {}
  keyboardDidHide(info) {}
}

const _p = TextFieldTTF.prototype
defineGetterSetter(_p, 'charCount', _p.getCharCount)
defineGetterSetter(_p, 'placeHolder', _p.getPlaceHolder, _p.setPlaceHolder)
