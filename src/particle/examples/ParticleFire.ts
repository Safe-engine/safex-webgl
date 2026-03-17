import { director, game } from '../..'
import { color, p } from '../../core'
import { _renderType } from '../../helper/engine'
import { ParticleSystem } from '../ParticleSystem'

export class ParticleFire extends ParticleSystem {
  /**
   * <p>The ParticleFire's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFire()".<br/>
   * Override it to extend its behavior, remember to call "super()" in the extended "constructor" function.</p>
   */
  constructor() {
    super(300)
  }

  /**
   * initialize a fire particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: any) {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // Gravity Mode
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, 0))

      // Gravity Mode: radial acceleration
      this.setRadialAccel(0)
      this.setRadialAccelVar(0)

      // Gravity Mode: speed of particles
      this.setSpeed(60)
      this.setSpeedVar(20)

      // starting angle
      this.setAngle(90)
      this.setAngleVar(10)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, 60)
      this.setPosVar(p(40, 20))

      // life of particles
      this.setLife(3)
      this.setLifeVar(0.25)

      // size, in pixels
      this.setStartSize(54.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per frame
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(194, 64, 31, 255))
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
 * A fireworks particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleFireworks();
 */
export class ParticleFireworks extends ParticleSystem {
  /**
   * <p>The ParticleFireworks's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFireworks()".<br/>
   * Override it to extend its behavior, remember to call "super()" in the extended "constructor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 1500 : 150)
  }

  /**
   * initialize a fireworks particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: any) {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // Gravity Mode
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, -90))

      // Gravity Mode:  radial
      this.setRadialAccel(0)
      this.setRadialAccelVar(0)

      //  Gravity Mode: speed of particles
      this.setSpeed(180)
      this.setSpeedVar(50)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)

      // angle
      this.setAngle(90)
      this.setAngleVar(20)

      // life of particles
      this.setLife(3.5)
      this.setLifeVar(1)

      // emits per frame
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(128, 128, 128, 255))
      this.setStartColorVar(color(128, 128, 128, 255))
      this.setEndColor(color(26, 26, 26, 51))
      this.setEndColorVar(color(26, 26, 26, 51))

      // size, in pixels
      this.setStartSize(8.0)
      this.setStartSizeVar(2.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // additive
      this.setBlendAdditive(false)
      return true
    }
    return false
  }
}

/**
 * A sun particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSun();
 */
export class ParticleSun extends ParticleSystem {
  /**
   * <p>The ParticleSun's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSun()".<br/>
   * Override it to extend its behavior, remember to call "super()" in the extended "constructor" function.</p>
   */
  constructor() {
    super(_renderType === game.RENDER_TYPE_WEBGL ? 350 : 150)
  }

  /**
   * initialize a sun particle system with number Of Particles
   * @param {Number} numberOfParticles
   * @return {Boolean}
   */
  initWithTotalParticles(numberOfParticles?: any) {
    if (super.initWithTotalParticles(numberOfParticles)) {
      // additive
      this.setBlendAdditive(true)

      // duration
      this.setDuration(ParticleSystem.DURATION_INFINITY)

      // Gravity Mode
      this.setEmitterMode(ParticleSystem.MODE_GRAVITY)

      // Gravity Mode: gravity
      this.setGravity(p(0, 0))

      // Gravity mode: radial acceleration
      this.setRadialAccel(0)
      this.setRadialAccelVar(0)

      // Gravity mode: speed of particles
      this.setSpeed(20)
      this.setSpeedVar(5)

      // angle
      this.setAngle(90)
      this.setAngleVar(360)

      // emitter position
      const winSize = director.getWinSize()
      this.setPosition(winSize.width / 2, winSize.height / 2)
      this.setPosVar(p(0, 0))

      // life of particles
      this.setLife(1)
      this.setLifeVar(0.5)

      // size, in pixels
      this.setStartSize(30.0)
      this.setStartSizeVar(10.0)
      this.setEndSize(ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE)

      // emits per seconds
      this.setEmissionRate(this.getTotalParticles() / this.getLife())

      // color of particles
      this.setStartColor(color(194, 64, 31, 255))
      this.setStartColorVar(color(0, 0, 0, 0))
      this.setEndColor(color(0, 0, 0, 255))
      this.setEndColorVar(color(0, 0, 0, 0))

      return true
    }
    return false
  }
}
