import { ActionInstant } from './ActionInstant'
import { ActionInterval } from './ActionInterval'

/**
 * Repeats an action a number of times.
 * To repeat an action forever use the CCRepeatForever action.
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @param {Number} times
 * @example
 * var rep = new Repeat(sequence(jump2, jump1), 5);
 */
export class Repeat extends ActionInterval {
  _times = 0
  _total = 0
  _nextDt = 0
  _actionInstant = false
  _innerAction: any = null //CCFiniteTimeAction

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30).
   * @param {FiniteTimeAction} action
   * @param {Number} times
   */
  constructor(action?: any, times?: number) {
    super()

    if (times !== undefined) {
      this.initWithAction(action, times)
    }
  }

  /**
   * @param {FiniteTimeAction} action
   * @param {Number} times
   * @return {Boolean}
   */
  initWithAction(action: any, times: number) {
    const duration = action._duration * times

    if (this.initWithDuration(duration)) {
      this._times = times
      this._innerAction = action
      if (action instanceof ActionInstant) {
        this._actionInstant = true
        this._times -= 1
      }
      this._total = 0
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {Repeat}
   */
  clone() {
    const action = new Repeat()
    this._cloneDecoration(action)
    action.initWithAction(this._innerAction.clone(), this._times)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any) {
    this._total = 0
    this._nextDt = this._innerAction._duration / this._duration
    super.startWithTarget(target)
    this._innerAction.startWithTarget(target)
  }

  /**
   * stop the action
   */
  stop() {
    this._innerAction.stop()
    super.stop()
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number}  dt
   */
  update(dt: number) {
    dt = this._computeEaseTime(dt)
    const locInnerAction = this._innerAction
    const locDuration = this._duration
    const locTimes = this._times
    let locNextDt = this._nextDt

    if (dt >= locNextDt) {
      while (dt > locNextDt && this._total < locTimes) {
        locInnerAction.update(1)
        this._total++
        locInnerAction.stop()
        locInnerAction.startWithTarget(this.target)
        locNextDt += locInnerAction._duration / locDuration
        this._nextDt = locNextDt
      }

      // fix for issue #1288, incorrect end value of repeat
      if (dt >= 1.0 && this._total < locTimes) this._total++

      // don't set a instant action back or update it, it has no use because it has no duration
      if (!this._actionInstant) {
        if (this._total === locTimes) {
          locInnerAction.update(1)
          locInnerAction.stop()
        } else {
          // issue #390 prevent jerk, use right update
          locInnerAction.update(dt - (locNextDt - locInnerAction._duration / locDuration))
        }
      }
    } else {
      locInnerAction.update((dt * locTimes) % 1.0)
    }
  }

  /**
   * Return true if the action has finished.
   * @return {Boolean}
   */
  isDone() {
    return this._total === this._times
  }

  /**
   * returns a reversed action.
   * @return {Repeat}
   */
  reverse() {
    const action = new Repeat(this._innerAction.reverse(), this._times)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * Set inner Action.
   * @param {FiniteTimeAction} action
   */
  setInnerAction(action: any) {
    if (this._innerAction !== action) {
      this._innerAction = action
    }
  }

  /**
   * Get inner Action.
   * @return {FiniteTimeAction}
   */
  getInnerAction() {
    return this._innerAction
  }
}

/**
 * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30)
 * @function
 * @param {FiniteTimeAction} action
 * @param {Number} times
 * @return {Repeat}
 * @example
 * // example
 * var rep = repeat(sequence(jump2, jump1), 5);
 */
export const repeat = function (action, times) {
  return new Repeat(action, times)
}

/**  Repeats an action for ever.  <br/>
 * To repeat the an action for a limited number of times use the Repeat action. <br/>
 * @warning This action can't be Sequenceable because it is not an IntervalAction
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @example
 * var rep = new RepeatForever(sequence(jump2, jump1), 5);
 */
export class RepeatForever extends ActionInterval {
  _innerAction: any = null //CCActionInterval

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Create a acton which repeat forever.
   * @param {FiniteTimeAction} action
   */
  constructor(action?: any) {
    super()
    this._innerAction = null
    if (action) {
      this.initWithAction(action)
    }
  }

  /**
   * @param {ActionInterval} action
   * @return {Boolean}
   */
  initWithAction(action: any) {
    if (!action) throw new Error('RepeatForever.initWithAction(): action must be non null')

    this._innerAction = action
    return true
  }

  /**
   * returns a new clone of the action
   * @returns {RepeatForever}
   */
  clone() {
    const action = new RepeatForever()
    this._cloneDecoration(action)
    action.initWithAction(this._innerAction.clone())
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any) {
    super.startWithTarget(target)
    this._innerAction.startWithTarget(target)
  }

  /**
   * called every frame with it's delta time. <br />
   * DON'T override unless you know what you are doing.
   * @param dt delta time in seconds
   */
  step(dt: number) {
    const locInnerAction = this._innerAction
    locInnerAction.step(dt)
    if (locInnerAction.isDone()) {
      //var diff = locInnerAction.getElapsed() - locInnerAction._duration;
      locInnerAction.startWithTarget(this.target)
      // to prevent jerk. issue #390 ,1247
      //this._innerAction.step(0);
      //this._innerAction.step(diff);
      locInnerAction.step(locInnerAction.getElapsed() - locInnerAction._duration)
    }
  }

  /**
   * Return true if the action has finished.
   * @return {Boolean}
   */
  isDone() {
    return false
  }

  /**
   * Returns a reversed action.
   * @return {RepeatForever}
   */
  reverse() {
    const action = new RepeatForever(this._innerAction.reverse())
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * Set inner action.
   * @param {ActionInterval} action
   */
  setInnerAction(action: any) {
    if (this._innerAction !== action) {
      this._innerAction = action
    }
  }

  /**
   * Get inner action.
   * @return {ActionInterval}
   */
  getInnerAction() {
    return this._innerAction
  }
}

/**
 * Create a acton which repeat forever
 * @function
 * @param {FiniteTimeAction} action
 * @return {RepeatForever}
 * @example
 * // example
 * var repeat = repeatForever(rotateBy(1.0, 360));
 */
export const repeatForever = function (action) {
  return new RepeatForever(action)
}
