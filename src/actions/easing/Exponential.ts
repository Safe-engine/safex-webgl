import { ActionEase } from './ActionEase'

/**
 * Ease Exponential In. Slow to Fast. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please action.easing(easeExponentialIn())
 *
 * @example
 * //The old usage
 * EaseExponentialIn.create(action);
 * //The new usage
 * action.easing(easeExponentialIn());
 */
export const EaseExponentialIn = ActionEase.extend(
  /** @lends EaseExponentialIn# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1)))
    },

    /**
     * Create a EaseExponentialOut action. Opposite with the original motion trajectory.
     * @return {EaseExponentialOut}
     */
    reverse: function () {
      return new EaseExponentialOut(this._inner.reverse())
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialIn}
     */
    clone: function () {
      const action = new EaseExponentialIn()
      action.initWithAction(this._inner.clone())
      return action
    },
  },
)

export const _easeExponentialInObj = {
  easing: function (dt) {
    return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1))
  },
  reverse: function () {
    return _easeExponentialOutObj
  },
}

/**
 * Creates the action easing object with the rate parameter. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialIn());
 */
export const easeExponentialIn = function () {
  return _easeExponentialInObj
}

/**
 * Ease Exponential Out. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialOut())
 *
 * @example
 * //The old usage
 * EaseExponentialOut.create(action);
 * //The new usage
 * action.easing(easeExponentialOut());
 */
export const EaseExponentialOut = ActionEase.extend(
  /** @lends EaseExponentialOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(dt === 1 ? 1 : -Math.pow(2, -10 * dt) + 1)
    },

    /**
     * Create a EaseExponentialIn action. Opposite with the original motion trajectory.
     * @return {EaseExponentialIn}
     */
    reverse: function () {
      return new EaseExponentialIn(this._inner.reverse())
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialOut}
     */
    clone: function () {
      const action = new EaseExponentialOut()
      action.initWithAction(this._inner.clone())
      return action
    },
  },
)

export const _easeExponentialOutObj = {
  easing: function (dt) {
    return dt === 1 ? 1 : -Math.pow(2, -10 * dt) + 1
  },
  reverse: function () {
    return _easeExponentialInObj
  },
}

/**
 * creates the action easing object. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialOut());
 */
export const easeExponentialOut = function () {
  return _easeExponentialOutObj
}

/**
 * Ease Exponential InOut. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialInOut)
 *
 * @example
 * //The old usage
 * EaseExponentialInOut.create(action);
 * //The new usage
 * action.easing(easeExponentialInOut());
 */
export const EaseExponentialInOut = ActionEase.extend(
  /** @lends EaseExponentialInOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      if (dt !== 1 && dt !== 0) {
        dt *= 2
        if (dt < 1) dt = 0.5 * Math.pow(2, 10 * (dt - 1))
        else dt = 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2)
      }
      this._inner.update(dt)
    },

    /**
     * Create a EaseExponentialInOut action. Opposite with the original motion trajectory.
     * @return {EaseExponentialInOut}
     */
    reverse: function () {
      return new EaseExponentialInOut(this._inner.reverse())
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialInOut}
     */
    clone: function () {
      const action = new EaseExponentialInOut()
      action.initWithAction(this._inner.clone())
      return action
    },
  },
)

export const _easeExponentialInOutObj = {
  easing: function (dt) {
    if (dt !== 1 && dt !== 0) {
      dt *= 2
      if (dt < 1) return 0.5 * Math.pow(2, 10 * (dt - 1))
      else return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2)
    }
    return dt
  },
  reverse: function () {
    return _easeExponentialInOutObj
  },
}

/**
 * creates an EaseExponentialInOut action easing object. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialInOut());
 */
export const easeExponentialInOut = function () {
  return _easeExponentialInOutObj
}
