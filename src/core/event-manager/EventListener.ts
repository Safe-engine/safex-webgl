export class EventListener {
  // Event callback function
  _onEvent: any = null
  // Event listener type
  _type = 0
  // Event listener ID
  _listenerID = ''
  // Whether the listener has been added to dispatcher.
  _registered = false

  // The higher the number, the higher the priority, 0 is for scene graph base priority.
  _fixedPriority = 0
  // scene graph based priority
  _node: any = null
  // Whether the listener is paused
  _paused = true
  // Whether the listener is enabled
  _isEnabled = true

  /**
   * Initializes event with type and callback function
   */
  constructor(type?: number, listenerID?: string, callback?: any) {
    this._onEvent = callback
    this._type = type || 0
    this._listenerID = listenerID || ''
  }

  /** Sets paused state for the listener (used for scene-graph priority listeners). */
  _setPaused(paused: boolean) {
    this._paused = paused
  }

  /** Checks whether the listener is paused */
  _isPaused() {
    return this._paused
  }

  /** Marks the listener was registered by EventDispatcher */
  _setRegistered(registered: boolean) {
    this._registered = registered
  }

  /** Checks whether the listener was registered by EventDispatcher */
  _isRegistered() {
    return this._registered
  }

  /** Gets the internal type of this listener */
  _getType() {
    return this._type
  }

  /** Gets the listener ID of this listener */
  _getListenerID() {
    return this._listenerID
  }

  /** Sets the fixed priority for this listener */
  _setFixedPriority(fixedPriority: number) {
    this._fixedPriority = fixedPriority
  }

  /** Gets the fixed priority of this listener */
  _getFixedPriority() {
    return this._fixedPriority
  }

  /** Sets scene graph priority for this listener */
  _setSceneGraphPriority(node: any) {
    this._node = node
  }

  /** Gets scene graph priority of this listener */
  _getSceneGraphPriority() {
    return this._node
  }

  /** Checks whether the listener is available. */
  checkAvailable() {
    return this._onEvent !== null
  }

  /** Clones the listener, subclasses override this method. */
  clone(): EventListener | null {
    return null
  }

  /** Enables or disables the listener */
  setEnabled(enabled: boolean) {
    this._isEnabled = enabled
  }

  /** Checks whether the listener is enabled */
  isEnabled() {
    return this._isEnabled
  }

  // JSB compatibility stubs (retain/release)
  retain() {}

  release() {}

  // event listener type constants (also available on the class itself)
  static UNKNOWN = 0
  static TOUCH_ONE_BY_ONE = 1
  static TOUCH_ALL_AT_ONCE = 2
  static KEYBOARD = 3
  static MOUSE = 4
  static ACCELERATION = 6
  static FOCUS = 7
  static CUSTOM = 8
}
