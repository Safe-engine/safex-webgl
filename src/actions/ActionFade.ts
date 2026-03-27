import { ActionInterval } from './ActionInterval'

/** Fades an object that implements the RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @example
 * var action = new FadeTo(1.0, 0);
 */
export class FadeTo extends ActionInterval {
  _toOpacity = 0
  _fromOpacity = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Number} opacity 0-255, 0 is transparent
   */
  constructor(duration?: number, opacity?: number) {
    super()
    opacity !== undefined && this.initWithDuration(duration, opacity)
  }

  /**
   * Initializes the action.
   * @param {Number} duration  duration in seconds
   * @param {Number} opacity
   * @return {Boolean}
   */
  initWithDuration(duration: number, opacity: number): boolean {
    if (super.initWithDuration(duration)) {
      this._toOpacity = opacity
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {FadeTo}
   */
  clone(): FadeTo {
    const action = new FadeTo()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._toOpacity)
    return action
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} time time in seconds
   */
  update(time: number): void {
    time = this._computeEaseTime(time)
    const fromOpacity = this._fromOpacity !== undefined ? this._fromOpacity : 255
    this.target.setOpacity(fromOpacity + (this._toOpacity - fromOpacity) * time)
  }

  /**
   * Start this action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._fromOpacity = target.opacity
  }
}

/**
 * Fades an object that implements the RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @function
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @return {FadeTo}
 * @example
 * // example
 * var action = fadeTo(1.0, 0);
 */
export const fadeTo = function (duration: number, opacity: number) {
  return new FadeTo(duration, opacity)
}

/** Fades In an object that implements the RGBAProtocol protocol. It modifies the opacity from 0 to 255.<br/>
 * The "reverse" of this action is FadeOut
 * @class
 * @extends FadeTo
 * @param {Number} duration duration in seconds
 */
export class FadeIn extends FadeTo {
  _reverseAction: any = null

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration duration in seconds
   */
  constructor(duration?: number) {
    super()
    if (duration == null) duration = 0
    this.initWithDuration(duration, 255)
  }

  /**
   * Returns a reversed action.
   * @return {FadeOut}
   */
  reverse(): FadeOut {
    const action = new FadeOut()
    action.initWithDuration(this._duration, 0)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * returns a new clone of the action
   * @returns {FadeIn}
   */
  clone(): FadeIn {
    const action = new FadeIn()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._toOpacity)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    if (this._reverseAction) this._toOpacity = this._reverseAction._fromOpacity
    super.startWithTarget(target)
  }
}

/**
 * Fades In an object that implements the RGBAProtocol protocol. It modifies the opacity from 0 to 255.
 * @function
 * @param {Number} duration duration in seconds
 * @return {FadeIn}
 * @example
 * //example
 * var action = fadeIn(1.0);
 */
export const fadeIn = function (duration: number) {
  return new FadeIn(duration)
}

/** Fades Out an object that implements the RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * The "reverse" of this action is FadeIn
 * @class
 * @extends FadeTo
 * @param {Number} duration duration in seconds
 */
export class FadeOut extends FadeTo {
  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration duration in seconds
   */
  constructor(duration?: number) {
    super()
    if (duration == null) duration = 0
    this.initWithDuration(duration, 0)
  }

  /**
   * Returns a reversed action.
   * @return {FadeIn}
   */
  reverse(): FadeIn {
    const action = new FadeIn()
    action._reverseAction = this
    action.initWithDuration(this._duration, 255)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * returns a new clone of the action
   * @returns {FadeOut}
   */
  clone(): FadeOut {
    const action = new FadeOut()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._toOpacity)
    return action
  }
}

/**
 * Fades Out an object that implements the RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * @function
 * @param {Number} d  duration in seconds
 * @return {FadeOut}
 * @example
 * // example
 * var action = fadeOut(1.0);
 */
export const fadeOut = function (d: number) {
  return new FadeOut(d)
}
