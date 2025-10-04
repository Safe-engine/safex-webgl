
/**
 * The touch event
 * @class
 * @extends cc.Event
 */
cc.EventTouch = cc.Event.extend(/** @lends cc.EventTouch# */{
  _eventCode: 0,
  _touches: null,

  ctor: function (arr) {
    cc.Event.prototype.ctor.call(this, cc.Event.TOUCH);
    this._touches = arr || [];
  },

  /**
   * Returns event code
   * @returns {number}
   */
  getEventCode: function () {
    return this._eventCode;
  },

  /**
   * Returns touches of event
   * @returns {Array}
   */
  getTouches: function () {
    return this._touches;
  },

  _setEventCode: function (eventCode) {
    this._eventCode = eventCode;
  },

  _setTouches: function (touches) {
    this._touches = touches;
  }
});

/**
 * The maximum touch numbers
 * @constant
 * @type {Number}
 */
cc.EventTouch.MAX_TOUCHES = 5;

cc.EventTouch.EventCode = { BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3 };
