import { log } from '../../helper'
import { degreesToRadians } from '../platform'
import { identityMatrix, Matrix4 } from './mat4'
import { Vec3 } from './vec3'

/** Creates an orthographic projection matrix like glOrtho */
export const kmMat4OrthographicProjection = function (pOut, left, right, bottom, top, nearVal, farVal) {
  pOut.identity()
  pOut.mat[0] = 2 / (right - left)
  pOut.mat[5] = 2 / (top - bottom)
  pOut.mat[10] = -2 / (farVal - nearVal)
  pOut.mat[12] = -((right + left) / (right - left))
  pOut.mat[13] = -((top + bottom) / (top - bottom))
  pOut.mat[14] = -((farVal + nearVal) / (farVal - nearVal))
  return pOut
}

/**
 * Builds a translation matrix in the same way as gluLookAt()
 * the resulting matrix is stored in pOut. pOut is returned.
 */
export const kmMat4LookAt = function (pOut, pEye, pCenter, pUp) {
  const f = new Vec3(pCenter),
    up = new Vec3(pUp)
  f.subtract(pEye)
  f.normalize()
  up.normalize()

  const s = new Vec3(f)
  s.cross(up)
  s.normalize()

  const u = new Vec3(s)
  u.cross(f)
  s.normalize()

  pOut.identity()

  pOut.mat[0] = s.x
  pOut.mat[4] = s.y
  pOut.mat[8] = s.z

  pOut.mat[1] = u.x
  pOut.mat[5] = u.y
  pOut.mat[9] = u.z

  pOut.mat[2] = -f.x
  pOut.mat[6] = -f.y
  pOut.mat[10] = -f.z

  const translate = Matrix4.createByTranslation(-pEye.x, -pEye.y, -pEye.z)
  pOut.multiply(translate)
  return pOut
}

/**
 * Build a rotation matrix from an axis and an angle. Result is stored in pOut.
 * pOut is returned.
 */
export const kmMat4RotationAxisAngle = function (pOut, axis, radians) {
  const rcos = Math.cos(radians),
    rsin = Math.sin(radians)

  const normalizedAxis = new Vec3(axis)
  normalizedAxis.normalize()

  pOut.mat[0] = rcos + normalizedAxis.x * normalizedAxis.x * (1 - rcos)
  pOut.mat[1] = normalizedAxis.z * rsin + normalizedAxis.y * normalizedAxis.x * (1 - rcos)
  pOut.mat[2] = -normalizedAxis.y * rsin + normalizedAxis.z * normalizedAxis.x * (1 - rcos)
  pOut.mat[3] = 0.0

  pOut.mat[4] = -normalizedAxis.z * rsin + normalizedAxis.x * normalizedAxis.y * (1 - rcos)
  pOut.mat[5] = rcos + normalizedAxis.y * normalizedAxis.y * (1 - rcos)
  pOut.mat[6] = normalizedAxis.x * rsin + normalizedAxis.z * normalizedAxis.y * (1 - rcos)
  pOut.mat[7] = 0.0

  pOut.mat[8] = normalizedAxis.y * rsin + normalizedAxis.x * normalizedAxis.z * (1 - rcos)
  pOut.mat[9] = -normalizedAxis.x * rsin + normalizedAxis.y * normalizedAxis.z * (1 - rcos)
  pOut.mat[10] = rcos + normalizedAxis.z * normalizedAxis.z * (1 - rcos)
  pOut.mat[11] = 0.0

  pOut.mat[12] = 0.0
  pOut.mat[13] = 0.0
  pOut.mat[14] = 0.0
  pOut.mat[15] = 1.0

  return pOut
}

/**
 * Sets pOut to an identity matrix returns pOut
 * @param pOut - A pointer to the matrix to set to identity
 * @returns Returns pOut so that the call can be nested
 */
export const kmMat4Identity = function (pOut) {
  const mat = pOut.mat
  mat[1] = mat[2] = mat[3] = mat[4] = mat[6] = mat[7] = mat[8] = mat[9] = mat[11] = mat[12] = mat[13] = mat[14] = 0
  mat[0] = mat[5] = mat[10] = mat[15] = 1.0
  return pOut
}

/**
 * Multiplies pM1 with pM2, stores the result in pOut, returns pOut
 */
