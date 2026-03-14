import { game } from '..'
import { Rect, arrayRemoveObject, p } from '../core'
import { KEY } from '../core/platform/Common'
import { $, $new } from '../core/platform/miniFramework'
import { sys } from '../helper/sys'

export const IMEKeyboardNotificationInfo = function (begin, end, duration) {
  this.begin = begin || Rect(0, 0, 0, 0)
  this.end = end || Rect(0, 0, 0, 0)
  this.duration = duration || 0
}

/**
 * Input method editor delegate.
 * @class
 * @extends Class
 */
export class IMEDelegate {
  constructor() {
    imeDispatcher.addDelegate(this)
  }

  /**
   * Remove delegate
   */
  removeDelegate() {
    imeDispatcher.removeDelegate(this)
  }

  /**
   * Remove delegate
   * @return {Boolean}
   */
  attachWithIME() {
    return imeDispatcher.attachDelegateWithIME(this)
  }

  /**
   * Detach with IME
   * @return {Boolean}
   */
  detachWithIME() {
    return imeDispatcher.detachDelegateWithIME(this)
  }

  /**
   * Decide the delegate instance is ready for receive ime message or not.<br />
   * Called by CCIMEDispatcher.
   * @return {Boolean}
   */
  canAttachWithIME() {
    return false
  }

  /**
   * When the delegate detach with IME, this method call by CCIMEDispatcher.
   */
  didAttachWithIME() {}

  /**
   * Decide the delegate instance can stop receive ime message or not.
   * @return {Boolean}
   */
  canDetachWithIME() {
    return false
  }

  /**
   * When the delegate detach with IME, this method call by CCIMEDispatcher.
   */
  didDetachWithIME() {}

  /**
   * Called by CCIMEDispatcher when some text input from IME.
   */
  insertText(text, len) {}

  /**
   * Called by CCIMEDispatcher when user clicked the backward key.
   */
  deleteBackward() {}

  /**
   * Called by CCIMEDispatcher for get text which delegate already has.
   * @return {String}
   */
  getContentText() {
    return ''
  }

  //////////////////////////////////////////////////////////////////////////
  // keyboard show/hide notification
  //////////////////////////////////////////////////////////////////////////
  keyboardWillShow(info) {}
  keyboardDidShow(info) {}
  keyboardWillHide(info) {}
  keyboardDidHide(info) {}
}

/**
 * imeDispatcher is a singleton object which manage input message dispatching.
 * @class
 * @name imeDispatcher
 */
export class IMEDispatcher {
  _domInputControl = null
  impl = null
  _currentInputString = ''
  _lastClickPosition = null

  /**
   * Constructor function.
   */
  constructor() {
    this.impl = new IMEDispatcherImpl()
    this._lastClickPosition = p(0, 0)
  }

  init() {
    if (sys.isMobile) return
    this._domInputControl = $('#imeDispatcherInput')
    if (!this._domInputControl) {
      this._domInputControl = $new('input')
      this._domInputControl.setAttribute('type', 'text')
      this._domInputControl.setAttribute('id', 'imeDispatcherInput')
      this._domInputControl.resize(0.0, 0.0)
      this._domInputControl.translates(0, 0)
      this._domInputControl.style.opacity = '0'
      //this._domInputControl.style.filter = "alpha(opacity = 0)";
      this._domInputControl.style.fontSize = '1px'
      this._domInputControl.setAttribute('tabindex', 2)
      this._domInputControl.style.position = 'absolute'
      this._domInputControl.style.top = 0
      this._domInputControl.style.left = 0
      document.body.appendChild(this._domInputControl)
    }
    //add event listener
    this._domInputControl.addEventListener(
      'input',
      () => {
        this._processDomInputString(this._domInputControl.value)
      },
      false,
    )
    this._domInputControl.addEventListener(
      'keydown',
      (e) => {
        // ignore tab key
        if (e.keyCode === KEY.tab) {
          e.stopPropagation()
          e.preventDefault()
        } else if (e.keyCode === KEY.enter) {
          this.dispatchInsertText('\n', 1)
          e.stopPropagation()
          e.preventDefault()
        }
      },
      false,
    )

    if (/msie/i.test(navigator.userAgent)) {
      this._domInputControl.addEventListener(
        'keyup',
        (e) => {
          if (e.keyCode === KEY.backspace) {
            this._processDomInputString(this._domInputControl.value)
          }
        },
        false,
      )
    }

    window.addEventListener(
      'mousedown',
      (event) => {
        const tx = event.pageX || 0
        const ty = event.pageY || 0

        this._lastClickPosition.x = tx
        this._lastClickPosition.y = ty
      },
      false,
    )
  }

