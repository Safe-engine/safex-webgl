import { square } from './utility'
import { Vec4 } from './vec4'

export const Vec3 = function (x?, y?, z?) {
  if (x && y === undefined) {
    this.x = x.x
    this.y = x.y
    this.z = x.z
  } else {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  }
}

export const vec3 = function (x, y, z) {
  return new Vec3(x, y, z)
}

const _p = Vec3.prototype

_p.fill = function (x, y, z) {
  // =kmVec3Fill
  if (x && y === undefined) {
    this.x = x.x
    this.y = x.y
    this.z = x.z
  } else {
    this.x = x
    this.y = y
    this.z = z
  }
  return this
}

_p.length = function () {
  //=kmVec3Length
  return Math.sqrt(square(this.x) + square(this.y) + square(this.z))
}

_p.lengthSq = function () {
  //=kmVec3LengthSq
  return square(this.x) + square(this.y) + square(this.z)
}

_p.normalize = function () {
  //= kmVec3Normalize
  const l = 1.0 / this.length()
  this.x *= l
  this.y *= l
  this.z *= l
  return this
}

_p.cross = function (vec3) {
  //= kmVec3Cross
  const x = this.x,
    y = this.y,
    z = this.z
  this.x = y * vec3.z - z * vec3.y
  this.y = z * vec3.x - x * vec3.z
  this.z = x * vec3.y - y * vec3.x
  return this
}

_p.dot = function (vec) {
  //= kmVec3Dot
  return this.x * vec.x + this.y * vec.y + this.z * vec.z
}

_p.add = function (vec) {
  //= kmVec3Add
  this.x += vec.x
  this.y += vec.y
  this.z += vec.z
  return this
}

_p.subtract = function (vec) {
  // = kmVec3Subtract
  this.x -= vec.x
  this.y -= vec.y
  this.z -= vec.z
  return this
}

_p.transform = function (mat4) {
  // = kmVec3Transform
  const x = this.x,
    y = this.y,
    z = this.z,
    mat = mat4.mat
  this.x = x * mat[0] + y * mat[4] + z * mat[8] + mat[12]
  this.y = x * mat[1] + y * mat[5] + z * mat[9] + mat[13]
  this.z = x * mat[2] + y * mat[6] + z * mat[10] + mat[14]
  return this
}

_p.transformNormal = function (mat4) {
  /*
   a = (Vx, Vy, Vz, 0)
   b = (a×M)T
   Out = (bx, by, bz)
   */
  //Omits the translation, only scaling + rotating
  const x = this.x,
    y = this.y,
    z = this.z,
    mat = mat4.mat
  this.x = x * mat[0] + y * mat[4] + z * mat[8]
  this.y = x * mat[1] + y * mat[5] + z * mat[9]
  this.z = x * mat[2] + y * mat[6] + z * mat[10]
  return this
}

_p.transformCoord = function (mat4) {
  // = kmVec3TransformCoord
  /*
   a = (Vx, Vy, Vz, 1)
   b = (a×M)T
   Out = 1⁄bw(bx, by, bz)
   */
  const v = new Vec4(this.x, this.y, this.z, 1.0)
  v.transform(mat4)
  this.x = v.x / v.w
  this.y = v.y / v.w
  this.z = v.z / v.w
  return this
}

_p.scale = function (scale) {
  // = kmVec3Scale
  this.x *= scale
  this.y *= scale
  this.z *= scale
  return this
}

_p.equals = function (vec) {
  // = kmVec3AreEqual
  var EPSILON = EPSILON
  return (
    this.x < vec.x + EPSILON &&
    this.x > vec.x - EPSILON &&
    this.y < vec.y + EPSILON &&
    this.y > vec.y - EPSILON &&
    this.z < vec.z + EPSILON &&
    this.z > vec.z - EPSILON
  )
}

_p.inverseTransform = function (mat4) {
  //= kmVec3InverseTransform
  const mat = mat4.mat
  const v1 = new Vec3(this.x - mat[12], this.y - mat[13], this.z - mat[14])
  this.x = v1.x * mat[0] + v1.y * mat[1] + v1.z * mat[2]
  this.y = v1.x * mat[4] + v1.y * mat[5] + v1.z * mat[6]
  this.z = v1.x * mat[8] + v1.y * mat[9] + v1.z * mat[10]
  return this
}

_p.inverseTransformNormal = function (mat4) {
  // = kmVec3InverseTransformNormal
  const x = this.x,
    y = this.y,
    z = this.z,
    mat = mat4.mat
  this.x = x * mat[0] + y * mat[1] + z * mat[2]
  this.y = x * mat[4] + y * mat[5] + z * mat[6]
  this.z = x * mat[8] + y * mat[9] + z * mat[10]
  return this
}

_p.assignFrom = function (vec) {
  if (!vec) return this
  this.x = vec.x
  this.y = vec.y
  this.z = vec.z
  return this
}

Vec3.zero = function (vec) {
  // = kmVec3Zero
  vec.x = vec.y = vec.z = 0.0
  return vec
}

_p.toTypeArray = function () {
  //kmVec3ToTypeArray
  const tyArr = new Float32Array(3)
  tyArr[0] = this.x
  tyArr[1] = this.y
  tyArr[2] = this.z
  return tyArr
}
