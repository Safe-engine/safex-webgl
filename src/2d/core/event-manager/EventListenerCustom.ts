
export class EventListenerCustom extends EventListener{
  _onCustomEvent: null,
  ctor: function (listenerId, callback, target) {
    this._onCustomEvent = callback;
    this._target = target;

    cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, listenerId, this._callback);
  },

  _callback: function (event) {
    if (this._onCustomEvent !== null)
      this._onCustomEvent.call(this._target, event);
  },

  checkAvailable: function () {
    return (cc.EventListener.prototype.checkAvailable.call(this) && this._onCustomEvent !== null);
  },

  clone: function () {
    return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent);
  }
});

cc._EventListenerCustom.create = function (eventName, callback) {
  return new cc._EventListenerCustom(eventName, callback);
};
