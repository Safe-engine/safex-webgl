import { log } from '../helper/Debugger'
import { ActionInterval } from './ActionInterval'

/**
 * Rotates a Node object to a certain angle by modifying it's.
 * rotation attribute. <br/>
 * The direction will be decided by the shortest angle.
 * @class
 * @extends ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees.
 * @param {Number} [deltaAngleY] deltaAngleY in degrees.
 * @example
 * var rotateTo = new RotateTo(2, 61.0);
 */
export class RotateTo extends ActionInterval {
  _dstAngleX = 0
  _startAngleX = 0
  _diffAngleX = 0

  _dstAngleY = 0
  _startAngleY = 0
  _diffAngleY = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Creates a RotateTo action with x and y rotation angles.
   * @param {Number} duration duration in seconds
   * @param {Number} deltaAngleX deltaAngleX in degrees.
   * @param {Number} [deltaAngleY] deltaAngleY in degrees.
   */
  constructor(duration?: number, deltaAngleX?: number, deltaAngleY?: number) {
    super()

    deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Number} deltaAngleX
   * @param {Number} deltaAngleY
   * @return {Boolean}
   */
  initWithDuration(duration: number, deltaAngleX: number, deltaAngleY?: number): boolean {
    if (super.initWithDuration(duration)) {
      this._dstAngleX = deltaAngleX || 0
      this._dstAngleY = deltaAngleY !== undefined ? deltaAngleY : this._dstAngleX
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {RotateTo}
   */
  clone(): RotateTo {
    const action = new RotateTo()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._dstAngleX, this._dstAngleY)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)

    // Calculate X
    const locStartAngleX = target.rotationX % 360.0
    let locDiffAngleX = this._dstAngleX - locStartAngleX
    if (locDiffAngleX > 180) locDiffAngleX -= 360
    if (locDiffAngleX < -180) locDiffAngleX += 360
    this._startAngleX = locStartAngleX
    this._diffAngleX = locDiffAngleX

    // Calculate Y  It's duplicated from calculating X since the rotation wrap should be the same
    this._startAngleY = target.rotationY % 360.0
    let locDiffAngleY = this._dstAngleY - this._startAngleY
    if (locDiffAngleY > 180) locDiffAngleY -= 360
    if (locDiffAngleY < -180) locDiffAngleY += 360
    this._diffAngleY = locDiffAngleY
  }

  /**
   * RotateTo reverse not implemented.
   * Will be overridden.
   * @returns {Action}
   */
  reverse(): any {
    log('RotateTo.reverse(): it should be overridden in subclass.')
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number}  dt
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    if (this.target) {
      this.target.setRotationX(this._startAngleX + this._diffAngleX * dt)
      this.target.setRotationY(this._startAngleY + this._diffAngleY * dt)
    }
  }
}

/**
 * Creates a RotateTo action with separate rotation angles.
 * To specify the angle of rotation.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees.
 * @param {Number} [deltaAngleY] deltaAngleY in degrees.
 * @return {RotateTo}
 * @example
 * // example
 * var rotateTo = rotateTo(2, 61.0);
 */
export const rotateTo = function (duration: number, deltaAngleX: number, deltaAngleY?: number) {
  return new RotateTo(duration, deltaAngleX, deltaAngleY)
}

/**
 * Rotates a Node object clockwise a number of degrees by modifying it's rotation attribute.
 * Relative to its properties to modify.
 * @class
 * @extends  ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees
 * @param {Number} [deltaAngleY] deltaAngleY in degrees
 * @example
 * var actionBy = new RotateBy(2, 360);
 */
export class RotateBy extends ActionInterval {
  _angleX = 0
  _startAngleX = 0
  _angleY = 0
  _startAngleY = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration duration in seconds
   * @param {Number} deltaAngleX deltaAngleX in degrees
   * @param {Number} [deltaAngleY] deltaAngleY in degrees
   */
  constructor(duration?: number, deltaAngleX?: number, deltaAngleY?: number) {
    super()

    deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY)
  }

  /**
   * Initializes the action.
   * @param {Number} duration duration in seconds
   * @param {Number} deltaAngleX deltaAngleX in degrees
   * @param {Number} [deltaAngleY=] deltaAngleY in degrees
   * @return {Boolean}
   */
  initWithDuration(duration: number, deltaAngleX: number, deltaAngleY?: number): boolean {
    if (super.initWithDuration(duration)) {
      this._angleX = deltaAngleX || 0
      this._angleY = deltaAngleY || this._angleX
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {RotateBy}
   */
  clone(): RotateBy {
    const action = new RotateBy()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._angleX, this._angleY)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._startAngleX = target.rotationX
    this._startAngleY = target.rotationY
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number}  dt
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    if (this.target) {
      this.target.setRotationX(this._startAngleX + this._angleX * dt)
      this.target.setRotationY(this._startAngleY + this._angleY * dt)
    }
  }

  /**
   * Returns a reversed action.
   * @return {RotateBy}
   */
  reverse(): RotateBy {
    const action = new RotateBy(this._duration, -this._angleX, -this._angleY)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }
}

/**
 * Rotates a Node object clockwise a number of degrees by modifying it's rotation attribute.
 * Relative to its properties to modify.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Number} deltaAngleX deltaAngleX in degrees
 * @param {Number} [deltaAngleY] deltaAngleY in degrees
 * @return {RotateBy}
 * @example
 * // example
 * var actionBy = rotateBy(2, 360);
 */
export const rotateBy = function (duration: number, deltaAngleX: number, deltaAngleY?: number) {
  return new RotateBy(duration, deltaAngleX, deltaAngleY)
}
