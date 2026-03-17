import { director, game } from '../..'
import { color, p } from '../../core'
import { _renderType } from '../../helper/engine'
import { ParticleSystem } from '../ParticleSystem'

export class ParticleSmoke extends ParticleSystem {
  /**
   * <p>The ParticleSmoke's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSmoke()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 200 : 100)
  }

  /**
   * initialize a smoke particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: number): boolean {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // Emitter mode: Gravity Mode
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, 0))

      // Gravity Mode: radial acceleration
      this.setRadialAccel(0)
      this.setRadialAccelVar(0)

      // Gravity Mode: speed of particles
      this.setSpeed(25)
      this.setSpeedVar(10)

      // angle
      this.setAngle(90)
      this.setAngleVar(5)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, 0)
      this.setPosVar(p(20, 0))

      // life of particles
      this.setLife(4)
      this.setLifeVar(1)

      // size, in pixels
      this.setStartSize(60.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per frame
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(204, 204, 204, 255))
      this.setStartColorVar(color(5, 5, 5, 0))
      this.setEndColor(color(0, 0, 0, 255))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}

/**
 * A snow particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSnow();
 */
export class ParticleSnow extends ParticleSystem {
  /**
   * <p>The ParticleSnow's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSnow()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 700 : 250)
  }

  /**
   * initialize a snow particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: number): boolean {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // set gravity mode.
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, -1))

      // Gravity Mode: speed of particles
      this.setSpeed(5)
      this.setSpeedVar(1)

      // Gravity Mode: radial
      this.setRadialAccel(0)
      this.setRadialAccelVar(1)

      // Gravity mode: tangential
      this.setTangentialAccel(0)
      this.setTangentialAccelVar(1)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height + 10)
      this.setPosVar(p(winSize.width / 2, 0))

      // angle
      this.setAngle(-90)
      this.setAngleVar(5)

      // life of particles
      this.setLife(45)
      this.setLifeVar(15)

      // size, in pixels
      this.setStartSize(10.0)
      this.setStartSizeVar(5.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(10)

      // color of particles
      this.setStartColor(color(255, 255, 255, 255))
      this.setStartColorVar(color(0, 0, 0, 0))
      this.setEndColor(color(255, 255, 255, 0))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}

//! @brief A rain particle system
/**
 * A rain particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleRain();
 */
export class ParticleRain extends ParticleSystem {
  /**
   * <p>The ParticleRain's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleRain()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 1000 : 300)
  }

  /**
   * initialize a rain particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: number): boolean {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(10, -10))

      // Gravity Mode: radial
      this.setRadialAccel(0)
      this.setRadialAccelVar(1)

      // Gravity Mode: tangential
      this.setTangentialAccel(0)
      this.setTangentialAccelVar(1)

      // Gravity Mode: speed of particles
      this.setSpeed(130)
      this.setSpeedVar(30)

      // angle
      this.setAngle(-90)
      this.setAngleVar(5)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height)
      this.setPosVar(p(winSize.width / 2, 0))

      // life of particles
      this.setLife(4.5)
      this.setLifeVar(0)

      // size, in pixels
      this.setStartSize(4.0)
      this.setStartSizeVar(2.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per second
      this.setEmissionRate(20)

      // color of particles
      this.setStartColor(color(179, 204, 255, 255))
      this.setStartColorVar(color(0, 0, 0, 0))
      this.setEndColor(color(179, 204, 255, 128))
      this.setEndColorVar(color(0, 0, 0, 0))

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}
