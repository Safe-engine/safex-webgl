import { EventListener } from "./EventListener";

export class EventListenerCustom extends EventListener {
  public _onCustomEvent: any = null;
  public _target: any = null;

  constructor(listenerId?: string, callback?: any, target?: any) {
    // initialize base EventListener with type CUSTOM and listener id; we'll wire _onEvent to our internal _callback
    super(EventListener.CUSTOM, listenerId || "", null);
    this._onCustomEvent = callback;
    this._target = target;
    // ensure EventListener._onEvent will call our _callback
    this._onEvent = this._callback.bind(this);
  }

  _callback(event: any) {
    if (this._onCustomEvent !== null) {
      this._onCustomEvent.call(this._target, event);
    }
  }

  checkAvailable() {
    return (EventListener.prototype.checkAvailable.call(this) && this._onCustomEvent !== null);
  }

  clone() {
    return new EventListenerCustom(this._listenerID, this._onCustomEvent, this._target);
  }

  static create(argObj: any) {
    // Support legacy create(eventName, callback) or create({ eventName, callback })
    if (typeof argObj === 'string') {
      const eventName = argObj as string;
      const callback = arguments[1];
      return new EventListenerCustom(eventName, callback);
    }
    if (argObj && typeof argObj === 'object') {
      return new EventListenerCustom(argObj.eventName, argObj.callback);
    }
    return null;
  }
}
