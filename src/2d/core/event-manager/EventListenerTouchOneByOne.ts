
cc._EventListenerTouchOneByOne = cc.EventListener.extend({
  _claimedTouches: null,
  swallowTouches: false,
  onTouchBegan: null,
  onTouchMoved: null,
  onTouchEnded: null,
  onTouchCancelled: null,

  ctor: function () {
    cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
    this._claimedTouches = [];
  },

  setSwallowTouches: function (needSwallow) {
    this.swallowTouches = needSwallow;
  },

  isSwallowTouches: function () {
    return this.swallowTouches;
  },

  clone: function () {
    var eventListener = new cc._EventListenerTouchOneByOne();
    eventListener.onTouchBegan = this.onTouchBegan;
    eventListener.onTouchMoved = this.onTouchMoved;
    eventListener.onTouchEnded = this.onTouchEnded;
    eventListener.onTouchCancelled = this.onTouchCancelled;
    eventListener.swallowTouches = this.swallowTouches;
    return eventListener;
  },

  checkAvailable: function () {
    if (!this.onTouchBegan) {
      cc.log(cc._LogInfos._EventListenerTouchOneByOne_checkAvailable);
      return false;
    }
    return true;
  }
});

cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";

cc._EventListenerTouchOneByOne.create = function () {
  return new cc._EventListenerTouchOneByOne();
};