import { view } from '../../..';
import { log } from '../../../helper/Debugger';
import { p, Point } from '../cocoa/Geometry';
import { pSub } from '../support/PointExtension';

/**
 * The touch event class
 * @class
 */
export class Touch {
  _lastModified: number = 0;
  _point: Point;
  _prevPoint: Point;
  _id: number = 0;
  _startPointCaptured: boolean = false;
  _startPoint: Point;

  constructor(x?: number, y?: number, id?: number) {
    this.setTouchInfo(id as number, x as number, y as number);
  }

  /** Returns the current touch location in OpenGL coordinates */
  getLocation(): Point {
    return p(this._point.x, this._point.y);
  }

  /** Returns X axis location value */
  getLocationX(): number {
    return this._point.x;
  }

  /** Returns Y axis location value */
  getLocationY(): number {
    return this._point.y;
  }

  /** Returns the previous touch location in OpenGL coordinates */
  getPreviousLocation(): Point {
    return p(this._prevPoint.x, this._prevPoint.y);
  }

  /** Returns the start touch location in OpenGL coordinates */
  getStartLocation(): Point {
    return p(this._startPoint.x, this._startPoint.y);
  }

  /** Returns the delta distance from the previous touch to the current one in screen coordinates */
  getDelta(): Point {
    return pSub(this._point, this._prevPoint);
  }

  /** Returns the current touch location in screen coordinates */
  getLocationInView(): Point {
    return p(this._point.x, this._point.y);
  }

  /** Returns the previous touch location in screen coordinates */
  getPreviousLocationInView(): Point {
    return p(this._prevPoint.x, this._prevPoint.y);
  }

  /** Returns the start touch location in screen coordinates */
  getStartLocationInView(): Point {
    return p(this._startPoint.x, this._startPoint.y);
  }

  /** Returns the id of Touch */
  getID(): number {
    return this._id;
  }

  /** Deprecated: use getID() instead */
  getId(): number {
    log('getId is deprecated. Please use getID instead.');
    return this._id;
  }

  /** Sets information to touch */
  setTouchInfo(id: number, x?: number, y?: number): void {
    this._prevPoint = this._point;
    this._point = p(x || 0, y || 0);
    this._id = id;
    if (!this._startPointCaptured) {
      this._startPoint = p(this._point.x, this._point.y);
      view._convertPointWithScale(this._startPoint);
      this._startPointCaptured = true;
    }
  }

  _setPoint(x: number | Point, y?: number): void {
    if (y === undefined) {
      this._point.x = (x as Point).x;
      this._point.y = (x as Point).y;
    } else {
      this._point.x = x as number;
      this._point.y = y;
    }
  }

  _setPrevPoint(x: number | Point, y?: number): void {
    if (y === undefined) {
      this._prevPoint = p((x as Point).x, (x as Point).y);
    } else {
      this._prevPoint = p((x as number) || 0, y || 0);
    }
  }
}