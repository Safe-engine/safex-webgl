import { log } from "../helper/Debugger";
import type { ActionInterval } from "./ActionInterval";

export const ActionEase = ActionInterval.extend(/** @lends ActionEase# */{
    _inner:null,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
	 * creates the action of ActionEase.
	 * @param {ActionInterval} action
	 */
    ctor: function (action) {
        ActionInterval.prototype.ctor.call(this);
        action && this.initWithAction(action);
    },

    /**
     * initializes the action
     *
     * @param {ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw new Error("ActionEase.initWithAction(): action must be non nil");

        if (this.initWithDuration(action.getDuration())) {
            this._inner = action;
            return true;
        }
        return false;
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {ActionEase}
     */
    clone:function(){
       var action = new ActionEase();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * called before the action start. It will also set the target.
     *
     * @param {Node} target
     */
    startWithTarget:function (target) {
        ActionInterval.prototype.startWithTarget.call(this, target);
        this._inner.startWithTarget(this.target);
    },

    /**
     * Stop the action.
     */
    stop:function () {
        this._inner.stop();
        ActionInterval.prototype.stop.call(this);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt);
    },

    /**
     * Create new action to original operation effect opposite. <br />
     * For example: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * - The reversed action will be x of 100 move to 0.
     * - Will be rewritten
     * @return {ActionEase}
     */
    reverse:function () {
        return new ActionEase(this._inner.reverse());
    },

    /**
     * Get inner Action.
     *
     * @return {ActionInterval}
     */
    getInnerAction:function(){
       return this._inner;
    }
});

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
    return new ActionEase(action);
};

/**
 * Base class for Easing actions with rate parameters
 *
 * @class
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} rate
 *
 * @deprecated since v3.0 please easeRateAction(action, 3.0);
 *
 * @example
 * //The old usage
 * EaseRateAction.create(action, 3.0);
 * //The new usage
 * var moveEaseRateAction = easeRateAction(action, 3.0);
 */
export const EaseRateAction = ActionEase.extend(/** @lends EaseRateAction# */{
    _rate:0,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
	 * Creates the action with the inner action and the rate parameter.
	 * @param {ActionInterval} action
	 * @param {Number} rate
	 */
    ctor: function(action, rate){
        ActionEase.prototype.ctor.call(this);

		rate !== undefined && this.initWithAction(action, rate);
    },

    /**
     * set rate value for the actions
     * @param {Number} rate
     */
    setRate:function (rate) {
        this._rate = rate;
    },

    /** get rate value for the actions
     * @return {Number}
     */
    getRate:function () {
        return this._rate;
    },

    /**
     * Initializes the action with the inner action and the rate parameter
     * @param {ActionInterval} action
     * @param {Number} rate
     * @return {Boolean}
     */
    initWithAction:function (action, rate) {
        if (ActionEase.prototype.initWithAction.call(this, action)) {
            this._rate = rate;
            return true;
        }
        return false;
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseRateAction}
     */
    clone:function(){
        var action = new EaseRateAction();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * Create new action to original operation effect opposite. <br />
     * For example: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * - The reversed action will be x of 100 move to 0.
     * - Will be rewritten
     * @return {EaseRateAction}
     */
    reverse:function () {
        return new EaseRateAction(this._inner.reverse(), 1 / this._rate);
    }
});

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
    return new EaseRateAction(action, rate);
};

/**
 * EaseIn action with a rate. From slow to fast.
 *
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeIn(3));
 *
 * @example
 * //The old usage
 * EaseIn.create(action, 3);
 * //The new usage
 * action.easing(easeIn(3.0));
 */
export const EaseIn = EaseRateAction.extend(/** @lends EaseIn# */{

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(Math.pow(dt, this._rate));
    },

    /**
     * Create a easeIn action. Opposite with the original motion trajectory.
     * @return {EaseIn}
     */
    reverse:function () {
        return new EaseIn(this._inner.reverse(), 1 / this._rate);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseIn}
     */
    clone:function(){
        var action = new EaseIn();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    }
});

/**
 * Creates the action with the inner action and the rate parameter. <br />
 * From slow to fast.
 *
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(easeIn(3))
 *
 * @example
 * //The old usage
 * EaseIn.create(action, 3);
 * //The new usage
 * action.easing(easeIn(3.0));
 *
 * @param {ActionInterval} action
 * @param {Number} rate
 * @return {EaseIn}
 */
EaseIn.create = function (action, rate) {
    return new EaseIn(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * From slow to fast.
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(easeIn(3.0));
 */
export const easeIn = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, this._rate);
        },
        reverse: function(){
            return easeIn(1 / this._rate);
        }
    };
};

/**
 * EaseOut action with a rate. From fast to slow.
 *
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeOut(3))
 *
 * @example
 * //The old usage
 * EaseOut.create(action, 3);
 * //The new usage
 * action.easing(easeOut(3.0));
 */
