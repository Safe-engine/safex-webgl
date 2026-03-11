import { ActionEase } from './ActionEase'
import { ActionInterval } from '../ActionInterval'

/**
 * EaseCircleActionIn action. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionIn());
 *
 * @example
 * //The old usage
 * EaseCircleActionIn.create(action);
 * //The new usage
 * action.easing(easeCircleActionIn());
 */
export class EaseCircleActionIn extends ActionEase {
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
    this._inner!.update(-1 * (Math.sqrt(1 - dt * dt) - 1))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseCircleActionIn}
   */
  clone(): EaseCircleActionIn {
    const action = new EaseCircleActionIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCircleActionIn}
   */
  reverse(): EaseCircleActionOut {
    return new EaseCircleActionOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCircleActionIn = {
  easing: function (time: number) {
    return -1 * (Math.sqrt(1 - time * time) - 1)
  },
  reverse: function () {
    return _easeCircleActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionIn());
 */
export const easeCircleActionIn = function () {
  return _easeCircleActionIn
}

/**
 * EaseCircleActionOut action. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionOut());
 */
export class EaseCircleActionOut extends ActionEase {
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
    const time = dt - 1
    this._inner!.update(Math.sqrt(1 - time * time))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseCircleActionOut}
   */
  clone(): EaseCircleActionOut {
    const action = new EaseCircleActionOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCircleActionOut}
   */
  reverse(): EaseCircleActionIn {
    return new EaseCircleActionIn(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCircleActionOut = {
  easing: function (time: number) {
    const t = time - 1
    return Math.sqrt(1 - t * t)
  },
  reverse: function () {
    return _easeCircleActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionOut());
 */
export const easeCircleActionOut = function () {
  return _easeCircleActionOut
}

/**
 * EaseCircleActionInOut action. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionInOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionInOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionInOut());
 */
export class EaseCircleActionInOut extends ActionEase {
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
    let time = dt * 2
    if (time < 1) {
      this._inner!.update(-0.5 * (Math.sqrt(1 - time * time) - 1))
    } else {
      time -= 2
      this._inner!.update(0.5 * (Math.sqrt(1 - time * time) + 1))
    }
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseCircleActionInOut}
   */
  clone(): EaseCircleActionInOut {
    const action = new EaseCircleActionInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCircleActionInOut}
   */
  reverse(): EaseCircleActionInOut {
    return new EaseCircleActionInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCircleActionInOut = {
  easing: function (time: number) {
    let t = time * 2
    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1)
    t -= 2
    return 0.5 * (Math.sqrt(1 - t * t) + 1)
  },
  reverse: function () {
    return _easeCircleActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionInOut());
 */
export const easeCircleActionInOut = function () {
  return _easeCircleActionInOut
}
