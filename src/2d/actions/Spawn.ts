/** Spawn a new action immediately
 * @class
 * @extends ActionInterval
 */
Spawn = ActionInterval.extend(
  /** @lends Spawn# */ {
    _one: null,
    _two: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {Array|FiniteTimeAction} tempArray
     */
    ctor: function (tempArray) {
      ActionInterval.prototype.ctor.call(this)
      this._one = null
      this._two = null

      let i, paramArray, last
      if (tempArray instanceof Array) {
        paramArray = tempArray
      } else {
        paramArray = new Array(arguments.length)
        for (i = 0; i < arguments.length; ++i) {
          paramArray[i] = arguments[i]
        }
      }
      last = paramArray.length - 1
      if (last >= 0 && paramArray[last] == null) log('parameters should not be ending with null in Javascript')

      if (last >= 0) {
        let prev = paramArray[0],
          action1
        for (i = 1; i < last; i++) {
          if (paramArray[i]) {
            action1 = prev
            prev = Spawn._actionOneTwo(action1, paramArray[i])
          }
        }
        this.initWithTwoActions(prev, paramArray[last])
      }
    },

    /** initializes the Spawn action with the 2 actions to spawn
     * @param {FiniteTimeAction} action1
     * @param {FiniteTimeAction} action2
     * @return {Boolean}
     */
    initWithTwoActions: function (action1, action2) {
      if (!action1 || !action2) throw new Error('Spawn.initWithTwoActions(): arguments must all be non null')

      let ret = false

      const d1 = action1._duration
      const d2 = action2._duration

      if (this.initWithDuration(Math.max(d1, d2))) {
        this._one = action1
        this._two = action2

        if (d1 > d2) {
          this._two = Sequence._actionOneTwo(action2, delayTime(d1 - d2))
        } else if (d1 < d2) {
          this._one = Sequence._actionOneTwo(action1, delayTime(d2 - d1))
        }

        ret = true
      }
      return ret
    },

    /**
     * returns a new clone of the action
     * @returns {Spawn}
     */
    clone: function () {
      const action = new Spawn()
      this._cloneDecoration(action)
      action.initWithTwoActions(this._one.clone(), this._two.clone())
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._one.startWithTarget(target)
      this._two.startWithTarget(target)
    },

    /**
     * Stop the action
     */
    stop: function () {
      this._one.stop()
      this._two.stop()
      Action.prototype.stop.call(this)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number}  dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      if (this._one) this._one.update(dt)
      if (this._two) this._two.update(dt)
    },

    /**
     * Returns a reversed action.
     * @return {Spawn}
     */
    reverse: function () {
      const action = Spawn._actionOneTwo(this._one.reverse(), this._two.reverse())
      this._cloneDecoration(action)
      this._reverseEaseList(action)
      return action
    },
  },
)

/**
 * Create a spawn action which runs several actions in parallel.
 * @function
 * @param {Array|FiniteTimeAction}tempArray
 * @return {Spawn}
 * @example
 * // example
 * var action = spawn(jumpBy(2, p(300, 0), 50, 4), rotateBy(2, 720));
 * todo:It should be the direct use new
 */
spawn = function (/*Multiple Arguments*/ tempArray) {
  const paramArray = tempArray instanceof Array ? tempArray : arguments
  if (paramArray.length > 0 && paramArray[paramArray.length - 1] == null) log('parameters should not be ending with null in Javascript')

  let prev = paramArray[0]
  for (let i = 1; i < paramArray.length; i++) {
    if (paramArray[i] != null) prev = Spawn._actionOneTwo(prev, paramArray[i])
  }
  return prev
}

/**
 * Please use spawn instead.
 * Create a spawn action which runs several actions in parallel.
 * @static
 * @deprecated since v3.0 <br /> Please use spawn instead.
 * @param {Array|FiniteTimeAction}tempArray
 * @return {Spawn}
 */
Spawn.create = spawn

/**
 * @param {FiniteTimeAction} action1
 * @param {FiniteTimeAction} action2
 * @return {Spawn}
 * @private
 */
Spawn._actionOneTwo = function (action1, action2) {
  const pSpawn = new Spawn()
  pSpawn.initWithTwoActions(action1, action2)
  return pSpawn
}
