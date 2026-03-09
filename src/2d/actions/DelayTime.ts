/** Delays the action a certain amount of seconds
 * @class
 * @extends ActionInterval
 */
DelayTime = ActionInterval.extend(
  /** @lends DelayTime# */ {
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * Will be overwrite.
     * @param {Number} dt time in seconds
     */
    update: function (dt) {},

    /**
     * Returns a reversed action.
     * @return {DelayTime}
     */
    reverse: function () {
      const action = new DelayTime(this._duration)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },

    /**
     * returns a new clone of the action
     * @returns {DelayTime}
     */
    clone: function () {
      const action = new DelayTime()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration)
      return action
    },
  },
)

/**
 * Delays the action a certain amount of seconds
 * @function
 * @param {Number} d duration in seconds
 * @return {DelayTime}
 * @example
 * // example
 * var delay = delayTime(1);
 */
delayTime = function (d) {
  return new DelayTime(d)
}
/**
 * Please use delayTime instead.
 * Delays the action a certain amount of seconds
 * @static
 * @deprecated since v3.0 please use delaTime instead.
 * @param {Number} d duration in seconds
 * @return {DelayTime}
 */
DelayTime.create = delayTime

/**
 * <p>
 * Executes an action in reverse order, from time=duration to time=0                                     <br/>
 * @warning Use this action carefully. This action is not sequenceable.                                 <br/>
 * Use it as the default "reversed" method of your own actions, but using it outside the "reversed"      <br/>
 * scope is not recommended.
 * </p>
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @example
 *  var reverse = new ReverseTime(this);
 */
ReverseTime = ActionInterval.extend(
  /** @lends ReverseTime# */ {
    _other: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {FiniteTimeAction} action
     */
    ctor: function (action) {
      ActionInterval.prototype.ctor.call(this)
      this._other = null

      action && this.initWithAction(action)
    },

    /**
     * @param {FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithAction: function (action) {
      if (!action) throw new Error('ReverseTime.initWithAction(): action must be non null')
      if (action === this._other) throw new Error('ReverseTime.initWithAction(): the action was already passed in.')

      if (ActionInterval.prototype.initWithDuration.call(this, action._duration)) {
        // Don't leak if action is reused
        this._other = action
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {ReverseTime}
     */
    clone: function () {
      const action = new ReverseTime()
      this._cloneDecoration(action)
      action.initWithAction(this._other.clone())
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._other.startWithTarget(target)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt time in seconds
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      if (this._other) this._other.update(1 - dt)
    },

    /**
     * Returns a reversed action.
     * @return {ActionInterval}
     */
    reverse: function () {
      return this._other.clone()
    },

    /**
     * Stop the action
     */
    stop: function () {
      this._other.stop()
      Action.prototype.stop.call(this)
    },
  },
)

/**
 * Executes an action in reverse order, from time=duration to time=0.
 * @function
 * @param {FiniteTimeAction} action
 * @return {ReverseTime}
 * @example
 * // example
 *  var reverse = reverseTime(this);
 */
reverseTime = function (action) {
  return new ReverseTime(action)
}
/**
 * Please use reverseTime instead.
 * Executes an action in reverse order, from time=duration to time=0.
 * @static
 * @deprecated since v3.0 please use reverseTime instead.
 * @param {FiniteTimeAction} action
 * @return {ReverseTime}
 */
ReverseTime.create = reverseTime
