import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * EaseQuinticActionIn action. <br />
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuinticActionIn());
 *
 * @example
 * //The old usage
 * EaseQuinticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuinticActionIn());
 */
export class EaseQuinticActionIn extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    return time * time * time * time * time
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseQuinticActionIn}
   */
  clone(): EaseQuinticActionIn {
    const action = new EaseQuinticActionIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseQuinticActionIn}
   */
  reverse(): EaseQuinticActionIn {
    return new EaseQuinticActionIn(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuinticActionIn = {
  easing: EaseQuinticActionIn.prototype._updateTime,
  reverse: function () {
    return _easeQuinticActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuinticActionIn());
 */
export const easeQuinticActionIn = function () {
  return _easeQuinticActionIn
}

/**
 * EaseQuinticActionOut action. <br />
 * Reference easeQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionOut());
 *
 * @example
 * //The old usage
 * EaseQuinticActionOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionOut());
 */
export class EaseQuinticActionOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    time -= 1
    return time * time * time * time * time + 1
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseQuinticActionOut}
   */
  clone(): EaseQuinticActionOut {
    const action = new EaseQuinticActionOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseQuinticActionOut}
   */
  reverse(): EaseQuinticActionOut {
    return new EaseQuinticActionOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuinticActionOut = {
  easing: EaseQuinticActionOut.prototype._updateTime,
  reverse: function () {
    return _easeQuinticActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionOut());
 */
export const easeQuinticActionOut = function () {
  return _easeQuinticActionOut
}

/**
 * EaseQuinticActionInOut action. <br />
 * Reference easeInOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuinticActionInOut());
 *
 * @example
 * //The old usage
 * EaseQuinticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuinticActionInOut());
 */
export class EaseQuinticActionInOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    time = time * 2
    if (time < 1) return 0.5 * time * time * time * time * time
    time -= 2
    return 0.5 * (time * time * time * time * time + 2)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseQuinticActionInOut}
   */
  clone(): EaseQuinticActionInOut {
    const action = new EaseQuinticActionInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseQuinticActionInOut}
   */
  reverse(): EaseQuinticActionInOut {
    return new EaseQuinticActionInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuinticActionInOut = {
  easing: EaseQuinticActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeQuinticActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuinticActionInOut());
 */
export const easeQuinticActionInOut = function () {
  return _easeQuinticActionInOut
}
