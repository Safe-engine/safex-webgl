import { TextFieldTTF } from '../../text-input/TextFieldTTF'

export class TextFieldRenderer extends TextFieldTTF {
  _maxLengthEnabled = false
  _maxLength = 0
  _passwordEnabled = false
  _passwordStyleText = '*'
  _attachWithIME = false
  _detachWithIME = false
  _insertText = false
  _deleteBackward = false

  // constructor() {
  //   super()
  //   this._maxLengthEnabled = false
  //   this._maxLength = 0
  //   this._passwordEnabled = false
  //   this._passwordStyleText = '*'
  //   this._attachWithIME = false
  //   this._detachWithIME = false
  //   this._insertText = false
  //   this._deleteBackward = false
  // }

  onEnter() {
    super.onEnter()
    this.setDelegate(this)
  }

  onTextFieldAttachWithIME(sender) {
    this.setAttachWithIME(true)
    return false
  }

  onTextFieldInsertText(sender, text, len) {
    if (len === 1 && text === '\n') return false

    this.setInsertText(true)
    return this._maxLengthEnabled && super.getCharCount() >= this._maxLength
  }

  onTextFieldDeleteBackward(sender, delText, nLen) {
    this.setDeleteBackward(true)
    return false
  }

  onTextFieldDetachWithIME(sender) {
    this.setDetachWithIME(true)
    return false
  }

  insertText(text, len) {
    const input_text = text

    if (text !== '\n') {
      if (this._maxLengthEnabled) {
        const text_count = this.getString().length
        if (text_count >= this._maxLength) {
          // password
          if (this._passwordEnabled) this.setPasswordText(this.getString())
          return
        }
      }
    }
    super.insertText(input_text, len)

    // password
    if (this._passwordEnabled && super.getCharCount() > 0) this.setPasswordText(this.getString())
  }

  deleteBackward() {
    super.deleteBackward()

    if (super.getCharCount() > 0 && this._passwordEnabled) this.setPasswordText(this._inputText)
  }

  openIME() {
    super.attachWithIME()
  }

  closeIME() {
    super.detachWithIME()
  }

  setMaxLengthEnabled(enable) {
    this._maxLengthEnabled = enable
  }

  isMaxLengthEnabled() {
    return this._maxLengthEnabled
  }

  setMaxLength(length) {
    this._maxLength = length
  }

  getMaxLength() {
    return this._maxLength
  }

  getCharCount() {
    return super.getCharCount()
  }

  setPasswordEnabled(enable) {
    this._passwordEnabled = enable
  }

  isPasswordEnabled() {
    return this._passwordEnabled
  }

  setPasswordStyleText(styleText) {
    if (styleText.length > 1) return
    const header = styleText.charCodeAt(0)
    if (header < 33 || header > 126) return
    this._passwordStyleText = styleText
  }

  setPasswordText(text) {
    let tempStr = ''
    const text_count = text.length
    let max = text_count

    if (this._maxLengthEnabled && text_count > this._maxLength) max = this._maxLength

    for (let i = 0; i < max; ++i) tempStr += this._passwordStyleText

    super.setString(tempStr)
  }

  setAttachWithIME(attach) {
    this._attachWithIME = attach
  }

  getAttachWithIME() {
    return this._attachWithIME
  }

  setDetachWithIME(detach) {
    this._detachWithIME = detach
  }

  getDetachWithIME() {
    return this._detachWithIME
  }

  setInsertText(insert) {
    this._insertText = insert
  }

  getInsertText() {
    return this._insertText
  }

  setDeleteBackward(deleteBackward) {
    this._deleteBackward = deleteBackward
  }

  getDeleteBackward() {
    return this._deleteBackward
  }

  onDraw(sender) {
    return false
  }
  static create(placeholder: string, fontName: string, fontSize: number) {
    const ret = new TextFieldRenderer()
    if (ret && ret.initWithString('', fontName, fontSize)) {
      if (placeholder) ret.setPlaceHolder(placeholder)
      return ret
    }
    return null
  }
}
