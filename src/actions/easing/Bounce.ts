/**
 * EaseBounce abstract class.
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.
 *
 * @class
 * @extends ActionEase
 */
export const EaseBounce = ActionEase.extend(
  /** @lends EaseBounce# */ {
    /**
     * @param {Number} time1
     * @return {Number}
     */
    bounceTime: function (time1) {
      if (time1 < 1 / 2.75) {
        return 7.5625 * time1 * time1
      } else if (time1 < 2 / 2.75) {
        time1 -= 1.5 / 2.75
        return 7.5625 * time1 * time1 + 0.75
      } else if (time1 < 2.5 / 2.75) {
        time1 -= 2.25 / 2.75
        return 7.5625 * time1 * time1 + 0.9375
      }

      time1 -= 2.625 / 2.75
      return 7.5625 * time1 * time1 + 0.984375
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounce}
     */
    clone: function () {
      const action = new EaseBounce()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounce}
     */
    reverse: function () {
      return new EaseBounce(this._inner.reverse())
    },
  },
)

/**
 * EaseBounceIn action. <br />
 * Eased bounce effect at the beginning.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(easeBounceIn())
 *
 * @example
 * //The old usage
 * EaseBounceIn.create(action);
 * //The new usage
 * action.easing(easeBounceIn());
 */
export const EaseBounceIn = EaseBounce.extend(
  /** @lends EaseBounceIn# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      const newT = 1 - this.bounceTime(1 - dt)
      this._inner.update(newT)
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceOut}
     */
    reverse: function () {
      return new EaseBounceOut(this._inner.reverse())
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceIn}
     */
    clone: function () {
      const action = new EaseBounceIn()
      action.initWithAction(this._inner.clone())
      return action
    },
  },
)

export const _bounceTime = function (time1) {
  if (time1 < 1 / 2.75) {
    return 7.5625 * time1 * time1
  } else if (time1 < 2 / 2.75) {
    time1 -= 1.5 / 2.75
    return 7.5625 * time1 * time1 + 0.75
  } else if (time1 < 2.5 / 2.75) {
    time1 -= 2.25 / 2.75
    return 7.5625 * time1 * time1 + 0.9375
  }

  time1 -= 2.625 / 2.75
  return 7.5625 * time1 * time1 + 0.984375
}

export const _easeBounceInObj = {
  easing: function (dt) {
    return 1 - _bounceTime(1 - dt)
  },
  reverse: function () {
    return _easeBounceOutObj
  },
}

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceIn());
 */
export const easeBounceIn = function () {
  return _easeBounceInObj
}

/**
 * EaseBounceOut action. <br />
 * Eased bounce effect at the ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(easeBounceOut())
 *
 * @example
 * //The old usage
 * EaseBounceOut.create(action);
 * //The new usage
 * action.easing(easeBounceOut());
 */
export const EaseBounceOut = EaseBounce.extend(
  /** @lends EaseBounceOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      const newT = this.bounceTime(dt)
      this._inner.update(newT)
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceIn}
     */
    reverse: function () {
      return new EaseBounceIn(this._inner.reverse())
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceOut}
     */
    clone: function () {
      const action = new EaseBounceOut()
      action.initWithAction(this._inner.clone())
      return action
    },
  },
)

export const _easeBounceOutObj = {
  easing: function (dt) {
    return _bounceTime(dt)
  },
  reverse: function () {
    return _easeBounceInObj
  },
}

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the ending.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceOut());
 */
export const easeBounceOut = function () {
  return _easeBounceOutObj
}

/**
 * EaseBounceInOut action. <br />
 * Eased bounce effect at the beginning and ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 <br /> Please use acton.easing(easeBounceInOut())
 *
 * @example
 * //The old usage
 * EaseBounceInOut.create(action);
 * //The new usage
 * action.easing(easeBounceInOut());
 */
export const EaseBounceInOut = EaseBounce.extend(
  /** @lends EaseBounceInOut# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      let newT = 0
      if (dt < 0.5) {
        dt = dt * 2
        newT = (1 - this.bounceTime(1 - dt)) * 0.5
      } else {
        newT = this.bounceTime(dt * 2 - 1) * 0.5 + 0.5
      }
      this._inner.update(newT)
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceInOut}
     */
    clone: function () {
      const action = new EaseBounceInOut()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceInOut}
     */
    reverse: function () {
      return new EaseBounceInOut(this._inner.reverse())
    },
  },
)

export const _easeBounceInOutObj = {
  easing: function (time1) {
    let newT
    if (time1 < 0.5) {
      time1 = time1 * 2
      newT = (1 - _bounceTime(1 - time1)) * 0.5
    } else {
      newT = _bounceTime(time1 * 2 - 1) * 0.5 + 0.5
    }
    return newT
  },
  reverse: function () {
    return _easeBounceInOutObj
  },
}

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning and ending.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceInOut());
 */
export const easeBounceInOut = function () {
  return _easeBounceInOutObj
}
