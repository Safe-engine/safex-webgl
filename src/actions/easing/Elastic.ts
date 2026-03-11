import { log } from '../../helper/Debugger'
import { ActionEase } from './ActionEase'

/**
 * Ease Elastic abstract class.
 * @class
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} [period=0.3]
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.
 */
export const EaseElastic = ActionEase.extend(
  /** @lends EaseElastic# */ {
    _period: 0.3,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Creates the action with the inner action and the period in radians (default is 0.3).
     * @param {ActionInterval} action
     * @param {Number} [period=0.3]
     */
    ctor: function (action, period) {
      ActionEase.prototype.ctor.call(this)

      action && this.initWithAction(action, period)
    },

    /**
     * get period of the wave in radians. default is 0.3
     * @return {Number}
     */
    getPeriod: function () {
      return this._period
    },

    /**
     * set period of the wave in radians.
     * @param {Number} period
     */
    setPeriod: function (period) {
      this._period = period
    },

    /**
     * Initializes the action with the inner action and the period in radians (default is 0.3)
     * @param {ActionInterval} action
     * @param {Number} [period=0.3]
     * @return {Boolean}
     */
    initWithAction: function (action, period) {
      ActionEase.prototype.initWithAction.call(this, action)
      this._period = period == null ? 0.3 : period
      return true
    },

    /**
     * Create a action. Opposite with the original motion trajectory. <br />
     * Will be overwrite.
     * @return {?Action}
     */
    reverse: function () {
      log('EaseElastic.reverse(): it should be overridden in subclass.')
      return null
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElastic}
     */
    clone: function () {
      const action = new EaseElastic()
      action.initWithAction(this._inner.clone(), this._period)
      return action
    },
  },
)

/**
 * Ease Elastic In action. <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(easeElasticIn())
 *
 * @example
 * //The old usage
 * EaseElasticIn.create(action, period);
 * //The new usage
 * action.easing(easeElasticIn(period));
 */
export const EaseElasticIn = EaseElastic.extend(
  /** @lends EaseElasticIn# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      let newT = 0
      if (dt === 0 || dt === 1) {
        newT = dt
      } else {
        const s = this._period / 4
        dt = dt - 1
        newT = -Math.pow(2, 10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / this._period)
      }
      this._inner.update(newT)
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticOut}
     */
    reverse: function () {
      return new EaseElasticOut(this._inner.reverse(), this._period)
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticIn}
     */
    clone: function () {
      const action = new EaseElasticIn()
      action.initWithAction(this._inner.clone(), this._period)
      return action
    },
  },
)

//default ease elastic in object (period = 0.3)
export const _easeElasticInObj = {
  easing: function (dt) {
    if (dt === 0 || dt === 1) return dt
    dt = dt - 1
    return -Math.pow(2, 10 * dt) * Math.sin(((dt - 0.3 / 4) * Math.PI * 2) / 0.3)
  },
  reverse: function () {
    return _easeElasticOutObj
  },
}

/**
 * Creates the action easing obejct with the period in radians (default is 0.3). <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticIn(3.0));
 */
export const easeElasticIn = function (period) {
  if (period && period !== 0.3) {
    return {
      _period: period,
      easing: function (dt) {
        if (dt === 0 || dt === 1) return dt
        dt = dt - 1
        return -Math.pow(2, 10 * dt) * Math.sin(((dt - this._period / 4) * Math.PI * 2) / this._period)
      },
      reverse: function () {
        return easeElasticOut(this._period)
      },
    }
  }
  return _easeElasticInObj
}

/**
 * Ease Elastic Out action. <br />
 * Reference easeOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeElasticOut(period))
 *
 * @example
 * //The old usage
 * EaseElasticOut.create(action, period);
 * //The new usage
 * action.easing(easeElasticOut(period));
 */
export const EaseElasticOut = EaseElastic.extend(
  /** @lends EaseElasticOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      let newT = 0
      if (dt === 0 || dt === 1) {
        newT = dt
      } else {
        const s = this._period / 4
        newT = Math.pow(2, -10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / this._period) + 1
      }

      this._inner.update(newT)
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticIn}
     */
    reverse: function () {
      return new EaseElasticIn(this._inner.reverse(), this._period)
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticOut}
     */
    clone: function () {
      const action = new EaseElasticOut()
      action.initWithAction(this._inner.clone(), this._period)
      return action
    },
  },
)

//default ease elastic out object (period = 0.3)
export const _easeElasticOutObj = {
  easing: function (dt) {
    return dt === 0 || dt === 1 ? dt : Math.pow(2, -10 * dt) * Math.sin(((dt - 0.3 / 4) * Math.PI * 2) / 0.3) + 1
  },
  reverse: function () {
    return _easeElasticInObj
  },
}
/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticOut(3.0));
 */
export const easeElasticOut = function (period) {
  if (period && period !== 0.3) {
    return {
      _period: period,
      easing: function (dt) {
        return dt === 0 || dt === 1 ? dt : Math.pow(2, -10 * dt) * Math.sin(((dt - this._period / 4) * Math.PI * 2) / this._period) + 1
      },
      reverse: function () {
        return easeElasticIn(this._period)
      },
    }
  }
  return _easeElasticOutObj
}

/**
 * Ease Elastic InOut action. <br />
 * Reference easeInOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(easeElasticInOut())
 *
 * @example
 * //The old usage
 * EaseElasticInOut.create(action, period);
 * //The new usage
 * action.easing(easeElasticInOut(period));
 */
export const EaseElasticInOut = EaseElastic.extend(
  /** @lends EaseElasticInOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      let newT = 0
      let locPeriod = this._period
      if (dt === 0 || dt === 1) {
        newT = dt
      } else {
        dt = dt * 2
        if (!locPeriod) locPeriod = this._period = 0.3 * 1.5

        const s = locPeriod / 4
        dt = dt - 1
        if (dt < 0) newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / locPeriod)
        else newT = Math.pow(2, -10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / locPeriod) * 0.5 + 1
      }
      this._inner.update(newT)
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticInOut}
     */
    reverse: function () {
      return new EaseElasticInOut(this._inner.reverse(), this._period)
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticInOut}
     */
    clone: function () {
      const action = new EaseElasticInOut()
      action.initWithAction(this._inner.clone(), this._period)
      return action
    },
  },
)

/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeInOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticInOut(3.0));
 */
export const easeElasticInOut = function (period) {
  period = period || 0.3
  return {
    _period: period,
    easing: function (dt) {
      let newT = 0
      let locPeriod = this._period
      if (dt === 0 || dt === 1) {
        newT = dt
      } else {
        dt = dt * 2
        if (!locPeriod) locPeriod = this._period = 0.3 * 1.5
        const s = locPeriod / 4
        dt = dt - 1
        if (dt < 0) newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / locPeriod)
        else newT = Math.pow(2, -10 * dt) * Math.sin(((dt - s) * Math.PI * 2) / locPeriod) * 0.5 + 1
      }
      return newT
    },
    reverse: function () {
      return easeElasticInOut(this._period)
    },
  }
}
