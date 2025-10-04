
cc._EventListenerMouse = cc.EventListener.extend({
  onMouseDown: null,
  onMouseUp: null,
  onMouseMove: null,
  onMouseScroll: null,

  ctor: function () {
    cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, this._callback);
  },

  _callback: function (event) {
    var eventType = cc.EventMouse;
    switch (event._eventType) {
      case eventType.DOWN:
        if (this.onMouseDown)
          this.onMouseDown(event);
        break;
      case eventType.UP:
        if (this.onMouseUp)
          this.onMouseUp(event);
        break;
      case eventType.MOVE:
        if (this.onMouseMove)
          this.onMouseMove(event);
        break;
      case eventType.SCROLL:
        if (this.onMouseScroll)
          this.onMouseScroll(event);
        break;
      default:
        break;
    }
  },

  clone: function () {
    var eventListener = new cc._EventListenerMouse();
    eventListener.onMouseDown = this.onMouseDown;
    eventListener.onMouseUp = this.onMouseUp;
    eventListener.onMouseMove = this.onMouseMove;
    eventListener.onMouseScroll = this.onMouseScroll;
    return eventListener;
  },

  checkAvailable: function () {
    return true;
  }
}