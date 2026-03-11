import { ActionInterval } from '../ActionInterval'
import { ActionEase } from './ActionEase'

/**
 * EaseQuadraticActionIn action. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticAction())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionIn());
 */
export class EaseQuadraticActionIn extends ActionEase {
  _updateTime(time: number): number {
    return Math.pow(time, 2)
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuadraticActionIn {
    const action = new EaseQuadraticActionIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuadraticActionIn {
    return new EaseQuadraticActionIn(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuadraticActionIn = {
  easing: EaseQuadraticActionIn.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionIn
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionIn());
 */
export const easeQuadraticActionIn = function () {
  return _easeQuadraticActionIn
}

/**
 * EaseQuadraticActionIn action. <br />
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionOut())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionOut());
 */
export class EaseQuadraticActionOut extends ActionEase {
  _updateTime(time: number): number {
    return -time * (time - 2)
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuadraticActionOut {
    const action = new EaseQuadraticActionOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuadraticActionOut {
    return new EaseQuadraticActionOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuadraticActionOut = {
  easing: EaseQuadraticActionOut.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionOut
  },
}
/**
 * Creates the action easing object. <br />
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionOut());
 */
export const easeQuadraticActionOut = function () {
  return _easeQuadraticActionOut
}

/**
 * EaseQuadraticActionInOut action. <br />
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionInOut())
 *
 * @example
 * //The old usage
 * EaseQuadraticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionInOut());
 */
export class EaseQuadraticActionInOut extends ActionEase {
  _updateTime(time: number): number {
    let resultTime
    time *= 2
    if (time < 1) {
      resultTime = time * time * 0.5
    } else {
      --time
      resultTime = -0.5 * (time * (time - 2) - 1)
    }
    return resultTime
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuadraticActionInOut {
    const action = new EaseQuadraticActionInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuadraticActionInOut {
    return new EaseQuadraticActionInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuadraticActionInOut = {
  easing: EaseQuadraticActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeQuadraticActionInOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionInOut());
 */
export const easeQuadraticActionInOut = function () {
  return _easeQuadraticActionInOut
}

/**
 * EaseQuarticActionIn action. <br />
 * Reference easeInQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuarticActionIn());
 *
 * @example
 * //The old usage
 * EaseQuarticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuarticActionIn());
 */
export class EaseQuarticActionIn extends ActionEase {
  _updateTime(time: number): number {
    return time * time * time * time
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuarticActionIn {
    const action = new EaseQuarticActionIn()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuarticActionIn {
    return new EaseQuarticActionIn(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuarticActionIn = {
  easing: EaseQuarticActionIn.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionIn
  },
}
/**
 * Creates the action easing object. <br />
 * Reference easeIntQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuarticActionIn());
 */
export const easeQuarticActionIn = function () {
  return _easeQuarticActionIn
}

/**
 * EaseQuarticActionOut action. <br />
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(QuarticActionOut());
 *
 * @example
 * //The old usage
 * EaseQuarticActionOut.create(action);
 * //The new usage
 * action.easing(EaseQuarticActionOut());
 */
export class EaseQuarticActionOut extends ActionEase {
  _updateTime(time: number): number {
    time -= 1
    return -(time * time * time * time - 1)
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuarticActionOut {
    const action = new EaseQuarticActionOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuarticActionOut {
    return new EaseQuarticActionOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuarticActionOut = {
  easing: EaseQuarticActionOut.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionOut
  },
}

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(QuarticActionOut());
 */
export const easeQuarticActionOut = function () {
  return _easeQuarticActionOut
}

/**
 * EaseQuarticActionInOut action. <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuarticActionInOut());
 *
 * @example
 * //The old usage
 * EaseQuarticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuarticActionInOut());
 */
export class EaseQuarticActionInOut extends ActionEase {
  _updateTime(time: number): number {
    time = time * 2
    if (time < 1) return 0.5 * time * time * time * time
    time -= 2
    return -0.5 * (time * time * time * time - 2)
  }

  update(dt: number): void {
    this._inner!.update(this._updateTime(dt))
  }

  clone(): EaseQuarticActionInOut {
    const action = new EaseQuarticActionInOut()
    action.initWithAction(this._inner!.clone() as ActionInterval)
    return action
  }

  reverse(): EaseQuarticActionInOut {
    return new EaseQuarticActionInOut(this._inner!.reverse() as ActionInterval)
  }
}

export const _easeQuarticActionInOut = {
  easing: EaseQuarticActionInOut.prototype._updateTime,
  reverse: function () {
    return _easeQuarticActionInOut
  },
}
/**
 * Creates the action easing object.  <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
export const easeQuarticActionInOut = function () {
  return _easeQuarticActionInOut
}
