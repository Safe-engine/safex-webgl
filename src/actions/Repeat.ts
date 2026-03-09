/**
 * Repeats an action a number of times.
 * To repeat an action forever use the CCRepeatForever action.
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @param {Number} times
 * @example
 * var rep = new Repeat(sequence(jump2, jump1), 5);
 */
Repeat = ActionInterval.extend(
  /** @lends Repeat# */ {
    _times: 0,
    _total: 0,
    _nextDt: 0,
    _actionInstant: false,
    _innerAction: null, //CCFiniteTimeAction

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30).
     * @param {FiniteTimeAction} action
     * @param {Number} times
     */
    ctor: function (action, times) {
      ActionInterval.prototype.ctor.call(this)

      times !== undefined && this.initWithAction(action, times)
    },

    /**
     * @param {FiniteTimeAction} action
     * @param {Number} times
     * @return {Boolean}
     */
    initWithAction: function (action, times) {
      const duration = action._duration * times

      if (this.initWithDuration(duration)) {
        this._times = times
        this._innerAction = action
        if (action instanceof ActionInstant) {
          this._actionInstant = true
          this._times -= 1
        }
        this._total = 0
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {Repeat}
     */
    clone: function () {
      const action = new Repeat()
      this._cloneDecoration(action)
      action.initWithAction(this._innerAction.clone(), this._times)
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      this._total = 0
      this._nextDt = this._innerAction._duration / this._duration
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._innerAction.startWithTarget(target)
    },

    /**
     * stop the action
     */
    stop: function () {
      this._innerAction.stop()
      Action.prototype.stop.call(this)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number}  dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      const locInnerAction = this._innerAction
      const locDuration = this._duration
      const locTimes = this._times
      let locNextDt = this._nextDt

      if (dt >= locNextDt) {
        while (dt > locNextDt && this._total < locTimes) {
          locInnerAction.update(1)
          this._total++
          locInnerAction.stop()
          locInnerAction.startWithTarget(this.target)
          locNextDt += locInnerAction._duration / locDuration
          this._nextDt = locNextDt
        }

        // fix for issue #1288, incorrect end value of repeat
        if (dt >= 1.0 && this._total < locTimes) this._total++

        // don't set a instant action back or update it, it has no use because it has no duration
        if (!this._actionInstant) {
          if (this._total === locTimes) {
            locInnerAction.update(1)
            locInnerAction.stop()
          } else {
            // issue #390 prevent jerk, use right update
            locInnerAction.update(dt - (locNextDt - locInnerAction._duration / locDuration))
          }
        }
      } else {
        locInnerAction.update((dt * locTimes) % 1.0)
      }
    },

    /**
     * Return true if the action has finished.
     * @return {Boolean}
     */
    isDone: function () {
      return this._total === this._times
    },

    /**
     * returns a reversed action.
     * @return {Repeat}
     */
    reverse: function () {
      const action = new Repeat(this._innerAction.reverse(), this._times)
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },

    /**
     * Set inner Action.
     * @param {FiniteTimeAction} action
     */
    setInnerAction: function (action) {
      if (this._innerAction !== action) {
        this._innerAction = action
      }
    },

    /**
     * Get inner Action.
     * @return {FiniteTimeAction}
     */
    getInnerAction: function () {
      return this._innerAction
    },
  },
)

/**
 * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30)
 * @function
 * @param {FiniteTimeAction} action
 * @param {Number} times
 * @return {Repeat}
 * @example
 * // example
 * var rep = repeat(sequence(jump2, jump1), 5);
 */
repeat = function (action, times) {
  return new Repeat(action, times)
}

/**
 * Please use repeat instead
 * Creates a Repeat action. Times is an unsigned integer between 1 and pow(2,30)
 * @static
 * @deprecated since v3.0 <br /> Please use repeat instead.
 * @param {FiniteTimeAction} action
 * @param {Number} times
 * @return {Repeat}
 */
Repeat.create = repeat

/**  Repeats an action for ever.  <br/>
 * To repeat the an action for a limited number of times use the Repeat action. <br/>
 * @warning This action can't be Sequenceable because it is not an IntervalAction
 * @class
 * @extends ActionInterval
 * @param {FiniteTimeAction} action
 * @example
 * var rep = new RepeatForever(sequence(jump2, jump1), 5);
 */
RepeatForever = ActionInterval.extend(
  /** @lends RepeatForever# */ {
    _innerAction: null, //CCActionInterval

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Create a acton which repeat forever.
     * @param {FiniteTimeAction} action
     */
    ctor: function (action) {
      ActionInterval.prototype.ctor.call(this)
      this._innerAction = null

      action && this.initWithAction(action)
    },

    /**
     * @param {ActionInterval} action
     * @return {Boolean}
     */
    initWithAction: function (action) {
      if (!action) throw new Error('RepeatForever.initWithAction(): action must be non null')

      this._innerAction = action
      return true
    },

    /**
     * returns a new clone of the action
     * @returns {RepeatForever}
     */
    clone: function () {
      const action = new RepeatForever()
      this._cloneDecoration(action)
      action.initWithAction(this._innerAction.clone())
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._innerAction.startWithTarget(target)
    },

    /**
     * called every frame with it's delta time. <br />
     * DON'T override unless you know what you are doing.
     * @param dt delta time in seconds
     */
    step: function (dt) {
      const locInnerAction = this._innerAction
      locInnerAction.step(dt)
      if (locInnerAction.isDone()) {
        //var diff = locInnerAction.getElapsed() - locInnerAction._duration;
        locInnerAction.startWithTarget(this.target)
        // to prevent jerk. issue #390 ,1247
        //this._innerAction.step(0);
        //this._innerAction.step(diff);
        locInnerAction.step(locInnerAction.getElapsed() - locInnerAction._duration)
      }
    },

    /**
     * Return true if the action has finished.
     * @return {Boolean}
     */
    isDone: function () {
      return false
    },

    /**
     * Returns a reversed action.
     * @return {RepeatForever}
     */
    reverse: function () {
      const action = new RepeatForever(this._innerAction.reverse())
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },

    /**
     * Set inner action.
     * @param {ActionInterval} action
     */
    setInnerAction: function (action) {
      if (this._innerAction !== action) {
        this._innerAction = action
      }
    },

    /**
     * Get inner action.
     * @return {ActionInterval}
     */
    getInnerAction: function () {
      return this._innerAction
    },
  },
)

/**
 * Create a acton which repeat forever
 * @function
 * @param {FiniteTimeAction} action
 * @return {RepeatForever}
 * @example
 * // example
 * var repeat = repeatForever(rotateBy(1.0, 360));
 */
repeatForever = function (action) {
  return new RepeatForever(action)
}

/**
 * Please use repeatForever instead
 * Create a acton which repeat forever
 * @static
 * @deprecated since v3.0 <br /> Please use repeatForever instead.
 * @param {FiniteTimeAction} action
 * @return {RepeatForever}
 * @param {Array|FiniteTimeAction} tempArray
 * @example
 * var action = new Spawn(jumpBy(2, p(300, 0), 50, 4), rotateBy(2, 720));
 */
RepeatForever.create = repeatForever
