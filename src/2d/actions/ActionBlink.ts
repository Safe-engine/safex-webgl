/** Blinks a Node object by modifying it's visible attribute
 * @class
 * @extends ActionInterval
 * @param {Number} duration  duration in seconds
 * @param {Number} blinks  blinks in times
 * @example
 * var action = new Blink(2, 10);
 */
Blink = ActionInterval.extend(
  /** @lends Blink# */ {
    _times: 0,
    _originalState: false,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration  duration in seconds
     * @param {Number} blinks  blinks in times
     */
    ctor: function (duration, blinks) {
      ActionInterval.prototype.ctor.call(this)
      blinks !== undefined && this.initWithDuration(duration, blinks)
    },

    /**
     * Initializes the action.
     * @param {Number} duration duration in seconds
     * @param {Number} blinks blinks in times
     * @return {Boolean}
     */
    initWithDuration: function (duration, blinks) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        this._times = blinks
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {Blink}
     */
    clone: function () {
      const action = new Blink()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._times)
      return action
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt time in seconds
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      if (this.target && !this.isDone()) {
        const slice = 1.0 / this._times
        const m = dt % slice
        this.target.visible = m > slice / 2
      }
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._originalState = target.visible
    },

    /**
     * stop the action
     */
    stop: function () {
      this.target.visible = this._originalState
      ActionInterval.prototype.stop.call(this)
    },

    /**
     * Returns a reversed action.
     * @return {Blink}
     */
    reverse: function () {
      const action = new Blink(this._duration, this._times)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)
/**
 * Blinks a Node object by modifying it's visible attribute.
 * @function
 * @param {Number} duration  duration in seconds
 * @param blinks blinks in times
 * @return {Blink}
 * @example
 * // example
 * var action = blink(2, 10);
 */
blink = function (duration, blinks) {
  return new Blink(duration, blinks)
}
/**
 * Please use blink instead.
 * Blinks a Node object by modifying it's visible attribute.
 * @static
 * @deprecated since v3.0 please use blink instead.
 * @param {Number} duration  duration in seconds
 * @param blinks blinks in times
 * @return {Blink}
 */
Blink.create = blink
