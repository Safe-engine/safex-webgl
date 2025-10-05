
/**
 * The touch event
 */
import { Event } from "./Event";

export class EventTouch extends Event {
  private _eventCode: number = 0;
  private _touches: any[] = [];

  static MAX_TOUCHES: number = 5;
  static EventCode = { BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3 };

  constructor(arr?: any[]) {
    super(Event.TOUCH);
    this._touches = arr || [];
  }

  /**
   * Returns event code
   */
  getEventCode() {
    return this._eventCode;
  }

  /**
   * Returns touches of event
   */
  getTouches() {
    return this._touches;
  }

  _setEventCode(eventCode: number) {
    this._eventCode = eventCode;
  }

  _setTouches(touches: any[]) {
    this._touches = touches;
  }
}

// The maximum touch numbers
EventTouch.MAX_TOUCHES = 5;

EventTouch.EventCode = { BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3 };
