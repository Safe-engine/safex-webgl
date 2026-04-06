import { ActionInterval } from './ActionInterval'
import type { FiniteTimeAction } from './FiniteTimeAction'

/** Delays the action a certain amount of seconds
 * @class
 * @extends ActionInterval
 */
export class DelayTime extends ActionInterval {
  constructor(d?: number) {
    super(d)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * Will be overwrite.
   * @param {Number} dt time in seconds
   */
  update(dt: number) {}

  /**
   * Returns a reversed action.
   * @return {DelayTime}
   */
  reverse() {
    const action = new DelayTime(this._duration)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * returns a new clone of the action
   * @returns {DelayTime}
   */
  clone() {
    const action = new DelayTime()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration)
    return action
  }
}

/**
 * Delays the action a certain amount of seconds
 * @function
 * @param {Number} d duration in seconds
 * @return {DelayTime}
 * @example
 * // example
 * var delay = delayTime(1);
 */
export const delayTime = function (d: number) {
  return new DelayTime(d)
}

/**
 * <p>
 * Executes an action in reverse order, from time=duration to time=0                                     <br/>
 * @warning Use this action carefully. This action is not sequenceable.                                 <br/>
 * Use it as the default "reversed" method of your own actions, but using it outside the "reversed"      <br/>
 * scope is not recommended.
 * </p>
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @example
 *  var reverse = new ReverseTime(this);
 */
export class ReverseTime extends ActionInterval {
  _other: any = null

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {FiniteTimeAction} action
   */
  constructor(action?: any) {
    super()
    this._other = null
    if (action) {
      this.initWithAction(action)
    }
  }

  /**
   * @param {FiniteTimeAction} action
   * @return {Boolean}
   */
  initWithAction(action: any) {
    if (!action) throw new Error('ReverseTime.initWithAction(): action must be non null')
    if (action === this._other) throw new Error('ReverseTime.initWithAction(): the action was already passed in.')

    if (super.initWithDuration(action._duration)) {
      // Don't leak if action is reused
      this._other = action
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {ReverseTime}
   */
  clone() {
    const action = new ReverseTime()
    this._cloneDecoration(action)
    action.initWithAction(this._other.clone())
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any) {
    super.startWithTarget(target)
    this._other.startWithTarget(target)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt time in seconds
   */
  update(dt: number) {
    dt = this._computeEaseTime(dt)
    if (this._other) this._other.update(1 - dt)
  }

  /**
   * Returns a reversed action.
   * @return {ActionInterval}
   */
  reverse() {
    return this._other.clone()
  }

  /**
   * Stop the action
   */
  stop() {
    this._other.stop()
    super.stop()
  }
}

/**
 * Executes an action in reverse order, from time=duration to time=0.
 * @function
 * @param {FiniteTimeAction} action
 * @return {ReverseTime}
 * @example
 * // example
 *  var reverse = reverseTime(this);
 */
export const reverseTime = function (action: FiniteTimeAction) {
  return new ReverseTime(action)
}