export const kmMat4Multiply = function (pOut, pM1, pM2) {
  // Cache the matrix values (makes for huge speed increases!)
  const outArray = pOut.mat,
    mat1 = pM1.mat,
    mat2 = pM2.mat
  const a00 = mat1[0],
    a01 = mat1[1],
    a02 = mat1[2],
    a03 = mat1[3]
  const a10 = mat1[4],
    a11 = mat1[5],
    a12 = mat1[6],
    a13 = mat1[7]
  const a20 = mat1[8],
    a21 = mat1[9],
    a22 = mat1[10],
    a23 = mat1[11]
  const a30 = mat1[12],
    a31 = mat1[13],
    a32 = mat1[14],
    a33 = mat1[15]

  const b00 = mat2[0],
    b01 = mat2[1],
    b02 = mat2[2],
    b03 = mat2[3]
  const b10 = mat2[4],
    b11 = mat2[5],
    b12 = mat2[6],
    b13 = mat2[7]
  const b20 = mat2[8],
    b21 = mat2[9],
    b22 = mat2[10],
    b23 = mat2[11]
  const b30 = mat2[12],
    b31 = mat2[13],
    b32 = mat2[14],
    b33 = mat2[15]

  outArray[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30
  outArray[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31
  outArray[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32
  outArray[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33
  outArray[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30
  outArray[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31
  outArray[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32
  outArray[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33
  outArray[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30
  outArray[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31
  outArray[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32
  outArray[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33
  outArray[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30
  outArray[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31
  outArray[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32
  outArray[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
  return pOut
}

/**
 * Assigns the value of pIn to pOut
 */
export const kmMat4Assign = function (pOut, pIn) {
  if (pOut === pIn) {
    log('kmMat4Assign(): pOut equals pIn')
    return pOut
  }

  const outArr = pOut.mat
  const inArr = pIn.mat

  outArr[0] = inArr[0]
  outArr[1] = inArr[1]
  outArr[2] = inArr[2]
  outArr[3] = inArr[3]

  outArr[4] = inArr[4]
  outArr[5] = inArr[5]
  outArr[6] = inArr[6]
  outArr[7] = inArr[7]

  outArr[8] = inArr[8]
  outArr[9] = inArr[9]
  outArr[10] = inArr[10]
  outArr[11] = inArr[11]

  outArr[12] = inArr[12]
  outArr[13] = inArr[13]
  outArr[14] = inArr[14]
  outArr[15] = inArr[15]
  return pOut
}

/**
 * Builds a translation matrix. All other elements in the matrix
 * will be set to zero except for the diagonal which is set to 1.0
 */
export const kmMat4Translation = function (pOut, x, y, z) {
  //FIXME: Write a test for this
  pOut.mat[0] = pOut.mat[5] = pOut.mat[10] = pOut.mat[15] = 1.0
  pOut.mat[1] = pOut.mat[2] = pOut.mat[3] = pOut.mat[4] = pOut.mat[6] = pOut.mat[7] = pOut.mat[8] = pOut.mat[9] = pOut.mat[11] = 0.0
  pOut.mat[12] = x
  pOut.mat[13] = y
  pOut.mat[14] = z
  return pOut
}

/**
 * Creates a perspective projection matrix in the
 * same way as gluPerspective
 */
export const kmMat4PerspectiveProjection = function (pOut, fovY, aspect, zNear, zFar) {
  const r = degreesToRadians(fovY / 2)
  const deltaZ = zFar - zNear
  const s = Math.sin(r)

  if (deltaZ === 0 || s === 0 || aspect === 0) return null

  //cos(r) / sin(r) = cot(r)
  const cotangent = Math.cos(r) / s
  pOut.identity()
  pOut.mat[0] = cotangent / aspect
  pOut.mat[5] = cotangent
  pOut.mat[10] = -(zFar + zNear) / deltaZ
  pOut.mat[11] = -1
  pOut.mat[14] = (-2 * zNear * zFar) / deltaZ
  pOut.mat[15] = 0

  return pOut
}
/**
 * Calculates the inverse of pM and stores the result in pOut.
 * Please use matrix4's inverse function instead.
 * @Return Returns NULL if there is no inverse, else pOut
 */
export const kmMat4Inverse = function (pOut, pM) {
  const inv = new Matrix4(pM)
  const tmp = new Matrix4(identityMatrix)
  if (Matrix4._gaussj(inv, tmp) === false) return null
  pOut.assignFrom(inv)
  return pOut
}
export const getMat4MultiplyValue = function (pM1, pM2) {
  const m1 = pM1.mat,
    m2 = pM2.mat
  const mat = new Float32Array(16)

  mat[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3]
  mat[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3]
  mat[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3]
  mat[3] = m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3]

  mat[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7]
  mat[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7]
  mat[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7]
  mat[7] = m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7]

  mat[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11]
  mat[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11]
  mat[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11]
  mat[11] = m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11]

  mat[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15]
  mat[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15]
  mat[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15]
  mat[15] = m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15]

  return mat
}
