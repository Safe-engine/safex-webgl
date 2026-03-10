import { EventListener } from "../../core/event-manager/EventListener";
import { eventManager } from "../../core/event-manager/EventManager";

export class FocusNavigationController {
    _keyboardListener: any = null;
    _firstFocusedWidget: any = null;
    _enableFocusNavigation: boolean = false;
    _keyboardEventPriority: number = 1;

    enableFocusNavigation(flag: boolean) {
        if (this._enableFocusNavigation === flag)
            return;

        this._enableFocusNavigation = flag;
        if (flag)
            this._addKeyboardEventListener();
        else
            this._removeKeyboardEventListener();
    }

    _setFirstFocsuedWidget(widget: any) {
        this._firstFocusedWidget = widget;
    }

    _onKeyPressed(keyCode: any, event: any) {
        if (this._enableFocusNavigation && this._firstFocusedWidget) {
            // @ts-ignore
            if (keyCode === KEY.dpadDown) {
                // @ts-ignore
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.DOWN, this._firstFocusedWidget);
            }
            // @ts-ignore
            if (keyCode === KEY.dpadUp) {
                // @ts-ignore
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.UP, this._firstFocusedWidget);
            }
            // @ts-ignore
            if (keyCode === KEY.dpadLeft) {
                // @ts-ignore
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.LEFT, this._firstFocusedWidget);
            }
            // @ts-ignore
            if (keyCode === KEY.dpadRight) {
                // @ts-ignore
                this._firstFocusedWidget = this._firstFocusedWidget.findNextFocusedWidget(ccui.Widget.RIGHT, this._firstFocusedWidget);
            }
        }
    }

    _addKeyboardEventListener() {
        if (!this._keyboardListener) {
            this._keyboardListener = EventListener.create({
                event: EventListener.KEYBOARD,
                onKeyReleased: this._onKeyPressed.bind(this)
            });
            eventManager.addListener(this._keyboardListener, this._keyboardEventPriority);
        }
    }

    _removeKeyboardEventListener() {
        if (this._keyboardListener) {
            eventManager.removeEventListener(this._keyboardListener);
            this._keyboardListener = null;
        }
    }
}
