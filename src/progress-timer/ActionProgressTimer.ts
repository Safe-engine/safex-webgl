import { ActionInterval } from '../actions/ActionInterval'
import { log } from '../helper/Debugger'
import { ProgressTimer } from './ProgressTimer'

/**
 * Creates a ProgressTo action with a duration and a percent
 * @class
 * @extends ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Number} percent
 * @example
 * // example
 * var to = new ProgressTo(2, 100);
 */
export class ProgressTo extends ActionInterval {
  _to = 0
  _from = 0

  /**
   * Creates a ProgressTo action with a duration and a percent
   * Constructor of ProgressTo
   * @param {Number} duration duration in seconds
   * @param {Number} percent
   */
  constructor(duration?: number, percent?: number) {
    super()
    this._to = 0
    this._from = 0

    percent !== undefined && this.initWithDuration(duration, percent)
  }

  /** Initializes with a duration and a percent
   * @param {Number} duration duration in seconds
   * @param {Number} percent
   * @return {Boolean}
   */
  initWithDuration(duration: number, percent: number): boolean {
    if (super.initWithDuration(duration)) {
      this._to = percent
      return true
    }
    return false
  }

  /**
   * return a new ProgressTo, all the configuration is the same as the original
   * @returns {ProgressTo}
   */
  clone(): ProgressTo {
    const action = new ProgressTo()
    action.initWithDuration(this._duration, this._to)
    return action
  }

  /**
   * reverse hasn't been supported
   * @returns {null}
   */
  reverse(): null {
    log('ProgressTo.reverse(): reverse hasnt been supported.')
    return null
  }

  /**
   * start with a target
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
    this._from = target.percentage
  }

  /**
   * custom update
   * @param {Number} time time in seconds
   */
  update(time: number): void {
    if (this.target instanceof ProgressTimer) this.target.percentage = this._from + (this._to - this._from) * time
  }
}

/**
 * Creates and initializes with a duration and a percent
 * @function
 * @param {Number} duration duration in seconds
 * @param {Number} percent
 * @return {ProgressTo}
 * @example
 * // example
 * var to = progressTo(2, 100);
 */
export function progressTo(duration: number, percent: number): ProgressTo {
  return new ProgressTo(duration, percent)
}

/**
 * Progress from a percentage to another percentage
 * @class
 * @extends ActionInterval
 * @param {Number} duration duration in seconds
 * @param {Number} fromPercentage
 * @param {Number} toPercentage
 * @example
 *  var fromTo = new ProgressFromTo(2, 100.0, 0.0);
 */
export class ProgressFromTo extends ActionInterval {
  _to = 0
  _from = 0

  /**
   * Creates and initializes the action with a duration, a "from" percentage and a "to" percentage
   * Constructor of ProgressFromTo
   * @param {Number} duration duration in seconds
   * @param {Number} fromPercentage
   * @param {Number} toPercentage
   */
  constructor(duration?: number, fromPercentage?: number, toPercentage?: number) {
    super()
    this._to = 0
    this._from = 0

    toPercentage !== undefined && this.initWithDuration(duration, fromPercentage, toPercentage)
  }

  /** Initializes the action with a duration, a "from" percentage and a "to" percentage
   * @param {Number} duration duration in seconds
   * @param {Number} fromPercentage
   * @param {Number} toPercentage
   * @return {Boolean}
   */
  override initWithDuration(duration: number, fromPercentage?: number, toPercentage?: number): boolean {
    if (super.initWithDuration(duration)) {
      if (toPercentage !== undefined) this._to = toPercentage
      if (fromPercentage !== undefined) this._from = fromPercentage
      return true
    }
    return false
  }

  /**
   * return a new ProgressFromTo, all the configuration is the same as the original
   * @returns {ProgressFromTo}
   */
  override clone(): ProgressFromTo {
    const action = new ProgressFromTo()
    action.initWithDuration(this._duration, this._from, this._to)
    return action
  }

  /**
   * @return {ActionInterval}
   */
  reverse(): ProgressFromTo {
    return progressFromTo(this._duration, this._to, this._from)
  }

  /**
   * start with a target
   * @param {Node} target
   */
  startWithTarget(target: any): void {
    super.startWithTarget(target)
  }

  /**
   * @param {Number} time time in seconds
   */
  update(time: number): void {
    if (this.target instanceof ProgressTimer) this.target.percentage = this._from + (this._to - this._from) * time
  }
}

/** Creates and initializes the action with a duration, a "from" percentage and a "to" percentage
 * @function
 * @param {Number} duration duration in seconds
 * @param {Number} fromPercentage
 * @param {Number} toPercentage
 * @return {ProgressFromTo}
 * @example
 * // example
 *  var fromTo = progressFromTo(2, 100.0, 0.0);
 */
export function progressFromTo(duration: number, fromPercentage: number, toPercentage: number): ProgressFromTo {
  return new ProgressFromTo(duration, fromPercentage, toPercentage)
}
