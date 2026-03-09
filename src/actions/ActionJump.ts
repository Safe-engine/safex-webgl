import { p } from '../core/cocoa/Geometry'
import { ENABLE_STACKABLE_ACTIONS } from '../core/platform/Config'
import { ActionInterval } from './ActionInterval'

/**
 * Moves a Node object simulating a parabolic jump movement by modifying it's position attribute.
 * Relative to its movement.
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionBy = new JumpBy(2, p(300, 0), 50, 4);
 * var actionBy = new JumpBy(2, 300, 0, 50, 4);
 */
export class JumpBy extends ActionInterval {
  _startPosition: any = p(0, 0)
  _delta: any = p(0, 0)
  _height = 0
  _jumps = 0
  _previousPosition: any = p(0, 0)

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Point|Number} position
   * @param {Number} [y]
   * @param {Number} height
   * @param {Number} jumps
   */
  constructor(duration?: number, position?: any, y?: number, height?: number, jumps?: number) {
    super()
    this._startPosition = p(0, 0)
    this._previousPosition = p(0, 0)
    this._delta = p(0, 0)

    height !== undefined && this.initWithDuration(duration, position, y, height, jumps)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Point|Number} position
   * @param {Number} [y]
   * @param {Number} height
   * @param {Number} jumps
   * @return {Boolean}
   * @example
   * actionBy.initWithDuration(2, p(300, 0), 50, 4);
   * actionBy.initWithDuration(2, 300, 0, 50, 4);
   */
  initWithDuration(duration: number, position: any, y?: number, height?: number, jumps?: number): boolean {
    if (super.initWithDuration(duration)) {
      if (jumps === undefined) {
        jumps = height
        height = y
        y = position.y
        position = position.x
      }
      this._delta.x = position
      this._delta.y = y
      this._height = height
      this._jumps = jumps
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {JumpBy}
   */
  clone(): JumpBy {
    const action = new JumpBy()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._delta, this._height, this._jumps)
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    const locPosX = target.getPositionX()
    const locPosY = target.getPositionY()
    this._previousPosition.x = locPosX
    this._previousPosition.y = locPosY
    this._startPosition.x = locPosX
    this._startPosition.y = locPosY
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt
   */
  update(dt: number): void {
    dt = this._computeEaseTime(dt)
    if (this.target) {
      const frac = (dt * this._jumps) % 1.0
      let y = this._height * 4 * frac * (1 - frac)
      y += this._delta.y * dt

      let x = this._delta.x * dt
      const locStartPosition = this._startPosition
      if (ENABLE_STACKABLE_ACTIONS) {
        const targetX = this.target.getPositionX()
        const targetY = this.target.getPositionY()
        const locPreviousPosition = this._previousPosition

        locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x
        locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y
        x = x + locStartPosition.x
        y = y + locStartPosition.y
        locPreviousPosition.x = x
        locPreviousPosition.y = y
        this.target.setPosition(x, y)
      } else {
        this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y)
      }
    }
  }

  /**
   * Returns a reversed action.
   * @return {JumpBy}
   */
  reverse(): JumpBy {
    const action = new JumpBy(this._duration, p(-this._delta.x, -this._delta.y), this._height, this._jumps)
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }
}

/**
 * Moves a Node object simulating a parabolic jump movement by modifying it's position attribute.
 * Relative to its movement.
 * @function
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpBy}
 * @example
 * // example
 * var actionBy = jumpBy(2, p(300, 0), 50, 4);
 * var actionBy = jumpBy(2, 300, 0, 50, 4);
 */
export const jumpBy = function (duration, position, y, height, jumps) {
  return new JumpBy(duration, position, y, height, jumps)
}

/**
 * Moves a Node object to a parabolic position simulating a jump movement by modifying it's position attribute. <br />
 * Jump to the specified location.
 * @class
 * @extends JumpBy
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionTo = new JumpTo(2, p(300, 0), 50, 4);
 * var actionTo = new JumpTo(2, 300, 0, 50, 4);
 */
export class JumpTo extends JumpBy {
  _endPosition: any = p(0, 0)

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Point|Number} position
   * @param {Number} [y]
   * @param {Number} height
   * @param {Number} jumps
   */
  constructor(duration?: number, position?: any, y?: number, height?: number, jumps?: number) {
    super()
    this._endPosition = p(0, 0)

    height !== undefined && this.initWithDuration(duration, position, y, height, jumps)
  }

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Point|Number} position
   * @param {Number} [y]
   * @param {Number} height
   * @param {Number} jumps
   * @return {Boolean}
   * @example
   * actionTo.initWithDuration(2, p(300, 0), 50, 4);
   * actionTo.initWithDuration(2, 300, 0, 50, 4);
   */
  initWithDuration(duration: number, position: any, y?: number, height?: number, jumps?: number): boolean {
    if (super.initWithDuration(duration, position, y, height, jumps)) {
      if (jumps === undefined) {
        y = position.y
        position = position.x
      }
      this._endPosition.x = position
      this._endPosition.y = y
      return true
    }
    return false
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._delta.x = this._endPosition.x - this._startPosition.x
    this._delta.y = this._endPosition.y - this._startPosition.y
  }

  /**
   * returns a new clone of the action
   * @returns {JumpTo}
   */
  clone(): JumpTo {
    const action = new JumpTo()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._endPosition, this._height, this._jumps)
    return action
  }
}

/**
 * Moves a Node object to a parabolic position simulating a jump movement by modifying it's position attribute. <br />
 * Jump to the specified location.
 * @function
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpTo}
 * @example
 * // example
 * var actionTo = jumpTo(2, p(300, 300), 50, 4);
 * var actionTo = jumpTo(2, 300, 300, 50, 4);
 */
export const jumpTo = function (duration, position, y, height, jumps) {
  return new JumpTo(duration, position, y, height, jumps)
}
