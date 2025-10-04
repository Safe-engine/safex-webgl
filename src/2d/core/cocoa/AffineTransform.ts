import { rectGetMaxX, rectGetMaxY, rectGetMinX, rectGetMinY } from "./Geometry";

/**
 * <p>AffineTransform class represent an affine transform matrix. It's composed basically by translation, rotation, scale transformations.<br/>
 * Please do not use its constructor directly, use affineTransformMake alias function instead.
 * </p>
 * @class AffineTransform
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @see affineTransformMake
 */
export const AffineTransform = function (a, b, c, d, tx, ty) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;
  this.tx = tx;
  this.ty = ty;
};

/**
 * Create a AffineTransform object with all contents in the matrix
 * @function
 *
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @return {AffineTransform}
 */
export const affineTransformMake = function (a, b, c, d, tx, ty) {
  return { a: a, b: b, c: c, d: d, tx: tx, ty: ty };
};

/**
 * Apply the affine transformation on a point.
 * @function
 *
 * @param {Point|Number} point or x
 * @param {AffineTransform|Number} transOrY transform matrix or y
 * @param {AffineTransform} t transform matrix or y
 * @return {Point}
 */
export const pointApplyAffineTransform = function (point, transOrY, t) {
  var x, y;
  if (t === undefined) {
    t = transOrY;
    x = point.x;
    y = point.y;
  } else {
    x = point;
    y = transOrY;
  }
  return { x: t.a * x + t.c * y + t.tx, y: t.b * x + t.d * y + t.ty };
};

export const _pointApplyAffineTransform = function (x, y, t) {   //it will remove.
  return pointApplyAffineTransform(x, y, t);
};

/**
 * Apply the affine transformation on a size.
 * @function
 *
 * @param {Size} size
 * @param {AffineTransform} t
 * @return {Size}
 */
export const sizeApplyAffineTransform = function (size, t) {
  return { width: t.a * size.width + t.c * size.height, height: t.b * size.width + t.d * size.height };
};

/**
 * <p>Create a identity transformation matrix: <br/>
 * [ 1, 0, 0, <br/>
 *   0, 1, 0 ]</p>
 * @function
 *
 * @return {AffineTransform}
 */
export const affineTransformMakeIdentity = function () {
  return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
};

/**
 * <p>Create a identity transformation matrix: <br/>
 * [ 1, 0, 0, <br/>
 *   0, 1, 0 ]</p>
 * @function
 *
 * @return {AffineTransform}
 * @deprecated since v3.0, please use affineTransformMakeIdentity() instead
 * @see affineTransformMakeIdentity
 */
export const affineTransformIdentity = function () {
  return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0 };
};

/**
 * Apply the affine transformation on a rect.
 * @function
 *
 * @param {Rect} rect
 * @param {AffineTransform} anAffineTransform
 * @return {Rect}
 */
export const rectApplyAffineTransform = function (rect, anAffineTransform) {
  var top = rectGetMinY(rect);
  var left = rectGetMinX(rect);
  var right = rectGetMaxX(rect);
  var bottom = rectGetMaxY(rect);

  var topLeft = pointApplyAffineTransform(left, top, anAffineTransform);
  var topRight = pointApplyAffineTransform(right, top, anAffineTransform);
  var bottomLeft = pointApplyAffineTransform(left, bottom, anAffineTransform);
  var bottomRight = pointApplyAffineTransform(right, bottom, anAffineTransform);

  var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
  var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
  var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
  var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

  return rect(minX, minY, (maxX - minX), (maxY - minY));
};

export const _rectApplyAffineTransformIn = function (rect, anAffineTransform) {
  var top = rectGetMinY(rect);
  var left = rectGetMinX(rect);
  var right = rectGetMaxX(rect);
  var bottom = rectGetMaxY(rect);

  var topLeft = pointApplyAffineTransform(left, top, anAffineTransform);
  var topRight = pointApplyAffineTransform(right, top, anAffineTransform);
  var bottomLeft = pointApplyAffineTransform(left, bottom, anAffineTransform);
  var bottomRight = pointApplyAffineTransform(right, bottom, anAffineTransform);

  var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
  var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
  var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
  var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

  rect.x = minX;
  rect.y = minY;
  rect.width = maxX - minX;
  rect.height = maxY - minY;
  return rect;
};

/**
 * Create a new affine transformation with a base transformation matrix and a translation based on it.
 * @function
 *
 * @param {AffineTransform} t The base affine transform object
 * @param {Number} tx The translation on x axis
 * @param {Number} ty The translation on y axis
 * @return {AffineTransform}
 */
