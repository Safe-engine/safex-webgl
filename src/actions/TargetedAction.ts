import { ActionInterval } from './ActionInterval'

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
export class TargetedAction extends ActionInterval {
  _action: any = null
  _forcedTarget: any = null

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Create an action with the specified action and forced target.
   * @param {Node} target
   * @param {FiniteTimeAction} action
   */
  constructor(target?: any, action?: any) {
    super()
    if (action) {
      this.initWithTarget(target, action)
    }
  }

  /**
   * Init an action with the specified action and forced target
   * @param {Node} target
   * @param {FiniteTimeAction} action
   * @return {Boolean}
   */
  initWithTarget(target: any, action: any) {
    if (this.initWithDuration(action._duration)) {
      this._forcedTarget = target
      this._action = action
      return true
    }
    return false
  }

  /**
   * returns a new clone of the action
   * @returns {TargetedAction}
   */
  clone() {
    const action = new TargetedAction()
    this._cloneDecoration(action)
    action.initWithTarget(this._forcedTarget, this._action.clone())
    return action
  }

  /**
   * Start the action with target.
   * @param {Node} target
   */
  startWithTarget(target: any) {
    super.startWithTarget(target)
    this._action.startWithTarget(this._forcedTarget)
  }

  /**
   * stop the action
   */
  stop() {
    this._action.stop()
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt
   */
  update(dt: number) {
    dt = this._computeEaseTime(dt)
    this._action.update(dt)
  }

  /**
   * return the target that the action will be forced to run with
   * @return {Node}
   */
  getForcedTarget() {
    return this._forcedTarget
  }

  /**
   * set the target that the action will be forced to run with
   * @param {Node} forcedTarget
   */
  setForcedTarget(forcedTarget: any) {
    if (this._forcedTarget !== forcedTarget) this._forcedTarget = forcedTarget
  }
}

/**
 * Create an action with the specified action and forced target
 * @function
 * @param {Node} target
 * @param {FiniteTimeAction} action
 * @return {TargetedAction}
 */
export const targetedAction = function (target, action) {
  return new TargetedAction(target, action)
}
