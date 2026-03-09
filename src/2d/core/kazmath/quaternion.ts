import { degreesToRadians } from '../platform/Macro'
import { EPSILON, square } from './utility'
import { Vec3 } from './vec3'

/**
 * The Quaternion class
 */
export class Quaternion {
  x: number
  y: number
  z: number
  w: number

  constructor(x?: number | Quaternion, y?: number, z?: number, w?: number) {
    if (x && y === undefined) {
      const q = x as Quaternion
      this.x = q.x
      this.y = q.y
      this.z = q.z
      this.w = q.w
    } else {
      this.x = (x as number) || 0
      this.y = y || 0
      this.z = z || 0
      this.w = w || 0
    }
  }

  /**
   * Sets the conjugate of quaternion to self
   * @param {Quaternion} quaternion
   */
  conjugate(quaternion: Quaternion): Quaternion {
    //= kmQuaternionConjugate
    this.x = -quaternion.x
    this.y = -quaternion.y
    this.z = -quaternion.z
    this.w = quaternion.w
    return this
  }

  /**
   * Returns the dot product of the current quaternion and parameter quaternion
   * @param quaternion
   * @returns {number}
   */
  dot(quaternion: Quaternion): number {
    // = kmQuaternionDot
    // A dot B = B dot A = AtBt + AxBx + AyBy + AzBz
    return this.w * quaternion.w + this.x * quaternion.x + this.y * quaternion.y + this.z * quaternion.z
  }

  /**
   * Returns the exponential of the quaternion, this function doesn't implemented.
   * @returns {Quaternion}
   */
  exponential(): Quaternion {
    //=kmQuaternionExp
    return this
  }

  /**
   * Makes the current quaternion an identity quaternion
   */
  identity(): Quaternion {
    //=kmQuaternionIdentity
    this.x = 0.0
    this.y = 0.0
    this.z = 0.0
    this.w = 1.0
    return this
  }

  /**
   * Inverses the value of current Quaternion
   */
  inverse(): Quaternion {
    //=kmQuaternionInverse
    const len = this.length()
    if (Math.abs(len) > EPSILON) {
      this.x = 0.0
      this.y = 0.0
      this.z = 0.0
      this.w = 0.0
      return this
    }

    ///Get the conjugute and divide by the length
    this.conjugate(this).scale(1.0 / len)
    return this
  }

  /**
   * Returns true if the quaternion is an identity quaternion
   * @returns {boolean}
   */
  isIdentity(): boolean {
    //=kmQuaternionIsIdentity
    return this.x === 0.0 && this.y === 0.0 && this.z === 0.0 && this.w === 1.0
  }

  /**
   * Returns the length of the quaternion
   * @returns {number}
   */
  length(): number {
    //=kmQuaternionLength
    return Math.sqrt(this.lengthSq())
  }

  /**
   * Returns the length of the quaternion squared (prevents a sqrt)
   * @returns {number}
   */
  lengthSq(): number {
    //=kmQuaternionLengthSq
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
  }

  /**
   * Uses current quaternion multiplies other quaternion.
   * @param {Quaternion} quaternion
   * @returns {Quaternion}
   */
  multiply(quaternion: Quaternion): Quaternion {
    //kmQuaternionMultiply
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w
    this.w = w * quaternion.w - x * quaternion.x - y * quaternion.y - z * quaternion.z
    this.x = w * quaternion.x + x * quaternion.w + y * quaternion.z - z * quaternion.y
    this.y = w * quaternion.y + y * quaternion.w + z * quaternion.x - x * quaternion.z
    this.z = w * quaternion.z + z * quaternion.w + x * quaternion.y - y * quaternion.x
    return this
  }

  /**
   * Normalizes a quaternion
   * @returns {Quaternion}
   */
  normalize(): Quaternion {
    //=kmQuaternionNormalize
    const length = this.length()
    if (Math.abs(length) <= EPSILON) throw new Error('current quaternion is an invalid value')
    this.scale(1.0 / length)
    return this
  }

  /**
   * Rotates a quaternion around an axis and an angle
   * @param {Vec3} axis
   * @param {Number} angle
   */
  rotationAxis(axis: Vec3, angle: number): Quaternion {
    //kmQuaternionRotationAxis
    const rad = angle * 0.5,
      scale = Math.sin(rad)
    this.w = Math.cos(rad)
    this.x = axis.x * scale
    this.y = axis.y * scale
    this.z = axis.z * scale
    return this
  }