export const affineTransformTranslate = function (t, tx, ty) {
  return {
    a: t.a,
    b: t.b,
    c: t.c,
    d: t.d,
    tx: t.tx + t.a * tx + t.c * ty,
    ty: t.ty + t.b * tx + t.d * ty
  };
};

/**
 * Create a new affine transformation with a base transformation matrix and a scale based on it.
 * @function
 * @param {AffineTransform} t The base affine transform object
 * @param {Number} sx The scale on x axis
 * @param {Number} sy The scale on y axis
 * @return {AffineTransform}
 */
export const affineTransformScale = function (t, sx, sy) {
  return { a: t.a * sx, b: t.b * sx, c: t.c * sy, d: t.d * sy, tx: t.tx, ty: t.ty };
};

/**
 * Create a new affine transformation with a base transformation matrix and a rotation based on it.
 * @function
 * @param {AffineTransform} aTransform The base affine transform object
 * @param {Number} anAngle  The angle to rotate
 * @return {AffineTransform}
 */
export const affineTransformRotate = function (aTransform, anAngle) {
  var fSin = Math.sin(anAngle);
  var fCos = Math.cos(anAngle);

  return {
    a: aTransform.a * fCos + aTransform.c * fSin,
    b: aTransform.b * fCos + aTransform.d * fSin,
    c: aTransform.c * fCos - aTransform.a * fSin,
    d: aTransform.d * fCos - aTransform.b * fSin,
    tx: aTransform.tx,
    ty: aTransform.ty
  };
};

/**
 * Concatenate a transform matrix to another and return the result:<br/>
 * t' = t1 * t2
 * @function
 * @param {AffineTransform} t1 The first transform object
 * @param {AffineTransform} t2 The transform object to concatenate
 * @return {AffineTransform} The result of concatenation
 */
export const affineTransformConcat = function (t1, t2) {
  return {
    a: t1.a * t2.a + t1.b * t2.c,                          //a
    b: t1.a * t2.b + t1.b * t2.d,                               //b
    c: t1.c * t2.a + t1.d * t2.c,                               //c
    d: t1.c * t2.b + t1.d * t2.d,                               //d
    tx: t1.tx * t2.a + t1.ty * t2.c + t2.tx,                    //tx
    ty: t1.tx * t2.b + t1.ty * t2.d + t2.ty
  };				    //ty
};

/**
 * Concatenate a transform matrix to another<br/>
 * The results are reflected in the first matrix.<br/>
 * t' = t1 * t2
 * @function
 * @param {AffineTransform} t1 The first transform object
 * @param {AffineTransform} t2 The transform object to concatenate
 * @return {AffineTransform} The result of concatenation
 */
export const affineTransformConcatIn = function (t1, t2) {
  var a = t1.a, b = t1.b, c = t1.c, d = t1.d, tx = t1.tx, ty = t1.ty;
  t1.a = a * t2.a + b * t2.c;
  t1.b = a * t2.b + b * t2.d;
  t1.c = c * t2.a + d * t2.c;
  t1.d = c * t2.b + d * t2.d;
  t1.tx = tx * t2.a + ty * t2.c + t2.tx;
  t1.ty = tx * t2.b + ty * t2.d + t2.ty;
  return t1;
};

/**
 * Return true if an affine transform equals to another, false otherwise.
 * @function
 * @param {AffineTransform} t1
 * @param {AffineTransform} t2
 * @return {Boolean}
 */
export const affineTransformEqualToTransform = function (t1, t2) {
  return ((t1.a === t2.a) && (t1.b === t2.b) && (t1.c === t2.c) && (t1.d === t2.d) && (t1.tx === t2.tx) && (t1.ty === t2.ty));
};

/**
 * Get the invert transform of an AffineTransform object
 * @function
 * @param {AffineTransform} t
 * @return {AffineTransform} The inverted transform object
 */
export const affineTransformInvert = function (t) {
  var determinant = 1 / (t.a * t.d - t.b * t.c);
  return {
    a: determinant * t.d, b: -determinant * t.b, c: -determinant * t.c, d: determinant * t.a,
    tx: determinant * (t.c * t.ty - t.d * t.tx), ty: determinant * (t.b * t.tx - t.a * t.ty)
  };
};

export const affineTransformInvertOut = function (t, out) {
  var a = t.a, b = t.b, c = t.c, d = t.d;
  var determinant = 1 / (a * d - b * c);
  out.a = determinant * d;
  out.b = -determinant * b;
  out.c = -determinant * c;
  out.d = determinant * a;
  out.tx = determinant * (c * t.ty - d * t.tx);
  out.ty = determinant * (b * t.tx - a * t.ty);
};
