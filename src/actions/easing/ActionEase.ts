import { ActionInterval } from '../ActionInterval'

export const ActionEase = ActionInterval.extend(
  /** @lends ActionEase# */ {
    _inner: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * creates the action of ActionEase.
     * @param {ActionInterval} action
     */
    ctor: function (action) {
      ActionInterval.prototype.ctor.call(this)
      action && this.initWithAction(action)
    },

    /**
     * initializes the action
     *
     * @param {ActionInterval} action
     * @return {Boolean}
     */
    initWithAction: function (action) {
      if (!action) throw new Error('ActionEase.initWithAction(): action must be non nil')

      if (this.initWithDuration(action.getDuration())) {
        this._inner = action
        return true
      }
      return false
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {ActionEase}
     */
    clone: function () {
      const action = new ActionEase()
      action.initWithAction(this._inner.clone())
      return action
    },

    /**
     * called before the action start. It will also set the target.
     *
     * @param {Node} target
     */
    startWithTarget: function (target) {
      ActionInterval.prototype.startWithTarget.call(this, target)
      this._inner.startWithTarget(this.target)
    },

    /**
     * Stop the action.
     */
    stop: function () {
      this._inner.stop()
      ActionInterval.prototype.stop.call(this)
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function (dt) {
      this._inner.update(dt)
    },

    /**
     * Create new action to original operation effect opposite. <br />
     * For example: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * - The reversed action will be x of 100 move to 0.
     * - Will be rewritten
     * @return {ActionEase}
     */
    reverse: function () {
      return new ActionEase(this._inner.reverse())
    },

    /**
     * Get inner Action.
     *
     * @return {ActionInterval}
     */
    getInnerAction: function () {
      return this._inner
    },
  },
)

/**
 * creates the action of ActionEase
 *
 * @param {ActionInterval} action
 * @return {ActionEase}
 * @example
 * // example
 * var moveEase = actionEase(action);
 */
export const actionEase = function (action) {
  return new ActionEase(action)
}

/**
 * Base class for Easing actions with rate parameters
 *
 * @class
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} rate
 *
 * @example
 * //The old usage
 * EaseRateAction.create(action, 3.0);
 * //The new usage
 * var moveEaseRateAction = easeRateAction(action, 3.0);
 */
export const EaseRateAction = ActionEase.extend(
  /** @lends EaseRateAction# */ {
    _rate: 0,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Creates the action with the inner action and the rate parameter.
     * @param {ActionInterval} action
     * @param {Number} rate
     */
    ctor: function (action, rate) {
      ActionEase.prototype.ctor.call(this)

      rate !== undefined && this.initWithAction(action, rate)
    },

    /**
     * set rate value for the actions
     * @param {Number} rate
     */
    setRate: function (rate) {
      this._rate = rate
    },

    /** get rate value for the actions
     * @return {Number}
     */
    getRate: function () {
      return this._rate
    },

    /**
     * Initializes the action with the inner action and the rate parameter
     * @param {ActionInterval} action
     * @param {Number} rate
     * @return {Boolean}
     */
    initWithAction: function (action, rate) {
      if (ActionEase.prototype.initWithAction.call(this, action)) {
        this._rate = rate
        return true
      }
      return false
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseRateAction}
     */
    clone: function () {
      const action = new EaseRateAction()
      action.initWithAction(this._inner.clone(), this._rate)
      return action
    },

    /**
     * Create new action to original operation effect opposite. <br />
     * For example: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * - The reversed action will be x of 100 move to 0.
     * - Will be rewritten
     * @return {EaseRateAction}
     */
    reverse: function () {
      return new EaseRateAction(this._inner.reverse(), 1 / this._rate)
    },
  },
)

/**
 * Creates the action with the inner action and the rate parameter.
 *
 * @param {ActionInterval} action
 * @param {Number} rate
 * @return {EaseRateAction}
 * @example
 * // example
 * var moveEaseRateAction = easeRateAction(action, 3.0);
 */
export const easeRateAction = function (action, rate) {
  return new EaseRateAction(action, rate)
}
