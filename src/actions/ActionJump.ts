/**
 * Moves a Node object simulating a parabolic jump movement by modifying it's position attribute.
 * Relative to its movement.
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionBy = new JumpBy(2, p(300, 0), 50, 4);
 * var actionBy = new JumpBy(2, 300, 0, 50, 4);
 */
JumpBy = ActionInterval.extend(
  /** @lends JumpBy# */ {
    _startPosition: null,
    _delta: null,
    _height: 0,
    _jumps: 0,
    _previousPosition: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration
     * @param {Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     */
    ctor: function (duration, position, y, height, jumps) {
      ActionInterval.prototype.ctor.call(this)
      this._startPosition = p(0, 0)
      this._previousPosition = p(0, 0)
      this._delta = p(0, 0)

      height !== undefined && this.initWithDuration(duration, position, y, height, jumps)
    },
    /**
     * Initializes the action.
     * @param {Number} duration
     * @param {Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     * @return {Boolean}
     * @example
     * actionBy.initWithDuration(2, p(300, 0), 50, 4);
     * actionBy.initWithDuration(2, 300, 0, 50, 4);
     */
    initWithDuration: function (duration, position, y, height, jumps) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        if (jumps === undefined) {
          jumps = height
          height = y
          y = position.y
          position = position.x
        }
        this._delta.x = position
        this._delta.y = y
        this._height = height
        this._jumps = jumps
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {JumpBy}
     */
    clone: function () {
      const action = new JumpBy()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._delta, this._height, this._jumps)
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
        const frac = (dt * this._jumps) % 1.0
        let y = this._height * 4 * frac * (1 - frac)
        y += this._delta.y * dt

        let x = this._delta.x * dt
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
     * @return {JumpBy}
     */
    reverse: function () {
      const action = new JumpBy(this._duration, p(-this._delta.x, -this._delta.y), this._height, this._jumps)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * Moves a Node object simulating a parabolic jump movement by modifying it's position attribute.
 * Relative to its movement.
 * @function
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpBy}
 * @example
 * // example
 * var actionBy = jumpBy(2, p(300, 0), 50, 4);
 * var actionBy = jumpBy(2, 300, 0, 50, 4);
 */
jumpBy = function (duration, position, y, height, jumps) {
  return new JumpBy(duration, position, y, height, jumps)
}
/**
 * Please use jumpBy instead. <br />
 * Moves a Node object simulating a parabolic jump movement by modifying it's position attribute. <br />
 * Relative to its movement.
 * @static
 * @deprecated since v3.0 please use jumpBy instead.
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpBy}
 */
JumpBy.create = jumpBy

/**
 * Moves a Node object to a parabolic position simulating a jump movement by modifying it's position attribute. <br />
 * Jump to the specified location.
 * @class
 * @extends JumpBy
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionTo = new JumpTo(2, p(300, 0), 50, 4);
 * var actionTo = new JumpTo(2, 300, 0, 50, 4);
 */
JumpTo = JumpBy.extend(
  /** @lends JumpTo# */ {
    _endPosition: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration
     * @param {Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     */
    ctor: function (duration, position, y, height, jumps) {
      JumpBy.prototype.ctor.call(this)
      this._endPosition = p(0, 0)

      height !== undefined && this.initWithDuration(duration, position, y, height, jumps)
    },
    /**
     * Initializes the action.
     * @param {Number} duration
     * @param {Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     * @return {Boolean}
     * @example
     * actionTo.initWithDuration(2, p(300, 0), 50, 4);
     * actionTo.initWithDuration(2, 300, 0, 50, 4);
     */
    initWithDuration: function (duration, position, y, height, jumps) {
      if (JumpBy.prototype.initWithDuration.call(this, duration, position, y, height, jumps)) {
        if (jumps === undefined) {
          y = position.y
          position = position.x
        }
        this._endPosition.x = position
        this._endPosition.y = y
        return true
      }
      return false
    },
    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      JumpBy.prototype.startWithTarget.call(this, target)
      this._delta.x = this._endPosition.x - this._startPosition.x
      this._delta.y = this._endPosition.y - this._startPosition.y
    },

    /**
     * returns a new clone of the action
     * @returns {JumpTo}
     */
    clone: function () {
      const action = new JumpTo()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._endPosition, this._height, this._jumps)
      return action
    },
  },
)

/**
 * Moves a Node object to a parabolic position simulating a jump movement by modifying it's position attribute. <br />
 * Jump to the specified location.
 * @function
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpTo}
 * @example
 * // example
 * var actionTo = jumpTo(2, p(300, 300), 50, 4);
 * var actionTo = jumpTo(2, 300, 300, 50, 4);
 */
jumpTo = function (duration, position, y, height, jumps) {
  return new JumpTo(duration, position, y, height, jumps)
}
/**
 * Please use jumpTo instead.
 * Moves a Node object to a parabolic position simulating a jump movement by modifying it's position attribute. <br />
 * Jump to the specified location.
 * @static
 * @deprecated since v3.0 please use jumpTo instead.
 * @param {Number} duration
 * @param {Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {JumpTo}
 */
JumpTo.create = jumpTo
