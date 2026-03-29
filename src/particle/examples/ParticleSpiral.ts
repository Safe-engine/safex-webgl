import { director } from '../..'
import { color, p } from '../../core'
import { ParticleSystem } from '../ParticleSystem'

/**
 * A spiral particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSpiral();
 */
export class ParticleSpiral extends ParticleSystem {
  /**
   * <p>The ParticleSpiral's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSpiral()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(500)
  }

  /**
   * initialize a spiral particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: number): boolean {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // Gravity Mode
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, 0))

      // Gravity Mode: speed of particles
      this.setSpeed(150)
      this.setSpeedVar(0)

      // Gravity Mode: radial
      this.setRadialAccel(-380)
      this.setRadialAccelVar(0)

      // Gravity Mode: tangential
      this.setTangentialAccel(45)
      this.setTangentialAccelVar(0)

      // angle
      this.setAngle(90)
      this.setAngleVar(0)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)
      this.setPosVar(p(0, 0))

      // life of particles
      this.setLife(12)
      this.setLifeVar(0)

      // size, in pixels
      this.setStartSize(20.0)
      this.setStartSizeVar(0.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(128, 128, 128, 255))
      this.setStartColorVar(color(128, 128, 128, 0))
      this.setEndColor(color(128, 128, 128, 255))
      this.setEndColorVar(color(128, 128, 128, 0))

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}

export class ParticleExplosion extends ParticleSystem {
  /**
   * <p>The ParticleExplosion's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleExplosion()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(700)
  }

  /**
   * initialize an explosion particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: number): boolean {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(0.1)

      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, 0))

      // Gravity Mode: speed of particles
      this.setSpeed(70)
      this.setSpeedVar(40)

      // Gravity Mode: radial
      this.setRadialAccel(0)
      this.setRadialAccelVar(0)

      // Gravity Mode: tangential
      this.setTangentialAccel(0)
      this.setTangentialAccelVar(0)

      // angle
      this.setAngle(90)
      this.setAngleVar(360)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)
      this.setPosVar(p(0, 0))

      // life of particles
      this.setLife(5.0)
      this.setLifeVar(2)

      // size, in pixels
      this.setStartSize(15.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(this.getTotalParticles() / this.getDuration())

      // color of particles
      this.setStartColor(color(179, 26, 51, 255))
      this.setStartColorVar(color(128, 128, 128, 0))
      this.setEndColor(color(128, 128, 128, 0))
      this.setEndColorVar(color(128, 128, 128, 0))

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}