export const EaseOut = EaseRateAction.extend(/** @lends EaseOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(Math.pow(dt, 1 / this._rate));
    },

    /**
     * Create a easeIn action. Opposite with the original motion trajectory.
     * @return {EaseOut}
     */
    reverse:function () {
        return new EaseOut(this._inner.reverse(), 1 / this._rate);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseOut}
     */
    clone:function(){
        var action = new EaseOut();
        action.initWithAction(this._inner.clone(),this._rate);
        return action;
    }
});

/**
 * Creates the action easing object with the rate parameter. <br />
 * From fast to slow.
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(easeOut(3.0));
 */
export const easeOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, 1 / this._rate);
        },
        reverse: function(){
            return easeOut(1 / this._rate)
        }
    };
};

/**
 * EaseInOut action with a rate. <br />
 * Slow to fast then to slow.
 * @class
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(easeInOut(3.0))
 *
 * @example
 * //The old usage
 * EaseInOut.create(action, 3);
 * //The new usage
 * action.easing(easeInOut(3.0));
 */
export const EaseInOut = EaseRateAction.extend(/** @lends EaseInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt *= 2;
        if (dt < 1)
            this._inner.update(0.5 * Math.pow(dt, this._rate));
        else
            this._inner.update(1.0 - 0.5 * Math.pow(2 - dt, this._rate));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseInOut}
     */
    clone:function(){
        var action = new EaseInOut();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * Create a EaseInOut action. Opposite with the original motion trajectory.
     * @return {EaseInOut}
     */
    reverse:function () {
        return new EaseInOut(this._inner.reverse(), this._rate);
    }
});

/**
 * Creates the action with the inner action and the rate parameter.
 * Slow to fast then to slow.
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(easeInOut(3.0))
 *
 * @example
 * //The old usage
 * EaseInOut.create(action, 3);
 * //The new usage
 * action.easing(easeInOut(3.0));
 *
 * @param {ActionInterval} action
 * @param {Number} rate
 * @return {EaseInOut}
 */
EaseInOut.create = function (action, rate) {
    return new EaseInOut(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * Slow to fast then to slow.
 * @function
 * @param {Number} rate
 * @return {Object}
 *
 * @example
 * //The new usage
 * action.easing(easeInOut(3.0));
 */
export const easeInOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(dt, this._rate);
            else
                return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
        },
        reverse: function(){
            return easeInOut(this._rate);
        }
    };
};

/**
 * Ease Exponential In. Slow to Fast. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please action.easing(easeExponentialIn())
 *
 * @example
 * //The old usage
 * EaseExponentialIn.create(action);
 * //The new usage
 * action.easing(easeExponentialIn());
 */
export const EaseExponentialIn = ActionEase.extend(/** @lends EaseExponentialIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1)));
    },

    /**
     * Create a EaseExponentialOut action. Opposite with the original motion trajectory.
     * @return {EaseExponentialOut}
     */
    reverse:function () {
        return new EaseExponentialOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialIn}
     */
    clone:function(){
        var action = new EaseExponentialIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeExponentialInObj = {
    easing: function(dt){
        return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1));
    },
    reverse: function(){
        return _easeExponentialOutObj;
    }
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * Reference easeInExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialIn());
 */
export const easeExponentialIn = function(){
    return _easeExponentialInObj;
};

/**
 * Ease Exponential Out. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialOut())
 *
 * @example
 * //The old usage
 * EaseExponentialOut.create(action);
 * //The new usage
 * action.easing(easeExponentialOut());
 */
