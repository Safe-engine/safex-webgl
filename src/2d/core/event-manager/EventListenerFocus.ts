
cc._EventListenerFocus = cc.EventListener.extend({
  clone: function () {
    var listener = new cc._EventListenerFocus();
    listener.onFocusChanged = this.onFocusChanged;
    return listener;
  },
  checkAvailable: function () {
    if (!this.onFocusChanged) {
      cc.log("Invalid EventListenerFocus!");
      return false;
    }
    return true;
  },
  onFocusChanged: null,
  ctor: function () {
    cc.EventListener.prototype.ctor.call(this, cc.EventListener.FOCUS, cc._EventListenerFocus.LISTENER_ID, this._callback);
  },
  _callback: function (event) {
    if (this.onFocusChanged) {
      this.onFocusChanged(event._widgetLoseFocus, event._widgetGetFocus);
    }
  }
});

cc._EventListenerFocus.LISTENER_ID = "__cc_focus_event";