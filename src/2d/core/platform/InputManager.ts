import { isFunction } from '../../../helper/checkType';
import { _LogInfos, log } from '../../../helper/Debugger';
import { sys } from '../../../helper/sys';
import { p, Rect, rectContainsPoint } from '../cocoa/Geometry';
import { EventAcceleration } from '../event-manager/EventExtension';
import { eventManager } from '../event-manager/EventManager';
import { EventMouse } from '../event-manager/EventMouse';
import { Touch } from '../event-manager/Touch';
import { EGLView } from './EGLView';

/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationLandscapeLeft = -90;
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationLandscapeRight = 90;
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationPortraitUpsideDown = 180;
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationPortrait = 0;

/**
 * <p>
 *  This class manages all events of input. include: touch, mouse, accelerometer, keyboard                                       <br/>
 * </p>
 * @class
 * @name inputManager
 */
export const inputManager = {
  TOUCH_TIMEOUT: 5000,

  _mousePressed: false,

  _isRegisterEvent: false,

  _preTouchPoint: p(0, 0),
  _prevMousePoint: p(0, 0),

  _preTouchPool: [],
  _preTouchPoolPointer: 0,

  _touches: [],
  _touchesIntegerDict: {},

  _indexBitsUsed: 0,
  _maxTouches: 5,

  _accelEnabled: false,
  _accelInterval: 1 / 30,
  _accelMinus: 1,
  _accelCurTime: 0,
  _acceleration: null,
  _accelDeviceEvent: null,

  _getUnUsedIndex: function () {
    var temp = this._indexBitsUsed;
    var now = sys.now();

    for (var i = 0; i < this._maxTouches; i++) {
      if (!(temp & 0x00000001)) {
        this._indexBitsUsed |= (1 << i);
        return i;
      }
      else {
        var touch = this._touches[i];
        if (now - touch._lastModified > this.TOUCH_TIMEOUT) {
          this._removeUsedIndexBit(i);
          delete this._touchesIntegerDict[touch.getID()];
          return i;
        }
      }
      temp >>= 1;
    }

    // all bits are used
    return -1;
  },

  _removeUsedIndexBit: function (index) {
    if (index < 0 || index >= this._maxTouches)
      return;

    var temp = 1 << index;
    temp = ~temp;
    this._indexBitsUsed &= temp;
  },

  _glView: null,

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesBegin: function (touches) {
    var selTouch, index, curTouch, touchID,
      handleTouches = [], locTouchIntDict = this._touchesIntegerDict,
      now = sys.now();
    for (var i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i];
      touchID = selTouch.getID();
      index = locTouchIntDict[touchID];

      if (index == null) {
        var unusedIndex = this._getUnUsedIndex();
        if (unusedIndex === -1) {
          log(_LogInfos.inputManager_handleTouchesBegin, unusedIndex);
          continue;
        }
        //curTouch = this._touches[unusedIndex] = selTouch;
        curTouch = this._touches[unusedIndex] = new Touch(selTouch._point.x, selTouch._point.y, selTouch.getID());
        curTouch._lastModified = now;
        curTouch._setPrevPoint(selTouch._prevPoint);
        locTouchIntDict[touchID] = unusedIndex;
        handleTouches.push(curTouch);
      }
    }
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches);
      var touchEvent = new EventTouch(handleTouches);
      touchEvent._eventCode = EventTouch.EventCode.BEGAN;
      eventManager.dispatchEvent(touchEvent);
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesMove: function (touches) {
    var selTouch, index, touchID,
      handleTouches = [], locTouches = this._touches,
      now = sys.now();
    for (var i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i];
      touchID = selTouch.getID();
      index = this._touchesIntegerDict[touchID];

      if (index == null) {
        //log("if the index doesn't exist, it is an error");
        continue;
      }
      if (locTouches[index]) {
        locTouches[index]._setPoint(selTouch._point);
        locTouches[index]._setPrevPoint(selTouch._prevPoint);
        locTouches[index]._lastModified = now;
        handleTouches.push(locTouches[index]);
      }
    }
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches);
      var touchEvent = new EventTouch(handleTouches);
      touchEvent._eventCode = EventTouch.EventCode.MOVED;
      eventManager.dispatchEvent(touchEvent);
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesEnd: function (touches) {
    var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches);
      var touchEvent = new EventTouch(handleTouches);
      touchEvent._eventCode = EventTouch.EventCode.ENDED;
      eventManager.dispatchEvent(touchEvent);
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesCancel: function (touches) {
    var handleTouches = this.getSetOfTouchesEndOrCancel(touches);
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches);
      var touchEvent = new EventTouch(handleTouches);
      touchEvent._eventCode = EventTouch.EventCode.CANCELLED;
      eventManager.dispatchEvent(touchEvent);
    }
  },

  /**
   * @function
   * @param {Array} touches
   * @returns {Array}
   */
  getSetOfTouchesEndOrCancel: function (touches) {
    var selTouch, index, touchID, handleTouches = [], locTouches = this._touches, locTouchesIntDict = this._touchesIntegerDict;
    for (var i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i];
      touchID = selTouch.getID();
      index = locTouchesIntDict[touchID];

      if (index == null) {
        continue;  //log("if the index doesn't exist, it is an error");
      }
      if (locTouches[index]) {
        locTouches[index]._setPoint(selTouch._point);
        locTouches[index]._setPrevPoint(selTouch._prevPoint);
        handleTouches.push(locTouches[index]);
        this._removeUsedIndexBit(index);
        delete locTouchesIntDict[touchID];
      }
    }
    return handleTouches;
  },

  /**
   * @function
   * @param {HTMLElement} element
   * @return {Object}
   */
  getHTMLElementPosition: function (element) {
    var docElem = document.documentElement;
    var win = window;
    var box = null;
    if (isFunction(element.getBoundingClientRect)) {
      box = element.getBoundingClientRect();
    } else {
      box = {
        left: 0,
        top: 0,
        width: parseInt(element.style.width),
        height: parseInt(element.style.height)
      };
    }
    return {
      left: box.left + win.pageXOffset - docElem.clientLeft,
      top: box.top + win.pageYOffset - docElem.clientTop,
      width: box.width,
      height: box.height
    };
  },

  /**
   * @function
   * @param {Touch} touch
   * @return {Touch}
   */
  getPreTouch: function (touch) {
    var preTouch = null;
    var locPreTouchPool = this._preTouchPool;
    var id = touch.getID();
    for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
      if (locPreTouchPool[i].getID() === id) {
        preTouch = locPreTouchPool[i];
        break;
      }
    }
    if (!preTouch)
      preTouch = touch;
    return preTouch;
  },

  /**
   * @function
   * @param {Touch} touch
   */
  setPreTouch: function (touch) {
    var find = false;
    var locPreTouchPool = this._preTouchPool;
    var id = touch.getID();
    for (var i = locPreTouchPool.length - 1; i >= 0; i--) {
      if (locPreTouchPool[i].getID() === id) {
        locPreTouchPool[i] = touch;
        find = true;
        break;
      }
    }
    if (!find) {
      if (locPreTouchPool.length <= 50) {
        locPreTouchPool.push(touch);
      } else {
        locPreTouchPool[this._preTouchPoolPointer] = touch;
        this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50;
      }
    }
  },

  /**
   * @function
   * @param {Number} tx
   * @param {Number} ty
   * @param {p} pos
   * @return {Touch}
   */
  getTouchByXY: function (tx, ty, pos) {
    var locPreTouch = this._preTouchPoint;
    var location = this._glView.convertToLocationInView(tx, ty, pos);
    var touch = new Touch(location.x, location.y);
    touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
    locPreTouch.x = location.x;
    locPreTouch.y = location.y;
    return touch;
  },

  /**
   * @function
   * @param {p} location
   * @param {p} pos
   * @param {Number} eventType
   * @returns {EventMouse}
   */
  getMouseEvent: function (location, pos, eventType) {
    var locPreMouse = this._prevMousePoint;
    this._glView._convertMouseToLocationInView(location, pos);
    var mouseEvent = new EventMouse(eventType);
    mouseEvent.setLocation(location.x, location.y);
    mouseEvent._setPrevCursor(locPreMouse.x, locPreMouse.y);
    locPreMouse.x = location.x;
    locPreMouse.y = location.y;
    return mouseEvent;
  },

  /**
   * @function
   * @param {Touch} event
   * @param {p} pos
   * @return {p}
   */
  getPointByEvent: function (event, pos) {
    if (event.pageX != null)  //not available in <= IE8
      return { x: event.pageX, y: event.pageY };

    pos.left -= document.body.scrollLeft;
    pos.top -= document.body.scrollTop;
    return { x: event.clientX, y: event.clientY };
  },

  /**
   * @function
   * @param {Touch} event
   * @param {p} pos
   * @returns {Array}
   */
  getTouchesByEvent: function (event, pos) {
    var touchArr = [], locView = this._glView;
    var touch_event, touch, preLocation;
    var locPreTouch = this._preTouchPoint;

    var length = event.changedTouches.length;
    for (var i = 0; i < length; i++) {
      touch_event = event.changedTouches[i];
      if (touch_event) {
        var location;
        if (sys.BROWSER_TYPE_FIREFOX === sys.browserType)
          location = locView.convertToLocationInView(touch_event.pageX, touch_event.pageY, pos);
        else
          location = locView.convertToLocationInView(touch_event.clientX, touch_event.clientY, pos);
        if (touch_event.identifier != null) {
          touch = new Touch(location.x, location.y, touch_event.identifier);
          //use Touch Pool
          preLocation = this.getPreTouch(touch).getLocation();
          touch._setPrevPoint(preLocation.x, preLocation.y);
          this.setPreTouch(touch);
        } else {
          touch = new Touch(location.x, location.y);
          touch._setPrevPoint(locPreTouch.x, locPreTouch.y);
        }
        locPreTouch.x = location.x;
        locPreTouch.y = location.y;
        touchArr.push(touch);
      }
    }
    return touchArr;
  },

  /**
   * @function
   * @param {HTMLElement} element
   */
  registerSystemEvent: function (element) {
    if (this._isRegisterEvent) return;

    var locView = this._glView = EGLView.getInstance();
    var selfPointer = this;
    var supportMouse = ('mouse' in sys.capabilities), supportTouches = ('touches' in sys.capabilities);

    //HACK
    //  - At the same time to trigger the ontouch event and onmouse event
    //  - The function will execute 2 times
    //The known browser:
    //  liebiao
    //  miui
    //  WECHAT
    var prohibition = false;
    if (sys.isMobile)
      prohibition = true;

    //register touch event
    if (supportMouse) {
      window.addEventListener('mousedown', function () {
        selfPointer._mousePressed = true;
      }, false);

      window.addEventListener('mouseup', function (event) {
        if (prohibition) return;
        var savePressed = selfPointer._mousePressed;
        selfPointer._mousePressed = false;

        if (!savePressed)
          return;

        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);
        if (!rectContainsPoint(new Rect(pos.left, pos.top, pos.width, pos.height), location)) {
          selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

          var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.UP);
          mouseEvent.setButton(event.button);
          eventManager.dispatchEvent(mouseEvent);
        }
      }, false);

      //register canvas mouse event
      element.addEventListener("mousedown", function (event) {
        if (prohibition) return;
        selfPointer._mousePressed = true;

        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);

        selfPointer.handleTouchesBegin([selfPointer.getTouchByXY(location.x, location.y, pos)]);

        var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.DOWN);
        mouseEvent.setButton(event.button);
        eventManager.dispatchEvent(mouseEvent);

        event.stopPropagation();
        event.preventDefault();
        element.focus();
      }, false);

      element.addEventListener("mouseup", function (event) {
        if (prohibition) return;
        selfPointer._mousePressed = false;

        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);

        selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);

        var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.UP);
        mouseEvent.setButton(event.button);
        eventManager.dispatchEvent(mouseEvent);

        event.stopPropagation();
        event.preventDefault();
      }, false);

      element.addEventListener("mousemove", function (event) {
        if (prohibition) return;

        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);

        selfPointer.handleTouchesMove([selfPointer.getTouchByXY(location.x, location.y, pos)]);

        var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.MOVE);
        if (selfPointer._mousePressed)
          mouseEvent.setButton(event.button);
        else
          mouseEvent.setButton(null);
        eventManager.dispatchEvent(mouseEvent);

        event.stopPropagation();
        event.preventDefault();
      }, false);

      element.addEventListener("mousewheel", function (event) {
        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);

        var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.SCROLL);
        mouseEvent.setButton(event.button);
        mouseEvent.setScrollData(0, event.wheelDelta);
        eventManager.dispatchEvent(mouseEvent);

        event.stopPropagation();
        event.preventDefault();
      }, false);

      /* firefox fix */
      element.addEventListener("DOMMouseScroll", function (event) {
        var pos = selfPointer.getHTMLElementPosition(element);
        var location = selfPointer.getPointByEvent(event, pos);

        var mouseEvent = selfPointer.getMouseEvent(location, pos, EventMouse.SCROLL);
        mouseEvent.setButton(event.button);
        mouseEvent.setScrollData(0, event.detail * -120);
        eventManager.dispatchEvent(mouseEvent);

        event.stopPropagation();
        event.preventDefault();
      }, false);
    }

    if (window.navigator.msPointerEnabled) {
      var _pointerEventsMap = {
        "MSPointerDown": selfPointer.handleTouchesBegin,
        "MSPointerMove": selfPointer.handleTouchesMove,
        "MSPointerUp": selfPointer.handleTouchesEnd,
        "MSPointerCancel": selfPointer.handleTouchesCancel
      };

      for (var eventName in _pointerEventsMap) {
        (function (_pointerEvent, _touchEvent) {
          element.addEventListener(_pointerEvent, function (event) {
            var pos = selfPointer.getHTMLElementPosition(element);
            pos.left -= document.documentElement.scrollLeft;
            pos.top -= document.documentElement.scrollTop;

            _touchEvent.call(selfPointer, [selfPointer.getTouchByXY(event.clientX, event.clientY, pos)]);
            event.stopPropagation();
          }, false);
        })(eventName, _pointerEventsMap[eventName]);
      }
    }

    if (supportTouches) {
      //register canvas touch event
      element.addEventListener("touchstart", function (event) {
        if (!event.changedTouches) return;

        var pos = selfPointer.getHTMLElementPosition(element);
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        selfPointer.handleTouchesBegin(selfPointer.getTouchesByEvent(event, pos));
        event.stopPropagation();
        event.preventDefault();
        element.focus();
      }, false);

      element.addEventListener("touchmove", function (event) {
        if (!event.changedTouches) return;

        var pos = selfPointer.getHTMLElementPosition(element);
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        selfPointer.handleTouchesMove(selfPointer.getTouchesByEvent(event, pos));
        event.stopPropagation();
        event.preventDefault();
      }, false);

      element.addEventListener("touchend", function (event) {
        if (!event.changedTouches) return;

        var pos = selfPointer.getHTMLElementPosition(element);
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        selfPointer.handleTouchesEnd(selfPointer.getTouchesByEvent(event, pos));
        event.stopPropagation();
        event.preventDefault();
      }, false);

      element.addEventListener("touchcancel", function (event) {
        if (!event.changedTouches) return;

        var pos = selfPointer.getHTMLElementPosition(element);
        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        selfPointer.handleTouchesCancel(selfPointer.getTouchesByEvent(event, pos));
        event.stopPropagation();
        event.preventDefault();
      }, false);
    }

    //register keyboard event
    this._registerKeyboardEvent();

    //register Accelerometer event
    // this._registerAccelerometerEvent();

    this._isRegisterEvent = true;
  },

  _registerKeyboardEvent: function () {
  },

  /**
   * Register Accelerometer event
   * @function
   */
  _registerAccelerometerEvent: function () {
  },

  /**
   * @function
   * @param {Number} dt
   */
  update: function (dt) {
    if (this._accelCurTime > this._accelInterval) {
      this._accelCurTime -= this._accelInterval;
      eventManager.dispatchEvent(new EventAcceleration(this._acceleration));
    }
    this._accelCurTime += dt;
  }
};
