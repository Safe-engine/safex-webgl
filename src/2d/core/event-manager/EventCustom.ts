import { Event } from "./Event";

export class EventCustom extends Event {
  _eventName = null
  _userData = null

  constructor(eventName: string) {
    super(Event.CUSTOM);
    this._eventName = eventName;
  }

  /**
   * Sets user data
   * @param {*} data
   */
  setUserData(data) {
    this._userData = data;
  }

  /**
   * Gets user data
   * @returns {*}
   */
  getUserData() {
    return this._userData;
  }

  /**
   * Gets event name
   * @returns {String}
   */
  getEventName() {
    return this._eventName;
  }
}
