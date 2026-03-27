import { p, Point } from '../core/cocoa/Geometry'
import { ENABLE_STACKABLE_ACTIONS } from '../core/platform/Config'
import { pSub } from '../core/support/PointExtension'
import { ActionInterval } from './ActionInterval'

/**
 * Returns the Cardinal Spline position for a given set of control points, tension and time. <br />
 * CatmullRom Spline formula. <br />
 * s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
 *
 * @function
 * @param {Point} p0
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @param {Number} tension
 * @param {Number} t
 * @param {Point} [out]
 * @return {Point}
 */
export const cardinalSplineAt = function (p0, p1, p2, p3, tension, t, out?) {
  const t2 = t * t
  const t3 = t2 * t

  /*
   * Formula: s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
   */
  const s = (1 - tension) / 2

  const b1 = s * (-t3 + 2 * t2 - t) // s(-t3 + 2 t2 - t)P1
  const b2 = s * (-t3 + t2) + (2 * t3 - 3 * t2 + 1) // s(-t3 + t2)P2 + (2 t3 - 3 t2 + 1)P2
  const b3 = s * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2) // s(t3 - 2 t2 + t)P3 + (-2 t3 + 3 t2)P3
  const b4 = s * (t3 - t2) // s(t3 - t2)P4

  const x = p0.x * b1 + p1.x * b2 + p2.x * b3 + p3.x * b4
  const y = p0.y * b1 + p1.y * b2 + p2.y * b3 + p3.y * b4
  if (out !== undefined) {
    out.x = x
    out.y = y
  } else {
    return p(x, y)
  }
}

/**
 * returns a new copy of the array reversed.
 *
 * @return {Array}
 */
export const reverseControlPoints = function (controlPoints) {
  const newArray = []
  for (let i = controlPoints.length - 1; i >= 0; i--) {
    newArray.push(p(controlPoints[i].x, controlPoints[i].y))
  }
  return newArray
}

/**
 * returns a new clone of the controlPoints
 *
 * @param controlPoints
 * @returns {Array}
 */
export const cloneControlPoints = function (controlPoints) {
  const newArray = []
  for (let i = 0; i < controlPoints.length; i++) newArray.push(p(controlPoints[i].x, controlPoints[i].y))
  return newArray
}

/**
 * returns a new clone of the controlPoints
 * @deprecated since v3.0 please use cloneControlPoints() instead.
 * @param controlPoints
 * @returns {Array}
 */
export const copyControlPoints = cloneControlPoints

/**
 * returns a point from the array
 *
 * @param {Array} controlPoints
 * @param {Number} pos
 * @return {Array}
 */
export const getControlPointAt = function (controlPoints: Point[], pos: number) {
  const p = Math.min(controlPoints.length - 1, Math.max(pos, 0))
  return controlPoints[p]
}

/**
 * reverse the current control point array inline, without generating a new one <br />
 *
 * @param controlPoints
 */
export const reverseControlPointsInline = function (controlPoints) {
  const len = controlPoints.length
  const mid = 0 | (len / 2)
  for (let i = 0; i < mid; ++i) {
    const temp = controlPoints[i]
    controlPoints[i] = controlPoints[len - i - 1]
    controlPoints[len - i - 1] = temp
  }
}

/**
 * Cardinal Spline path. {@link http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline}
 * Absolute coordinates.
 *
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Array} points array of control points
 * @param {Number} tension
 *
 * @example
 * //create a CardinalSplineTo
 * var action1 = cardinalSplineTo(3, array, 0);
 */
export class CardinalSplineTo extends ActionInterval {
  /** Array of control points */
  declare _points: Point[]
  _deltaT = 0
  _tension = 0
  declare _previousPosition
  declare _accumulatedDiff

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Creates an action with a Cardinal Spline array of points and tension.
   * @param {Number} duration
   * @param {Array} points array of control points
   * @param {Number} tension
   */
  constructor(duration?, points?, tension?) {
    super()
    this._points = []
    if (tension !== undefined) {
      this.initWithDuration(duration, points, tension)
    }
  }

