
/**
 * Focus change event for UI widget
 * @class
 * @extends cc.Event
 */
cc.EventFocus = cc.Event.extend(/** @lends cc.EventTouch# */{
  _widgetGetFocus: null,
  _widgetLoseFocus: null,
  /**
   * Constructor function.
   * @param {ccui.Widget} widgetLoseFocus
   * @param {ccui.Widget} widgetGetFocus
   */
  ctor: function (widgetLoseFocus, widgetGetFocus) {
    cc.Event.prototype.ctor.call(this, cc.Event.FOCUS);
    this._widgetGetFocus = widgetGetFocus;
    this._widgetLoseFocus = widgetLoseFocus;
  }
});