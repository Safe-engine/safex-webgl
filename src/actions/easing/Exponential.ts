import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * Ease Exponential In. Slow to Fast. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please action.easing(easeExponentialIn())
 *
 * @example
 * //The old usage
 * EaseExponentialIn.create(action);
 * //The new usage
 * action.easing(easeExponentialIn());
 */
export class EaseExponentialIn extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    return time === 0 ? 0 : Math.pow(2, 10 * (time - 1))
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
   * Create a EaseExponentialOut action. Opposite with the original motion trajectory.
   * @return {EaseExponentialOut}
   */
  reverse(): EaseExponentialOut {
    return new EaseExponentialOut(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseExponentialIn}
   */
  clone(): EaseExponentialIn {
    const action = new EaseExponentialIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeExponentialInObj = {
  easing: EaseExponentialIn.prototype._updateTime,
  reverse: function () {
    return _easeExponentialOutObj
  },
}

/**
 * Creates the action easing object with the rate parameter. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialIn());
 */
export const easeExponentialIn = function () {
  return _easeExponentialInObj
}

/**
 * Ease Exponential Out. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialOut())
 *
 * @example
 * //The old usage
 * EaseExponentialOut.create(action);
 * //The new usage
 * action.easing(easeExponentialOut());
 */
export class EaseExponentialOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    return time === 1 ? 1 : -Math.pow(2, -10 * time) + 1
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
   * Create a EaseExponentialIn action. Opposite with the original motion trajectory.
   * @return {EaseExponentialIn}
   */
  reverse(): EaseExponentialIn {
    return new EaseExponentialIn(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseExponentialOut}
   */
  clone(): EaseExponentialOut {
    const action = new EaseExponentialOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeExponentialOutObj = {
  easing: EaseExponentialOut.prototype._updateTime,
  reverse: function () {
    return _easeExponentialInObj
  },
}

/**
 * creates the action easing object. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialOut());
 */
export const easeExponentialOut = function () {
  return _easeExponentialOutObj
}

/**
 * Ease Exponential InOut. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialInOut)
 *
 * @example
 * //The old usage
 * EaseExponentialInOut.create(action);
 * //The new usage
 * action.easing(easeExponentialInOut());
 */
export class EaseExponentialInOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  _updateTime(time: number): number {
    if (time !== 1 && time !== 0) {
      time *= 2
      if (time < 1) return 0.5 * Math.pow(2, 10 * (time - 1))
      return 0.5 * (-Math.pow(2, -10 * (time - 1)) + 2)
    }
    return time
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
   * Create a EaseExponentialInOut action. Opposite with the original motion trajectory.
   * @return {EaseExponentialInOut}
   */
  reverse(): EaseExponentialInOut {
    return new EaseExponentialInOut(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseExponentialInOut}
   */
  clone(): EaseExponentialInOut {
    const action = new EaseExponentialInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeExponentialInOutObj = {
  easing: EaseExponentialInOut.prototype._updateTime,
  reverse: function () {
    return _easeExponentialInOutObj
  },
}

/**
 * creates an EaseExponentialInOut action easing object. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialInOut());
 */
export const easeExponentialInOut = function () {
  return _easeExponentialInOutObj
}
