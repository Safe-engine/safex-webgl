
/**
 * The Custom event
 * @class
 * @extends cc.Event
 */

cc.EventCustom = cc.Event.extend(/** @lends cc.EventCustom# */{
  _eventName: null,
  _userData: null,                                 // User data

  ctor: function (eventName) {
    cc.Event.prototype.ctor.call(this, cc.Event.CUSTOM);
    this._eventName = eventName;
  },

  /**
   * Sets user data
   * @param {*} data
   */
  setUserData: function (data) {
    this._userData = data;
  },

  /**
   * Gets user data
   * @returns {*}
   */
  getUserData: function () {
    return this._userData;
  },

  /**
   * Gets event name
   * @returns {String}
   */
  getEventName: function () {
    return this._eventName;
  }
});
