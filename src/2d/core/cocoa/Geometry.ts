export class Point {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Helper function that creates a Point.
 *
 * @param x a Number or a size object
 * @param y
 * @return
 * @example
 * var point1 = p();
 * var point2 = p(100, 100);
 * var point3 = p(point2);
 * var point4 = p({x: 100, y: 100});
 */
export function p(x?: number | Point, y?: number): Point {
  if (x === undefined) {
    return new Point();
  }
  if (y === undefined) {
    return new Point((x as Point).x, (x as Point).y);
  }
  return new Point(x as number, y);
}

/**
 * Check whether a point's value equals to another
 *
 * @param point1
 * @param point2
 * @return
 */
export function pointEqualToPoint(point1: Point, point2: Point): boolean {
  return point1 && point2 && (point1.x === point2.x) && (point1.y === point2.y);
}

export class Size {
  width: number;
  height: number;

  constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }
}

/**
 * Helper function that creates a Size.
 *
 * @param w width or a size object
 * @param h height
 * @return
 * @example
 * var size1 = size();
 * var size2 = size(100,100);
 * var size3 = size(size2);
 * var size4 = size({width: 100, height: 100});
 */
export function size(w?: number | Size, h?: number): Size {
  if (w === undefined) {
    return new Size();
  }
  if (h === undefined) {
    return new Size((w as Size).width, (w as Size).height);
  }
  return new Size(w as number, h);
}

/**
 * Check whether a point's value equals to another
 *
 * @param size1
 * @param size2
 * @return
 */
export function sizeEqualToSize(size1: Size, size2: Size): boolean {
  return (size1 && size2 && (size1.width === size2.width) && (size1.height === size2.height));
}

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

/**
 * Helper function that creates a Rect.
 *
 * @param x a number or a rect object
 * @param y
 * @param w
 * @param h
 * @returns
 * @example
 * var rect1 = rect();
 * var rect2 = rect(100,100,100,100);
 * var rect3 = rect(rect2);
 * var rect4 = rect({x: 100, y: 100, width: 100, height: 100});
 */
export function rect(x?: number | Rect, y?: number, w?: number, h?: number): Rect {
  if (x === undefined) {
    return new Rect();
  }
  if (y === undefined) {
    const r = x as Rect;
    return new Rect(r.x, r.y, r.width, r.height);
  }
  return new Rect(x as number, y as number, w as number, h as number);
}

/**
 * Check whether a rect's value equals to another
 *
 * @param rect1
 * @param rect2
 * @return
 */
export function rectEqualToRect(rect1: Rect, rect2: Rect): boolean {
  return rect1 && rect2 && (rect1.x === rect2.x) && (rect1.y === rect2.y) && (rect1.width === rect2.width) && (rect1.height === rect2.height);
}

export function rectEqualToZero(rect: Rect): boolean {
  return rect && (rect.x === 0) && (rect.y === 0) && (rect.width === 0) && (rect.height === 0);
}

/**
 * Check whether the rect1 contains rect2
 *
 * @param rect1
 * @param rect2
 * @return
 */
export function rectContainsRect(rect1: Rect, rect2: Rect): boolean {
  if (!rect1 || !rect2) {
    return false;
  }
  return !((rect1.x >= rect2.x) || (rect1.y >= rect2.y) ||
    (rect1.x + rect1.width <= rect2.x + rect2.width) ||
    (rect1.y + rect1.height <= rect2.y + rect2.height));
}

/**
 * Returns the rightmost x-value of a rect
 *
 * @param rect
 * @return The rightmost x value
 */
export function rectGetMaxX(rect: Rect): number {
  return (rect.x + rect.width);
}

/**
 * Return the midpoint x-value of a rect
 *
 * @param rect
 * @return The midpoint x value
 */
export function rectGetMidX(rect: Rect): number {
  return (rect.x + rect.width / 2.0);
}
/**
 * Returns the leftmost x-value of a rect
 *
 * @param rect
 * @return The leftmost x value
 */
export function rectGetMinX(rect: Rect): number {
  return rect.x;
}

/**
 * Return the topmost y-value of a rect
 *
 * @param rect
 * @return The topmost y value
 */
export function rectGetMaxY(rect: Rect): number {
  return (rect.y + rect.height);
}

/**
 * Return the midpoint y-value of `rect`
 *
 * @param rect
 * @return The midpoint y value
 */
export function rectGetMidY(rect: Rect): number {
  return rect.y + rect.height / 2.0;
}

/**
 * Return the bottommost y-value of a rect
 *
 * @param rect
 * @return The bottommost y value
 */
export function rectGetMinY(rect: Rect): number {
  return rect.y;
}

/**
 * Check whether a rect contains a point
 *
 * @param rect
 * @param point
 * @return
 */
export function rectContainsPoint(rect: Rect, point: Point): boolean {
  return (point.x >= rectGetMinX(rect) && point.x <= rectGetMaxX(rect) &&
    point.y >= rectGetMinY(rect) && point.y <= rectGetMaxY(rect));
}

/**
 * Check whether a rect intersect with another
 *
 * @param rectA
 * @param rectB
 * @return
 */
export function rectIntersectsRect(ra: Rect, rb: Rect): boolean {
  const maxax = ra.x + ra.width;
  const maxay = ra.y + ra.height;
  const maxbx = rb.x + rb.width;
  const maxby = rb.y + rb.height;
  return !(maxax < rb.x || maxbx < ra.x || maxay < rb.y || maxby < ra.y);
}

/**
 * Check whether a rect overlaps another
 *
 * @param rectA
 * @param rectB
 * @return
 */
export function rectOverlapsRect(rectA: Rect, rectB: Rect): boolean {
  return !((rectA.x + rectA.width < rectB.x) ||
    (rectB.x + rectB.width < rectA.x) ||
    (rectA.y + rectA.height < rectB.y) ||
    (rectB.y + rectB.height < rectA.y));
}

/**
 * Returns the smallest rectangle that contains the two source rectangles.
 *
 * @param rectA
 * @param rectB
 * @return
 */
export function rectUnion(rectA: Rect, rectB: Rect): Rect {
  const newRect = rect(0, 0, 0, 0);
  newRect.x = Math.min(rectA.x, rectB.x);
  newRect.y = Math.min(rectA.y, rectB.y);
  newRect.width = Math.max(rectA.x + rectA.width, rectB.x + rectB.width) - newRect.x;
  newRect.height = Math.max(rectA.y + rectA.height, rectB.y + rectB.height) - newRect.y;
  return newRect;
}

/**
 * Returns the overlapping portion of 2 rectangles
 *
 * @param rectA
 * @param rectB
 * @return
 */
export function rectIntersection(rectA: Rect, rectB: Rect): Rect {
  const intersection = rect(
    Math.max(rectGetMinX(rectA), rectGetMinX(rectB)),
    Math.max(rectGetMinY(rectA), rectGetMinY(rectB)),
    0, 0
  );

  intersection.width = Math.min(rectGetMaxX(rectA), rectGetMaxX(rectB)) - rectGetMinX(intersection);
  intersection.height = Math.min(rectGetMaxY(rectA), rectGetMaxY(rectB)) - rectGetMinY(intersection);
  return intersection;
}