import { log } from '../../helper/Debugger'
import { Quaternion } from './quaternion'
import { EPSILON } from './utility'
import { Vec3 } from './vec3'

/**
 * <p>
 * A 3x3 matrix                         </br>
 * </p>
 */
export class Matrix3 {
  mat: Float32Array

  constructor(mat3?: Matrix3) {
    if (mat3 && mat3.mat) {
      this.mat = new Float32Array(mat3.mat)
    } else {
      this.mat = new Float32Array(9)
    }
  }

  static tmpMatrix = new Matrix3() // internal matrix

  /**
   * Copy matrix.
   * @param  {Matrix3} mat3 Matrix to copy
   * @return {Matrix3} this
   */
  fill(mat3: Matrix3): Matrix3 {
    //kmMat3Fill
    const mat = this.mat,
      matIn = mat3.mat
    mat[0] = matIn[0]
    mat[1] = matIn[1]
    mat[2] = matIn[2]
    mat[3] = matIn[3]
    mat[4] = matIn[4]
    mat[5] = matIn[5]
    mat[6] = matIn[6]
    mat[7] = matIn[7]
    mat[8] = matIn[8]
    return this
  }

  adjugate(): Matrix3 {
    //= kmMat3Adjugate
    const mat = this.mat
    const m0 = mat[0],
      m1 = mat[1],
      m2 = mat[2],
      m3 = mat[3],
      m4 = mat[4],
      m5 = mat[5],
      m6 = mat[6],
      m7 = mat[7],
      m8 = mat[8]
    mat[0] = m4 * m8 - m5 * m7
    mat[1] = m2 * m7 - m1 * m8
    mat[2] = m1 * m5 - m2 * m4
    mat[3] = m5 * m6 - m3 * m8
    mat[4] = m0 * m8 - m2 * m6
    mat[5] = m2 * m3 - m0 * m5
    mat[6] = m3 * m7 - m4 * m6

    // XXX: pIn.mat[9] is invalid!
    //mat[7] = m1 * m6 - pIn.mat[9] * m7;
    mat[8] = m0 * m4 - m1 * m3
    return this
  }

  /**
   * Sets pOut to an identity matrix returns pOut
   * @return {Matrix3} this
   */
  identity(): Matrix3 {
    //kmMat3Identity
    const mat = this.mat
    mat[1] = mat[2] = mat[3] = mat[5] = mat[6] = mat[7] = 0
    mat[0] = mat[4] = mat[8] = 1.0
    return this
  }

  inverse(determinate: number): Matrix3 {
    //kmMat3Inverse
    if (determinate === 0.0) return this
    Matrix3.tmpMatrix.assignFrom(this)
    const detInv = 1.0 / determinate
    this.adjugate()
    this.multiplyScalar(detInv)
    return this
  }

  isIdentity(): boolean {
    //= kmMat3IsIdentity
    const mat = this.mat
    return (
      mat[0] === 1 &&
      mat[1] === 0 &&
      mat[2] === 0 &&
      mat[3] === 0 &&
      mat[4] === 1 &&
      mat[5] === 0 &&
      mat[6] === 0 &&
      mat[7] === 0 &&
      mat[8] === 1
    )
  }

  transpose(): Matrix3 {
    // kmMat3Transpose
    const mat = this.mat
    const m1 = mat[1],
      m2 = mat[2],
      m3 = mat[3],
      m5 = mat[5],
      m6 = mat[6],
      m7 = mat[7]
    // m0 = mat[0],m8 = mat[8], m4 = mat[4];
    //mat[0] = m0;
    //mat[8]  = m8;
    //mat[4] = m4
    mat[1] = m3
    mat[2] = m6
    mat[3] = m1
    mat[5] = m7
    mat[6] = m2
    mat[7] = m5
    return this
  }