  /**
   *  Creates a quaternion from a rotation matrix
   * @param mat3
   * @returns {*}
   */
  static rotationMatrix(mat3: any): Quaternion | null {
    //kmQuaternionRotationMatrix
    if (!mat3) return null

    let x, y, z, w
    const m4x4 = []
    const mat = mat3.mat
    let scale

    /*    0 3 6
           1 4 7
           2 5 8

           0 1 2 3
           4 5 6 7
           8 9 10 11
           12 13 14 15*/
    m4x4[0] = mat[0]
    m4x4[1] = mat[3]
    m4x4[2] = mat[6]
    m4x4[4] = mat[1]
    m4x4[5] = mat[4]
    m4x4[6] = mat[7]
    m4x4[8] = mat[2]
    m4x4[9] = mat[5]
    m4x4[10] = mat[8]
    m4x4[15] = 1
    const pMatrix = m4x4[0]

    const diagonal = pMatrix[0] + pMatrix[5] + pMatrix[10] + 1
    if (diagonal > EPSILON) {
      // Calculate the scale of the diagonal
      scale = Math.sqrt(diagonal) * 2

      // Calculate the x, y, x and w of the quaternion through the respective equation
      x = (pMatrix[9] - pMatrix[6]) / scale
      y = (pMatrix[2] - pMatrix[8]) / scale
      z = (pMatrix[4] - pMatrix[1]) / scale
      w = 0.25 * scale
    } else {
      // If the first element of the diagonal is the greatest value
      if (pMatrix[0] > pMatrix[5] && pMatrix[0] > pMatrix[10]) {
        // Find the scale according to the first element, and double that value
        scale = Math.sqrt(1.0 + pMatrix[0] - pMatrix[5] - pMatrix[10]) * 2.0

        // Calculate the x, y, x and w of the quaternion through the respective equation
        x = 0.25 * scale
        y = (pMatrix[4] + pMatrix[1]) / scale
        z = (pMatrix[2] + pMatrix[8]) / scale
        w = (pMatrix[9] - pMatrix[6]) / scale
      }
      // Else if the second element of the diagonal is the greatest value
      else if (pMatrix[5] > pMatrix[10]) {
        // Find the scale according to the second element, and double that value
        scale = Math.sqrt(1.0 + pMatrix[5] - pMatrix[0] - pMatrix[10]) * 2.0

        // Calculate the x, y, x and w of the quaternion through the respective equation
        x = (pMatrix[4] + pMatrix[1]) / scale
        y = 0.25 * scale
        z = (pMatrix[9] + pMatrix[6]) / scale
        w = (pMatrix[2] - pMatrix[8]) / scale
      } else {
        // Else the third element of the diagonal is the greatest value

        // Find the scale according to the third element, and double that value
        scale = Math.sqrt(1.0 + pMatrix[10] - pMatrix[0] - pMatrix[5]) * 2.0

        // Calculate the x, y, x and w of the quaternion through the respective equation
        x = (pMatrix[2] + pMatrix[8]) / scale
        y = (pMatrix[9] + pMatrix[6]) / scale
        z = 0.25 * scale
        w = (pMatrix[4] - pMatrix[1]) / scale
      }
    }
    return new Quaternion(x, y, z, w)
  }

  /**
   * Create a quaternion from yaw, pitch and roll
   * @param yaw
   * @param pitch
   * @param roll
   * @returns {Quaternion}
   */
  static rotationYawPitchRoll(yaw: number, pitch: number, roll: number): Quaternion {
    //kmQuaternionRotationYawPitchRoll
    const ex = degreesToRadians(pitch) / 2.0 // convert to rads and half them
    const ey = degreesToRadians(yaw) / 2.0
    const ez = degreesToRadians(roll) / 2.0

    const cr = Math.cos(ex)
    const cp = Math.cos(ey)
    const cy = Math.cos(ez)

    const sr = Math.sin(ex)
    const sp = Math.sin(ey)
    const sy = Math.sin(ez)

    const cpcy = cp * cy
    const spsy = sp * sy

    const ret = new Quaternion()
    ret.w = cr * cpcy + sr * spsy
    ret.x = sr * cpcy - cr * spsy
    ret.y = cr * sp * cy + sr * cp * sy
    ret.z = cr * cp * sy - sr * sp * cy
    ret.normalize()
    return ret
  }

  /**
   * Interpolate with other quaternions
   * @param {Quaternion} quaternion
   * @param {Number} t
   * @returns {Quaternion}
   */
  slerp(quaternion: Quaternion, t: number): Quaternion {
    //=kmQuaternionSlerp
    if (this.x === quaternion.x && this.y === quaternion.y && this.z === quaternion.z && this.w === quaternion.w) {
      return this
    }
    const ct = this.dot(quaternion),
      theta = Math.acos(ct),
      st = Math.sqrt(1.0 - square(ct))
    const stt = Math.sin(t * theta) / st,
      somt = Math.sin((1.0 - t) * theta) / st
    const temp2 = new Quaternion(quaternion)
    this.scale(somt)
    temp2.scale(stt)
    this.add(temp2)
    return this
  }

