/**
 * Base class of all kinds of events.
 * @class
 * @extends cc.Class
 */
export class Event  {
    _type: 0,                                   //  Event type
    _isStopped: false,                         //< whether the event has been stopped.
    _currentTarget: null,                       //< Current target

    _setCurrentTarget: function (target) {
        this._currentTarget = target;
    },

    ctor: function (type) {
        this._type = type;
    },

    /**
     * Gets the event type
     * @function
     * @returns {Number}
     */
    getType: function () {
        return this._type;
    },

    /**
     * Stops propagation for current event
     * @function
     */
    stopPropagation: function () {
        this._isStopped = true;
    },

    /**
     * Checks whether the event has been stopped
     * @function
     * @returns {boolean}
     */
    isStopped: function () {
        return this._isStopped;
    },

    /**
     * <p>
     *     Gets current target of the event                                                            <br/>
     *     note: It only be available when the event listener is associated with node.                <br/>
     *          It returns 0 when the listener is associated with fixed priority.
     * </p>
     * @function
     * @returns {cc.Node}  The target with which the event associates.
     */
    getCurrentTarget: function () {
        return this._currentTarget;
    }
}

//event type
/**
 * The type code of Touch event.
 * @constant
 * @type {number}
 */
cc.Event.TOUCH = 0;
/**
 * The type code of Keyboard event.
 * @constant
 * @type {number}
 */
cc.Event.KEYBOARD = 1;
/**
 * The type code of Acceleration event.
 * @constant
 * @type {number}
 */
cc.Event.ACCELERATION = 2;
/**
 * The type code of Mouse event.
 * @constant
 * @type {number}
 */
cc.Event.MOUSE = 3;
/**
 * The type code of UI focus event.
 * @constant
 * @type {number}
 */
cc.Event.FOCUS = 4;
/**
 * The type code of Custom event.
 * @constant
 * @type {number}
 */
cc.Event.CUSTOM = 6;