  _processDomInputString(text) {
    let i, startPos
    const len = this._currentInputString.length < text.length ? this._currentInputString.length : text.length
    for (startPos = 0; startPos < len; startPos++) {
      if (text[startPos] !== this._currentInputString[startPos]) break
    }
    const delTimes = this._currentInputString.length - startPos
    const insTimes = text.length - startPos
    for (i = 0; i < delTimes; i++) this.dispatchDeleteBackward()

    for (i = 0; i < insTimes; i++) this.dispatchInsertText(text[startPos + i], 1)

    this._currentInputString = text
  }

  /**
   * Dispatch the input text from ime
   * @param {String} text
   * @param {Number} len
   */
  dispatchInsertText(text, len) {
    if (!this.impl || !text || len <= 0) return

    // there is no delegate attach with ime
    if (!this.impl._delegateWithIme) return

    this.impl._delegateWithIme.insertText(text, len)
  }

  /**
   * Dispatch the delete backward operation
   */
  dispatchDeleteBackward() {
    if (!this.impl) {
      return
    }

    // there is no delegate attach with ime
    if (!this.impl._delegateWithIme) return

    this.impl._delegateWithIme.deleteBackward()
  }

  /**
   * Get the content text, which current CCIMEDelegate which attached with IME has.
   * @return {String}
   */
  getContentText() {
    if (this.impl && this.impl._delegateWithIme) {
      const pszContentText = this.impl._delegateWithIme.getContentText()
      return pszContentText ? pszContentText : ''
    }
    return ''
  }

  /**
   * Dispatch keyboard notification
   * @param {IMEKeyboardNotificationInfo} info
   */
  dispatchKeyboardWillShow(info) {
    if (this.impl) {
      for (let i = 0; i < this.impl._delegateList.length; i++) {
        const delegate = this.impl._delegateList[i]
        if (delegate) {
          delegate.keyboardWillShow(info)
        }
      }
    }
  }

  /**
   * Dispatch keyboard notification
   * @param {IMEKeyboardNotificationInfo} info
   */
  dispatchKeyboardDidShow(info) {
    if (this.impl) {
      for (let i = 0; i < this.impl._delegateList.length; i++) {
        const delegate = this.impl._delegateList[i]
        if (delegate) delegate.keyboardDidShow(info)
      }
    }
  }

  /**
   * Dispatch keyboard notification
   * @param {IMEKeyboardNotificationInfo} info
   */
  dispatchKeyboardWillHide(info) {
    if (this.impl) {
      for (let i = 0; i < this.impl._delegateList.length; i++) {
        const delegate = this.impl._delegateList[i]
        if (delegate) {
          delegate.keyboardWillHide(info)
        }
      }
    }
  }

  /**
   * Dispatch keyboard notification
   * @param {IMEKeyboardNotificationInfo} info
   */
  dispatchKeyboardDidHide(info) {
    if (this.impl) {
      for (let i = 0; i < this.impl._delegateList.length; i++) {
        const delegate = this.impl._delegateList[i]
        if (delegate) {
          delegate.keyboardDidHide(info)
        }
      }
    }
  }

  /**
   * Add delegate to concern ime msg
   * @param {IMEDelegate} delegate
   * @example
   * //example
   * imeDispatcher.addDelegate(this);
   */
  addDelegate(delegate) {
    if (!delegate || !this.impl) return

    if (this.impl._delegateList.indexOf(delegate) > -1) {
      // delegate already in list
      return
    }
    this.impl._delegateList.splice(0, 0, delegate)
  }

  /**
   * Attach the pDeleate with ime.
   * @param {IMEDelegate} delegate
   * @return {Boolean} If the old delegate can detattach with ime and the new delegate can attach with ime, return true, otherwise return false.
   * @example
   * //example
   * var ret = imeDispatcher.attachDelegateWithIME(this);
   */
  attachDelegateWithIME(delegate) {
    if (!this.impl || !delegate) return false

    // if delegate is not in delegate list, return
    if (this.impl._delegateList.indexOf(delegate) === -1) return false

    if (this.impl._delegateWithIme) {
      // if old delegate canDetachWithIME return false
      // or delegate canAttachWithIME return false,
      // do nothing.
      if (!this.impl._delegateWithIme.canDetachWithIME() || !delegate.canAttachWithIME()) return false

      // detach first
      const pOldDelegate = this.impl._delegateWithIme
      this.impl._delegateWithIme = null
      pOldDelegate.didDetachWithIME()

      this._focusDomInput(delegate)
      return true
    }

    // havn't delegate attached with IME yet
    if (!delegate.canAttachWithIME()) return false

    this._focusDomInput(delegate)
    return true
  }

