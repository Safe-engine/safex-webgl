import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * Ease Sine In. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineIn())
 *
 * @example
 * //The old usage
 * EaseSineIn.create(action);
 * //The new usage
 * action.easing(easeSineIn());
 */
export class EaseSineIn extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    dt = dt === 0 || dt === 1 ? dt : -1 * Math.cos((dt * Math.PI) / 2) + 1
    this._inner!.update(dt)
  }

  /**
   * Create a EaseSineOut action. Opposite with the original motion trajectory.
   * @return {EaseSineOut}
   */
  reverse(): EaseSineOut {
    return new EaseSineOut(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseSineIn}
   */
  clone(): EaseSineIn {
    const action = new EaseSineIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeSineInObj = {
  easing: function (dt: number) {
    return dt === 0 || dt === 1 ? dt : -1 * Math.cos((dt * Math.PI) / 2) + 1
  },
  reverse: function () {
    return _easeSineOutObj
  },
}
/**
 * creates an EaseSineIn action. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineIn());
 */
export const easeSineIn = function () {
  return _easeSineInObj
}

/**
 * Ease Sine Out. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineOut())
 *
 * @example
 * //The old usage
 * EaseSineOut.create(action);
 * //The new usage
 * action.easing(easeSineOut());
 */
export class EaseSineOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    dt = dt === 0 || dt === 1 ? dt : Math.sin((dt * Math.PI) / 2)
    this._inner!.update(dt)
  }

  /**
   * Create a EaseSineIn action. Opposite with the original motion trajectory.
   * @return {EaseSineIn}
   */
  reverse(): EaseSineIn {
    return new EaseSineIn(this._inner!.reverse() as ActionInterval)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseSineOut}
   */
  clone(): EaseSineOut {
    const action = new EaseSineOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }
}

export const _easeSineOutObj = {
  easing: function (dt: number) {
    return dt === 0 || dt === 1 ? dt : Math.sin((dt * Math.PI) / 2)
  },
  reverse: function () {
    return _easeSineInObj
  },
}

/**
 * Creates an EaseSineOut action easing object. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineOut());
 */
export const easeSineOut = function () {
  return _easeSineOutObj
}

/**
 * Ease Sine InOut. <br />
 * Reference easeInOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineInOut())
 *
 * @example
 * //The old usage
 * EaseSineInOut.create(action);
 * //The new usage
 * action.easing(easeSineInOut());
 */
export class EaseSineInOut extends ActionEase {
  constructor(action?: ActionInterval) {
    super(action)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    dt = dt === 0 || dt === 1 ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1)
    this._inner!.update(dt)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseSineInOut}
   */
  clone(): EaseSineInOut {
    const action = new EaseSineInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * Create a EaseSineInOut action. Opposite with the original motion trajectory.
   * @return {EaseSineInOut}
   */
  reverse(): EaseSineInOut {
    return new EaseSineInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeSineInOutObj = {
  easing: function (dt: number) {
    return dt === 0 || dt === 1 ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1)
  },
  reverse: function () {
    return _easeSineInOutObj
  },
}

/**
 * creates the action easing object. <br />
 * Reference easeInOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineInOut());
 */
export const easeSineInOut = function () {
  return _easeSineInOutObj
}
