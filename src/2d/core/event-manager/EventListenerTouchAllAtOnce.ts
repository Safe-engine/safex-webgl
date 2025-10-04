
cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
  onTouchesBegan: null,
  onTouchesMoved: null,
  onTouchesEnded: null,
  onTouchesCancelled: null,

  ctor: function () {
    cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null);
  },

  clone: function () {
    var eventListener = new cc._EventListenerTouchAllAtOnce();
    eventListener.onTouchesBegan = this.onTouchesBegan;
    eventListener.onTouchesMoved = this.onTouchesMoved;
    eventListener.onTouchesEnded = this.onTouchesEnded;
    eventListener.onTouchesCancelled = this.onTouchesCancelled;
    return eventListener;
  },

  checkAvailable: function () {
    if (this.onTouchesBegan === null && this.onTouchesMoved === null
      && this.onTouchesEnded === null && this.onTouchesCancelled === null) {
      cc.log(cc._LogInfos._EventListenerTouchAllAtOnce_checkAvailable);
      return false;
    }
    return true;
  }
});

cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";

cc._EventListenerTouchAllAtOnce.create = function () {
  return new cc._EventListenerTouchAllAtOnce();
};