  _focusDomInput(delegate) {
    if (sys.isMobile) {
      this.impl._delegateWithIme = delegate
      delegate.didAttachWithIME()
      //prompt
      this._currentInputString = delegate.string || ''

      const tipMessage = delegate.getTipMessage ? delegate.getTipMessage() : 'please enter your word:'
      // wechat cover the prompt function .So need use the Window.prototype.prompt
      let userInput
      const win = window.Window
      if (win && win.prototype.prompt && win.prototype.prompt != prompt) {
        userInput = win.prototype.prompt.call(window, tipMessage, this._currentInputString)
      } else {
        userInput = prompt(tipMessage, this._currentInputString)
      }
      if (userInput != null) this._processDomInputString(userInput)
      this.dispatchInsertText('\n', 1)
    } else {
      this.impl._delegateWithIme = delegate
      this._currentInputString = delegate.string || ''
      delegate.didAttachWithIME()
      this._domInputControl.focus()
      this._domInputControl.value = this._currentInputString
      this._domInputControlTranslate()
    }
  }

  _domInputControlTranslate() {
    if (/msie/i.test(navigator.userAgent)) {
      this._domInputControl.style.left = `${this._lastClickPosition.x}px`
      this._domInputControl.style.top = `${this._lastClickPosition.y}px`
    } else {
      this._domInputControl.translates(this._lastClickPosition.x, this._lastClickPosition.y)
    }
  }

  /**
   * Detach the pDeleate with ime.
   * @param {IMEDelegate} delegate
   * @return {Boolean} If the old delegate can detattach with ime and the new delegate can attach with ime, return true, otherwise return false.
   * @example
   * //example
   * var ret = imeDispatcher.detachDelegateWithIME(this);
   */
  detachDelegateWithIME(delegate) {
    if (!this.impl || !delegate) return false

    // if delegate is not the current delegate attached with ime, return
    if (this.impl._delegateWithIme !== delegate) return false

    if (!delegate.canDetachWithIME()) return false

    this.impl._delegateWithIme = null
    delegate.didDetachWithIME()
    game.canvas.focus()
    return true
  }

  /**
   * Remove the delegate from the delegates who concern ime msg
   * @param {IMEDelegate} delegate
   * @example
   * //example
   * imeDispatcher.removeDelegate(this);
   */
  removeDelegate(delegate) {
    if (!this.impl || !delegate) return

    // if delegate is not in delegate list, return
    if (this.impl._delegateList.indexOf(delegate) === -1) return

    if (this.impl._delegateWithIme) {
      if (delegate === this.impl._delegateWithIme) {
        this.impl._delegateWithIme = null
      }
    }
    arrayRemoveObject(this.impl._delegateList, delegate)
  }

  /**
   * Process keydown's keycode
   * @param {Number} keyCode
   * @example
   * //example
   * document.addEventListener("keydown", function (e) {
   *      imeDispatcher.processKeycode(e.keyCode);
   * });
   */
  processKeycode(keyCode) {
    if (keyCode < 32) {
      if (keyCode === KEY.backspace) {
        this.dispatchDeleteBackward()
      } else if (keyCode === KEY.enter) {
        this.dispatchInsertText('\n', 1)
      } else if (keyCode === KEY.tab) {
        //tab input
      } else if (keyCode === KEY.escape) {
        //ESC input
      }
    } else if (keyCode < 255) {
      this.dispatchInsertText(String.fromCharCode(keyCode), 1)
    } else {
      //
    }
  }
}

/**
 * Create the IMEDispatcher.Imp Object. <br />
 * This is the inner class...
 * @class
 * @extends Class
 * @name IMEDispatcherImpl
 */
export class IMEDispatcherImpl {
  _delegateWithIme = null
  _delegateList = null

  /**
   * Constructor function.
   */
  constructor() {
    this._delegateList = []
  }

  /**
   * Find delegate
   * @param {IMEDelegate} delegate
   * @return {Number|Null}
   */
  findDelegate(delegate) {
    for (let i = 0; i < this._delegateList.length; i++) {
      if (this._delegateList[i] === delegate) return i
    }
    return null
  }
}

// Initialize imeDispatcher singleton
export const imeDispatcher = new IMEDispatcher()

document.body
  ? imeDispatcher.init()
  : window.addEventListener(
      'load',
      function () {
        imeDispatcher.init()
      },
      false,
    )
