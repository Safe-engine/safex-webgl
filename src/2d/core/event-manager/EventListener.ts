/**
 * The base class of event listener.
 * Subclasses should call `this.ctor(...)` to initialize the base part when they are created using legacy patterns.
 */

import { _LogInfos, assert } from "../../../helper/Debugger";
import { EventListenerAcceleration, EventListenerKeyboard } from "./EventExtension";
import { EventListenerCustom } from "./EventListenerCustom";

export class EventListener {
  // Event callback function
  _onEvent: any = null;
  // Event listener type
  _type: number = 0;
  // Event listener ID
  _listenerID: string = "";
  // Whether the listener has been added to dispatcher.
  _registered: boolean = false;

  // The higher the number, the higher the priority, 0 is for scene graph base priority.
  _fixedPriority: number = 0;
  // scene graph based priority
  _node: any = null;
  // Whether the listener is paused
  _paused: boolean = true;
  // Whether the listener is enabled
  _isEnabled: boolean = true;

  /**
   * Initializes event with type and callback function
   */
  constructor(type?: number, listenerID?: string, callback?: any) {
    this._onEvent = callback;
    this._type = type || 0;
    this._listenerID = listenerID || "";
  }

  /** Sets paused state for the listener (used for scene-graph priority listeners). */
  _setPaused(paused: boolean) {
    this._paused = paused;
  }

  /** Checks whether the listener is paused */
  _isPaused() {
    return this._paused;
  }

  /** Marks the listener was registered by EventDispatcher */
  _setRegistered(registered: boolean) {
    this._registered = registered;
  }

  /** Checks whether the listener was registered by EventDispatcher */
  _isRegistered() {
    return this._registered;
  }

  /** Gets the internal type of this listener */
  _getType() {
    return this._type;
  }

  /** Gets the listener ID of this listener */
  _getListenerID() {
    return this._listenerID;
  }

  /** Sets the fixed priority for this listener */
  _setFixedPriority(fixedPriority: number) {
    this._fixedPriority = fixedPriority;
  }

  /** Gets the fixed priority of this listener */
  _getFixedPriority() {
    return this._fixedPriority;
  }

  /** Sets scene graph priority for this listener */
  _setSceneGraphPriority(node: any) {
    this._node = node;
  }

  /** Gets scene graph priority of this listener */
  _getSceneGraphPriority() {
    return this._node;
  }

  /** Checks whether the listener is available. */
  checkAvailable() {
    return this._onEvent !== null;
  }

  /** Clones the listener, subclasses override this method. */
  clone(): EventListener | null {
    return null;
  }

  /** Enables or disables the listener */
  setEnabled(enabled: boolean) {
    this._isEnabled = enabled;
  }

  /** Checks whether the listener is enabled */
  isEnabled() {
    return this._isEnabled;
  }

  // JSB compatibility stubs (retain/release)
  retain() {
  }

  release() {
  }

  // event listener type constants (also available on the class itself)
  static UNKNOWN = 0;
  static TOUCH_ONE_BY_ONE = 1;
  static TOUCH_ALL_AT_ONCE = 2;
  static KEYBOARD = 3;
  static MOUSE = 4;
  static ACCELERATION = 6;
  static FOCUS = 7;
  static CUSTOM = 8;

  /**
   * Create a EventListener object by json object
   * @param argObj a json object
   */
  static create = function (argObj: any) {
    assert(argObj && argObj.event, _LogInfos.EventListener_create);

    const listenerType = argObj.event;
    delete argObj.event;

    let listener: any = null;
    if (listenerType === (EventListener as any).TOUCH_ONE_BY_ONE)
      listener = new EventListenerTouchOneByOne();
    else if (listenerType === (EventListener as any).TOUCH_ALL_AT_ONCE)
      listener = new EventListenerTouchAllAtOnce();
    else if (listenerType === (EventListener as any).MOUSE)
      listener = new EventListenerMouse();
    else if (listenerType === (EventListener as any).CUSTOM) {
      listener = new EventListenerCustom(argObj.eventName, argObj.callback);
      delete argObj.eventName;
      delete argObj.callback;
    } else if (listenerType === (EventListener as any).KEYBOARD)
      listener = new EventListenerKeyboard();
    else if (listenerType === (EventListener as any).ACCELERATION) {
      listener = new EventListenerAcceleration(argObj.callback);
      delete argObj.callback;
    } else if (listenerType === (EventListener as any).FOCUS)
      listener = new EventListenerFocus();

    for (const key in argObj) {
      listener[key] = argObj[key];
    }

    return listener;
  };

}

// attach to global `cc` for backward compatibility


// Keep compatibility for mouse helper if exists
if (EventListenerMouse) {
  EventListenerMouse.LISTENER_ID = "__cc_mouse";
  EventListenerMouse.create = function () {
    return new EventListenerMouse();
  };
}
