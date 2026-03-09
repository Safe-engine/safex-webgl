import { log } from '../../helper/Debugger'
import { FLT_EPSILON } from '../core/platform/Macro'
import { Action } from './Action'
import { FiniteTimeAction } from './FiniteTimeAction'

export class ActionInterval extends FiniteTimeAction {
  _elapsed = 0
  _firstTick = false
  _easeList: any = null
  _timesForRepeat = 1
  _repeatForever = false
  _repeatMethod = false //Compatible with repeat class, Discard after can be deleted
  _speed = 1
  _speedMethod = false //Compatible with speed class, Discard after can be deleted

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} d duration in seconds
   */
  constructor(d?: number) {
    super()
    this._speed = 1
    this._timesForRepeat = 1
    this._repeatForever = false
    this.MAX_VALUE = 2
    this._repeatMethod = false //Compatible with repeat class, Discard after can be deleted
    this._speedMethod = false //Compatible with repeat class, Discard after can be deleted
    d !== undefined && this.initWithDuration(d)
  }

  MAX_VALUE = 2

  /**
   * How many seconds had elapsed since the actions started to run.
   * @return {Number}
   */
  getElapsed(): number {
    return this._elapsed
  }

  /**
   * Initializes the action.
   * @param {Number} d duration in seconds
   * @return {Boolean}
   */
  initWithDuration(d: number): boolean {
    this._duration = d === 0 ? FLT_EPSILON : d
    // prevent division by 0
    // This comparison could be in step:, but it might decrease the performance
    // by 3% in heavy based action games.
    this._elapsed = 0
    this._firstTick = true
    return true
  }

  /**
   * Returns true if the action has finished.
   * @return {Boolean}
   */
  isDone(): boolean {
    return this._elapsed >= this._duration
  }

  /**
   * Some additional parameters of cloning.
   * @param {Action} action
   * @private
   */
  _cloneDecoration(action: ActionInterval): void {
    action._repeatForever = this._repeatForever
    action._speed = this._speed
    action._timesForRepeat = this._timesForRepeat
    action._easeList = this._easeList
    action._speedMethod = this._speedMethod
    action._repeatMethod = this._repeatMethod
  }

  _reverseEaseList(action: ActionInterval): void {
    if (this._easeList) {
      action._easeList = []
      for (let i = 0; i < this._easeList.length; i++) {
        action._easeList.push(this._easeList[i].reverse())
      }
    }
  }

  /**
   * Returns a new clone of the action.
   * @returns {ActionInterval}
   */
  clone(): ActionInterval {
    const action = new ActionInterval(this._duration)
    this._cloneDecoration(action)
    return action
  }

  /**
   * Implementation of ease motion.
   *
   * @example
   * //example
   * action.easing(easeIn(3.0));
   * @param {Object} easeObj
   * @returns {ActionInterval}
   */
  easing(...args: any[]): ActionInterval {
    if (this._easeList) this._easeList.length = 0
    else this._easeList = []
    for (let i = 0; i < args.length; i++) this._easeList.push(args[i])
    return this
  }

  _computeEaseTime(dt: number): number {
    const locList = this._easeList
    if (!locList || locList.length === 0) return dt
    for (let i = 0, n = locList.length; i < n; i++) dt = locList[i].easing(dt)
    return dt
  }

  /**
   * called every frame with it's delta time. <br />
   * DON'T override unless you know what you are doing.
   *
   * @param {Number} dt
   */
  step(dt: number): void {
    if (this._firstTick) {
      this._firstTick = false
      this._elapsed = 0
    } else this._elapsed += dt

    //this.update((1 > (this._elapsed / this._duration)) ? this._elapsed / this._duration : 1);
    //this.update(Math.max(0, Math.min(1, this._elapsed / Math.max(this._duration, FLT_EPSILON))));
    let t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896)
    t = 1 > t ? t : 1
    this.update(t > 0 ? t : 0)

    //Compatible with repeat class, Discard after can be deleted (this._repeatMethod)
    if (this._repeatMethod && this._timesForRepeat > 1 && this.isDone()) {
      if (!this._repeatForever) {
        this._timesForRepeat--
      }
      //var diff = locInnerAction.getElapsed() - locInnerAction._duration;
      this.startWithTarget(this.target)
      // to prevent jerk. issue #390 ,1247
      //this._innerAction.step(0);
      //this._innerAction.step(diff);
      this.step(this._elapsed - this._duration)
    }
  }

  /**
   * Start this action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    Action.prototype.startWithTarget.call(this, target)
    this._elapsed = 0
    this._firstTick = true
  }

  /**
   * returns a reversed action. <br />
   * Will be overwrite.
   *
   * @return {?Action}
   */
  reverse(): Action | null {
    log('IntervalAction: reverse not implemented.')
    return null
  }

  /**
   * Set amplitude rate.
   * @warning It should be overridden in subclass.
   * @param {Number} amp
   */
  setAmplitudeRate(amp: number): void {
    // Abstract class needs implementation
    log('ActionInterval.setAmplitudeRate(): it should be overridden in subclass.')
  }

  /**
   * Get amplitude rate.
   * @warning It should be overridden in subclass.
   * @return {Number} 0
   */
  getAmplitudeRate(): number {
    // Abstract class needs implementation
    log('ActionInterval.getAmplitudeRate(): it should be overridden in subclass.')
    return 0
  }

  /**
   * Changes the speed of an action, making it take longer (speed>1)
   * or less (speed<1) time. <br/>
   * Useful to simulate 'slow motion' or 'fast forward' effect.
   *
   * @param speed
   * @returns {Action}
   */
  speed(speed: number): ActionInterval {
    if (speed <= 0) {
      log('The speed parameter error')
      return this
    }

    this._speedMethod = true //Compatible with repeat class, Discard after can be deleted
    this._speed *= speed
    return this
  }

  /**
   * Get this action speed.
   * @return {Number}
   */
  getSpeed(): number {
    return this._speed
  }

  /**
   * Set this action speed.
   * @param {Number} speed
   * @returns {ActionInterval}
   */
  setSpeed(speed: number): ActionInterval {
    this._speed = speed
    return this
  }

  /**
   * Repeats an action a number of times.
   * To repeat an action forever use the CCRepeatForever action.
   * @param times
   * @returns {ActionInterval}
   */
  repeat(times: number): ActionInterval {
    times = Math.round(times)
    if (isNaN(times) || times < 1) {
      log('The repeat parameter error')
      return this
    }
    this._repeatMethod = true //Compatible with repeat class, Discard after can be deleted
    this._timesForRepeat *= times
    return this
  }

  /**
   * Repeats an action for ever.  <br/>
   * To repeat the an action for a limited number of times use the Repeat action. <br/>
   * @returns {ActionInterval}
   */
  repeatForever(): ActionInterval {
    this._repeatMethod = true //Compatible with repeat class, Discard after can be deleted
    this._timesForRepeat = this.MAX_VALUE
    this._repeatForever = true
    return this
  }
}

/**
 * An interval action is an action that takes place within a certain period of time.
 * @function
 * @param {Number} d duration in seconds
 * @return {ActionInterval}
 * @example
 * // example
 * var actionInterval = actionInterval(3);
 */
export function actionInterval(d: number): ActionInterval {
  return new ActionInterval(d)
}
