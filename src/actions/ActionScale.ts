import { ActionInterval } from './ActionInterval'

/** Scales a Node object to a zoom factor by modifying it's scale attribute.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Number} sx  scale parameter in X
 * @param {Number} [sy] scale parameter in Y, if Null equal to sx
 * @example
 * // It scales to 0.5 in both X and Y.
 * var actionTo = new ScaleTo(2, 0.5);
 *
 * // It scales to 0.5 in x and 2 in Y
 * var actionTo = new ScaleTo(2, 0.5, 2);
 */
export class ScaleTo extends ActionInterval {
  _scaleX = 1
  _scaleY = 1
  _startScaleX = 1
  _startScaleY = 1
  _endScaleX = 0
  _endScaleY = 0
  _deltaX = 0
  _deltaY = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Number} sx  scale parameter in X
   * @param {Number} [sy] scale parameter in Y, if Null equal to sx
   */
  constructor(duration?: number, sx?: number, sy?: number) {
    super()
    sx !== undefined && this.initWithDuration(duration, sx, sy)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Number} sx
   * @param {Number} [sy=]
   * @return {Boolean}
   */
  initWithDuration(duration: number, sx: number, sy?: number): boolean {
    //function overload here
    if (super.initWithDuration(duration)) {
      this._endScaleX = sx
      this._endScaleY = sy != null ? sy : sx
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {ScaleTo}
   */
  clone(): ScaleTo {
    const action = new ScaleTo()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._endScaleX, this._endScaleY)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._startScaleX = target.getScaleX()
    this._startScaleY = target.getScaleY()
    this._deltaX = this._endScaleX - this._startScaleX
    this._deltaY = this._endScaleY - this._startScaleY
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    if (this.target) {
      this.target.setScaleX(this._startScaleX + this._deltaX * dt)
      this.target.setScaleY(this._startScaleY + this._deltaY * dt)
    }
  }
}
/**
 * Scales a Node object to a zoom factor by modifying it's scale attribute.
 * @function
 * @param {Number} duration
 * @param {Number} sx  scale parameter in X
 * @param {Number} [sy] scale parameter in Y, if Null equal to sx
 * @return {ScaleTo}
 * @example
 * // example
 * // It scales to 0.5 in both X and Y.
 * var actionTo = scaleTo(2, 0.5);
 *
 * // It scales to 0.5 in x and 2 in Y
 * var actionTo = scaleTo(2, 0.5, 2);
 */
export const scaleTo = function (duration: number, sx: number, sy?: number) {
  //function overload
  return new ScaleTo(duration, sx, sy)
}

/** Scales a Node object a zoom factor by modifying it's scale attribute.
 * Relative to its changes.
 * @class
 * @extends ScaleTo
 */
export class ScaleBy extends ScaleTo {
  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX
    this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY
  }

  /**
   * Returns a reversed action.
   * @return {ScaleBy}
   */
  reverse(): ScaleBy {
    const action = new ScaleBy(this._duration, 1 / this._endScaleX, 1 / this._endScaleY)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  /**
   * returns a new clone of the action
   * @returns {ScaleBy}
   */
  clone(): ScaleBy {
    const action = new ScaleBy()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._endScaleX, this._endScaleY)
    return action
  }
}
/**
 * Scales a Node object a zoom factor by modifying it's scale attribute.
 * Relative to its changes.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Number} sx sx  scale parameter in X
 * @param {Number|Null} [sy=] sy scale parameter in Y, if Null equal to sx
 * @return {ScaleBy}
 * @example
 * // example without sy, it scales by 2 both in X and Y
 * var actionBy = scaleBy(2, 2);
 *
 * //example with sy, it scales by 0.25 in X and 4.5 in Y
 * var actionBy2 = scaleBy(2, 0.25, 4.5);
 */
export const scaleBy = function (duration: number, sx: number, sy?: number) {
  return new ScaleBy(duration, sx, sy)
}
