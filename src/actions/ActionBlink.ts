import { ActionInterval } from './ActionInterval'

/** Blinks a Node object by modifying it's visible attribute
 * @class
 * @extends ActionInterval
 * @param {Number} duration  duration in seconds
 * @param {Number} blinks  blinks in times
 * @example
 * var action = new Blink(2, 10);
 */
export class Blink extends ActionInterval {
  _times = 0
  _originalState = false

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration  duration in seconds
   * @param {Number} blinks  blinks in times
   */
  constructor(duration?: number, blinks?: number) {
    super()
    blinks !== undefined && this.initWithDuration(duration, blinks)
  }

  /**
   * Initializes the action.
   * @param {Number} duration duration in seconds
   * @param {Number} blinks blinks in times
   * @return {Boolean}
   */
  initWithDuration(duration: number, blinks: number): boolean {
    if (super.initWithDuration(duration)) {
      this._times = blinks
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {Blink}
   */
  clone(): Blink {
    const action = new Blink()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._times)
    return action
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt time in seconds
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    if (this.target && !this.isDone()) {
      const slice = 1.0 / this._times
      const m = dt % slice
      this.target.setVisible(m > slice / 2)
    }
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._originalState = target.visible
  }

  /**
   * stop the action
   */
  stop(): void {
    this.target.setVisible(this._originalState)
    super.stop()
  }

  /**
   * Returns a reversed action.
   * @return {Blink}
   */
  reverse(): Blink {
    const action = new Blink(this._duration, this._times)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }
}
/**
 * Blinks a Node object by modifying it's visible attribute.
 * @function
 * @param {Number} duration  duration in seconds
 * @param blinks blinks in times
 * @return {Blink}
 * @example
 * // example
 * var action = blink(2, 10);
 */
export const blink = function (duration, blinks) {
  return new Blink(duration, blinks)
}
