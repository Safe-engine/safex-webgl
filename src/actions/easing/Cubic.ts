import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * EaseCubicActionIn action. <br />
 * Reference easeInCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> action.easing(easeCubicActionIn());
 *
 * @example
 * //The old usage
 * EaseCubicActionIn.create(action);
 * //The new usage
 * action.easing(easeCubicActionIn());
 */
export class EaseCubicActionIn extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    return time * time * time
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
   * @returns {EaseCubicActionIn}
   */
  clone(): EaseCubicActionIn {
    const action = new EaseCubicActionIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCubicActionIn}
   */
  reverse(): EaseCubicActionIn {
    return new EaseCubicActionIn(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCubicActionIn = {
  easing: EaseCubicActionIn.prototype._updateTime,
  reverse: function () {
    return _easeCubicActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCubicActionIn());
 */
export const easeCubicActionIn = function () {
  return _easeCubicActionIn
}

/**
 * EaseCubicActionOut action. <br />
 * Reference easeOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCubicActionOut());
 *
 * @example
 * //The old usage
 * EaseCubicActionOut.create(action);
 * //The new usage
 * action.easing(easeCubicActionOut());
 */
export class EaseCubicActionOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    time -= 1
    return time * time * time + 1
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
   * @returns {EaseCubicActionOut}
   */
  clone(): EaseCubicActionOut {
    const action = new EaseCubicActionOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCubicActionOut}
   */
  reverse(): EaseCubicActionOut {
    return new EaseCubicActionOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCubicActionOut = {
  easing: EaseCubicActionOut.prototype._updateTime,
  reverse: function () {
    return _easeCubicActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCubicActionOut());
 */
export const easeCubicActionOut = function () {
  return _easeCubicActionOut
}

/**
 * EaseCubicActionInOut action. <br />
 * Reference easeInOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCubicActionInOut());
 *
 * @example
 * //The old usage
 * EaseCubicActionInOut.create(action);
 * //The new usage
 * action.easing(easeCubicActionInOut());
 */
export class EaseCubicActionInOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    time = time * 2
    if (time < 1) return 0.5 * time * time * time
    time -= 2
    return 0.5 * (time * time * time + 2)
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
   * @returns {EaseCubicActionInOut}
   */
  clone(): EaseCubicActionInOut {
    const action = new EaseCubicActionInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseCubicActionInOut}
   */
  reverse(): EaseCubicActionInOut {
    return new EaseCubicActionInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeCubicActionInOut = {
  easing: EaseCubicActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeCubicActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
export const easeCubicActionInOut = function () {
  return _easeCubicActionInOut
}
