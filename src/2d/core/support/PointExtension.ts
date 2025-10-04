/**
 * <p>Point extensions based on Chipmunk's cpVect file.<br />
 * These extensions work both with Point</p>
 *
 * <p>The "ccp" prefix means: "CoCos2d Point"</p>
 *
 * <p> //Examples:<br />
 * - pAdd( p(1,1), p(2,2) ); // preferred cocos2d way<br />
 * - pAdd( p(1,1), p(2,2) ); // also ok but more verbose<br />
 * - pAdd( cpv(1,1), cpv(2,2) ); // mixing chipmunk and cocos2d (avoid)</p>
 */

import { p } from "../cocoa/Geometry";

/**
 * smallest such that 1.0+FLT_EPSILON != 1.0
 * @constant
 * @type Number
 */
export const POINT_EPSILON = parseFloat('1.192092896e-07F');

/**
 * Returns opposite of point.
 * @param {Point} point
 * @return {Point}
 */
export const pNeg = function (point) {
    return p(-point.x, -point.y);
};

/**
 * Calculates sum of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export const pAdd = function (v1, v2) {
    return p(v1.x + v2.x, v1.y + v2.y);
};

/**
 * Calculates difference of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export const pSub = function (v1, v2) {
    return p(v1.x - v2.x, v1.y - v2.y);
};

/**
 * Returns point multiplied by given factor.
 * @param {Point} point
 * @param {Number} floatVar
 * @return {Point}
 */
export const pMult = function (point, floatVar) {
    return p(point.x * floatVar, point.y * floatVar);
};

/**
 * Calculates midpoint between two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export const pMidpoint = function (v1, v2) {
    return pMult(pAdd(v1, v2), 0.5);
};

/**
 * Calculates dot product of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export const pDot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * Calculates cross product of two points.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export const pCross = function (v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
};

/**
 * Calculates perpendicular of v, rotated 90 degrees counter-clockwise -- cross(v, perp(v)) >= 0
 * @param {Point} point
 * @return {Point}
 */
export const pPerp = function (point) {
    return p(-point.y, point.x);
};

/**
 * Calculates perpendicular of v, rotated 90 degrees clockwise -- cross(v, rperp(v)) <= 0
 * @param {Point} point
 * @return {Point}
 */
export const pRPerp = function (point) {
    return p(point.y, -point.x);
};

/**
 * Calculates the projection of v1 over v2.
 * @param {Point} v1
 * @param {Point} v2
 * @return {Point}
 */
export const pProject = function (v1, v2) {
    return pMult(v2, pDot(v1, v2) / pDot(v2, v2));
};

/**
 * Rotates two points.
 * @param  {Point} v1
 * @param  {Point} v2
 * @return {Point}
 */
