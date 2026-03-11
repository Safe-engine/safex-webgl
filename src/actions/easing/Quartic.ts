import { ActionEase } from './ActionEase'

/**
 * EaseQuadraticActionIn action. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticAction())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionIn());
 */
export const EaseQuadraticActionIn = ActionEase.extend(
  /** @lends EaseQuadraticActionIn# */ {
    _updateTime: function (time) {
      return Math.pow(time, 2)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionIn}
     */
    clone: function () {
      const action = new EaseQuadraticActionIn()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionIn}
     */
    reverse: function () {
      return new EaseQuadraticActionIn(this._inner.reverse())
    },
  },
)

export const _easeQuadraticActionIn = {
  easing: EaseQuadraticActionIn.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionIn());
 */
export const easeQuadraticActionIn = function () {
  return _easeQuadraticActionIn
}

/**
 * EaseQuadraticActionIn action. <br />
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionOut())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionOut());
 */
export const EaseQuadraticActionOut = ActionEase.extend(
  /** @lends EaseQuadraticActionOut# */ {
    _updateTime: function (time) {
      return -time * (time - 2)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionOut}
     */
    clone: function () {
      const action = new EaseQuadraticActionOut()
      action.initWithAction()
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionOut}
     */
    reverse: function () {
      return new EaseQuadraticActionOut(this._inner.reverse())
    },
  },
)

export const _easeQuadraticActionOut = {
  easing: EaseQuadraticActionOut.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionOut
  },
}
/**
 * Creates the action easing object. <br />
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionOut());
 */
export const easeQuadraticActionOut = function () {
  return _easeQuadraticActionOut
}

/**
 * EaseQuadraticActionInOut action. <br />
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionInOut())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionInOut());
 */
export const EaseQuadraticActionInOut = ActionEase.extend(
  /** @lends EaseQuadraticActionInOut# */ {
    _updateTime: function (time) {
      let resultTime = time
      time *= 2
      if (time < 1) {
        resultTime = time * time * 0.5
      } else {
        --time
        resultTime = -0.5 * (time * (time - 2) - 1)
      }
      return resultTime
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionInOut}
     */
    clone: function () {
      const action = new EaseQuadraticActionInOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionInOut}
     */
    reverse: function () {
      return new EaseQuadraticActionInOut(this._inner.reverse())
    },
  },
)

export const _easeQuadraticActionInOut = {
  easing: EaseQuadraticActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionInOut());
 */
export const easeQuadraticActionInOut = function () {
  return _easeQuadraticActionInOut
}

/**
 * EaseQuarticActionIn action. <br />
 * Reference easeInQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuarticActionIn());
 *
 * @example
 * //The old usage
 * EaseQuarticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuarticActionIn());
 */
export const EaseQuarticActionIn = ActionEase.extend(
  /** @lends EaseQuarticActionIn# */ {
    _updateTime: function (time) {
      return time * time * time * time
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionIn}
     */
    clone: function () {
      const action = new EaseQuarticActionIn()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionIn}
     */
    reverse: function () {
      return new EaseQuarticActionIn(this._inner.reverse())
    },
  },
)

export const _easeQuarticActionIn = {
  easing: EaseQuarticActionIn.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionIn
  },
}
/**
 * Creates the action easing object. <br />
 * Reference easeIntQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuarticActionIn());
 */
export const easeQuarticActionIn = function () {
  return _easeQuarticActionIn
}

/**
 * EaseQuarticActionOut action. <br />
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(QuarticActionOut());
 *
 * @example
 * //The old usage
 * EaseQuarticActionOut.create(action);
 * //The new usage
 * action.easing(EaseQuarticActionOut());
 */
export const EaseQuarticActionOut = ActionEase.extend(
  /** @lends EaseQuarticActionOut# */ {
    _updateTime: function (time) {
      time -= 1
      return -(time * time * time * time - 1)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionOut}
     */
    clone: function () {
      const action = new EaseQuarticActionOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionOut}
     */
    reverse: function () {
      return new EaseQuarticActionOut(this._inner.reverse())
    },
  },
)

export const _easeQuarticActionOut = {
  easing: EaseQuarticActionOut.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(QuarticActionOut());
 */
export const easeQuarticActionOut = function () {
  return _easeQuarticActionOut
}

/**
 * EaseQuarticActionInOut action. <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuarticActionInOut());
 *
 * @example
 * //The old usage
 * EaseQuarticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuarticActionInOut());
 */
export const EaseQuarticActionInOut = ActionEase.extend(
  /** @lends EaseQuarticActionInOut# */ {
    _updateTime: function (time) {
      time = time * 2
      if (time < 1) return 0.5 * time * time * time * time
      time -= 2
      return -0.5 * (time * time * time * time - 2)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(this._updateTime(dt))
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionInOut}
     */
    clone: function () {
      const action = new EaseQuarticActionInOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionInOut}
     */
    reverse: function () {
      return new EaseQuarticActionInOut(this._inner.reverse())
    },
  },
)

export const _easeQuarticActionInOut = {
  easing: EaseQuarticActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionInOut
  },
}
/**
 * Creates the action easing object.  <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
export const easeQuarticActionInOut = function () {
  return _easeQuarticActionInOut
}
