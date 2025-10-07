
/**
 * <p>The main namespace of Cocos2d-html5's math library,                                    <br/>
 *  all math core classes, functions, properties and constants are defined in this namespace</p>
 * @namespace
 * @name math
 */
export namespace math {
  export const EPSILON = 1.0 / 64.0         //kmEpsilon

  /**
   * Returns the square of s (e.g. s*s)
   * @param {Number} s
   */
  export const square = function (s) {
    return s * s
  }

  export const almostEqual = function (lhs, rhs) {
    return (lhs + math.EPSILON > rhs && lhs - math.EPSILON < rhs)
  }

}

//kmPIOver180 = 0.017453;       please use RAD

//kmPIUnder180 = 57.295779;     please use DEG