  /**
   * initializes the action with a duration and an array of points
   *
   * @param {Number} duration
   * @param {Array} points array of control points
   * @param {Number} tension
   *
   * @return {Boolean}
   */
  initWithDuration(duration?, points?, tension?) {
    if (!points || points.length === 0) throw new Error('Invalid configuration. It must at least have one control point')

    if (super.initWithDuration(duration)) {
      this.setPoints(points)
      this._tension = tension
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   *
   * @returns {CardinalSplineTo}
   */
  clone() {
    const action = new CardinalSplineTo()
    action.initWithDuration(this._duration, copyControlPoints(this._points), this._tension)
    return action
  }

  /**
   * called before the action start. It will also set the target.
   *
   * @param {Node} target
   */
  startWithTarget(target) {
    super.startWithTarget(target)
    // Issue #1441 from cocos2d-iphone
    this._deltaT = 1 / (this._points.length - 1)
    this._previousPosition = p(this.target.getPositionX(), this.target.getPositionY())
    this._accumulatedDiff = p(0, 0)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number}  dt
   */
  update(dt) {
    dt = this._computeEaseTime(dt)
    let p, lt
    const ps = this._points
    // eg.
    // p..p..p..p..p..p..p
    // 1..2..3..4..5..6..7
    // want p to be 1, 2, 3, 4, 5, 6
    if (dt === 1) {
      p = ps.length - 1
      lt = 1
    } else {
      const locDT = this._deltaT
      p = 0 | (dt / locDT)
      lt = (dt - locDT * p) / locDT
    }

    const newPos = cardinalSplineAt(
      getControlPointAt(ps, p - 1),
      getControlPointAt(ps, p - 0),
      getControlPointAt(ps, p + 1),
      getControlPointAt(ps, p + 2),
      this._tension,
      lt,
    )

    if (ENABLE_STACKABLE_ACTIONS) {
      let tempX, tempY
      tempX = this.target.getPositionX() - this._previousPosition.x
      tempY = this.target.getPositionY() - this._previousPosition.y
      if (tempX !== 0 || tempY !== 0) {
        const locAccDiff = this._accumulatedDiff
        tempX = locAccDiff.x + tempX
        tempY = locAccDiff.y + tempY
        locAccDiff.x = tempX
        locAccDiff.y = tempY
        newPos.x += tempX
        newPos.y += tempY
      }
    }
    this.updatePosition(newPos)
  }

  /**
   * reverse a new CardinalSplineTo. <br />
   * Along the track of movement in the opposite.
   *
   * @return {CardinalSplineTo}
   */
  reverse() {
    const reversePoints = reverseControlPoints(this._points)
    return cardinalSplineTo(this._duration, reversePoints, this._tension)
  }

  /**
   * update position of target
   *
   * @param {Point} newPos
   */
  updatePosition(newPos) {
    this.target.setPosition(newPos)
    this._previousPosition = newPos
  }

  /**
   * Points getter
   *
   * @return {Array}
   */
  getPoints() {
    return this._points
  }

  /**
   * Points setter
   *
   * @param {Array} points
   */
  setPoints(points) {
    this._points = points
  }
}

/**
 * creates an action with a Cardinal Spline array of points and tension.
 *
 * @function
 * @param {Number} duration
 * @param {Array} points array of control points
 * @param {Number} tension
 * @return {CardinalSplineTo}
 *
 * @example
 * //create a CardinalSplineTo
 * var action1 = cardinalSplineTo(3, array, 0);
 */
export const cardinalSplineTo = function (duration, points, tension) {
  return new CardinalSplineTo(duration, points, tension)
}

/**
 * Cardinal Spline path. {@link http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline}
 * Relative coordinates.
 *
 * @class
 * @extends CardinalSplineTo
 * @param {Number} duration
 * @param {Array} points
 * @param {Number} tension
 *
 * @example
 * //create a CardinalSplineBy
 * var action1 = cardinalSplineBy(3, array, 0);
 */
export class CardinalSplineBy extends CardinalSplineTo {
  _startPosition = null

  constructor(duration?, points?, tension?) {
    super()
    this._startPosition = p(0, 0)

    if (tension !== undefined) {
      this.initWithDuration(duration, points, tension)
    }
  }

  startWithTarget(target) {
    super.startWithTarget(target)
    this._startPosition.x = target.getPositionX()
    this._startPosition.y = target.getPositionY()
  }

  reverse() {
    const copyConfig = this._points.slice()
    let current
    //
    // convert "absolutes" to "diffs"
    //
    let p = copyConfig[0]
    for (let i = 1; i < copyConfig.length; ++i) {
      current = copyConfig[i]
      copyConfig[i] = pSub(current, p)
      p = current
    }

    // convert to "diffs" to "reverse absolute"
    const reverseArray = reverseControlPoints(copyConfig)

    // 1st element (which should be 0,0) should be here too
    p = reverseArray[reverseArray.length - 1]
    reverseArray.pop()

    p.x = -p.x
    p.y = -p.y

    reverseArray.unshift(p)
    for (let i = 1; i < reverseArray.length; ++i) {
      current = reverseArray[i]
      current.x = -current.x
      current.y = -current.y
      current.x += p.x
      current.y += p.y
      reverseArray[i] = current
      p = current
    }
    return cardinalSplineBy(this._duration, reverseArray, this._tension)
  }

  updatePosition(newPos) {
    const pos = this._startPosition
    const posX = newPos.x + pos.x
    const posY = newPos.y + pos.y
    this._previousPosition.x = posX
    this._previousPosition.y = posY
    this.target.setPosition(posX, posY)
  }

  clone() {
    const a = new CardinalSplineBy()
    a.initWithDuration(this._duration, copyControlPoints(this._points), this._tension)
    return a
  }
}

/**
 * creates an action with a Cardinal Spline array of points and tension.
 *
 * @function
 * @param {Number} duration
 * @param {Array} points
 * @param {Number} tension
 *
 * @return {CardinalSplineBy}
 */
export const cardinalSplineBy = function (duration, points, tension) {
  return new CardinalSplineBy(duration, points, tension)
}

/**
 * An action that moves the target with a CatmullRom curve to a destination point.<br/>
 * A Catmull Rom is a Cardinal Spline with a tension of 0.5.  <br/>
 * {@link http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline}
 * Absolute coordinates.
 *
 * @class
 * @extends CardinalSplineTo
 * @param {Number} dt
 * @param {Array} points
 *
 * @example
 * var action1 = catmullRomTo(3, array);
 */
export class CatmullRomTo extends CardinalSplineTo {
  constructor(dt?, points?) {
    super()
    if (points) {
      this.initWithDuration(dt, points)
    }
  }

  initWithDuration(dt, points) {
    return super.initWithDuration(dt, points, 0.5)
  }

  clone() {
    const action = new CatmullRomTo()
    action.initWithDuration(this._duration, copyControlPoints(this._points))
    return action
  }
}

/**
 * creates an action with a Cardinal Spline array of points and tension.
 *
 * @function
 * @param {Number} dt
 * @param {Array} points
 * @return {CatmullRomTo}
 *
 * @example
 * var action1 = catmullRomTo(3, array);
 */
export const catmullRomTo = function (dt: number, points: Point[]) {
  return new CatmullRomTo(dt, points)
}

/**
 * An action that moves the target with a CatmullRom curve by a certain distance.  <br/>
 * A Catmull Rom is a Cardinal Spline with a tension of 0.5.<br/>
 * http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 * Relative coordinates.
 *
 * @class
 * @extends CardinalSplineBy
 * @param {Number} dt
 * @param {Array} points
 *
 * @example
 * var action1 = catmullRomBy(3, array);
 */
export class CatmullRomBy extends CardinalSplineBy {
  constructor(dt?, points?) {
    super()
    if (points) {
      this.initWithDuration(dt, points)
    }
  }

  initWithDuration(dt, points) {
    return super.initWithDuration(dt, points, 0.5)
  }

  clone() {
    const action = new CatmullRomBy()
    action.initWithDuration(this._duration, copyControlPoints(this._points))
    return action
  }
}

/**
 * Creates an action with a Cardinal Spline array of points and tension
 * @function
 * @param {Number} dt
 * @param {Array} points
 * @return {CatmullRomBy}
 * @example
 * var action1 = catmullRomBy(3, array);
 */
export const catmullRomBy = function (dt: number, points: Point[]) {
  return new CatmullRomBy(dt, points)
}
