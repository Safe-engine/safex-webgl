import { EPSILON, square } from './utility'
import { Vec4 } from './vec4'

export class Vec3 {
  x: number
  y: number
  z: number

  constructor(x?: number | Vec3, y?: number, z?: number) {
    if (x && y === undefined) {
      const v = x as Vec3
      this.x = v.x
      this.y = v.y
      this.z = v.z
    } else {
      this.x = (x as number) || 0
      this.y = y || 0
      this.z = z || 0
    }
  }

  fill(x?: number | Vec3, y?: number, z?: number): Vec3 {
    // =kmVec3Fill
    if (x && y === undefined) {
      const v = x as Vec3
      this.x = v.x
      this.y = v.y
      this.z = v.z
    } else {
      this.x = x as number
      this.y = y!
      this.z = z!
    }
    return this
  }

  length(): number {
    //=kmVec3Length
    return Math.sqrt(square(this.x) + square(this.y) + square(this.z))
  }

  lengthSq(): number {
    //=kmVec3LengthSq
    return square(this.x) + square(this.y) + square(this.z)
  }

  normalize(): Vec3 {
    //= kmVec3Normalize
    const l = 1.0 / this.length()
    this.x *= l
    this.y *= l
    this.z *= l
    return this
  }

  cross(vec3: Vec3): Vec3 {
    //= kmVec3Cross
    const x = this.x,
      y = this.y,
      z = this.z
    this.x = y * vec3.z - z * vec3.y
    this.y = z * vec3.x - x * vec3.z
    this.z = x * vec3.y - y * vec3.x
    return this
  }

  dot(vec: Vec3): number {
    //= kmVec3Dot
    return this.x * vec.x + this.y * vec.y + this.z * vec.z
  }

  add(vec: Vec3): Vec3 {
    //= kmVec3Add
    this.x += vec.x
    this.y += vec.y
    this.z += vec.z
    return this
  }

  subtract(vec: Vec3): Vec3 {
    // = kmVec3Subtract
    this.x -= vec.x
    this.y -= vec.y
    this.z -= vec.z
    return this
  }

  transform(mat4: any): Vec3 {
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

  transformNormal(mat4: any): Vec3 {
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

  transformCoord(mat4: any): Vec3 {
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

  scale(scale: number): Vec3 {
    // = kmVec3Scale
    this.x *= scale
    this.y *= scale
    this.z *= scale
    return this
  }

  equals(vec: Vec3): boolean {
    // = kmVec3AreEqual
    return (
      this.x < vec.x + EPSILON &&
      this.x > vec.x - EPSILON &&
      this.y < vec.y + EPSILON &&
      this.y > vec.y - EPSILON &&
      this.z < vec.z + EPSILON &&
      this.z > vec.z - EPSILON
    )
  }

  inverseTransform(mat4: any): Vec3 {
    //= kmVec3InverseTransform
    const mat = mat4.mat
    const v1 = new Vec3(this.x - mat[12], this.y - mat[13], this.z - mat[14])
    this.x = v1.x * mat[0] + v1.y * mat[1] + v1.z * mat[2]
    this.y = v1.x * mat[4] + v1.y * mat[5] + v1.z * mat[6]
    this.z = v1.x * mat[8] + v1.y * mat[9] + v1.z * mat[10]
    return this
  }

  inverseTransformNormal(mat4: any): Vec3 {
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

  assignFrom(vec?: Vec3): Vec3 {
    if (!vec) return this
    this.x = vec.x
    this.y = vec.y
    this.z = vec.z
    return this
  }

  static zero(vec: Vec3): Vec3 {
    // = kmVec3Zero
    vec.x = vec.y = vec.z = 0.0
    return vec
  }

  toTypeArray(): Float32Array {
    //kmVec3ToTypeArray
    const tyArr = new Float32Array(3)
    tyArr[0] = this.x
    tyArr[1] = this.y
    tyArr[2] = this.z
    return tyArr
  }
}

export const vec3 = function (x: number, y: number, z: number): Vec3 {
  return new Vec3(x, y, z)
}
