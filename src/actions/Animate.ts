/**  Animates a sprite given the name of an Animation
 * @class
 * @extends ActionInterval
 * @param {Animation} animation
 * @example
 * // create the animation with animation
 * var anim = new Animate(dance_grey);
 */
Animate = ActionInterval.extend(
  /** @lends Animate# */ {
    _animation: null,
    _nextFrame: 0,
    _origFrame: null,
    _executedLoops: 0,
    _splitTimes: null,
    _currFrameIndex: 0,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * create the animate with animation.
     * @param {Animation} animation
     */
    ctor: function (animation) {
      ActionInterval.prototype.ctor.call(this)
      this._splitTimes = []

      animation && this.initWithAnimation(animation)
    },

    /**
     * @return {Animation}
     */
    getAnimation: function () {
      return this._animation
    },

    /**
     * @param {Animation} animation
     */
    setAnimation: function (animation) {
      this._animation = animation
    },

    /**
     * Gets the index of sprite frame currently displayed.
     * @return {Number}
     */
    getCurrentFrameIndex: function () {
      return this._currFrameIndex
    },

    /**
     * @param {Animation} animation
     * @return {Boolean}
     */
    initWithAnimation: function (animation) {
      if (!animation) throw new Error('Animate.initWithAnimation(): animation must be non-NULL')
      const singleDuration = animation.getDuration()
      if (this.initWithDuration(singleDuration * animation.getLoops())) {
        this._nextFrame = 0
        this.setAnimation(animation)

        this._origFrame = null
        this._executedLoops = 0
        const locTimes = this._splitTimes
        locTimes.length = 0

        let accumUnitsOfTime = 0
        const newUnitOfTimeValue = singleDuration / animation.getTotalDelayUnits()

        const frames = animation.getFrames()
        arrayVerifyType(frames, AnimationFrame)

        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i]
          const value = (accumUnitsOfTime * newUnitOfTimeValue) / singleDuration
          accumUnitsOfTime += frame.getDelayUnits()
          locTimes.push(value)
        }
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {Animate}
     */
    clone: function () {
      const action = new Animate()
      this._cloneDecoration(action)
      action.initWithAnimation(this._animation.clone())
      return action
    },

    /**
     * Start the action with target.
     * @param {Sprite} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      if (this._animation.getRestoreOriginalFrame()) this._origFrame = target.getSpriteFrame()
      this._nextFrame = 0
      this._executedLoops = 0
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      // if t==1, ignore. Animation should finish with t==1
      if (dt < 1.0) {
        dt *= this._animation.getLoops()

        // new loop?  If so, reset frame counter
        const loopNumber = 0 | dt
        if (loopNumber > this._executedLoops) {
          this._nextFrame = 0
          this._executedLoops++
        }

        // new t for animations
        dt = dt % 1.0
      }

      const frames = this._animation.getFrames()
      const numberOfFrames = frames.length,
        locSplitTimes = this._splitTimes
      for (let i = this._nextFrame; i < numberOfFrames; i++) {
        if (locSplitTimes[i] <= dt) {
          _currFrameIndex = i
          this.target.setSpriteFrame(frames[_currFrameIndex].getSpriteFrame())
          this._nextFrame = i + 1
        } else {
          // Issue 1438. Could be more than one frame per tick, due to low frame rate or frame delta < 1/FPS
          break
        }
      }
    },

    /**
     * Returns a reversed action.
     * @return {Animate}
     */
    reverse: function () {
      const locAnimation = this._animation
      const oldArray = locAnimation.getFrames()
      const newArray = []
      arrayVerifyType(oldArray, AnimationFrame)
      if (oldArray.length > 0) {
        for (let i = oldArray.length - 1; i >= 0; i--) {
          const element = oldArray[i]
          if (!element) break
          newArray.push(element.clone())
        }
      }
      const newAnim = new Animation(newArray, locAnimation.getDelayPerUnit(), locAnimation.getLoops())
      newAnim.setRestoreOriginalFrame(locAnimation.getRestoreOriginalFrame())
      const action = new Animate(newAnim)
      this._cloneDecoration(action)
      this._reverseEaseList(action)

      return action
    },

    /**
     * stop the action
     */
    stop: function () {
      if (this._animation.getRestoreOriginalFrame() && this.target) this.target.setSpriteFrame(this._origFrame)
      Action.prototype.stop.call(this)
    },
  },
)

/**
 * create the animate with animation
 * @function
 * @param {Animation} animation
 * @return {Animate}
 * @example
 * // example
 * // create the animation with animation
 * var anim = animate(dance_grey);
 */
animate = function (animation) {
  return new Animate(animation)
}
/**
 * Please use animate instead
 * create the animate with animation
 * @static
 * @deprecated since v3.0 please use animate instead.
 * @param {Animation} animation
 * @return {Animate}
 */
Animate.create = animate