export const pRotate = function (v1, v2) {
    return p(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
};

/**
 * Unrotates two points.
 * @param  {Point} v1
 * @param  {Point} v2
 * @return {Point}
 */
export const pUnrotate = function (v1, v2) {
    return p(v1.x * v2.x + v1.y * v2.y, v1.y * v2.x - v1.x * v2.y);
};

/**
 * Calculates the square length of a Point (not calling sqrt() )
 * @param  {Point} v
 *@return {Number}
 */
export const pLengthSQ = function (v) {
    return  pDot(v, v);
};

/**
 * Calculates the square distance between two points (not calling sqrt() )
 * @param {Point} point1
 * @param {Point} point2
 * @return {Number}
 */
export const pDistanceSQ = function(point1, point2){
    return pLengthSQ(pSub(point1,point2));
};

/**
 * Calculates distance between point an origin
 * @param  {Point} v
 * @return {Number}
 */
export const pLength = function (v) {
    return Math.sqrt(pLengthSQ(v));
};

/**
 * Calculates the distance between two points
 * @param {Point} v1
 * @param {Point} v2
 * @return {Number}
 */
export const pDistance = function (v1, v2) {
    return pLength(pSub(v1, v2));
};

/**
 * Returns point multiplied to a length of 1.
 * @param {Point} v
 * @return {Point}
 */
export const pNormalize = function (v) {
    var n = pLength(v);
    return n === 0 ? p(v) : pMult(v, 1.0 / n);
};

/**
 * Converts radians to a normalized vector.
 * @param {Number} a
 * @return {Point}
 */
export const pForAngle = function (a) {
    return p(Math.cos(a), Math.sin(a));
};

/**
 * Converts a vector to radians.
 * @param {Point} v
 * @return {Number}
 */
export const pToAngle = function (v) {
    return Math.atan2(v.y, v.x);
};

/**
 * Clamp a value between from and to.
 * @param {Number} value
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {Number}
 */
export const clampf = function (value, min_inclusive, max_inclusive) {
    if (min_inclusive > max_inclusive) {
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
};

/**
 * Clamp a point between from and to.
 * @param {Point} p
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {Point}
 */
export const pClamp = function (p, min_inclusive, max_inclusive) {
    return p(clampf(p.x, min_inclusive.x, max_inclusive.x), clampf(p.y, min_inclusive.y, max_inclusive.y));
};

/**
 * Quickly convert Size to a Point
 * @param {Size} s
 * @return {Point}
 */
export const pFromSize = function (s) {
    return p(s.width, s.height);
};

/**
 * Run a math operation function on each point component <br />
 * Math.abs, Math.fllor, Math.ceil, Math.round.
 * @param {Point} p
 * @param {Function} opFunc
 * @return {Point}
 * @example
 * //For example: let's try to take the floor of x,y
 * var p = pCompOp(p(10,10),Math.abs);
 */
export const pCompOp = function (p, opFunc) {
    return p(opFunc(p.x), opFunc(p.y));
};

/**
 * Linear Interpolation between two points a and b
 * alpha == 0 ? a
 * alpha == 1 ? b
 * otherwise a value between a..b
 * @param {Point} a
 * @param {Point} b
 * @param {Number} alpha
 * @return {Point}
 */
export const pLerp = function (a, b, alpha) {
    return pAdd(pMult(a, 1 - alpha), pMult(b, alpha));
};

/**
 * @param {Point} a
 * @param {Point} b
 * @param {Number} variance
 * @return {Boolean} if points have fuzzy equality which means equal with some degree of variance.
 */
export const pFuzzyEqual = function (a, b, variance) {
    if (a.x - variance <= b.x && b.x <= a.x + variance) {
        if (a.y - variance <= b.y && b.y <= a.y + variance)
            return true;
    }
    return false;
};

/**
 * Multiplies a nd b components, a.x*b.x, a.y*b.y
 * @param {Point} a
 * @param {Point} b
 * @return {Point}
 */
export const pCompMult = function (a, b) {
    return p(a.x * b.x, a.y * b.y);
};

/**
 * @param {Point} a
 * @param {Point} b
 * @return {Number} the signed angle in radians between two vector directions
 */
export const pAngleSigned = function (a, b) {
    var a2 = pNormalize(a);
    var b2 = pNormalize(b);
    var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, pDot(a2, b2));
    if (Math.abs(angle) < POINT_EPSILON)
        return 0.0;
    return angle;
};

/**
 * @param {Point} a
 * @param {Point} b
 * @return {Number} the angle in radians between two vector directions
 */
export const pAngle = function (a, b) {
    var angle = Math.acos(pDot(pNormalize(a), pNormalize(b)));
    if (Math.abs(angle) < POINT_EPSILON) return 0.0;
    return angle;
};

/**
 * Rotates a point counter clockwise by the angle around a pivot
 * @param {Point} v v is the point to rotate
 * @param {Point} pivot pivot is the pivot, naturally
 * @param {Number} angle angle is the angle of rotation cw in radians
 * @return {Point} the rotated point
 */
export const pRotateByAngle = function (v, pivot, angle) {
    var r = pSub(v, pivot);
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    var t = r.x;
    r.x = t * cosa - r.y * sina + pivot.x;
    r.y = t * sina + r.y * cosa + pivot.y;
    return r;
};

/**
 * A general line-line intersection test
 * indicating successful intersection of a line<br />
 * note that to truly test intersection for segments we have to make<br />
 * sure that s & t lie within [0..1] and for rays, make sure s & t > 0<br />
 * the hit point is        p3 + t * (p4 - p3);<br />
 * the hit point also is    p1 + s * (p2 - p1);
 * @param {Point} A A is the startpoint for the first line P1 = (p1 - p2).
 * @param {Point} B B is the endpoint for the first line P1 = (p1 - p2).
 * @param {Point} C C is the startpoint for the second line P2 = (p3 - p4).
 * @param {Point} D D is the endpoint for the second line P2 = (p3 - p4).
 * @param {Point} retP retP.x is the range for a hitpoint in P1 (pa = p1 + s*(p2 - p1)), <br />
 * retP.y is the range for a hitpoint in P3 (pa = p2 + t*(p4 - p3)).
 * @return {Boolean}
 */
export const pLineIntersect = function (A, B, C, D, retP) {
    if ((A.x === B.x && A.y === B.y) || (C.x === D.x && C.y === D.y)) {
        return false;
    }
    var BAx = B.x - A.x;
    var BAy = B.y - A.y;
    var DCx = D.x - C.x;
    var DCy = D.y - C.y;
    var ACx = A.x - C.x;
    var ACy = A.y - C.y;

    var denom = DCy * BAx - DCx * BAy;

    retP.x = DCx * ACy - DCy * ACx;
    retP.y = BAx * ACy - BAy * ACx;

    if (denom === 0) {
        if (retP.x === 0 || retP.y === 0) {
            // Lines incident
            return true;
        }
        // Lines parallel and not incident
        return false;
    }

    retP.x = retP.x / denom;
    retP.y = retP.y / denom;

    return true;
};

/**
 * ccpSegmentIntersect return YES if Segment A-B intersects with segment C-D.
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 * @return {Boolean}
 */
export const pSegmentIntersect = function (A, B, C, D) {
    var retP = p(0, 0);
    if (pLineIntersect(A, B, C, D, retP))
        if (retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0 && retP.y <= 1.0)
            return true;
    return false;
};

/**
 * ccpIntersectPoint return the intersection point of line A-B, C-D
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 * @return {Point}
 */
export const pIntersectPoint = function (A, B, C, D) {
    var retP = p(0, 0);

    if (pLineIntersect(A, B, C, D, retP)) {
        // Point of intersection
        var P = p(0, 0);
        P.x = A.x + retP.x * (B.x - A.x);
        P.y = A.y + retP.x * (B.y - A.y);
        return P;
    }

    return p(0,0);
};

/**
 * check to see if both points are equal
 * @param {Point} A A ccp a
 * @param {Point} B B ccp b to be compared
 * @return {Boolean} the true if both ccp are same
 */
export const pSameAs = function (A, B) {
    if ((A != null) && (B != null)) {
        return (A.x === B.x && A.y === B.y);
    }
    return false;
};



// High Performance In Place Operationrs ---------------------------------------

/**
 * sets the position of the point to 0
 * @param {Point} v
 */
export const pZeroIn = function(v) {
    v.x = 0;
    v.y = 0;
};

/**
 * copies the position of one point to another
 * @param {Point} v1
 * @param {Point} v2
 */
export const pIn = function(v1, v2) {
    v1.x = v2.x;
    v1.y = v2.y;
};

/**
 * multiplies the point with the given factor (inplace)
 * @param {Point} point
 * @param {Number} floatVar
 */
export const pMultIn = function(point, floatVar) {
    point.x *= floatVar;
    point.y *= floatVar;
};

/**
 * subtracts one point from another (inplace)
 * @param {Point} v1
 * @param {Point} v2
 */
export const pSubIn = function(v1, v2) {
    v1.x -= v2.x;
    v1.y -= v2.y;
};

/**
 * adds one point to another (inplace)
 * @param {Point} v1
 * @param {Point} v2
 */
export const pAddIn = function(v1, v2) {
    v1.x += v2.x;
    v1.y += v2.y;
};

/**
 * normalizes the point (inplace)
 * @param {Point} v
 */
export const pNormalizeIn = function(v) {
    var n = Math.sqrt(v.x * v.x + v.y * v.y);
    if (n !== 0)
        pMultIn(v, 1.0 / n);
};
