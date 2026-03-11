import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * EaseBezierAction action. <br />
 * Manually set a 4 order Bessel curve. <br />
 * According to the set point, calculate the trajectory.
 * @class
 * @extends ActionEase
 * @param {Action} action
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeBezierAction())
 *
 * @example
 * //The old usage
 * var action = EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage
 * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
export class EaseBezierAction extends ActionEase {
  _p0 = 0
  _p1 = 0
  _p2 = 0
  _p3 = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Initialization requires the application of Bessel curve of action.
   * @param {Action} action
   */
  constructor(action?: ActionInterval) {
    super()
    action && this.initWithAction(action)
  }

  static _updateTime(a: number, b: number, c: number, d: number, t: number): number {
    return Math.pow(1 - t, 3) * a + 3 * t * Math.pow(1 - t, 2) * b + 3 * Math.pow(t, 2) * (1 - t) * c + Math.pow(t, 3) * d
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    const t = EaseBezierAction._updateTime(this._p0, this._p1, this._p2, this._p3, dt)
    this._inner!.update(t)
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseBezierAction}
   */
  clone(): EaseBezierAction {
    const action = new EaseBezierAction()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    action.setBezierParamer(this._p0, this._p1, this._p2, this._p3)
    return action
  }

  /**
   * Create a action. Opposite with the original motion trajectory.
   * @return {EaseBezierAction}
   */
  reverse(): EaseBezierAction {
    const action = new EaseBezierAction(this._inner!.reverse() as ActionInterval)
    action.setBezierParamer(this._p3, this._p2, this._p1, this._p0)
    return action
  }

  /**
   * Set of 4 reference point
   * @param p0
   * @param p1
   * @param p2
   * @param p3
   */
  setBezierParamer(p0: number, p1: number, p2: number, p3: number): void {
    this._p0 = p0 || 0
    this._p1 = p1 || 0
    this._p2 = p2 || 0
    this._p3 = p3 || 0
  }

  /**
   * Creates the action. <br />
   * After creating the EaseBezierAction, also need to manually call setBezierParamer. <br />
   * According to the set point, calculate the trajectory.
   * @static
   * @param action
   * @returns {EaseBezierAction}
   *
   * @deprecated since v3.0 <br /> Please use action.easing(easeBezierAction())
   *
   * @example
   * //The old usage
   * var action = EaseBezierAction.create(action);
   * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
   * //The new usage
   * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
   */
  static create(action: ActionInterval): EaseBezierAction {
    return new EaseBezierAction(action)
  }
}

/**
 * Creates the action easing object. <br />
 * Into the 4 reference point. <br />
 * To calculate the motion curve.
 * @param {Number} p0 The first bezier parameter
 * @param {Number} p1 The second bezier parameter
 * @param {Number} p2 The third bezier parameter
 * @param {Number} p3 The fourth bezier parameter
 * @returns {Object}
 * @example
 * // example
 * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
export const easeBezierAction = function (p0: number, p1: number, p2: number, p3: number) {
  return {
    easing: function (time: number) {
      return EaseBezierAction._updateTime(p0, p1, p2, p3, time)
    },
    reverse: function () {
      return easeBezierAction(p3, p2, p1, p0)
    },
  }
}
