import { director, game } from '..'
import { color, p } from '../core'
import { _renderType } from '../helper/engine'

export const ParticleFire = ParticleSystem.extend(
  /** @lends ParticleFire# */ {
    /**
     * <p>The ParticleFire's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFire()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 300 : 150)
    },

    /**
     * initialize a fire particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a fire particle system
 * @deprecated since v3.0 please use new ParticleFire() instead
 * @return {ParticleFire}
 */
ParticleFire.create = function () {
  return new ParticleFire()
}

/**
 * A fireworks particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleFireworks();
 */
ParticleFireworks = ParticleSystem.extend(
  /** @lends ParticleFireworks# */ {
    /**
     * <p>The ParticleFireworks's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFireworks()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 1500 : 150)
    },

    /**
     * initialize a fireworks particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a fireworks particle system
 * @deprecated since v3.0 please use new ParticleFireworks() instead.
 * @return {ParticleFireworks}
 */
ParticleFireworks.create = function () {
  return new ParticleFireworks()
}

/**
 * A sun particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSun();
 */
ParticleSun = ParticleSystem.extend(
  /** @lends ParticleSun# */ {
    /**
     * <p>The ParticleSun's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSun()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 350 : 150)
    },

    /**
     * initialize a sun particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a sun particle system
 * @deprecated since v3.0 please use new ParticleSun() instead.
 * @return {ParticleSun}
 */
ParticleSun.create = function () {
  return new ParticleSun()
}

//! @brief A  particle system
/**
 * A galaxy particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleGalaxy();
 */
ParticleGalaxy = ParticleSystem.extend(
  /** @lends ParticleGalaxy# */ {
    /**
     * <p>The ParticleGalaxy's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleGalaxy()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 200 : 100)
    },

    /**
     * initialize a galaxy particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)
/**
 * Create a galaxy particle system
 * @deprecated since v3.0 please use new OarticleGalaxy() instead.
 * @return {ParticleGalaxy}
 */
ParticleGalaxy.create = function () {
  return new ParticleGalaxy()
}

/**
 * A flower particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleFlower();
 */
ParticleFlower = ParticleSystem.extend(
  /** @lends ParticleFlower# */ {
    /**
     * <p>The ParticleFlower's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleFlower()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 250 : 100)
    },

    /**
     * initialize a flower particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a flower particle system
 * @deprecated since v3.0 please use new ParticleFlower() instead.
 * @return {ParticleFlower}
 */
ParticleFlower.create = function () {
  return new ParticleFlower()
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
ParticleMeteor = ParticleSystem.extend(
  /** @lends ParticleMeteor# */ {
    /**
     * <p>The ParticleMeteor's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleMeteor()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 150 : 100)
    },

    /**
     * initialize a meteor particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a meteor particle system
 * @deprecated since v3.0 please use new ParticleMeteor() instead.
 * @return {ParticleMeteor}
 */
ParticleMeteor.create = function () {
  return new ParticleMeteor()
}

/**
 * A spiral particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSpiral();
 */
ParticleSpiral = ParticleSystem.extend(
  /** @lends ParticleSpiral# */ {
    /**
     * <p>The ParticleSpiral's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSpiral()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 500 : 100)
    },

    /**
     * initialize a spiral particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a spiral particle system
 * @deprecated since v3.0 please use new ParticleSpiral() instead.
 * @return {ParticleSpiral}
 */
ParticleSpiral.create = function () {
  return new ParticleSpiral()
}

/**
 * An explosion particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleExplosion();
 */
ParticleExplosion = ParticleSystem.extend(
  /** @lends ParticleExplosion# */ {
    /**
     * <p>The ParticleExplosion's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleExplosion()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 700 : 300)
    },

    /**
     * initialize an explosion particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create an explosion particle system
 * @deprecated since v3.0 please use new ParticleExplosion() instead.
 * @return {ParticleExplosion}
 */
ParticleExplosion.create = function () {
  return new ParticleExplosion()
}

/**
 * A smoke particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSmoke();
 */
ParticleSmoke = ParticleSystem.extend(
  /** @lends ParticleSmoke# */ {
    /**
     * <p>The ParticleSmoke's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSmoke()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 200 : 100)
    },

    /**
     * initialize a smoke particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a smoke particle system
 * @deprecated since v3.0 please use new ParticleSmoke() instead.
 * @return {ParticleSmoke}
 */
ParticleSmoke.create = function () {
  return new ParticleSmoke()
}

/**
 * A snow particle system
 * @class
 * @extends ParticleSystem
 *
 * @example
 * var emitter = new ParticleSnow();
 */
ParticleSnow = ParticleSystem.extend(
  /** @lends ParticleSnow# */ {
    /**
     * <p>The ParticleSnow's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleSnow()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 700 : 250)
    },

    /**
     * initialize a snow particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)

/**
 * Create a snow particle system
 * @deprecated since v3.0 please use new ParticleSnow() instead.
 * @return {ParticleSnow}
 */
ParticleSnow.create = function () {
  return new ParticleSnow()
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
ParticleRain = ParticleSystem.extend(
  /** @lends ParticleRain# */ {
    /**
     * <p>The ParticleRain's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new ParticleRain()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      ParticleSystem.prototype.ctor.call(this, _renderType === game.RENDER_TYPE_WEBGL ? 1000 : 300)
    },

    /**
     * initialize a rain particle system with number Of Particles
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles: function (numberOfParticles) {
      if (ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
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
    },
  },
)