  determinant(): number {
    const mat = this.mat
    /*
         calculating the determinant following the rule of sarus,
         | 0  3  6 | 0  3 |
         m = | 1  4  7 | 1  4 |
         | 2  5  8 | 2  5 |
         now sum up the products of the diagonals going to the right (i.e. 0,4,8)
         and subtract the products of the other diagonals (i.e. 2,4,6)
         */
    let output = mat[0] * mat[4] * mat[8] + mat[1] * mat[5] * mat[6] + mat[2] * mat[3] * mat[7]
    output -= mat[2] * mat[4] * mat[6] + mat[0] * mat[5] * mat[7] + mat[1] * mat[3] * mat[8]
    return output
  }

  multiply(mat3: Matrix3): Matrix3 {
    const m1 = this.mat,
      m2 = mat3.mat
    const a0 = m1[0],
      a1 = m1[1],
      a2 = m1[2],
      a3 = m1[3],
      a4 = m1[4],
      a5 = m1[5],
      a6 = m1[6],
      a7 = m1[7],
      a8 = m1[8]
    const b0 = m2[0],
      b1 = m2[1],
      b2 = m2[2],
      b3 = m2[3],
      b4 = m2[4],
      b5 = m2[5],
      b6 = m2[6],
      b7 = m2[7],
      b8 = m2[8]

    m1[0] = a0 * b0 + a3 * b1 + a6 * b2
    m1[1] = a1 * b0 + a4 * b1 + a7 * b2
    m1[2] = a2 * b0 + a5 * b1 + a8 * b2

    m1[3] = a0 * b3 + a3 * b4 + a6 * b5
    m1[4] = a1 * b3 + a4 * b4 + a7 * b5
    m1[5] = a2 * b3 + a5 * b4 + a8 * b5

    m1[6] = a0 * b6 + a3 * b7 + a6 * b8
    m1[7] = a1 * b6 + a4 * b7 + a7 * b8
    m1[8] = a2 * b6 + a5 * b7 + a8 * b8
    return this
  }

  multiplyScalar(factor: number): Matrix3 {
    const mat = this.mat
    mat[0] *= factor
    mat[1] *= factor
    mat[2] *= factor
    mat[3] *= factor
    mat[4] *= factor
    mat[5] *= factor
    mat[6] *= factor
    mat[7] *= factor
    mat[8] *= factor
    return this
  }

  static rotationAxisAngle(axis: Vec3, radians: number): Matrix3 {
    //kmMat3RotationAxisAngle
    const rcos = Math.cos(radians),
      rsin = Math.sin(radians)
    const retMat = new Matrix3()
    const mat = retMat.mat

    mat[0] = rcos + axis.x * axis.x * (1 - rcos)
    mat[1] = axis.z * rsin + axis.y * axis.x * (1 - rcos)
    mat[2] = -axis.y * rsin + axis.z * axis.x * (1 - rcos)

    mat[3] = -axis.z * rsin + axis.x * axis.y * (1 - rcos)
    mat[4] = rcos + axis.y * axis.y * (1 - rcos)
    mat[5] = axis.x * rsin + axis.z * axis.y * (1 - rcos)

    mat[6] = axis.y * rsin + axis.x * axis.z * (1 - rcos)
    mat[7] = -axis.x * rsin + axis.y * axis.z * (1 - rcos)
    mat[8] = rcos + axis.z * axis.z * (1 - rcos)

    return retMat
  }

  assignFrom(matIn: Matrix3): Matrix3 {
    // kmMat3Assign
    if (this === matIn) {
      log('Matrix3.assign(): current matrix equals matIn')
      return this
    }
    const mat = this.mat,
      m2 = matIn.mat
    mat[0] = m2[0]
    mat[1] = m2[1]
    mat[2] = m2[2]
    mat[3] = m2[3]
    mat[4] = m2[4]
    mat[5] = m2[5]
    mat[6] = m2[6]
    mat[7] = m2[7]
    mat[8] = m2[8]
    return this
  }

  equals(mat3: Matrix3): boolean {
    if (this === mat3) return true
    const m1 = this.mat,
      m2 = mat3.mat
    for (let i = 0; i < 9; ++i) {
      if (!(m1[i] + EPSILON > m2[i] && m1[i] - EPSILON < m2[i])) return false
    }
    return true
  }

