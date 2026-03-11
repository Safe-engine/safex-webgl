import { director } from '.'
import { clampf, color, pAdd, pDistance, pLength, pMult, pNormalize, pSub } from './core'
import { Point, Size, p } from './core/cocoa/Geometry'

function updatePoint(p) {
  const { x, y } = p
  return Vec2(x, y)
}

class _Vec2 {
  x: number
  y: number
  static ZERO
  constructor(x: number | object = 0, y = 0) {
    if (!(this instanceof _Vec2)) {
      return new _Vec2(x, y)
    }
    if (typeof x === 'object') {
      this.x = (x as any).x
      this.y = (x as any).y
      return
    }
    this.x = x
    this.y = y
  }

  equals(other: _Vec2) {
    return this.x === other.x && this.y === other.y
  }

  add(value: Point | Vec2): _Vec2 {
    return updatePoint(pAdd(p(this.x, this.y), value))
  }

  addSelf(value: Point | Vec2): _Vec2 {
    const nor = updatePoint(pAdd(p(this.x, this.y), value))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  sub(value: Point | Vec2): _Vec2 {
    return updatePoint(pSub(p(this.x, this.y), value))
  }

  mul(multiply: number): _Vec2 {
    return updatePoint(pMult(p(this.x, this.y), multiply))
  }

  mulSelf(multiply: number): _Vec2 {
    const nor = updatePoint(pMult(p(this.x, this.y), multiply))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  mag(): number {
    return pLength(p(this.x, this.y))
  }

  normalizeSelf(): _Vec2 {
    const nor = updatePoint(pNormalize(p(this.x, this.y)))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  normalize(): _Vec2 {
    return updatePoint(pNormalize(p(this.x, this.y)))
  }

  public cross(other: Vec2) {
    return this.x * other.y - this.y * other.x
  }
  public signAngle(other: Vec2) {
    const angle = this.angle(other)
    return this.cross(other) < 0 ? -angle : angle
  }
  public lengthSqr() {
    return this.x * this.x + this.y * this.y
  }
  public dot(other: Vec2) {
    return this.x * other.x + this.y * other.y
  }
  public angle(other: Vec2) {
    const magSqr1 = this.lengthSqr()
    const magSqr2 = other.lengthSqr()

    if (magSqr1 === 0 || magSqr2 === 0) {
      console.warn('Cant get angle between zero vector')
      return 0.0
    }

    const dot = this.dot(other)
    let theta = dot / Math.sqrt(magSqr1 * magSqr2)
    theta = clampf(theta, -1.0, 1.0)
    return Math.acos(theta)
  }
  public distance(other: _Vec2) {
    return pDistance(this, other)
  }
}
export type Vec2 = _Vec2
export function Vec2(x?: number | object, y?: number): Vec2 {
  return new _Vec2(x, y)
}
Vec2.ZERO = Object.freeze(Vec2(0, 0))

export function Color4B(r: number, g: number, b: number, a: number) {
  return color(r, g, b, a)
}
export type Color4B = ReturnType<typeof Color4B>

export function Color4F(r: number, g: number, b: number, a: number) {
  return color(r * 255, g * 255, b * 255, a * 255)
}
export type Color4F = ReturnType<typeof Color4F>

export function getWinSize(): Size {
  return director.getWinSize()
}
