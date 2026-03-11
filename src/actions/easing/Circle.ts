/**
 * EaseCircleActionIn action. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionIn());
 *
 * @example
 * //The old usage
 * EaseCircleActionIn.create(action);
 * //The new usage
 * action.easing(easeCircleActionIn());
 */
export const EaseCircleActionIn = ActionEase.extend(
  /** @lends EaseCircleActionIn# */ {
    _updateTime: function (time) {
      return -1 * (Math.sqrt(1 - time * time) - 1)
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
     * @returns {EaseCircleActionIn}
     */
    clone: function () {
      const action = new EaseCircleActionIn()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionIn}
     */
    reverse: function () {
      return new EaseCircleActionIn(this._inner.reverse())
    },
  },
)

export const _easeCircleActionIn = {
  easing: EaseCircleActionIn.prototype._updateTime,
  reverse: function () {
    return _easeCircleActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionIn());
 */
export const easeCircleActionIn = function () {
  return _easeCircleActionIn
}

/**
 * EaseCircleActionOut action. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionOut());
 */
export const EaseCircleActionOut = ActionEase.extend(
  /** @lends EaseCircleActionOut# */ {
    _updateTime: function (time) {
      time = time - 1
      return Math.sqrt(1 - time * time)
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
     * @returns {EaseCircleActionOut}
     */
    clone: function () {
      const action = new EaseCircleActionOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionOut}
     */
    reverse: function () {
      return new EaseCircleActionOut(this._inner.reverse())
    },
  },
)

export const _easeCircleActionOut = {
  easing: EaseCircleActionOut.prototype._updateTime,
  reverse: function () {
    return _easeCircleActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @exampple
 * //example
 * actioneasing(easeCircleActionOut());
 */
export const easeCircleActionOut = function () {
  return _easeCircleActionOut
}

/**
 * EaseCircleActionInOut action. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionInOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionInOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionInOut());
 */
export const EaseCircleActionInOut = ActionEase.extend(
  /** @lends EaseCircleActionInOut# */ {
    _updateTime: function (time) {
      time = time * 2
      if (time < 1) return -0.5 * (Math.sqrt(1 - time * time) - 1)
      time -= 2
      return 0.5 * (Math.sqrt(1 - time * time) + 1)
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
     * @returns {EaseCircleActionInOut}
     */
    clone: function () {
      const action = new EaseCircleActionInOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionInOut}
     */
    reverse: function () {
      return new EaseCircleActionInOut(this._inner.reverse())
    },
  },
)

export const _easeCircleActionInOut = {
  easing: EaseCircleActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeCircleActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionInOut());
 */
export const easeCircleActionInOut = function () {
  return _easeCircleActionInOut
}
