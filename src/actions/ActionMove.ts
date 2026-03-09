import { p } from '../core/cocoa/Geometry'
import { ENABLE_STACKABLE_ACTIONS } from '../core/platform/Config'
import { ActionInterval } from './ActionInterval'

/**
 * <p>
 *     Moves a CCNode object x,y pixels by modifying it's position attribute.                                  <br/>
 *     x and y are relative to the position of the object.                                                     <br/>
 *     Several CCMoveBy actions can be concurrently called, and the resulting                                  <br/>
 *     movement will be the sum of individual movements.
 * </p>
 * @class
 * @extends ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Point|Number} deltaPos
 * @param {Number} [deltaY]
 * @example
 * var actionBy = moveBy(2, p(windowSize.width - 40, windowSize.height - 40));
 */
export class MoveBy extends ActionInterval {
  _positionDelta
  _startPosition
  _previousPosition

  constructor(duration?, deltaPos?, deltaY?) {
    super()
    this._positionDelta = p(0, 0)
    this._startPosition = p(0, 0)
    this._previousPosition = p(0, 0)

    if (deltaPos !== undefined) {
      this.initWithDuration(duration, deltaPos, deltaY)
    }
  }

  initWithDuration(duration, position?, y?) {
    if (super.initWithDuration(duration)) {
      if (position.x !== undefined) {
        y = position.y
        position = position.x
      }

      this._positionDelta.x = position
      this._positionDelta.y = y
      return true
    }
    return false
  }

  clone() {
    const action = new MoveBy()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._positionDelta)
    return action
  }

  startWithTarget(target) {
    super.startWithTarget(target)
    const locPosX = target.getPositionX()
    const locPosY = target.getPositionY()
    this._previousPosition.x = locPosX
    this._previousPosition.y = locPosY
    this._startPosition.x = locPosX
    this._startPosition.y = locPosY
  }

  update(dt) {
    dt = this._computeEaseTime(dt)
    if (this.target) {
      let x = this._positionDelta.x * dt
      let y = this._positionDelta.y * dt
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

  reverse() {
    const action = new MoveBy(this._duration, p(-this._positionDelta.x, -this._positionDelta.y))
    this._cloneDecoration(action)
    this._reverseEaseList(action)
    return action
  }

  static create(duration, deltaPos, deltaY) {
    return new MoveBy(duration, deltaPos, deltaY)
  }
}

/**
 * Create the action.
 * Relative to its coordinate moves a certain distance.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {MoveBy}
 * @example
 * // example
 * var actionBy = moveBy(2, p(windowSize.width - 40, windowSize.height - 40));
 */
export function moveBy(duration, deltaPos, deltaY?) {
  return new MoveBy(duration, deltaPos, deltaY)
}

// backward compatibility alias
MoveBy.create = moveBy

/**
 * Moves a CCNode object to the position x,y. x and y are absolute coordinates by modifying it's position attribute. <br/>
 * Several CCMoveTo actions can be concurrently called, and the resulting                                            <br/>
 * movement will be the sum of individual movements.
 * @class
 * @extends MoveBy
 * @param {Number} duration duration in seconds
 * @param {Point|Number} position
 * @param {Number} y
 * @example
 * var actionTo = new MoveTo(2, p(80, 80));
 */
export class MoveTo extends MoveBy {
  _endPosition

  constructor(duration?, position?, y?) {
    super()
    this._endPosition = p(0, 0)

    if (position !== undefined) {
      this.initWithDuration(duration, position, y)
    }
  }

  initWithDuration(duration, position?, y?) {
    if (super.initWithDuration(duration, position, y)) {
      if (position.x !== undefined) {
        y = position.y
        position = position.x
      }

      this._endPosition.x = position
      this._endPosition.y = y
      return true
    }
    return false
  }

  clone() {
    const action = new MoveTo()
    this._cloneDecoration(action)
    action.initWithDuration(this._duration, this._endPosition)
    return action
  }

  startWithTarget(target) {
    super.startWithTarget(target)
    this._positionDelta.x = this._endPosition.x - target.getPositionX()
    this._positionDelta.y = this._endPosition.y - target.getPositionY()
  }

  static create(duration, position, y) {
    return new MoveTo(duration, position, y)
  }
}

/**
 * Create new action.
 * Moving to the specified coordinates.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Point|Number} position
 * @param {Number} y
 * @return {MoveTo}
 * @example
 * // example
 * var actionTo = moveTo(2, p(80, 80));
 */
export function moveTo(duration, position, y?) {
  return new MoveTo(duration, position, y)
}

// backward compatibility alias
MoveTo.create = moveTo
