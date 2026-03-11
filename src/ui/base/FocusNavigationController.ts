import { EventListener } from '../../core/event-manager/EventListener'
import { eventManager } from '../../core/event-manager/EventManager'
import { KEY } from '../../core/platform/Common'
import { Widget } from './UIWidget'

export class FocusNavigationController {
  _keyboardListener: any = null
  _firstFocusedWidget: any = null
  _enableFocusNavigation = false
  _keyboardEventPriority = 1

  enableFocusNavigation(flag: boolean) {
    if (this._enableFocusNavigation === flag) return

    this._enableFocusNavigation = flag
    if (flag) this._addKeyboardEventListener()
    else this._removeKeyboardEventListener()
  }

  _setFirstFocsuedWidget(widget: any) {
    this._firstFocusedWidget = widget
  }

  _onKeyPressed(keyCode: any, event: any) {
    if (this._enableFocusNavigation && this._firstFocusedWidget) {
      if (keyCode === KEY.dpadDown) {
        this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(Widget.DOWN, this._firstFocusedWidget)
      }

      if (keyCode === KEY.dpadUp) {
        this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(Widget.UP, this._firstFocusedWidget)
      }

      if (keyCode === KEY.dpadLeft) {
        this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(Widget.LEFT, this._firstFocusedWidget)
      }

      if (keyCode === KEY.dpadRight) {
        this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(Widget.RIGHT, this._firstFocusedWidget)
      }
    }
  }

  _addKeyboardEventListener() {
    if (!this._keyboardListener) {
      this._keyboardListener = EventListener.create({
        event: EventListener.KEYBOARD,
        onKeyReleased: this._onKeyPressed.bind(this),
      })
      eventManager.addListener(this._keyboardListener, this._keyboardEventPriority)
    }
  }

  _removeKeyboardEventListener() {
    if (this._keyboardListener) {
      eventManager.removeListener(this._keyboardListener)
      this._keyboardListener = null
    }
  }
}
