import { EventListener } from "./EventListener";
import { EventMouse } from "./EventMouse";

export class EventListenerMouse extends EventListener {
  onMouseDown
  onMouseUp
  onMouseMove
  onMouseScroll

  constructor() {
    super(EventListener.MOUSE, EventListenerMouse.LISTENER_ID);
    this._onEvent = this._callback.bind(this);
  }

  _callback(event) {
    var eventType = EventMouse;
    switch (event._eventType) {
      case eventType.DOWN:
        if (this.onMouseDown)
          this.onMouseDown(event);
        break;
      case eventType.UP:
        if (this.onMouseUp)
          this.onMouseUp(event);
        break;
      case eventType.MOVE:
        if (this.onMouseMove)
          this.onMouseMove(event);
        break;
      case eventType.SCROLL:
        if (this.onMouseScroll)
          this.onMouseScroll(event);
        break;
      default:
        break;
    }
  }

  clone() {
    var eventListener = new EventListenerMouse();
    eventListener.onMouseDown = this.onMouseDown;
    eventListener.onMouseUp = this.onMouseUp;
    eventListener.onMouseMove = this.onMouseMove;
    eventListener.onMouseScroll = this.onMouseScroll;
    return eventListener;
  }

  checkAvailable() {
    return true;
  }
  // Keep compatibility for mouse helper if exists
  static LISTENER_ID = "__cc_mouse";
  static create = function () {
    return new EventListenerMouse();
  };
}