/** Fades an object that implements the RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @warning This action doesn't support "reverse"
 * @class
 * @extends ActionInterval
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @example
 * var action = new FadeTo(1.0, 0);
 */
FadeTo = ActionInterval.extend(
  /** @lends FadeTo# */ {
    _toOpacity: 0,
    _fromOpacity: 0,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration
     * @param {Number} opacity 0-255, 0 is transparent
     */
    ctor: function (duration, opacity) {
      ActionInterval.prototype.ctor.call(this)
      opacity !== undefined && this.initWithDuration(duration, opacity)
    },

    /**
     * Initializes the action.
     * @param {Number} duration  duration in seconds
     * @param {Number} opacity
     * @return {Boolean}
     */
    initWithDuration: function (duration, opacity) {
      if (ActionInterval.prototype.initWithDuration.call(this, duration)) {
        this._toOpacity = opacity
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {FadeTo}
     */
    clone: function () {
      const action = new FadeTo()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._toOpacity)
      return action
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} time time in seconds
     */
    update: function (time) {
      time = this._computeEaseTime(time)
      const fromOpacity = this._fromOpacity !== undefined ? this._fromOpacity : 255
      this.target.opacity = fromOpacity + (this._toOpacity - fromOpacity) * time
    },

    /**
     * Start this action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._fromOpacity = target.opacity
    },
  },
)

/**
 * Fades an object that implements the RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @function
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @return {FadeTo}
 * @example
 * // example
 * var action = fadeTo(1.0, 0);
 */
fadeTo = function (duration, opacity) {
  return new FadeTo(duration, opacity)
}
/**
 * Please use fadeTo instead.
 * Fades an object that implements the RGBAProtocol protocol. It modifies the opacity from the current value to a custom one.
 * @static
 * @deprecated since v3.0 please use fadeTo instead.
 * @param {Number} duration
 * @param {Number} opacity 0-255, 0 is transparent
 * @return {FadeTo}
 */
FadeTo.create = fadeTo

/** Fades In an object that implements the RGBAProtocol protocol. It modifies the opacity from 0 to 255.<br/>
 * The "reverse" of this action is FadeOut
 * @class
 * @extends FadeTo
 * @param {Number} duration duration in seconds
 */
FadeIn = FadeTo.extend(
  /** @lends FadeIn# */ {
    _reverseAction: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration duration in seconds
     */
    ctor: function (duration) {
      FadeTo.prototype.ctor.call(this)
      if (duration == null) duration = 0
      this.initWithDuration(duration, 255)
    },

    /**
     * Returns a reversed action.
     * @return {FadeOut}
     */
    reverse: function () {
      const action = new FadeOut()
      action.initWithDuration(this._duration, 0)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },

    /**
     * returns a new clone of the action
     * @returns {FadeIn}
     */
    clone: function () {
      const action = new FadeIn()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._toOpacity)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      if (this._reverseAction) this._toOpacity = this._reverseAction._fromOpacity
      FadeTo.prototype.startWithTarget.call(this, target)
    },
  },
)

/**
 * Fades In an object that implements the RGBAProtocol protocol. It modifies the opacity from 0 to 255.
 * @function
 * @param {Number} duration duration in seconds
 * @return {FadeIn}
 * @example
 * //example
 * var action = fadeIn(1.0);
 */
fadeIn = function (duration) {
  return new FadeIn(duration)
}
/**
 * Please use fadeIn instead.
 * Fades In an object that implements the RGBAProtocol protocol. It modifies the opacity from 0 to 255.
 * @static
 * @deprecated since v3.0 please use fadeIn() instead.
 * @param {Number} duration duration in seconds
 * @return {FadeIn}
 */
FadeIn.create = fadeIn

/** Fades Out an object that implements the RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * The "reverse" of this action is FadeIn
 * @class
 * @extends FadeTo
 * @param {Number} duration duration in seconds
 */
FadeOut = FadeTo.extend(
  /** @lends FadeOut# */ {
    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Number} duration duration in seconds
     */
    ctor: function (duration) {
      FadeTo.prototype.ctor.call(this)
      if (duration == null) duration = 0
      this.initWithDuration(duration, 0)
    },

    /**
     * Returns a reversed action.
     * @return {FadeIn}
     */
    reverse: function () {
      const action = new FadeIn()
      action._reverseAction = this
      action.initWithDuration(this._duration, 255)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },

    /**
     * returns a new clone of the action
     * @returns {FadeOut}
     */
    clone: function () {
      const action = new FadeOut()
      this._cloneDecoration(action)
      action.initWithDuration(this._duration, this._toOpacity)
      return action
    },
  },
)

/**
 * Fades Out an object that implements the RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * @function
 * @param {Number} d  duration in seconds
 * @return {FadeOut}
 * @example
 * // example
 * var action = fadeOut(1.0);
 */
fadeOut = function (d) {
  return new FadeOut(d)
}
/**
 * Please use fadeOut instead.
 * Fades Out an object that implements the RGBAProtocol protocol. It modifies the opacity from 255 to 0.
 * @static
 * @deprecated since v3.0 please use fadeOut instead.
 * @param {Number} d  duration in seconds
 * @return {FadeOut}
 */
FadeOut.create = fadeOut
