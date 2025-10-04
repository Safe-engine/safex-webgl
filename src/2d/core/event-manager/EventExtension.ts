import { _LogInfos, assert, log } from "../../../helper/Debugger";
import { Event } from "./Event";
import { EventListener } from "./EventListener";

/**
 * The acceleration event
 */
export class EventAcceleration extends Event {
  protected _acc: any;

  constructor(acc: any) {
    super(Event.ACCELERATION);
    this._acc = acc;
  }
}

/**
 * The keyboard event
 */
export class EventKeyboard extends Event {
  protected _keyCode: number;
  protected _isPressed: boolean;

  constructor(keyCode: number, isPressed: boolean) {
    super(Event.KEYBOARD);
    this._keyCode = keyCode;
    this._isPressed = isPressed;
  }
}

// Acceleration listener
export class EventListenerAcceleration extends EventListener {
  protected _onAccelerationEvent: ((acc: any, event: EventAcceleration) => void) | null;

  static LISTENER_ID = "__cc_acceleration";

  constructor(callback: ((acc: any, event: EventAcceleration) => void) | null) {
    // create a listener wrapper that will call the provided callback
    const listener = (event: EventAcceleration) => {
      if (callback) callback((event as any)._acc, event);
    };
    super(Event.ACCELERATION, EventListenerAcceleration.LISTENER_ID, listener);
    this._onAccelerationEvent = callback;
  }

  checkAvailable(): boolean {
    assert(this._onAccelerationEvent, _LogInfos._EventListenerAcceleration_checkAvailable);
    return true;
  }

  clone(): EventListenerAcceleration {
    return new EventListenerAcceleration(this._onAccelerationEvent);
  }

  static create(callback: ((acc: any, event: EventAcceleration) => void) | null) {
    return new EventListenerAcceleration(callback);
  }
}

// Keyboard listener
export class EventListenerKeyboard extends EventListener {
  onKeyPressed: ((keyCode: number, event: EventKeyboard) => void) | null = null;
  onKeyReleased: ((keyCode: number, event: EventKeyboard) => void) | null = null;

  static LISTENER_ID = "__cc_keyboard";

  constructor() {
    super();
    const listener = (event: EventKeyboard) => {
      if ((event as any)._isPressed) {
        if ((this as any).onKeyPressed)
          (this as any).onKeyPressed((event as any)._keyCode, event);
      } else {
        if ((this as any).onKeyReleased)
          (this as any).onKeyReleased((event as any)._keyCode, event);
      }
    };
    super(Event.KEYBOARD, EventListenerKeyboard.LISTENER_ID, listener);
  }

  clone(): EventListenerKeyboard {
    const eventListener = new EventListenerKeyboard();
    eventListener.onKeyPressed = this.onKeyPressed;
    eventListener.onKeyReleased = this.onKeyReleased;
    return eventListener;
  }

  checkAvailable(): boolean {
    if (this.onKeyPressed === null && this.onKeyReleased === null) {
      log(_LogInfos.EventListenerKeyboard_checkAvailable);
      return false;
    }
    return true;
  }

  static create() {
    return new EventListenerKeyboard();
  }
}