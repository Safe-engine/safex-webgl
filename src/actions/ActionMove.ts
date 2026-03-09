/**
 * <p>
 *     Moves a CCNode object x,y pixels by modifying it's position attribute.                                  <br/>
 *     x and y are relative to the position of the object.                                                     <br/>
 *     Several CCMoveBy actions can be concurrently called, and the resulting                                  <br/>
 *     movement will be the sum of individual movements.
 * </p>
 * @class
 * @extends ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Point|Number} deltaPos
 * @param {Number} [deltaY]
 * @example
 * var actionBy = moveBy(2, p(windowSize.width - 40, windowSize.height - 40));
 */
MoveBy = ActionInterval.extend(
  /** @lends MoveBy# */ {
    _positionDelta: null,
    _startPosition: null,
    _previousPosition: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration duration in seconds
     * @param {Point|Number} deltaPos
     * @param {Number} [deltaY]
     */
    ctor: function (duration, deltaPos, deltaY) {
      ActionInterval.prototype.ctor.call(this)

      this._positionDelta = p(0, 0)
      this._startPosition = p(0, 0)
      this._previousPosition = p(0, 0)

      deltaPos !== undefined && this.initWithDuration(duration, deltaPos, deltaY)
    },

    /**
     * Initializes the action.
     * @param {Number} duration duration in seconds
     * @param {Point} position
     * @param {Number} [y]
     * @return {Boolean}
     */
    initWithDuration: function (duration, position, y) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        if (position.x !== undefined) {
          y = position.y
          position = position.x
        }

        this._positionDelta.x = position
        this._positionDelta.y = y
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {MoveBy}
     */
    clone: function () {
      const action = new MoveBy()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._positionDelta)
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
        let x = this._positionDelta.x * dt
        let y = this._positionDelta.y * dt
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
     * MoveTo reverse is not implemented
     * @return {MoveBy}
     */
    reverse: function () {
      const action = new MoveBy(this._duration, p(-this._positionDelta.x, -this._positionDelta.y))
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * Create the action.
 * Relative to its coordinate moves a certain distance.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {MoveBy}
 * @example
 * // example
 * var actionBy = moveBy(2, p(windowSize.width - 40, windowSize.height - 40));
 */
moveBy = function (duration, deltaPos, deltaY) {
  return new MoveBy(duration, deltaPos, deltaY)
}
/**
 * Please use moveBy instead.
 * Relative to its coordinate moves a certain distance.
 * @static
 * @deprecated since v3.0 please use moveBy instead.
 * @param {Number} duration duration in seconds
 * @param {Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {MoveBy}
 */
MoveBy.create = moveBy

/**
 * Moves a CCNode object to the position x,y. x and y are absolute coordinates by modifying it's position attribute. <br/>
 * Several CCMoveTo actions can be concurrently called, and the resulting                                            <br/>
 * movement will be the sum of individual movements.
 * @class
 * @extends MoveBy
 * @param {Number} duration duration in seconds
 * @param {Point|Number} position
 * @param {Number} y
 * @example
 * var actionTo = new MoveTo(2, p(80, 80));
 */
MoveTo = MoveBy.extend(
  /** @lends MoveTo# */ {
    _endPosition: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration duration in seconds
     * @param {Point|Number} position
     * @param {Number} y
     */
    ctor: function (duration, position, y) {
      MoveBy.prototype.ctor.call(this)
      this._endPosition = p(0, 0)

      position !== undefined && this.initWithDuration(duration, position, y)
    },

    /**
     * Initializes the action.
     * @param {Number} duration  duration in seconds
     * @param {Point} position
     * @param {Number} y
     * @return {Boolean}
     */
    initWithDuration: function (duration, position, y) {
      if (MoveBy.prototype.initWithDuration.call(this, duration, position, y)) {
        if (position.x !== undefined) {
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
     * returns a new clone of the action
     * @returns {MoveTo}
     */
    clone: function () {
      const action = new MoveTo()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._endPosition)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      MoveBy.prototype.startWithTarget.call(this, target)
      this._positionDelta.x = this._endPosition.x - target.getPositionX()
      this._positionDelta.y = this._endPosition.y - target.getPositionY()
    },
  },
)

/**
 * Create new action.
 * Moving to the specified coordinates.
 * @function
 * @param {Number} duration duration in seconds
 * @param {Point|Number} position
 * @param {Number} y
 * @return {MoveTo}
 * @example
 * // example
 * var actionTo = moveTo(2, p(80, 80));
 */
moveTo = function (duration, position, y) {
  return new MoveTo(duration, position, y)
}
/**
 * Please use moveTo instead.
 * Moving to the specified coordinates.
 * @static
 * @deprecated since v3.0 <br /> Please use moveTo instead.
 * @param {Number} duration duration in seconds
 * @param {Point|Number} position
 * @param {Number} y
 * @return {MoveTo}
 */
MoveTo.create = moveTo