export const EaseExponentialOut = ActionEase.extend(/** @lends EaseExponentialOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt === 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1));
    },

    /**
     * Create a EaseExponentialIn action. Opposite with the original motion trajectory.
     * @return {EaseExponentialIn}
     */
    reverse:function () {
        return new EaseExponentialIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialOut}
     */
    clone:function(){
        var action = new EaseExponentialOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeExponentialOutObj = {
    easing: function(dt){
        return dt === 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1);
    },
    reverse: function(){
        return _easeExponentialInObj;
    }
};

/**
 * creates the action easing object. <br />
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialOut());
 */
export const easeExponentialOut = function(){
    return _easeExponentialOutObj;
};

/**
 * Ease Exponential InOut. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeExponentialInOut)
 *
 * @example
 * //The old usage
 * EaseExponentialInOut.create(action);
 * //The new usage
 * action.easing(easeExponentialInOut());
 */
export const EaseExponentialInOut = ActionEase.extend(/** @lends EaseExponentialInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                dt = 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                dt = 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        this._inner.update(dt);
    },

    /**
     * Create a EaseExponentialInOut action. Opposite with the original motion trajectory.
     * @return {EaseExponentialInOut}
     */
    reverse:function () {
        return new EaseExponentialInOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseExponentialInOut}
     */
    clone:function(){
        var action = new EaseExponentialInOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeExponentialInOutObj = {
    easing: function(dt){
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        return dt;
    },
    reverse: function(){
        return _easeExponentialInOutObj;
    }
};

/**
 * creates an EaseExponentialInOut action easing object. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeExponentialInOut());
 */
export const easeExponentialInOut = function(){
    return _easeExponentialInOutObj;
};

/**
 * Ease Sine In. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineIn())
 *
 * @example
 * //The old usage
 * EaseSineIn.create(action);
 * //The new usage
 * action.easing(easeSineIn());
 */
export const EaseSineIn = ActionEase.extend(/** @lends EaseSineIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
        this._inner.update(dt);
    },

    /**
     * Create a EaseSineOut action. Opposite with the original motion trajectory.
     * @return {EaseSineOut}
     */
    reverse:function () {
        return new EaseSineOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseSineIn}
     */
    clone:function(){
        var action = new EaseSineIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeSineInObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
    },
    reverse: function(){
        return _easeSineOutObj;
    }
};
/**
 * creates an EaseSineIn action. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineIn());
 */
export const easeSineIn = function(){
    return _easeSineInObj;
};

/**
 * Ease Sine Out. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineOut())
 *
 * @example
 * //The old usage
 * EaseSineOut.create(action);
 * //The new usage
 * action.easing(easeSineOut());
 */
export const EaseSineOut = ActionEase.extend(/** @lends EaseSineOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : Math.sin(dt * Math.PI / 2);
        this._inner.update(dt);
    },

    /**
     * Create a EaseSineIn action. Opposite with the original motion trajectory.
     * @return {EaseSineIn}
     */
    reverse:function () {
        return new EaseSineIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseSineOut}
     */
    clone:function(){
        var action = new EaseSineOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeSineOutObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : Math.sin(dt * Math.PI / 2);
    },
    reverse: function(){
        return _easeSineInObj;
    }
};

/**
 * Creates an EaseSineOut action easing object. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineOut());
 */
export const easeSineOut = function(){
    return _easeSineOutObj;
};

/**
 * Ease Sine InOut. <br />
 * Reference easeInOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeSineInOut())
 *
 * @example
 * //The old usage
 * EaseSineInOut.create(action);
 * //The new usage
 * action.easing(easeSineInOut());
 */
export const EaseSineInOut = ActionEase.extend(/** @lends EaseSineInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
        this._inner.update(dt);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseSineInOut}
     */
    clone:function(){
        var action = new EaseSineInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a EaseSineInOut action. Opposite with the original motion trajectory.
     * @return {EaseSineInOut}
     */
    reverse:function () {
        return new EaseSineInOut(this._inner.reverse());
    }
});

export const _easeSineInOutObj = {
    easing: function(dt){
        return (dt === 0 || dt === 1) ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
    },
    reverse: function(){
        return _easeSineInOutObj;
    }
};

/**
 * creates the action easing object. <br />
 * Reference easeInOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @return {Object}
 * @example
 * // example
 * action.easing(easeSineInOut());
 */
export const easeSineInOut = function(){
    return _easeSineInOutObj;
};

/**
 * Ease Elastic abstract class.
 * @class
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} [period=0.3]
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.
 */
export const EaseElastic = ActionEase.extend(/** @lends EaseElastic# */{
    _period: 0.3,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Creates the action with the inner action and the period in radians (default is 0.3).
	 * @param {ActionInterval} action
	 * @param {Number} [period=0.3]
	 */
    ctor:function(action, period){
        ActionEase.prototype.ctor.call(this);

		action && this.initWithAction(action, period);
    },

    /**
     * get period of the wave in radians. default is 0.3
     * @return {Number}
     */
    getPeriod:function () {
        return this._period;
    },

    /**
     * set period of the wave in radians.
     * @param {Number} period
     */
    setPeriod:function (period) {
        this._period = period;
    },

    /**
     * Initializes the action with the inner action and the period in radians (default is 0.3)
     * @param {ActionInterval} action
     * @param {Number} [period=0.3]
     * @return {Boolean}
     */
    initWithAction:function (action, period) {
        ActionEase.prototype.initWithAction.call(this, action);
        this._period = (period == null) ? 0.3 : period;
        return true;
    },

    /**
     * Create a action. Opposite with the original motion trajectory. <br />
     * Will be overwrite.
     * @return {?Action}
     */
    reverse:function () {
        log("EaseElastic.reverse(): it should be overridden in subclass.");
        return null;
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElastic}
     */
    clone:function(){
        var action = new EaseElastic();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Ease Elastic In action. <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(easeElasticIn())
 *
 * @example
 * //The old usage
 * EaseElasticIn.create(action, period);
 * //The new usage
 * action.easing(easeElasticIn(period));
 */
export const EaseElasticIn = EaseElastic.extend(/** @lends EaseElasticIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            dt = dt - 1;
            newT = -Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period);
        }
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticOut}
     */
    reverse:function () {
        return new EaseElasticOut(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticIn}
     */
    clone:function(){
        var action = new EaseElasticIn();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

//default ease elastic in object (period = 0.3)
export const _easeElasticInObj = {
   easing:function(dt){
       if (dt === 0 || dt === 1)
           return dt;
       dt = dt - 1;
       return -Math.pow(2, 10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3);
   },
    reverse:function(){
        return _easeElasticOutObj;
    }
};

/**
 * Creates the action easing obejct with the period in radians (default is 0.3). <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticIn(3.0));
 */
export const easeElasticIn = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                if (dt === 0 || dt === 1)
                    return dt;
                dt = dt - 1;
                return -Math.pow(2, 10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period);
            },
            reverse:function () {
                return easeElasticOut(this._period);
            }
        };
    }
    return _easeElasticInObj;
};

/**
 * Ease Elastic Out action. <br />
 * Reference easeOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeElasticOut(period))
 *
 * @example
 * //The old usage
 * EaseElasticOut.create(action, period);
 * //The new usage
 * action.easing(easeElasticOut(period));
 */
export const EaseElasticOut = EaseElastic.extend(/** @lends EaseElasticOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period) + 1;
        }

        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticIn}
     */
    reverse:function () {
        return new EaseElasticIn(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticOut}
     */
    clone:function(){
        var action = new EaseElasticOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

//default ease elastic out object (period = 0.3)
export const _easeElasticOutObj = {
    easing: function (dt) {
        return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3) + 1;
    },
    reverse:function(){
        return _easeElasticInObj;
    }
};
/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticOut(3.0));
 */
export const easeElasticOut = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period) + 1;
            },
            reverse:function(){
                return easeElasticIn(this._period);
            }
        };
    }
    return _easeElasticOutObj;
};

/**
 * Ease Elastic InOut action. <br />
 * Reference easeInOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(easeElasticInOut())
 *
 * @example
 * //The old usage
 * EaseElasticInOut.create(action, period);
 * //The new usage
 * action.easing(easeElasticInOut(period));
 */
export const EaseElasticInOut = EaseElastic.extend(/** @lends EaseElasticInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        var locPeriod = this._period;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            dt = dt * 2;
            if (!locPeriod)
                locPeriod = this._period = 0.3 * 1.5;

            var s = locPeriod / 4;
            dt = dt - 1;
            if (dt < 0)
                newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
            else
                newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
        }
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseElasticInOut}
     */
    reverse:function () {
        return new EaseElasticInOut(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseElasticInOut}
     */
    clone:function(){
        var action = new EaseElasticInOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeInOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(easeElasticInOut(3.0));
 */
export const easeElasticInOut = function (period) {
    period = period || 0.3;
    return {
        _period: period,
        easing: function (dt) {
            var newT = 0;
            var locPeriod = this._period;
            if (dt === 0 || dt === 1) {
                newT = dt;
            } else {
                dt = dt * 2;
                if (!locPeriod)
                    locPeriod = this._period = 0.3 * 1.5;
                var s = locPeriod / 4;
                dt = dt - 1;
                if (dt < 0)
                    newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
                else
                    newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
            }
            return newT;
        },
        reverse: function(){
            return easeElasticInOut(this._period);
        }
    };
};

/**
 * EaseBounce abstract class.
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.
 *
 * @class
 * @extends ActionEase
 */
export const EaseBounce = ActionEase.extend(/** @lends EaseBounce# */{
    /**
     * @param {Number} time1
     * @return {Number}
     */
    bounceTime:function (time1) {
        if (time1 < 1 / 2.75) {
            return 7.5625 * time1 * time1;
        } else if (time1 < 2 / 2.75) {
            time1 -= 1.5 / 2.75;
            return 7.5625 * time1 * time1 + 0.75;
        } else if (time1 < 2.5 / 2.75) {
            time1 -= 2.25 / 2.75;
            return 7.5625 * time1 * time1 + 0.9375;
        }

        time1 -= 2.625 / 2.75;
        return 7.5625 * time1 * time1 + 0.984375;
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounce}
     */
    clone:function(){
        var action = new EaseBounce();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounce}
     */
    reverse:function () {
        return new EaseBounce(this._inner.reverse());
    }
});

/**
 * EaseBounceIn action. <br />
 * Eased bounce effect at the beginning.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(easeBounceIn())
 *
 * @example
 * //The old usage
 * EaseBounceIn.create(action);
 * //The new usage
 * action.easing(easeBounceIn());
 */
export const EaseBounceIn = EaseBounce.extend(/** @lends EaseBounceIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 1 - this.bounceTime(1 - dt);
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceOut}
     */
    reverse:function () {
        return new EaseBounceOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceIn}
     */
    clone:function(){
        var action = new EaseBounceIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _bounceTime = function (time1) {
    if (time1 < 1 / 2.75) {
        return 7.5625 * time1 * time1;
    } else if (time1 < 2 / 2.75) {
        time1 -= 1.5 / 2.75;
        return 7.5625 * time1 * time1 + 0.75;
    } else if (time1 < 2.5 / 2.75) {
        time1 -= 2.25 / 2.75;
        return 7.5625 * time1 * time1 + 0.9375;
    }

    time1 -= 2.625 / 2.75;
    return 7.5625 * time1 * time1 + 0.984375;
};

export const _easeBounceInObj = {
    easing: function(dt){
        return 1 - _bounceTime(1 - dt);
    },
    reverse: function(){
        return _easeBounceOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceIn());
 */
export const easeBounceIn = function(){
    return _easeBounceInObj;
};

/**
 * EaseBounceOut action. <br />
 * Eased bounce effect at the ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(easeBounceOut())
 *
 * @example
 * //The old usage
 * EaseBounceOut.create(action);
 * //The new usage
 * action.easing(easeBounceOut());
 */
export const EaseBounceOut = EaseBounce.extend(/** @lends EaseBounceOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = this.bounceTime(dt);
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceIn}
     */
    reverse:function () {
        return new EaseBounceIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceOut}
     */
    clone:function(){
        var action = new EaseBounceOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeBounceOutObj = {
    easing: function(dt){
        return _bounceTime(dt);
    },
    reverse:function () {
        return _easeBounceInObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the ending.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceOut());
 */
export const easeBounceOut = function(){
    return _easeBounceOutObj;
};

/**
 * EaseBounceInOut action. <br />
 * Eased bounce effect at the beginning and ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends EaseBounce
 *
 * @deprecated since v3.0 <br /> Please use acton.easing(easeBounceInOut())
 *
 * @example
 * //The old usage
 * EaseBounceInOut.create(action);
 * //The new usage
 * action.easing(easeBounceInOut());
 */
export const EaseBounceInOut = EaseBounce.extend(/** @lends EaseBounceInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt < 0.5) {
            dt = dt * 2;
            newT = (1 - this.bounceTime(1 - dt)) * 0.5;
        } else {
            newT = this.bounceTime(dt * 2 - 1) * 0.5 + 0.5;
        }
        this._inner.update(newT);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBounceInOut}
     */
    clone:function(){
        var action = new EaseBounceInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBounceInOut}
     */
    reverse:function () {
        return new EaseBounceInOut(this._inner.reverse());
    }
});

export const _easeBounceInOutObj = {
    easing: function (time1) {
        var newT;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - _bounceTime(1 - time1)) * 0.5;
        } else {
            newT = _bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }
        return newT;
    },
    reverse: function(){
        return _easeBounceInOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning and ending.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBounceInOut());
 */
export const easeBounceInOut = function(){
    return _easeBounceInOutObj;
};

/**
 * EaseBackIn action. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeBackIn())
 *
 * @example
 * //The old usage
 * EaseBackIn.create(action);
 * //The new usage
 * action.easing(easeBackIn());
 */
export const EaseBackIn = ActionEase.extend(/** @lends EaseBackIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt===0 || dt===1 ? dt : dt * dt * ((overshoot + 1) * dt - overshoot);
        this._inner.update(dt);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBackOut}
     */
    reverse:function () {
        return new EaseBackOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBackIn}
     */
    clone:function(){
        var action = new EaseBackIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeBackInObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        return (time1===0 || time1===1) ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot);
    },
    reverse: function(){
        return _easeBackOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackIn());
 */
export const easeBackIn = function(){
    return _easeBackInObj;
};

/**
 * EaseBackOut action. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(easeBackOut());
 *
 * @example
 * //The old usage
 * EaseBackOut.create(action);
 * //The new usage
 * action.easing(easeBackOut());
 */
export const EaseBackOut = ActionEase.extend(/** @lends EaseBackOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt - 1;
        this._inner.update(dt * dt * ((overshoot + 1) * dt + overshoot) + 1);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBackIn}
     */
    reverse:function () {
        return new EaseBackIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBackOut}
     */
    clone:function(){
        var action = new EaseBackOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

export const _easeBackOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        time1 = time1 - 1;
        return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
    },
    reverse: function(){
        return _easeBackInObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackOut());
 */
export const easeBackOut = function(){
    return _easeBackOutObj;
};

/**
 * EaseBackInOut action. <br />
 * Beginning of EaseBackIn. Ending of EaseBackOut.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeBackInOut())
 *
 * @example
 * //The old usage
 * EaseBackInOut.create(action);
 * //The new usage
 * action.easing(easeBackInOut());
 */
export const EaseBackInOut = ActionEase.extend(/** @lends EaseBackInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158 * 1.525;
        dt = dt * 2;
        if (dt < 1) {
            this._inner.update((dt * dt * ((overshoot + 1) * dt - overshoot)) / 2);
        } else {
            dt = dt - 2;
            this._inner.update((dt * dt * ((overshoot + 1) * dt + overshoot)) / 2 + 1);
        }
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBackInOut}
     */
    clone:function(){
        var action = new EaseBackInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBackInOut}
     */
    reverse:function () {
        return new EaseBackInOut(this._inner.reverse());
    }
});

export const _easeBackInOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158 * 1.525;
        time1 = time1 * 2;
        if (time1 < 1) {
            return (time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2;
        } else {
            time1 = time1 - 2;
            return (time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1;
        }
    },
    reverse: function(){
        return _easeBackInOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Beginning of EaseBackIn. Ending of EaseBackOut.
 * @function
 * @return {Object}
 * @example
 * // example
 * action.easing(easeBackInOut());
 */
export const easeBackInOut = function(){
    return _easeBackInOutObj;
};

/**
 * EaseBezierAction action. <br />
 * Manually set a 4 order Bessel curve. <br />
 * According to the set point, calculate the trajectory.
 * @class
 * @extends ActionEase
 * @param {Action} action
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeBezierAction())
 *
 * @example
 * //The old usage
 * var action = EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage
 * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
export const EaseBezierAction = ActionEase.extend(/** @lends EaseBezierAction# */{

    _p0: null,
    _p1: null,
    _p2: null,
    _p3: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Initialization requires the application of Bessel curve of action.
     * @param {Action} action
     */
    ctor: function(action){
        ActionEase.prototype.ctor.call(this, action);
    },

    _updateTime: function(a, b, c, d, t){
        return (Math.pow(1-t,3) * a + 3*t*(Math.pow(1-t,2))*b + 3*Math.pow(t,2)*(1-t)*c + Math.pow(t,3)*d );
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        var t = this._updateTime(this._p0, this._p1, this._p2, this._p3, dt);
        this._inner.update(t);
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseBezierAction}
     */
    clone: function(){
        var action = new EaseBezierAction();
        action.initWithAction(this._inner.clone());
        action.setBezierParamer(this._p0, this._p1, this._p2, this._p3);
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseBezierAction}
     */
    reverse: function(){
        var action = new EaseBezierAction(this._inner.reverse());
        action.setBezierParamer(this._p3, this._p2, this._p1, this._p0);
        return action;
    },

    /**
     * Set of 4 reference point
     * @param p0
     * @param p1
     * @param p2
     * @param p3
     */
    setBezierParamer: function(p0, p1, p2, p3){
        this._p0 = p0 || 0;
        this._p1 = p1 || 0;
        this._p2 = p2 || 0;
        this._p3 = p3 || 0;
    }
});

/**
 * Creates the action. <br />
 * After creating the EaseBezierAction, also need to manually call setBezierParamer. <br />
 * According to the set point, calculate the trajectory.
 * @static
 * @param action
 * @returns {EaseBezierAction}
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeBezierAction())
 *
 * @example
 * //The old usage
 * var action = EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage
 * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
EaseBezierAction.create = function(action){
    return new EaseBezierAction(action);
};

/**
 * Creates the action easing object. <br />
 * Into the 4 reference point. <br />
 * To calculate the motion curve.
 * @param {Number} p0 The first bezier parameter
 * @param {Number} p1 The second bezier parameter
 * @param {Number} p2 The third bezier parameter
 * @param {Number} p3 The fourth bezier parameter
 * @returns {Object}
 * @example
 * // example
 * action.easing(easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
export const easeBezierAction = function(p0, p1, p2, p3){
    return {
        easing: function(time){
            return EaseBezierAction.prototype._updateTime(p0, p1, p2, p3, time);
        },
        reverse: function(){
            return easeBezierAction(p3, p2, p1, p0);
        }
    };
};

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
export const EaseQuadraticActionIn = ActionEase.extend(/** @lends EaseQuadraticActionIn# */{

    _updateTime: function(time){
        return Math.pow(time, 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionIn}
     */
    clone: function(){
        var action = new EaseQuadraticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionIn}
     */
    reverse: function(){
        return new EaseQuadraticActionIn(this._inner.reverse());
    }

});

export const _easeQuadraticActionIn = {
    easing: EaseQuadraticActionIn.prototype._updateTime,
    reverse: function(){
        return _easeQuadraticActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionIn());
 */
export const easeQuadraticActionIn = function(){
    return _easeQuadraticActionIn;
};

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
export const EaseQuadraticActionOut = ActionEase.extend(/** @lends EaseQuadraticActionOut# */{

    _updateTime: function(time){
        return -time*(time-2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionOut}
     */
    clone: function(){
        var action = new EaseQuadraticActionOut();
        action.initWithAction();
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionOut}
     */
    reverse: function(){
        return new EaseQuadraticActionOut(this._inner.reverse());
    }
});

export const _easeQuadraticActionOut = {
    easing: EaseQuadraticActionOut.prototype._updateTime,
    reverse: function(){
        return _easeQuadraticActionOut;
    }
};
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
export const easeQuadraticActionOut = function(){
    return _easeQuadraticActionOut;
};

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
export const EaseQuadraticActionInOut = ActionEase.extend(/** @lends EaseQuadraticActionInOut# */{
    _updateTime: function(time){
        var resultTime = time;
        time *= 2;
        if(time < 1){
            resultTime = time * time * 0.5;
        }else{
            --time;
            resultTime = -0.5 * ( time * ( time - 2 ) - 1)
        }
        return resultTime;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuadraticActionInOut}
     */
    clone: function(){
        var action = new EaseQuadraticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuadraticActionInOut}
     */
    reverse: function(){
        return new EaseQuadraticActionInOut(this._inner.reverse());
    }
});

export const _easeQuadraticActionInOut = {
    easing: EaseQuadraticActionInOut.prototype._updateTime,
    reverse: function(){
        return _easeQuadraticActionInOut;
    }
};

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
export const easeQuadraticActionInOut = function(){
    return _easeQuadraticActionInOut;
};

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
export const EaseQuarticActionIn = ActionEase.extend(/** @lends EaseQuarticActionIn# */{
    _updateTime: function(time){
        return time * time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionIn}
     */
    clone: function(){
        var action = new EaseQuarticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionIn}
     */
    reverse: function(){
        return new EaseQuarticActionIn(this._inner.reverse());
    }
});

export const _easeQuarticActionIn = {
    easing: EaseQuarticActionIn.prototype._updateTime,
    reverse: function(){
        return _easeQuarticActionIn;
    }
};
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
export const easeQuarticActionIn = function(){
    return _easeQuarticActionIn;
};

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
export const EaseQuarticActionOut = ActionEase.extend(/** @lends EaseQuarticActionOut# */{
    _updateTime: function(time){
        time -= 1;
        return -(time * time * time * time - 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionOut}
     */
    clone: function(){
        var action = new EaseQuarticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionOut}
     */
    reverse: function(){
        return new EaseQuarticActionOut(this._inner.reverse());
    }
});

export const _easeQuarticActionOut = {
    easing: EaseQuarticActionOut.prototype._updateTime,
    reverse: function(){
        return _easeQuarticActionOut;
    }
};

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
export const easeQuarticActionOut = function(){
    return _easeQuarticActionOut;
};

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
export const EaseQuarticActionInOut = ActionEase.extend(/** @lends EaseQuarticActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time;
        time -= 2;
        return -0.5 * (time * time * time * time - 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuarticActionInOut}
     */
    clone: function(){
        var action = new EaseQuarticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuarticActionInOut}
     */
    reverse: function(){
        return new EaseQuarticActionInOut(this._inner.reverse());
    }
});

export const _easeQuarticActionInOut = {
    easing: EaseQuarticActionInOut.prototype._updateTime,
    reverse: function(){
        return _easeQuarticActionInOut;
    }
};
/**
 * Creates the action easing object.  <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
export const easeQuarticActionInOut = function(){
    return _easeQuarticActionInOut;
};

/**
 * EaseQuinticActionIn action. <br />
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuinticActionIn());
 *
 * @example
 * //The old usage
 * EaseQuinticActionIn.create(action);
 * //The new usage
 * action.easing(easeQuinticActionIn());
 */
export const EaseQuinticActionIn = ActionEase.extend(/** @lends EaseQuinticActionIn# */{
    _updateTime: function(time){
        return time * time * time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuinticActionIn}
     */
    clone: function(){
        var action = new EaseQuinticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuinticActionIn}
     */
    reverse: function(){
        return new EaseQuinticActionIn(this._inner.reverse());
    }
});

export const _easeQuinticActionIn = {
    easing: EaseQuinticActionIn.prototype._updateTime,
    reverse: function(){
        return _easeQuinticActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuinticActionIn());
 */
export const easeQuinticActionIn = function(){
    return _easeQuinticActionIn;
};

/**
 * EaseQuinticActionOut action. <br />
 * Reference easeQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuadraticActionOut());
 *
 * @example
 * //The old usage
 * EaseQuinticActionOut.create(action);
 * //The new usage
 * action.easing(easeQuadraticActionOut());
 */
export const EaseQuinticActionOut = ActionEase.extend(/** @lends EaseQuinticActionOut# */{
    _updateTime: function(time){
        time -=1;
        return (time * time * time * time * time + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuinticActionOut}
     */
    clone: function(){
        var action = new EaseQuinticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuinticActionOut}
     */
    reverse: function(){
        return new EaseQuinticActionOut(this._inner.reverse());
    }
});

export const _easeQuinticActionOut = {
    easing: EaseQuinticActionOut.prototype._updateTime,
    reverse: function(){
        return _easeQuinticActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuadraticActionOut());
 */
export const easeQuinticActionOut = function(){
    return _easeQuinticActionOut;
};

/**
 * EaseQuinticActionInOut action. <br />
 * Reference easeInOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeQuinticActionInOut());
 *
 * @example
 * //The old usage
 * EaseQuinticActionInOut.create(action);
 * //The new usage
 * action.easing(easeQuinticActionInOut());
 */
export const EaseQuinticActionInOut = ActionEase.extend(/** @lends EaseQuinticActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time * time * time + 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseQuinticActionInOut}
     */
    clone: function(){
        var action = new EaseQuinticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseQuinticActionInOut}
     */
    reverse: function(){
        return new EaseQuinticActionInOut(this._inner.reverse());
    }
});

export const _easeQuinticActionInOut = {
    easing: EaseQuinticActionInOut.prototype._updateTime,
    reverse: function(){
        return _easeQuinticActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeQuinticActionInOut());
 */
export const easeQuinticActionInOut = function(){
    return _easeQuinticActionInOut;
};

/**
 * EaseCircleActionIn action. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionIn());
 *
 * @example
 * //The old usage
 * EaseCircleActionIn.create(action);
 * //The new usage
 * action.easing(easeCircleActionIn());
 */
export const EaseCircleActionIn = ActionEase.extend(/** @lends EaseCircleActionIn# */{
    _updateTime: function(time){
        return -1 * (Math.sqrt(1 - time * time) - 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCircleActionIn}
     */
    clone: function(){
        var action = new EaseCircleActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionIn}
     */
    reverse: function(){
        return new EaseCircleActionIn(this._inner.reverse());
    }
});

export const _easeCircleActionIn = {
    easing: EaseCircleActionIn.prototype._updateTime,
    reverse: function(){
        return _easeCircleActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionIn());
 */
export const easeCircleActionIn = function(){
    return _easeCircleActionIn;
};

/**
 * EaseCircleActionOut action. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionOut());
 */
export const EaseCircleActionOut = ActionEase.extend(/** @lends EaseCircleActionOut# */{
    _updateTime: function(time){
        time = time - 1;
        return Math.sqrt(1 - time * time);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCircleActionOut}
     */
    clone: function(){
        var action = new EaseCircleActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionOut}
     */
    reverse: function(){
        return new EaseCircleActionOut(this._inner.reverse());
    }
});

export const _easeCircleActionOut = {
    easing: EaseCircleActionOut.prototype._updateTime,
    reverse: function(){
        return _easeCircleActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @exampple
 * //example
 * actioneasing(easeCircleActionOut());
 */
export const easeCircleActionOut = function(){
    return _easeCircleActionOut;
};

/**
 * EaseCircleActionInOut action. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCircleActionInOut());
 *
 * @example
 * //The old usage
 * EaseCircleActionInOut.create(action);
 * //The new usage
 * action.easing(easeCircleActionInOut());
 */
export const EaseCircleActionInOut = ActionEase.extend(/** @lends EaseCircleActionInOut# */{
    _updateTime: function(time){
        time = time * 2;
        if (time < 1)
            return -0.5 * (Math.sqrt(1 - time * time) - 1);
        time -= 2;
        return 0.5 * (Math.sqrt(1 - time * time) + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCircleActionInOut}
     */
    clone: function(){
        var action = new EaseCircleActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCircleActionInOut}
     */
    reverse: function(){
        return new EaseCircleActionInOut(this._inner.reverse());
    }
});

export const _easeCircleActionInOut = {
    easing: EaseCircleActionInOut.prototype._updateTime,
    reverse: function(){
        return _easeCircleActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCircleActionInOut());
 */
export const easeCircleActionInOut = function(){
    return _easeCircleActionInOut;
};

/**
 * EaseCubicActionIn action. <br />
 * Reference easeInCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> action.easing(easeCubicActionIn());
 *
 * @example
 * //The old usage
 * EaseCubicActionIn.create(action);
 * //The new usage
 * action.easing(easeCubicActionIn());
 */
export const EaseCubicActionIn = ActionEase.extend(/** @lends EaseCubicActionIn# */{
    _updateTime: function(time){
        return time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCubicActionIn}
     */
    clone: function(){
        var action = new EaseCubicActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCubicActionIn}
     */
    reverse: function(){
        return new EaseCubicActionIn(this._inner.reverse());
    }
});

export const _easeCubicActionIn = {
    easing: EaseCubicActionIn.prototype._updateTime,
    reverse: function(){
        return _easeCubicActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCubicActionIn());
 */
export const easeCubicActionIn = function(){
    return _easeCubicActionIn;
};

/**
 * EaseCubicActionOut action. <br />
 * Reference easeOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCubicActionOut());
 *
 * @example
 * //The old usage
 * EaseCubicActionOut.create(action);
 * //The new usage
 * action.easing(easeCubicActionOut());
 */
export const EaseCubicActionOut = ActionEase.extend(/** @lends EaseCubicActionOut# */{
    _updateTime: function(time){
        time -= 1;
        return (time * time * time + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCubicActionOut}
     */
    clone: function(){
        var action = new EaseCubicActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCubicActionOut}
     */
    reverse: function(){
        return new EaseCubicActionOut(this._inner.reverse());
    }
});

export const _easeCubicActionOut = {
    easing: EaseCubicActionOut.prototype._updateTime,
    reverse: function(){
        return _easeCubicActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example
 * action.easing(easeCubicActionOut());
 */
export const easeCubicActionOut = function(){
    return _easeCubicActionOut;
};

/**
 * EaseCubicActionInOut action. <br />
 * Reference easeInOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(easeCubicActionInOut());
 *
 * @example
 * //The old usage
 * EaseCubicActionInOut.create(action);
 * //The new usage
 * action.easing(easeCubicActionInOut());
 */
export const EaseCubicActionInOut = ActionEase.extend(/** @lends EaseCubicActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time + 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.
     * returns a clone of action.
     *
     * @returns {EaseCubicActionInOut}
     */
    clone: function(){
        var action = new EaseCubicActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.
     * @return {EaseCubicActionInOut}
     */
    reverse: function(){
        return new EaseCubicActionInOut(this._inner.reverse());
    }
});

export const _easeCubicActionInOut = {
    easing: EaseCubicActionInOut.prototype._updateTime,
    reverse: function(){
        return _easeCubicActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
export const easeCubicActionInOut = function(){
    return _easeCubicActionInOut;
};
