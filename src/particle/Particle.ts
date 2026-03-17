import { p } from '../core'

export const Particle = function (
  pos?,
  startPos?,
  color?,
  deltaColor?,
  size?,
  deltaSize?,
  rotation?,
  deltaRotation?,
  timeToLive?,
  atlasIndex?,
  modeA?,
  modeB?,
) {
  this.pos = pos ? pos : p(0, 0)
  this.startPos = startPos ? startPos : p(0, 0)
  this.color = color ? color : { r: 0, g: 0, b: 0, a: 255 }
  this.deltaColor = deltaColor ? deltaColor : { r: 0, g: 0, b: 0, a: 255 }
  this.size = size || 0
  this.deltaSize = deltaSize || 0
  this.rotation = rotation || 0
  this.deltaRotation = deltaRotation || 0
  this.timeToLive = timeToLive || 0
  this.atlasIndex = atlasIndex || 0
  this.modeA = modeA ? modeA : new ParticleModeA()
  this.modeB = modeB ? modeB : new ParticleModeB()
  this.isChangeColor = false
  this.drawPos = p(0, 0)
}

/**
 * Mode A: gravity, direction, radial accel, tangential accel
 * @Class
 * @Construct
 * @param {Point} dir direction of particle
 * @param {Number} radialAccel
 * @param {Number} tangentialAccel
 */
export const ParticleModeA = function (dir?, radialAccel?, tangentialAccel?) {
  this.dir = dir ? dir : p(0, 0)
  this.radialAccel = radialAccel || 0
  this.tangentialAccel = tangentialAccel || 0
}

/**
 * Mode B: radius mode
 * @Class
 * @Construct
 * @param {Number} angle
 * @param {Number} degreesPerSecond
 * @param {Number} radius
 * @param {Number} deltaRadius
 */
export const ParticleModeB = function (angle?, degreesPerSecond?, radius?, deltaRadius?) {
  this.angle = angle || 0
  this.degreesPerSecond = degreesPerSecond || 0
  this.radius = radius || 0
  this.deltaRadius = deltaRadius || 0
}

/**
 * Array of Point instances used to optimize particle updates
 */
Particle.TemporaryPoints = [p(), p(), p(), p()]
