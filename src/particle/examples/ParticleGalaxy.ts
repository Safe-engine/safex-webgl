import { director, game } from '../..'
import { color, p } from '../../core'
import { _renderType } from '../../helper/engine'
import { ParticleSystem } from '../ParticleSystem'

export class ParticleGalaxy extends ParticleSystem {
  /**
   * <p>The ParticleGalaxy's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleGalaxy()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 200 : 100)
  }

  /**
   * initialize a galaxy particle system with number Of Particles
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
      this.setSpeed(60)
      this.setSpeedVar(10)

      // Gravity Mode: radial
      this.setRadialAccel(-80)
      this.setRadialAccelVar(0)

      // Gravity Mode: tangential
      this.setTangentialAccel(80)
      this.setTangentialAccelVar(0)

      // angle
      this.setAngle(90)
      this.setAngleVar(360)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)
      this.setPosVar(p(0, 0))

      // life of particles
      this.setLife(4)
      this.setLifeVar(1)

      // size, in pixels
      this.setStartSize(37.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(31, 64, 194, 255))
      this.setStartColorVar(color(0, 0, 0, 0))
      this.setEndColor(color(0, 0, 0, 255))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(true)
      return true
    }
    return false
  }
}

/**
 * A flower particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleFlower();
 */
export class ParticleFlower extends ParticleSystem {
  /**
   * <p>The ParticleFlower's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFlower()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 250 : 100)
  }

  /**
   * initialize a flower particle system with number Of Particles
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
      this.setSpeed(80)
      this.setSpeedVar(10)

      // Gravity Mode: radial
      this.setRadialAccel(-60)
      this.setRadialAccelVar(0)

      // Gravity Mode: tangential
      this.setTangentialAccel(15)
      this.setTangentialAccelVar(0)

      // angle
      this.setAngle(90)
      this.setAngleVar(360)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)
      this.setPosVar(p(0, 0))

      // life of particles
      this.setLife(4)
      this.setLifeVar(1)

      // size, in pixels
      this.setStartSize(30.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(128, 128, 128, 255))
      this.setStartColorVar(color(128, 128, 128, 128))
      this.setEndColor(color(0, 0, 0, 255))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(true)
      return true
    }
    return false
  }
}

//! @brief A meteor particle system
/**
 * A meteor particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleMeteor();
 */
export class ParticleMeteor extends ParticleSystem {
  /**
   * <p>The ParticleMeteor's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleMeteor()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 150 : 100)
  }

  /**
   * initialize a meteor particle system with number Of Particles
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
      this.setGravity(p(-200, 200))

      // Gravity Mode: speed of particles
      this.setSpeed(15)
      this.setSpeedVar(5)

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
      this.setLife(2)
      this.setLifeVar(1)

      // size, in pixels
      this.setStartSize(60.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(51, 102, 179))
      this.setStartColorVar(color(0, 0, 51, 26))
      this.setEndColor(color(0, 0, 0, 255))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(true)
      return true
    }
    return false
  }
}
