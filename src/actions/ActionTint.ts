/** Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @example
 * var action = new TintTo(2, 255, 0, 255);
 */
TintTo = ActionInterval.extend(
  /** @lends TintTo# */ {
    _to: null,
    _from: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration
     * @param {Number} red 0-255
     * @param {Number} green  0-255
     * @param {Number} blue 0-255
     */
    ctor: function (duration, red, green, blue) {
      ActionInterval.prototype.ctor.call(this)
      this._to = color(0, 0, 0)
      this._from = color(0, 0, 0)

      blue !== undefined && this.initWithDuration(duration, red, green, blue)
    },

    /**
     * Initializes the action.
     * @param {Number} duration
     * @param {Number} red 0-255
     * @param {Number} green 0-255
     * @param {Number} blue 0-255
     * @return {Boolean}
     */
    initWithDuration: function (duration, red, green, blue) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        this._to = color(red, green, blue)
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {TintTo}
     */
    clone: function () {
      const action = new TintTo()
      this._cloneDecoration(action)
      const locTo = this._to
      action.initWithDuration(this._duration, locTo.r, locTo.g, locTo.b)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)

      this._from = this.target.color
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt time in seconds
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      const locFrom = this._from,
        locTo = this._to
      if (locFrom) {
        this.target.setColor(
          color(locFrom.r + (locTo.r - locFrom.r) * dt, locFrom.g + (locTo.g - locFrom.g) * dt, locFrom.b + (locTo.b - locFrom.b) * dt),
        )
      }
    },
  },
)

/**
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * @function
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {TintTo}
 * @example
 * // example
 * var action = tintTo(2, 255, 0, 255);
 */
tintTo = function (duration, red, green, blue) {
  return new TintTo(duration, red, green, blue)
}
/**
 * Please use tintTo instead.
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * @static
 * @deprecated since v3.0 please use tintTo instead.
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {TintTo}
 */
TintTo.create = tintTo

/**  Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * Relative to their own color change.
 * @class
 * @extends ActionInterval
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @example
 * var action = new TintBy(2, -127, -255, -127);
 */
TintBy = ActionInterval.extend(
  /** @lends TintBy# */ {
    _deltaR: 0,
    _deltaG: 0,
    _deltaB: 0,

    _fromR: 0,
    _fromG: 0,
    _fromB: 0,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration  duration in seconds
     * @param {Number} deltaRed
     * @param {Number} deltaGreen
     * @param {Number} deltaBlue
     */
    ctor: function (duration, deltaRed, deltaGreen, deltaBlue) {
      ActionInterval.prototype.ctor.call(this)
      deltaBlue !== undefined && this.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue)
    },

    /**
     * Initializes the action.
     * @param {Number} duration
     * @param {Number} deltaRed 0-255
     * @param {Number} deltaGreen 0-255
     * @param {Number} deltaBlue 0-255
     * @return {Boolean}
     */
    initWithDuration: function (duration, deltaRed, deltaGreen, deltaBlue) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        this._deltaR = deltaRed
        this._deltaG = deltaGreen
        this._deltaB = deltaBlue
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {TintBy}
     */
    clone: function () {
      const action = new TintBy()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)

      const color = target.color
      this._fromR = color.r
      this._fromG = color.g
      this._fromB = color.b
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt time in seconds
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)

      this.target.color = color(this._fromR + this._deltaR * dt, this._fromG + this._deltaG * dt, this._fromB + this._deltaB * dt)
    },

    /**
     * Returns a reversed action.
     * @return {TintBy}
     */
    reverse: function () {
      const action = new TintBy(this._duration, -this._deltaR, -this._deltaG, -this._deltaB)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * Relative to their own color change.
 * @function
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {TintBy}
 * @example
 * // example
 * var action = tintBy(2, -127, -255, -127);
 */
tintBy = function (duration, deltaRed, deltaGreen, deltaBlue) {
  return new TintBy(duration, deltaRed, deltaGreen, deltaBlue)
}
/**
 * Please use tintBy instead.
 * Tints a Node that implements the NodeRGB protocol from current tint to a custom one.
 * Relative to their own color change.
 * @static
 * @deprecated since v3.0 please use tintBy instead.
 * @param {Number} duration  duration in seconds
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {TintBy}
 */
TintBy.create = tintBy
