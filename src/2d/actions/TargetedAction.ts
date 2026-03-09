/**
 * <p>
 *     Overrides the target of an action so that it always runs on the target<br/>
 *     specified at action creation rather than the one specified by runAction.
 * </p>
 * @class
 * @extends ActionInterval
 * @param {Node} target
 * @param {FiniteTimeAction} action
 */
TargetedAction = ActionInterval.extend(
  /** @lends TargetedAction# */ {
    _action: null,
    _forcedTarget: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Create an action with the specified action and forced target.
     * @param {Node} target
     * @param {FiniteTimeAction} action
     */
    ctor: function (target, action) {
      ActionInterval.prototype.ctor.call(this)
      action && this.initWithTarget(target, action)
    },

    /**
     * Init an action with the specified action and forced target
     * @param {Node} target
     * @param {FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithTarget: function (target, action) {
      if (this.initWithDuration(action._duration)) {
        this._forcedTarget = target
        this._action = action
        return true
      }
      return false
    },

    /**
     * returns a new clone of the action
     * @returns {TargetedAction}
     */
    clone: function () {
      const action = new TargetedAction()
      this._cloneDecoration(action)
      action.initWithTarget(this._forcedTarget, this._action.clone())
      return action
    },

    /**
     * Start the action with target.
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._action.startWithTarget(this._forcedTarget)
    },

    /**
     * stop the action
     */
    stop: function () {
      this._action.stop()
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * @param {Number} dt
     */
    update: function (dt) {
      dt = this._computeEaseTime(dt)
      this._action.update(dt)
    },

    /**
     * return the target that the action will be forced to run with
     * @return {Node}
     */
    getForcedTarget: function () {
      return this._forcedTarget
    },

    /**
     * set the target that the action will be forced to run with
     * @param {Node} forcedTarget
     */
    setForcedTarget: function (forcedTarget) {
      if (this._forcedTarget !== forcedTarget) this._forcedTarget = forcedTarget
    },
  },
)

/**
 * Create an action with the specified action and forced target
 * @function
 * @param {Node} target
 * @param {FiniteTimeAction} action
 * @return {TargetedAction}
 */
targetedAction = function (target, action) {
  return new TargetedAction(target, action)
}
/**
 * Please use targetedAction instead
 * Create an action with the specified action and forced target
 * @static
 * @deprecated since v3.0 please use targetedAction instead.
 * @param {Node} target
 * @param {FiniteTimeAction} action
 * @return {TargetedAction}
 */
TargetedAction.create = targetedAction
