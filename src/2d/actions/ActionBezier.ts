/**
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} t
 * @return {Number}
 */
bezierAt = function (a, b, c, d, t) {
  return Math.pow(1 - t, 3) * a + 3 * t * Math.pow(1 - t, 2) * b + 3 * Math.pow(t, 2) * (1 - t) * c + Math.pow(t, 3) * d
}

/** An action that moves the target with a cubic Bezier curve by a certain distance.
 * Relative to its movement.
 * @class
 * @extends ActionInterval
 * @param {Number} t time in seconds
 * @param {Array} c Array of points
 * @example
 * var bezier = [p(0, windowSize.height / 2), p(300, -windowSize.height / 2), p(300, 100)];
 * var bezierForward = new BezierBy(3, bezier);
 */
BezierBy = ActionInterval.extend(
  /** @lends BezierBy# */ {
    _config: null,
    _startPosition: null,
    _previousPosition: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} t time in seconds
     * @param {Array} c Array of points
     */
    ctor: function (t, c) {
      ActionInterval.prototype.ctor.call(this)
      this._config = []
      this._startPosition = p(0, 0)
      this._previousPosition = p(0, 0)

      c && this.initWithDuration(t, c)
    },

    /**
     * Initializes the action.
     * @param {Number} t time in seconds
     * @param {Array} c Array of points
     * @return {Boolean}
     */
    initWithDuration: function (t, c) {
      if (ActionInterval.prototype.initWithDuration.call(this, t)) {
        this._config = c
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {BezierBy}
     */
    clone: function () {
      const action = new BezierBy()
      this._cloneDecoration(action)
      const newConfigs = []
      for (let i = 0; i < this._config.length; i++) {
        const selConf = this._config[i]
        newConfigs.push(p(selConf.x, selConf.y))
      }
      action.initWithDuration(this._duration, newConfigs)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      const locPosX = target.getPositionX()
      const locPosY = target.getPositionY()
      this._previousPosition.x = locPosX
      this._previousPosition.y = locPosY
      this._startPosition.x = locPosX
      this._startPosition.y = locPosY
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      if (this.target) {
        const locConfig = this._config
        const xa = 0
        const xb = locConfig[0].x
        const xc = locConfig[1].x
        const xd = locConfig[2].x

        const ya = 0
        const yb = locConfig[0].y
        const yc = locConfig[1].y
        const yd = locConfig[2].y

        let x = bezierAt(xa, xb, xc, xd, dt)
        let y = bezierAt(ya, yb, yc, yd, dt)

        const locStartPosition = this._startPosition
        if (ENABLE_STACKABLE_ACTIONS) {
          const targetX = this.target.getPositionX()
          const targetY = this.target.getPositionY()
          const locPreviousPosition = this._previousPosition

          locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x
          locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y
          x = x + locStartPosition.x
          y = y + locStartPosition.y
          locPreviousPosition.x = x
          locPreviousPosition.y = y
          this.target.setPosition(x, y)
        } else {
          this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y)
        }
      }
    },

    /**
     * Returns a reversed action.
     * @return {BezierBy}
     */
    reverse: function () {
      const locConfig = this._config
      const r = [pAdd(locConfig[1], pNeg(locConfig[2])), pAdd(locConfig[0], pNeg(locConfig[2])), pNeg(locConfig[2])]
      const action = new BezierBy(this._duration, r)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * An action that moves the target with a cubic Bezier curve by a certain distance.
 * Relative to its movement.
 * @function
 * @param {Number} t time in seconds
 * @param {Array} c Array of points
 * @return {BezierBy}
 * @example
 * // example
 * var bezier = [p(0, windowSize.height / 2), p(300, -windowSize.height / 2), p(300, 100)];
 * var bezierForward = bezierBy(3, bezier);
 */
bezierBy = function (t, c) {
  return new BezierBy(t, c)
}
/**
 * Please use bezierBy instead.
 * An action that moves the target with a cubic Bezier curve by a certain distance.
 * Relative to its movement.
 * @static
 * @deprecated since v3.0 please use bezierBy instead.
 * @param {Number} t time in seconds
 * @param {Array} c Array of points
 * @return {BezierBy}
 */
BezierBy.create = bezierBy

/** An action that moves the target with a cubic Bezier curve to a destination point.
 * @class
 * @extends BezierBy
 * @param {Number} t
 * @param {Array} c array of points
 * @example
 * var bezier = [p(0, windowSize.height / 2), p(300, -windowSize.height / 2), p(300, 100)];
 * var bezierTo = new BezierTo(2, bezier);
 */
BezierTo = BezierBy.extend(
  /** @lends BezierTo# */ {
    _toConfig: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} t
     * @param {Array} c array of points
     * var bezierTo = new BezierTo(2, bezier);
     */
    ctor: function (t, c) {
      BezierBy.prototype.ctor.call(this)
      this._toConfig = []
      c && this.initWithDuration(t, c)
    },

    /**
     * Initializes the action.
     * @param {Number} t time in seconds
     * @param {Array} c Array of points
     * @return {Boolean}
     */
    initWithDuration: function (t, c) {
      if (ActionInterval.prototype.initWithDuration.call(this, t)) {
        this._toConfig = c
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {BezierTo}
     */
    clone: function () {
      const action = new BezierTo()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._toConfig)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      BezierBy.prototype.startWithTarget.call(this, target)
      const locStartPos = this._startPosition
      const locToConfig = this._toConfig
      const locConfig = this._config

      locConfig[0] = pSub(locToConfig[0], locStartPos)
      locConfig[1] = pSub(locToConfig[1], locStartPos)
      locConfig[2] = pSub(locToConfig[2], locStartPos)
    },
  },
)
/**
 * An action that moves the target with a cubic Bezier curve to a destination point.
 * @function
 * @param {Number} t
 * @param {Array} c array of points
 * @return {BezierTo}
 * @example
 * // example
 * var bezier = [p(0, windowSize.height / 2), p(300, -windowSize.height / 2), p(300, 100)];
 * var bezierTo = bezierTo(2, bezier);
 */
bezierTo = function (t, c) {
  return new BezierTo(t, c)
}
/**
 * Please use bezierTo instead
 * @static
 * @deprecated since v3.0 please use bezierTo instead.
 * @param {Number} t
 * @param {Array} c array of points
 * @return {BezierTo}
 */
BezierTo.create = bezierTo
