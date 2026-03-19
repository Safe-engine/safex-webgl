import { color } from '../core/platform/Color'
import { ActionInterval } from './ActionInterval'

/** Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @example
 * var action = new TintTo(2, 255, 0, 255);
 */
export class TintTo extends ActionInterval {
  _to: any = color(0, 0, 0)
  _from: any = color(0, 0, 0)

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Number} red 0-255
   * @param {Number} green  0-255
   * @param {Number} blue 0-255
   */
  constructor(duration?: number, red?: number, green?: number, blue?: number) {
    super()
    this._to = color(0, 0, 0)
    this._from = color(0, 0, 0)

    blue !== undefined && this.initWithDuration(duration, red, green, blue)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Number} red 0-255
   * @param {Number} green 0-255
   * @param {Number} blue 0-255
   * @return {Boolean}
   */
  initWithDuration(duration: number, red: number, green?: number, blue?: number): boolean {
    if (super.initWithDuration(duration)) {
      this._to = color(red, green, blue)
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {TintTo}
   */
  clone(): TintTo {
    const action = new TintTo()
    this._cloneDecoration(action)
    const locTo = this._to
    action.initWithDuration(this._duration, locTo.r, locTo.g, locTo.b)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)

    this._from = this.target.getColor()
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt time in seconds
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    const locFrom = this._from,
      locTo = this._to
    if (locFrom) {
      this.target.setColor(
        color(locFrom.r + (locTo.r - locFrom.r) * dt, locFrom.g + (locTo.g - locFrom.g) * dt, locFrom.b + (locTo.b - locFrom.b) * dt),
      )
    }
  }
}

/**
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * @function
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {TintTo}
 * @example
 * // example
 * var action = tintTo(2, 255, 0, 255);
 */
export const tintTo = function (duration, red, green, blue) {
  return new TintTo(duration, red, green, blue)
}

/**  Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * Relative to their own color change.
 * @class
 * @extends ActionInterval
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @example
 * var action = new TintBy(2, -127, -255, -127);
 */
export class TintBy extends ActionInterval {
  _deltaR = 0
  _deltaG = 0
  _deltaB = 0

  _fromR = 0
  _fromG = 0
  _fromB = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration  duration in seconds
   * @param {Number} deltaRed
   * @param {Number} deltaGreen
   * @param {Number} deltaBlue
   */
  constructor(duration?: number, deltaRed?: number, deltaGreen?: number, deltaBlue?: number) {
    super()
    deltaBlue !== undefined && this.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Number} deltaRed 0-255
   * @param {Number} deltaGreen 0-255
   * @param {Number} deltaBlue 0-255
   * @return {Boolean}
   */
  initWithDuration(duration: number, deltaRed: number, deltaGreen?: number, deltaBlue?: number): boolean {
    if (super.initWithDuration(duration)) {
      this._deltaR = deltaRed
      this._deltaG = deltaGreen
      this._deltaB = deltaBlue
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {TintBy}
   */
  clone(): TintBy {
    const action = new TintBy()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)

    const color = target.color
    this._fromR = color.r
    this._fromG = color.g
    this._fromB = color.b
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt time in seconds
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)

    this.target.setColor(color(this._fromR + this._deltaR * dt, this._fromG + this._deltaG * dt, this._fromB + this._deltaB * dt))
  }

  /**
   * Returns a reversed action.
   * @return {TintBy}
   */
  reverse(): TintBy {
    const action = new TintBy(this._duration, -this._deltaR, -this._deltaG, -this._deltaB)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }
}

/**
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * Relative to their own color change.
 * @function
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {TintBy}
 * @example
 * // example
 * var action = tintBy(2, -127, -255, -127);
 */
export const tintBy = function (duration, deltaRed, deltaGreen, deltaBlue) {
  return new TintBy(duration, deltaRed, deltaGreen, deltaBlue)
}
