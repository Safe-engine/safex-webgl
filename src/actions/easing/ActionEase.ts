import { ActionInterval } from '../ActionInterval'

export class ActionEase extends ActionInterval {
  _inner: ActionInterval | null = null

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * creates the action of ActionEase.
   * @param {ActionInterval} action
   */
  constructor(action?: ActionInterval) {
    super()
    action && this.initWithAction(action)
  }

  /**
   * initializes the action
   *
   * @param {ActionInterval} action
   * @return {Boolean}
   */
  initWithAction(action: ActionInterval): boolean {
    if (!action) throw new Error('ActionEase.initWithAction(): action must be non nil')

    if (this.initWithDuration(action.getDuration())) {
      this._inner = action
      return true
    }
    return false
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {ActionEase}
   */
  clone(): ActionEase {
    const action = new ActionEase()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  /**
   * called before the action start. It will also set the target.
   *
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._inner!.startWithTarget(this.target)
  }

  /**
   * Stop the action.
   */
  stop(): void {
    this._inner!.stop()
    super.stop()
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   *
   * @param {Number} dt
   */
  update(dt: number): void {
    this._inner!.update(dt)
  }

  /**
   * Create new action to original operation effect opposite. <br />
   * For example: <br />
   * - The action will be x coordinates of 0 move to 100. <br />
   * - The reversed action will be x of 100 move to 0.
   * - Will be rewritten
   * @return {ActionEase}
   */
  reverse(): ActionEase {
    return new ActionEase(this._inner!.reverse() as ActionInterval)
  }

  /**
   * Get inner Action.
   *
   * @return {ActionInterval}
   */
  getInnerAction(): ActionInterval | null {
    return this._inner
  }
}

/**
 * creates the action of ActionEase
 *
 * @param {ActionInterval} action
 * @return {ActionEase}
 * @example
 * // example
 * var moveEase = actionEase(action);
 */
export function actionEase(action: ActionInterval): ActionEase {
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
export class EaseRateAction extends ActionEase {
  _rate = 0

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
   * Creates the action with the inner action and the rate parameter.
   * @param {ActionInterval} action
   * @param {Number} rate
   */
  constructor(action?: ActionInterval, rate?: number) {
    super()
    rate !== undefined && this.initWithAction(action!, rate)
  }

  /**
   * set rate value for the actions
   * @param {Number} rate
   */
  setRate(rate: number): void {
    this._rate = rate
  }

  /** get rate value for the actions
   * @return {Number}
   */
  getRate(): number {
    return this._rate
  }

  /**
   * Initializes the action with the inner action and the rate parameter
   * @param {ActionInterval} action
   * @param {Number} rate
   * @return {Boolean}
   */
  initWithAction(action: ActionInterval, rate?: number): boolean {
    if (super.initWithAction(action)) {
      if (rate !== undefined) this._rate = rate
      return true
    }
    return false
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   *
   * @returns {EaseRateAction}
   */
  clone(): EaseRateAction {
    const action = new EaseRateAction()
    action.initWithAction(this._inner!.clone() as ActionInterval, this._rate)
    return action
  }

  /**
   * Create new action to original operation effect opposite. <br />
   * For example: <br />
   * - The action will be x coordinates of 0 move to 100. <br />
   * - The reversed action will be x of 100 move to 0.
   * - Will be rewritten
   * @return {EaseRateAction}
   */
  reverse(): EaseRateAction {
    return new EaseRateAction(this._inner!.reverse() as ActionInterval, 1 / this._rate)
  }
}

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
export function easeRateAction(action: ActionInterval, rate: number): EaseRateAction {
  return new EaseRateAction(action, rate)
}
