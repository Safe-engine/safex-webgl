import { EGLView } from '../platform/EGLView';
import { Event } from './Event';

/**
 * The mouse event
 * @class
 * @extends Event
 */
export class EventMouse extends Event {
  _eventType = 0;
  _button = 0;
  _x = 0;
  _y = 0;
  _prevX = 0;
  _prevY = 0;
  _scrollX = 0;
  _scrollY = 0;

  constructor(eventType) {
    super(Event.MOUSE);
    this._eventType = eventType;
  }

  /**
   * Sets scroll data
   * @param {number} scrollX
   * @param {number} scrollY
   */
  setScrollData(scrollX, scrollY) {
    this._scrollX = scrollX;
    this._scrollY = scrollY;
  }

  /**
   * Returns the x axis scroll value
   * @returns {number}
   */
  getScrollX() {
    return this._scrollX;
  }

  /**
   * Returns the y axis scroll value
   * @returns {number}
   */
  getScrollY() {
    return this._scrollY;
  }

  /**
   * Sets cursor location
   * @param {number} x
   * @param {number} y
   */
  setLocation(x, y) {
    this._x = x;
    this._y = y;
  }

  /**
   * Returns cursor location
   * @return {cc.Point} location
   */
  getLocation() {
    return { x: this._x, y: this._y };
  }

  /**
   * Returns the current cursor location in screen coordinates
   * @return {cc.Point}
   */
  getLocationInView() {
    return { x: this._x, y: EGLView.getInstance().getDesignResolutionSize().height - this._y };
  }

  _setPrevCursor(x, y) {
    this._prevX = x;
    this._prevY = y;
  }

  /**
   * Returns the delta distance from the previous location to current location
   * @return {cc.Point}
   */
  getDelta() {
    return { x: this._x - this._prevX, y: this._y - this._prevY };
  }

  /**
   * Returns the X axis delta distance from the previous location to current location
   * @return {Number}
   */
  getDeltaX() {
    return this._x - this._prevX;
  }

  /**
   * Returns the Y axis delta distance from the previous location to current location
   * @return {Number}
   */
  getDeltaY() {
    return this._y - this._prevY;
  }

  /**
   * Sets mouse button
   * @param {number} button
   */
  setButton(button) {
    this._button = button;
  }

  /**
   * Returns mouse button
   * @returns {number}
   */
  getButton() {
    return this._button;
  }

  /**
   * Returns location X axis data
   * @returns {number}
   */
  getLocationX() {
    return this._x;
  }

  /**
   * Returns location Y axis data
   * @returns {number}
   */
  getLocationY() {
    return this._y;
  }

  //Different types of MouseEvent
  /**
   * The none event code of  mouse event.
   * @constant
   * @type {number}
   */
  static NONE = 0;
  /**
   * The event type code of mouse down event.
   * @constant
   * @type {number}
   */
  static DOWN = 1;
  /**
   * The event type code of mouse up event.
   * @constant
   * @type {number}
   */
  static UP = 2;
  /**
   * The event type code of mouse move event.
   * @constant
   * @type {number}
   */
  static MOVE = 3;
  /**
   * The event type code of mouse scroll event.
   * @constant
   * @type {number}
   */
  static SCROLL = 4;

  /**
   * The tag of Mouse left button
   * @constant
   * @type {Number}
   */
  static BUTTON_LEFT = 0;

  /**
   * The tag of Mouse right button  (The right button number is 2 on browser)
   * @constant
   * @type {Number}
   */
  static BUTTON_RIGHT = 2;

  /**
   * The tag of Mouse middle button  (The right button number is 1 on browser)
   * @constant
   * @type {Number}
   */
  static BUTTON_MIDDLE = 1;

  /**
   * The tag of Mouse button 4
   * @constant
   * @type {Number}
   */
  static BUTTON_4 = 3;

  /**
   * The tag of Mouse button 5
   * @constant
   * @type {Number}
   */
  static BUTTON_5 = 4;

  /**
   * The tag of Mouse button 6
   * @constant
   * @type {Number}
   */
  static BUTTON_6 = 5;

  /**
   * The tag of Mouse button 7
   * @constant
   * @type {Number}
   */
  static BUTTON_7 = 6;

  /**
   * The tag of Mouse button 8
   * @constant
   * @type {Number}
   */
  static BUTTON_8 = 7;

}
