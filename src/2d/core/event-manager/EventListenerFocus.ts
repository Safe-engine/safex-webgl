import { log } from "../../../helper/Debugger";
import { EventListener } from "./EventListener";

export class EventListenerFocus extends EventListener {
  static LISTENER_ID = "__cc_focus_event";
  onFocusChanged

  clone() {
    var listener = new EventListenerFocus();
    listener.onFocusChanged = this.onFocusChanged;
    return listener;
  }
  checkAvailable() {
    if (!this.onFocusChanged) {
      log("Invalid EventListenerFocus!");
      return false;
    }
    return true;
  }
  constructor() {
    super(EventListener.FOCUS, EventListenerFocus.LISTENER_ID);
    this._onEvent = this._callback.bind(this);
  }
  _callback(event) {
    if (this.onFocusChanged) {
      this.onFocusChanged(event._widgetLoseFocus, event._widgetGetFocus);
    }
  }
}
