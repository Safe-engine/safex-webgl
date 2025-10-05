import { Event } from "./Event";

/**
 * Focus change event for UI widget
 * @class
 * @extends Event
 */
export class EventFocus extends Event {
  _widgetGetFocus
  _widgetLoseFocus
  /**
   * Constructor function.
   * @param {ccui.Widget} widgetLoseFocus
   * @param {ccui.Widget} widgetGetFocus
   */
  constructor(widgetLoseFocus, widgetGetFocus) {
    super(Event.FOCUS);
    this._widgetGetFocus = widgetGetFocus;
    this._widgetLoseFocus = widgetLoseFocus;
  }
}
