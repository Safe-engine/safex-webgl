import { ActionEase } from './ActionEase'
import { ActionInterval } from '../ActionInterval'

/**
 * EaseBackIn action. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeBackIn())
 *
 * @example
 * //The old usage
 * EaseBackIn.create(action);
 * //The new usage
 * action.easing(easeBackIn());
 */
export class EaseBackIn extends ActionEase {
  constructor(action?: ActionInterval) {
    super()
    action && this.initWithAction(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    const overshoot = 1.70158
    dt = dt === 0 || dt === 1 ? dt : dt * dt * ((overshoot + 1) * dt - overshoot)
    this._inner!.update(dt)
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseBackOut}
   */
  reverse(): EaseBackOut {
    return new EaseBackOut(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseBackIn}
   */
  clone(): EaseBackIn {
    const action = new EaseBackIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeBackInObj = {
  easing: function (time1) {
    const overshoot = 1.70158
    return time1 === 0 || time1 === 1 ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot)
  },
  reverse: function () {
    return _easeBackOutObj
  },
}

/**
 * Creates the action easing object. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackIn());
 */
export const easeBackIn = function () {
  return _easeBackInObj
}

/**
 * EaseBackOut action. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeBackOut());
 *
 * @example
 * //The old usage
 * EaseBackOut.create(action);
 * //The new usage
 * action.easing(easeBackOut());
 */
export class EaseBackOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super()
    action && this.initWithAction(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    const overshoot = 1.70158
    dt = dt - 1
    this._inner!.update(dt * dt * ((overshoot + 1) * dt + overshoot) + 1)
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseBackIn}
   */
  reverse(): EaseBackIn {
    return new EaseBackIn(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseBackOut}
   */
  clone(): EaseBackOut {
    const action = new EaseBackOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeBackOutObj = {
  easing: function (time1) {
    const overshoot = 1.70158
    time1 = time1 - 1
    return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1
  },
  reverse: function () {
    return _easeBackInObj
  },
}

/**
 * Creates the action easing object. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackOut());
 */
export const easeBackOut = function () {
  return _easeBackOutObj
}

/**
 * EaseBackInOut action. <br />
 * Beginning of EaseBackIn. Ending of EaseBackOut.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeBackInOut())
 *
 * @example
 * //The old usage
 * EaseBackInOut.create(action);
 * //The new usage
 * action.easing(easeBackInOut());
 */
export class EaseBackInOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super()
    action && this.initWithAction(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    const overshoot = 1.70158 * 1.525
    dt = dt * 2
    if (dt < 1) {
      this._inner!.update((dt * dt * ((overshoot + 1) * dt - overshoot)) / 2)
    } else {
      dt = dt - 2
      this._inner!.update((dt * dt * ((overshoot + 1) * dt + overshoot)) / 2 + 1)
    }
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseBackInOut}
   */
  clone(): EaseBackInOut {
    const action = new EaseBackInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseBackInOut}
   */
  reverse(): EaseBackInOut {
    return new EaseBackInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeBackInOutObj = {
  easing: function (time1) {
    const overshoot = 1.70158 * 1.525
    time1 = time1 * 2
    if (time1 < 1) {
      return (time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2
    } else {
      time1 = time1 - 2
      return (time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1
    }
  },
  reverse: function () {
    return _easeBackInOutObj
  },
}

/**
 * Creates the action easing object. <br />
 * Beginning of EaseBackIn. Ending of EaseBackOut.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackInOut());
 */
export const easeBackInOut = function () {
  return _easeBackInOutObj
}
