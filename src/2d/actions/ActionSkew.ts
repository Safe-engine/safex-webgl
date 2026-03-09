/**
 * Please use actionInterval instead.
 * An interval action is an action that takes place within a certain period of time.
 * @static
 * @deprecated since v3.0 <br /> Please use actionInterval instead.
 * @param {Number} d duration in seconds
 * @return {ActionInterval}
 */
ActionInterval.create = actionInterval

/**
 * Skews a Node object to given angles by modifying it's skewX and skewY attributes
 * @class
 * @extends ActionInterval
 * @param {Number} t time in seconds
 * @param {Number} sx
 * @param {Number} sy
 * @example
 * var actionTo = new SkewTo(2, 37.2, -37.2);
 */
SkewTo = ActionInterval.extend(
  /** @lends SkewTo# */ {
    _skewX: 0,
    _skewY: 0,
    _startSkewX: 0,
    _startSkewY: 0,
    _endSkewX: 0,
    _endSkewY: 0,
    _deltaX: 0,
    _deltaY: 0,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} t time in seconds
     * @param {Number} sx
     * @param {Number} sy
     */
    ctor: function (t, sx, sy) {
      ActionInterval.prototype.ctor.call(this)

      sy !== undefined && this.initWithDuration(t, sx, sy)
    },

    /**
     * Initializes the action.
     * @param {Number} t time in seconds
     * @param {Number} sx
     * @param {Number} sy
     * @return {Boolean}
     */
    initWithDuration: function (t, sx, sy) {
      let ret = false
      if (ActionInterval.prototype.initWithDuration.call(this, t)) {
        this._endSkewX = sx
        this._endSkewY = sy
        ret = true
      }
      return ret
    },

    /**
     * returns a new clone of the action
     * @returns {SkewTo}
     */
    clone: function () {
      const action = new SkewTo()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._endSkewX, this._endSkewY)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)

      this._startSkewX = target.skewX % 180
      this._deltaX = this._endSkewX - this._startSkewX
      if (this._deltaX > 180) this._deltaX -= 360
      if (this._deltaX < -180) this._deltaX += 360

      this._startSkewY = target.skewY % 360
      this._deltaY = this._endSkewY - this._startSkewY
      if (this._deltaY > 180) this._deltaY -= 360
      if (this._deltaY < -180) this._deltaY += 360
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      this.target.skewX = this._startSkewX + this._deltaX * dt
      this.target.skewY = this._startSkewY + this._deltaY * dt
    },
  },
)
/**
 * Create new action.
 * Skews a Node object to given angles by modifying it's skewX and skewY attributes.
 * Changes to the specified value.
 * @function
 * @param {Number} t time in seconds
 * @param {Number} sx
 * @param {Number} sy
 * @return {SkewTo}
 * @example
 * // example
 * var actionTo = skewTo(2, 37.2, -37.2);
 */
skewTo = function (t, sx, sy) {
  return new SkewTo(t, sx, sy)
}
/**
 * Please use skewTo instead.
 * Skews a Node object to given angles by modifying it's skewX and skewY attributes。
 * Changes to the specified value.
 * @static
 * @deprecated since v3.0 <br /> Please use skewTo instead.
 * @param {Number} t time in seconds
 * @param {Number} sx
 * @param {Number} sy
 * @return {SkewTo}
 */
SkewTo.create = skewTo

/**
 * Skews a Node object by skewX and skewY degrees.
 * Relative to its attribute modification.
 * @class
 * @extends SkewTo
 * @param {Number} t time in seconds
 * @param {Number} sx  skew in degrees for X axis
 * @param {Number} sy  skew in degrees for Y axis
 */
SkewBy = SkewTo.extend(
  /** @lends SkewBy# */ {
    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} t time in seconds
     * @param {Number} sx  skew in degrees for X axis
     * @param {Number} sy  skew in degrees for Y axis
     */
    ctor: function (t, sx, sy) {
      SkewTo.prototype.ctor.call(this)
      sy !== undefined && this.initWithDuration(t, sx, sy)
    },

    /**
     * Initializes the action.
     * @param {Number} t time in seconds
     * @param {Number} deltaSkewX  skew in degrees for X axis
     * @param {Number} deltaSkewY  skew in degrees for Y axis
     * @return {Boolean}
     */
    initWithDuration: function (t, deltaSkewX, deltaSkewY) {
      let ret = false
      if (SkewTo.prototype.initWithDuration.call(this, t, deltaSkewX, deltaSkewY)) {
        this._skewX = deltaSkewX
        this._skewY = deltaSkewY
        ret = true
      }
      return ret
    },

    /**
     * returns a new clone of the action
     * @returns {SkewBy}
     */
    clone: function () {
      const action = new SkewBy()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._skewX, this._skewY)
      return action
    },

    /**
     * Start the action width target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      SkewTo.prototype.startWithTarget.call(this, target)
      this._deltaX = this._skewX
      this._deltaY = this._skewY
      this._endSkewX = this._startSkewX + this._deltaX
      this._endSkewY = this._startSkewY + this._deltaY
    },

    /**
     * Returns a reversed action.
     * @return {SkewBy}
     */
    reverse: function () {
      const action = new SkewBy(this._duration, -this._skewX, -this._skewY)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * Skews a Node object by skewX and skewY degrees. <br />
 * Relative to its attribute modification.
 * @function
 * @param {Number} t time in seconds
 * @param {Number} sx sx skew in degrees for X axis
 * @param {Number} sy sy skew in degrees for Y axis
 * @return {SkewBy}
 * @example
 * // example
 * var actionBy = skewBy(2, 0, -90);
 */
skewBy = function (t, sx, sy) {
  return new SkewBy(t, sx, sy)
}
/**
 * Please use skewBy instead. <br />
 * Skews a Node object by skewX and skewY degrees. <br />
 * Relative to its attribute modification.
 * @static
 * @deprecated since v3.0 please use skewBy instead.
 * @param {Number} t time in seconds
 * @param {Number} sx sx skew in degrees for X axis
 * @param {Number} sy sy skew in degrees for Y axis
 * @return {SkewBy}
 */
SkewBy.create = skewBy
