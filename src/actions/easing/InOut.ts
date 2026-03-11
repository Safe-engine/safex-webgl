import { ActionInterval } from '../ActionInterval'
import { EaseRateAction } from './ActionEase'

/**
 * EaseIn action with a rate. From slow to fast.
 *
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeIn(3));
 *
 * @example
 * //The old usage
 * EaseIn.create(action, 3);
 * //The new usage
 * action.easing(easeIn(3.0));
 */
export class EaseIn extends EaseRateAction {
  constructor(action?: ActionInterval, rate?: number) {
    super()
    rate !== undefined && this.initWithAction(action!, rate)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(Math.pow(dt, this._rate))
  }

  /**
   * Create a easeIn action. Opposite with the original motion trajectory.
   * @return {EaseIn}
   */
  reverse(): EaseIn {
    return new EaseIn(this._inner!.reverse() as ActionInterval, 1 / this._rate)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseIn}
   */
  clone(): EaseIn {
    const action = new EaseIn()
    action.initWithAction(this._inner!.clone() as ActionInterval, this._rate)
    return action
  }

  /**
   * Creates the action with the inner action and the rate parameter. <br />
   * From slow to fast.
   *
   * @static
   * @deprecated since v3.0 <br /> Please use action.easing(easeIn(3))
   *
   * @example
   * //The old usage
   * EaseIn.create(action, 3);
   * //The new usage
   * action.easing(easeIn(3.0));
   *
   * @param {ActionInterval} action
   * @param {Number} rate
   * @return {EaseIn}
   */
  static create(action: ActionInterval, rate: number): EaseIn {
    return new EaseIn(action, rate)
  }
}

/**
 * Creates the action easing object with the rate parameter. <br />
 * From slow to fast.
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(easeIn(3.0));
 */
export const easeIn = function (rate) {
  return {
    _rate: rate,
    easing: function (dt) {
      return Math.pow(dt, this._rate)
    },
    reverse: function () {
      return easeIn(1 / this._rate)
    },
  }
}

/**
 * EaseOut action with a rate. From fast to slow.
 *
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeOut(3))
 *
 * @example
 * //The old usage
 * EaseOut.create(action, 3);
 * //The new usage
 * action.easing(easeOut(3.0));
 */
export class EaseOut extends EaseRateAction {
  constructor(action?: ActionInterval, rate?: number) {
    super()
    rate !== undefined && this.initWithAction(action!, rate)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(Math.pow(dt, 1 / this._rate))
  }

  /**
   * Create a easeIn action. Opposite with the original motion trajectory.
   * @return {EaseOut}
   */
  reverse(): EaseOut {
    return new EaseOut(this._inner!.reverse() as ActionInterval, 1 / this._rate)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseOut}
   */
  clone(): EaseOut {
    const action = new EaseOut()
    action.initWithAction(this._inner!.clone() as ActionInterval, this._rate)
    return action
  }
}

/**
 * Creates the action easing object with the rate parameter. <br />
 * From fast to slow.
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(easeOut(3.0));
 */
export const easeOut = function (rate) {
  return {
    _rate: rate,
    easing: function (dt) {
      return Math.pow(dt, 1 / this._rate)
    },
    reverse: function () {
      return easeOut(1 / this._rate)
    },
  }
}

/**
 * EaseInOut action with a rate. <br />
 * Slow to fast then to slow.
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeInOut(3.0))
 *
 * @example
 * //The old usage
 * EaseInOut.create(action, 3);
 * //The new usage
 * action.easing(easeInOut(3.0));
 */
export class EaseInOut extends EaseRateAction {
  constructor(action?: ActionInterval, rate?: number) {
    super()
    rate !== undefined && this.initWithAction(action!, rate)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    dt *= 2
    if (dt < 1) this._inner!.update(0.5 * Math.pow(dt, this._rate))
    else this._inner!.update(1.0 - 0.5 * Math.pow(2 - dt, this._rate))
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseInOut}
   */
  clone(): EaseInOut {
    const action = new EaseInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval, this._rate)
    return action
  }

  /**
   * Create a EaseInOut action. Opposite with the original motion trajectory.
   * @return {EaseInOut}
   */
  reverse(): EaseInOut {
    return new EaseInOut(this._inner!.reverse() as ActionInterval, this._rate)
  }

  /**
   * Creates the action with the inner action and the rate parameter.
   * Slow to fast then to slow.
   * @static
   * @deprecated since v3.0 <br /> Please use action.easing(easeInOut(3.0))
   *
   * @example
   * //The old usage
   * EaseInOut.create(action, 3);
   * //The new usage
   * action.easing(easeInOut(3.0));
   *
   * @param {ActionInterval} action
   * @param {Number} rate
   * @return {EaseInOut}
   */
  static create(action: ActionInterval, rate: number): EaseInOut {
    return new EaseInOut(action, rate)
  }
}

/**
 * Creates the action easing object with the rate parameter. <br />
 * Slow to fast then to slow.
 * @function
 * @param {Number} rate
 * @return {Object}
 *
 * @example
 * //The new usage
 * action.easing(easeInOut(3.0));
 */
export const easeInOut = function (rate) {
  return {
    _rate: rate,
    easing: function (dt) {
      dt *= 2
      if (dt < 1) return 0.5 * Math.pow(dt, this._rate)
      else return 1.0 - 0.5 * Math.pow(2 - dt, this._rate)
    },
    reverse: function () {
      return easeInOut(this._rate)
    },
  }
}