  static createByRotationX(radians: number): Matrix3 {
    const retMat = new Matrix3(),
      mat = retMat.mat
    mat[0] = 1.0
    mat[1] = 0.0
    mat[2] = 0.0

    mat[3] = 0.0
    mat[4] = Math.cos(radians)
    mat[5] = Math.sin(radians)

    mat[6] = 0.0
    mat[7] = -Math.sin(radians)
    mat[8] = Math.cos(radians)
    return retMat
  }

  static createByRotationY(radians: number): Matrix3 {
    /*
         |  cos(A)  0   sin(A) |
         M = |  0       1   0      |
         | -sin(A)  0   cos(A) |
         */
    const retMat = new Matrix3(),
      mat = retMat.mat
    mat[0] = Math.cos(radians)
    mat[1] = 0.0
    mat[2] = -Math.sin(radians)

    mat[3] = 0.0
    mat[4] = 1.0
    mat[5] = 0.0

    mat[6] = Math.sin(radians)
    mat[7] = 0.0
    mat[8] = Math.cos(radians)
    return retMat
  }

  static createByRotationZ(radians: number): Matrix3 {
    /*
         |  cos(A)  -sin(A)   0  |
         M = |  sin(A)   cos(A)   0  |
         |  0        0        1  |
         */
    const retMat = new Matrix3(),
      mat = retMat.mat
    mat[0] = Math.cos(radians)
    mat[1] = -Math.sin(radians)
    mat[2] = 0.0

    mat[3] = Math.sin(radians)
    mat[4] = Math.cos(radians)
    mat[5] = 0.0

    mat[6] = 0.0
    mat[7] = 0.0
    mat[8] = 1.0
    return retMat
  }

  static createByRotation(radians: number): Matrix3 {
    /*
         |  cos(A)  -sin(A)   0  |
         M = |  sin(A)   cos(A)   0  |
         |  0        0        1  |
         */
    const retMat = new Matrix3(),
      mat = retMat.mat
    mat[0] = Math.cos(radians)
    mat[1] = Math.sin(radians)
    mat[2] = 0.0

    mat[3] = -Math.sin(radians)
    mat[4] = Math.cos(radians)
    mat[5] = 0.0

    mat[6] = 0.0
    mat[7] = 0.0
    mat[8] = 1.0
    return retMat
  }

  static createByScale(x: number, y: number): Matrix3 {
    const ret = new Matrix3()
    ret.identity()
    ret.mat[0] = x
    ret.mat[4] = y
    return ret
  }

  static createByTranslation(x: number, y: number): Matrix3 {
    const ret = new Matrix3()
    ret.identity()
    ret.mat[6] = x
    ret.mat[7] = y
    return ret
  }

  static createByQuaternion(quaternion: Quaternion): Matrix3 | null {
    //kmMat3RotationQuaternion
    if (!quaternion) return null

    const ret = new Matrix3(),
      mat = ret.mat
    // First row
    mat[0] = 1.0 - 2.0 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)
    mat[1] = 2.0 * (quaternion.x * quaternion.y - quaternion.w * quaternion.z)
    mat[2] = 2.0 * (quaternion.x * quaternion.z + quaternion.w * quaternion.y)

    // Second row
    mat[3] = 2.0 * (quaternion.x * quaternion.y + quaternion.w * quaternion.z)
    mat[4] = 1.0 - 2.0 * (quaternion.x * quaternion.x + quaternion.z * quaternion.z)
    mat[5] = 2.0 * (quaternion.y * quaternion.z - quaternion.w * quaternion.x)

    // Third row
    mat[6] = 2.0 * (quaternion.x * quaternion.z - quaternion.w * quaternion.y)
    mat[7] = 2.0 * (quaternion.y * quaternion.z + quaternion.w * quaternion.x)
    mat[8] = 1.0 - 2.0 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y)
    return ret
  }

  rotationToAxisAngle(): { axis: Vec3; angle: number } {
    //kmMat3RotationToAxisAngle
    return Quaternion.rotationMatrix(this).toAxisAndAngle()
  }
}
