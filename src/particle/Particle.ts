import { Color, color, p, Point } from '../core'

export class ParticleModeA {
  dir: Point
  radialAccel: number
  tangentialAccel: number

  constructor(dir?: Point, radialAccel?: number, tangentialAccel?: number) {
    this.dir = dir ?? p(0, 0)
    this.radialAccel = radialAccel ?? 0
    this.tangentialAccel = tangentialAccel ?? 0
  }
}

export class ParticleModeB {
  angle: number
  degreesPerSecond: number
  radius: number
  deltaRadius: number

  constructor(angle?: number, degreesPerSecond?: number, radius?: number, deltaRadius?: number) {
    this.angle = angle ?? 0
    this.degreesPerSecond = degreesPerSecond ?? 0
    this.radius = radius ?? 0
    this.deltaRadius = deltaRadius ?? 0
  }
}

export class Particle {
  declare pos: Point
  declare startPos: Point
  declare color: Color
  declare deltaColor: Color
  declare size: number
  declare deltaSize: number
  declare rotation: number
  declare deltaRotation: number
  declare timeToLive: number
  declare atlasIndex: number
  declare modeA: ParticleModeA
  declare modeB: ParticleModeB
  declare isChangeColor: boolean
  declare drawPos: Point

  constructor(
    pos?: Point,
    startPos?: Point,
    cl?: Color,
    deltaColor?: Color,
    size?: number,
    deltaSize?: number,
    rotation?: number,
    deltaRotation?: number,
    timeToLive?: number,
    atlasIndex?: number,
    modeA?: ParticleModeA,
    modeB?: ParticleModeB,
  ) {
    this.pos = pos ?? p(0, 0)
    this.startPos = startPos ?? p(0, 0)
    this.color = cl ?? color(0, 0, 0, 255)
    this.deltaColor = deltaColor ?? color(0, 0, 0, 255)
    this.size = size ?? 0
    this.deltaSize = deltaSize ?? 0
    this.rotation = rotation ?? 0
    this.deltaRotation = deltaRotation ?? 0
    this.timeToLive = timeToLive ?? 0
    this.atlasIndex = atlasIndex ?? 0
    this.modeA = modeA ?? new ParticleModeA()
    this.modeB = modeB ?? new ParticleModeB()
    this.isChangeColor = false
    this.drawPos = p(0, 0)
  }
  static TemporaryPoints = [p(), p(), p(), p()]
}
