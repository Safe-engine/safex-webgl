import { EventListener } from "../../core/event-manager/EventListener";
import { eventManager } from "../../core/event-manager/EventManager";

export const FocusNavigationController = Class.extend({
    _keyboardListener: null,
    _firstFocusedWidget: null,
    _enableFocusNavigation: false,
    _keyboardEventPriority: 1,

    enableFocusNavigation: function (flag) {
        if (this._enableFocusNavigation === flag)
            return;

        this._enableFocusNavigation = flag;
        if (flag)
            this._addKeyboardEventListener();
        else
            this._removeKeyboardEventListener();
    },

    _setFirstFocsuedWidget: function (widget) {
        this._firstFocusedWidget = widget;
    },

    _onKeyPressed: function (keyCode, event) {
        if (this._enableFocusNavigation && this._firstFocusedWidget) {
            if (keyCode === KEY.dpadDown) {
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.DOWN, this._firstFocusedWidget);
            }
            if (keyCode === KEY.dpadUp) {
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.UP, this._firstFocusedWidget);
            }
            if (keyCode === KEY.dpadLeft) {
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.LEFT, this._firstFocusedWidget);
            }
            if (keyCode === KEY.dpadRight) {
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.RIGHT, this._firstFocusedWidget);
            }
        }
    },

    _addKeyboardEventListener: function () {
        if (!this._keyboardListener) {
            this._keyboardListener = EventListener.create({
                event: EventListener.KEYBOARD,
                onKeyReleased: this._onKeyPressed.bind(this)
            });
            eventManager.addListener(this._keyboardListener, this._keyboardEventPriority);
        }
    },

    _removeKeyboardEventListener: function () {
        if (this._keyboardListener) {
            eventManager.removeEventListener(this._keyboardListener);
            this._keyboardListener = null;
        }
    }
});
