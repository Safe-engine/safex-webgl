import { Vec3 } from './vec3'

export class Plane {
  a: number
  b: number
  c: number
  d: number

  constructor(a?: any, b?: number, c?: number, d?: number) {
    if (a && b === undefined) {
      this.a = a.a
      this.b = a.b
      this.c = a.c
      this.d = a.d
    } else {
      this.a = a || 0
      this.b = b || 0
      this.c = c || 0
      this.d = d || 0
    }
  }

  static LEFT = 0
  static RIGHT = 1
  static BOTTOM = 2
  static TOP = 3
  static NEAR = 4
  static FAR = 5
  static POINT_INFRONT_OF_PLANE = 0
  static POINT_BEHIND_PLANE = 1
  static POINT_ON_PLANE = 2

  dot(vec4: any): number {
    //kmPlaneDot
    return this.a * vec4.x + this.b * vec4.y + this.c * vec4.z + this.d * vec4.w
  }

  dotCoord(vec3: any): number {
    //=kmPlaneDotCoord
    return this.a * vec3.x + this.b * vec3.y + this.c * vec3.z + this.d
  }

  dotNormal(vec3: any): number {
    //=kmPlaneDotNormal
    return this.a * vec3.x + this.b * vec3.y + this.c * vec3.z
  }

  static fromPointNormal(vec3: any, normal: any): Plane {
    //kmPlaneFromPointNormal
    /*
         Planea = Nx
         Planeb = Ny
         Planec = Nz
         Planned = −N⋅P
         */
    return new Plane(normal.x, normal.y, normal.z, -normal.dot(vec3))
  }

  static fromPoints(vec1: any, vec2: any, vec3: any): Plane {
    //kmPlaneFromPoints
    /*
         v = (B − A) × (C − A)
         n = 1⁄|v| v
         Outa = nx
         Outb = ny
         Outc = nz
         Outd = −n⋅A
         */
    const v1 = new Vec3(vec2),
      v2 = new Vec3(vec3),
      plane = new Plane()
    v1.subtract(vec1) //Create the vectors for the 2 sides of the triangle
    v2.subtract(vec1)
    v1.cross(v2) //  Use the cross product to get the normal
    v1.normalize() //Normalize it and assign to pOut.m_N

    plane.a = v1.x
    plane.b = v1.y
    plane.c = v1.z
    plane.d = v1.scale(-1.0).dot(vec1)
    return plane
  }

  normalize(): Plane {
    //kmPlaneNormalize
    const n = new Vec3(this.a, this.b, this.c),
      l = 1.0 / n.length() //Get 1/length
    n.normalize() //Normalize the vector and assign to pOut
    this.a = n.x
    this.b = n.y
    this.c = n.z
    this.d = this.d * l //Scale the D value and assign to pOut
    return this
  }

  classifyPoint(vec3: any): number {
    // This function will determine if a point is on, in front of, or behind
    // the plane.  First we store the dot product of the plane and the point.
    const distance = this.a * vec3.x + this.b * vec3.y + this.c * vec3.z + this.d

    // Simply put if the dot product is greater than 0 then it is infront of it.
    // If it is less than 0 then it is behind it.  And if it is 0 then it is on it.
    if (distance > 0.001) return Plane.POINT_INFRONT_OF_PLANE
    if (distance < -0.001) return Plane.POINT_BEHIND_PLANE
    return Plane.POINT_ON_PLANE
  }
}
