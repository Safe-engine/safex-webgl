

export const EPSILON = 1.0 / 64.0         //kmEpsilon

/**
 * Returns the square of s (e.g. s*s)
 * @param {Number} s
 */
export const square = function (s) {
  return s * s
}

export const almostEqual = function (lhs, rhs) {
  return (lhs + EPSILON > rhs && lhs - EPSILON < rhs)
}

//kmPIOver180 = 0.017453;       please use RAD

//kmPIUnder180 = 57.295779;     please use DEG