  /**
   * Get the axis and angle of rotation from a quaternion
   * @returns {{axis: Vec3, angle: number}}
   */
  toAxisAndAngle(): { axis: Vec3; angle: number } {
    //=kmQuaternionToAxisAngle
    let retAngle
    const retAxis = new Vec3()

    const tempAngle = Math.acos(this.w)
    const scale = Math.sqrt(square(this.x) + square(this.y) + square(this.z))

    if ((scale > -EPSILON && scale < EPSILON) || (scale < 2 * Math.PI + EPSILON && scale > 2 * Math.PI - EPSILON)) {
      // angle is 0 or 360 so just simply set axis to 0,0,1 with angle 0
      retAngle = 0.0
      retAxis.x = 0.0
      retAxis.y = 0.0
      retAxis.z = 1.0
    } else {
      retAngle = tempAngle * 2.0 // angle in radians
      retAxis.x = this.x / scale
      retAxis.y = this.y / scale
      retAxis.z = this.z / scale
      retAxis.normalize()
    }
    return { axis: retAxis, angle: retAngle }
  }

  /**
   * Scale a quaternion
   * @param {Number} scale
   */
  scale(scale: number): Quaternion {
    //kmQuaternionScale
    this.x *= scale
    this.y *= scale
    this.z *= scale
    this.w *= scale
    return this
  }

  /**
   * Assign current quaternion value from a quaternion.
   * @param {Quaternion} quaternion
   * @returns {Quaternion}  current quaternion
   */
  assignFrom(quaternion: Quaternion): Quaternion {
    //=kmQuaternionAssign
    this.x = quaternion.x
    this.y = quaternion.y
    this.z = quaternion.z
    this.w = quaternion.w
    return this
  }

  /**
   * Adds other quaternion
   * @param {Quaternion} quaternion
   * @returns {Quaternion}
   */
  add(quaternion: Quaternion): Quaternion {
    //kmQuaternionAdd
    this.x += quaternion.x
    this.y += quaternion.y
    this.z += quaternion.z
    this.w += quaternion.w
    return this
  }

  /**
   * <p>
   *     Adapted from the OGRE engine!                                                            <br/>
   *     Gets the shortest arc quaternion to rotate this vector to the destination vector.        <br/>
   *     @remarks                                                                                <br/>
   *     If you call this with a destination vector that is close to the inverse                  <br/>
   *     of this vector, we will rotate 180 degrees around the 'fallbackAxis'                     <br/>
   *     (if specified, or a generated axis if not) since in this case ANY axis of rotation is valid.
   * </p>
   * @param {Vec3} vec1
   * @param {Vec3} vec2
   * @param {Vec3} fallback
   * @returns {Quaternion}
   */
  static rotationBetweenVec3(vec1: Vec3, vec2: Vec3, fallback?: Vec3): Quaternion {
    //kmQuaternionRotationBetweenVec3
    const v1 = new Vec3(vec1),
      v2 = new Vec3(vec2)
    v1.normalize()
    v2.normalize()
    const a = v1.dot(v2),
      quaternion = new Quaternion()

    if (a >= 1.0) {
      quaternion.identity()
      return quaternion
    }

    if (a < 1e-6 - 1.0) {
      if (fallback && Math.abs(fallback.lengthSq()) < EPSILON) {
        quaternion.rotationAxis(fallback, Math.PI)
      } else {
        const axis = new Vec3(1.0, 0.0, 0.0)
        axis.cross(vec1)

        //If axis is zero
        if (Math.abs(axis.lengthSq()) < EPSILON) {
          axis.fill(0.0, 1.0, 0.0)
          axis.cross(vec1)
        }
        axis.normalize()
        quaternion.rotationAxis(axis, Math.PI)
      }
    } else {
      const s = Math.sqrt((1 + a) * 2),
        invs = 1 / s
      v1.cross(v2)
      quaternion.x = v1.x * invs
      quaternion.y = v1.y * invs
      quaternion.z = v1.z * invs
      quaternion.w = s * 0.5
      quaternion.normalize()
    }
    return quaternion
  }

  /**
   * Current quaternion multiplies a vec3
   * @param {Vec3} vec
   * @returns {Vec3}
   */
  multiplyVec3(vec: Vec3): Vec3 {
    //=kmQuaternionMultiplyVec3
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w
    const retVec = new Vec3(vec)
    const uv = new Vec3(x, y, z),
      uuv = new Vec3(x, y, z)
    uv.cross(vec)
    uuv.cross(uv)
    uv.scale(2.0 * w)
    uuv.scale(2.0)

    retVec.add(uv)
    retVec.add(uuv)
    return retVec
  }
}

// kmQuaternion = Quaternion
