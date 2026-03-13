import { isFunction } from '../../helper/checkType'
import { _LogInfos, log } from '../../helper/Debugger'
import { sys } from '../../helper/sys'
import { p, Rect, rectContainsPoint } from '../cocoa/Geometry'
import { EventAcceleration } from '../event-manager/EventExtension'
import { eventManager } from '../event-manager/EventManager'
import { EventMouse } from '../event-manager/EventMouse'
import { EventTouch } from '../event-manager/EventTouch'
import { Touch } from '../event-manager/Touch'
import { EGLView } from './EGLView'

/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationLandscapeLeft = -90
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationLandscapeRight = 90
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationPortraitUpsideDown = 180
/**
 * @constant
 * @type {number}
 */
export const UIInterfaceOrientationPortrait = 0

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
    let temp = this._indexBitsUsed
    const now = sys.now()

    for (let i = 0; i < this._maxTouches; i++) {
      if (!(temp & 0x00000001)) {
        this._indexBitsUsed |= 1 << i
        return i
      } else {
        const touch = this._touches[i]
        if (now - touch._lastModified > this.TOUCH_TIMEOUT) {
          this._removeUsedIndexBit(i)
          delete this._touchesIntegerDict[touch.getID()]
          return i
        }
      }
      temp >>= 1
    }

    // all bits are used
    return -1
  },

  _removeUsedIndexBit: function (index) {
    if (index < 0 || index >= this._maxTouches) return

    let temp = 1 << index
    temp = ~temp
    this._indexBitsUsed &= temp
  },

  _glView: null,

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesBegin: function (touches) {
    let selTouch
    let index
    let curTouch
    let touchID
    const handleTouches = []
    const locTouchIntDict = this._touchesIntegerDict
    const now = sys.now()
    for (let i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i]
      touchID = selTouch.getID()
      index = locTouchIntDict[touchID]

      if (index == null) {
        const unusedIndex = this._getUnUsedIndex()
        if (unusedIndex === -1) {
          log(_LogInfos.inputManager_handleTouchesBegin, unusedIndex)
          continue
        }
        //curTouch = this._touches[unusedIndex] = selTouch;
        curTouch = this._touches[unusedIndex] = new Touch(selTouch._point.x, selTouch._point.y, selTouch.getID())
        curTouch._lastModified = now
        curTouch._setPrevPoint(selTouch._prevPoint)
        locTouchIntDict[touchID] = unusedIndex
        handleTouches.push(curTouch)
      }
    }
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches)
      const touchEvent = new EventTouch(handleTouches)
      touchEvent._eventCode = EventTouch.EventCode.BEGAN
      eventManager.dispatchEvent(touchEvent)
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesMove: function (touches) {
    let selTouch
    let index
    let touchID
    const handleTouches = []
    const locTouches = this._touches
    const now = sys.now()
    for (let i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i]
      touchID = selTouch.getID()
      index = this._touchesIntegerDict[touchID]

      if (index == null) {
        //log("if the index doesn't exist, it is an error");
        continue
      }
      if (locTouches[index]) {
        locTouches[index]._setPoint(selTouch._point)
        locTouches[index]._setPrevPoint(selTouch._prevPoint)
        locTouches[index]._lastModified = now
        handleTouches.push(locTouches[index])
      }
    }
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches)
      const touchEvent = new EventTouch(handleTouches)
      touchEvent._eventCode = EventTouch.EventCode.MOVED
      eventManager.dispatchEvent(touchEvent)
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesEnd: function (touches) {
    const handleTouches = this.getSetOfTouchesEndOrCancel(touches)
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches)
      const touchEvent = new EventTouch(handleTouches)
      touchEvent._eventCode = EventTouch.EventCode.ENDED
      eventManager.dispatchEvent(touchEvent)
    }
  },

  /**
   * @function
   * @param {Array} touches
   */
  handleTouchesCancel: function (touches) {
    const handleTouches = this.getSetOfTouchesEndOrCancel(touches)
    if (handleTouches.length > 0) {
      this._glView._convertTouchesWithScale(handleTouches)
      const touchEvent = new EventTouch(handleTouches)
      touchEvent._eventCode = EventTouch.EventCode.CANCELLED
      eventManager.dispatchEvent(touchEvent)
    }
  },

  /**
   * @function
   * @param {Array} touches
   * @returns {Array}
   */
  getSetOfTouchesEndOrCancel: function (touches) {
    let selTouch
    let index
    let touchID
    const handleTouches = []
    const locTouches = this._touches
    const locTouchesIntDict = this._touchesIntegerDict
    for (let i = 0, len = touches.length; i < len; i++) {
      selTouch = touches[i]
      touchID = selTouch.getID()
      index = locTouchesIntDict[touchID]

      if (index == null) {
        continue //log("if the index doesn't exist, it is an error");
      }
      if (locTouches[index]) {
        locTouches[index]._setPoint(selTouch._point)
        locTouches[index]._setPrevPoint(selTouch._prevPoint)
        handleTouches.push(locTouches[index])
        this._removeUsedIndexBit(index)
        delete locTouchesIntDict[touchID]
      }
    }
    return handleTouches
  },

  /**
   * @function
   * @param {HTMLElement} element
   * @return {Object}
   */
  getHTMLElementPosition: function (element) {
    const docElem = document.documentElement
    const win = window
    let box
    if (isFunction(element.getBoundingClientRect)) {
      box = element.getBoundingClientRect()
    } else {
      box = {
        left: 0,
        top: 0,
        width: parseInt(element.style.width),
        height: parseInt(element.style.height),
      }
    }
    return {
      left: box.left + win.pageXOffset - docElem.clientLeft,
      top: box.top + win.pageYOffset - docElem.clientTop,
      width: box.width,
      height: box.height,
    }
  },

  /**
   * @function
   * @param {Touch} touch
   * @return {Touch}
   */
  getPreTouch: function (touch) {
    let preTouch = null
    const locPreTouchPool = this._preTouchPool
    const id = touch.getID()
    for (let i = locPreTouchPool.length - 1; i >= 0; i--) {
      if (locPreTouchPool[i].getID() === id) {
        preTouch = locPreTouchPool[i]
        break
      }
    }
    if (!preTouch) preTouch = touch
    return preTouch
  },

  /**
   * @function
   * @param {Touch} touch
   */
  setPreTouch: function (touch) {
    let find = false
    const locPreTouchPool = this._preTouchPool
    const id = touch.getID()
    for (let i = locPreTouchPool.length - 1; i >= 0; i--) {
      if (locPreTouchPool[i].getID() === id) {
        locPreTouchPool[i] = touch
        find = true
        break
      }
    }
    if (!find) {
      if (locPreTouchPool.length <= 50) {
        locPreTouchPool.push(touch)
      } else {
        locPreTouchPool[this._preTouchPoolPointer] = touch
        this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50
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
    const locPreTouch = this._preTouchPoint
    const location = this._glView.convertToLocationInView(tx, ty, pos)
    const touch = new Touch(location.x, location.y)
    touch._setPrevPoint(locPreTouch.x, locPreTouch.y)
    locPreTouch.x = location.x
    locPreTouch.y = location.y
    return touch
  },

  /**
   * @function
   * @param {p} location
   * @param {p} pos
   * @param {Number} eventType
   * @returns {EventMouse}
   */
  getMouseEvent: function (location, pos, eventType) {
    const locPreMouse = this._prevMousePoint
    this._glView._convertMouseToLocationInView(location, pos)
    const mouseEvent = new EventMouse(eventType)
    mouseEvent.setLocation(location.x, location.y)
    mouseEvent._setPrevCursor(locPreMouse.x, locPreMouse.y)
    locPreMouse.x = location.x
    locPreMouse.y = location.y
    return mouseEvent
  },

  /**
   * @function
   * @param {Touch} event
   * @param {p} pos
   * @return {p}
   */
  getPointByEvent: function (event, pos) {
    if (event.pageX != null)
      //not available in <= IE8
      return { x: event.pageX, y: event.pageY }

    pos.left -= document.body.scrollLeft
    pos.top -= document.body.scrollTop
    return { x: event.clientX, y: event.clientY }
  },

  /**
   * @function
   * @param {Touch} event
   * @param {p} pos
   * @returns {Array}
   */
  getTouchesByEvent: function (event, pos) {
    const touchArr = [],
      locView = this._glView
    let touch_event, touch, preLocation
    const locPreTouch = this._preTouchPoint

    const length = event.changedTouches.length
    for (let i = 0; i < length; i++) {
      touch_event = event.changedTouches[i]
      if (touch_event) {
        let location
        if (sys.BROWSER_TYPE_FIREFOX === sys.browserType)
          location = locView.convertToLocationInView(touch_event.pageX, touch_event.pageY, pos)
        else location = locView.convertToLocationInView(touch_event.clientX, touch_event.clientY, pos)
        if (touch_event.identifier != null) {
          touch = new Touch(location.x, location.y, touch_event.identifier)
          //use Touch Pool
          preLocation = this.getPreTouch(touch).getLocation()
          touch._setPrevPoint(preLocation.x, preLocation.y)
          this.setPreTouch(touch)
        } else {
          touch = new Touch(location.x, location.y)
          touch._setPrevPoint(locPreTouch.x, locPreTouch.y)
        }
        locPreTouch.x = location.x
        locPreTouch.y = location.y
        touchArr.push(touch)
      }
    }
    return touchArr
  },

  /**
   * @function
   * @param {HTMLElement} element
   */
  registerSystemEvent: function (element) {
    if (this._isRegisterEvent) return

    this._glView = EGLView.getInstance()
    const supportMouse = 'mouse' in sys.capabilities,
      supportTouches = 'touches' in sys.capabilities

    //HACK
    //  - At the same time to trigger the ontouch event and onmouse event
    //  - The function will execute 2 times
    //The known browser:
    //  liebiao
    //  miui
    //  WECHAT
    let prohibition = false
    if (sys.isMobile) prohibition = true

    //register touch event
    if (supportMouse) {
      window.addEventListener(
        'mousedown',
        () => {
          this._mousePressed = true
        },
        false,
      )

      window.addEventListener(
        'mouseup',
        (event) => {
          if (prohibition) return
          const savePressed = this._mousePressed
          this._mousePressed = false

          if (!savePressed) return

          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)
          if (!rectContainsPoint(Rect(pos.left, pos.top, pos.width, pos.height), location)) {
            this.handleTouchesEnd([this.getTouchByXY(location.x, location.y, pos)])

            const mouseEvent = this.getMouseEvent(location, pos, EventMouse.UP)
            mouseEvent.setButton(event.button)
            eventManager.dispatchEvent(mouseEvent)
          }
        },
        false,
      )

      //register canvas mouse event
      element.addEventListener(
        'mousedown',
        (event) => {
          if (prohibition) return
          this._mousePressed = true

          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)

          this.handleTouchesBegin([this.getTouchByXY(location.x, location.y, pos)])

          const mouseEvent = this.getMouseEvent(location, pos, EventMouse.DOWN)
          mouseEvent.setButton(event.button)
          eventManager.dispatchEvent(mouseEvent)

          event.stopPropagation()
          event.preventDefault()
          element.focus()
        },
        false,
      )

      element.addEventListener(
        'mouseup',
        (event) => {
          if (prohibition) return
          this._mousePressed = false

          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)

          this.handleTouchesEnd([this.getTouchByXY(location.x, location.y, pos)])

          const mouseEvent = this.getMouseEvent(location, pos, EventMouse.UP)
          mouseEvent.setButton(event.button)
          eventManager.dispatchEvent(mouseEvent)

          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )

      element.addEventListener(
        'mousemove',
        (event) => {
          if (prohibition) return

          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)

          this.handleTouchesMove([this.getTouchByXY(location.x, location.y, pos)])

          const mouseEvent = this.getMouseEvent(location, pos, EventMouse.MOVE)
          if (this._mousePressed) mouseEvent.setButton(event.button)
          else mouseEvent.setButton(null)
          eventManager.dispatchEvent(mouseEvent)

          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )

      element.addEventListener(
        'mousewheel',
        (event) => {
          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)

          const mouseEvent = this.getMouseEvent(location, pos, EventMouse.SCROLL)
          mouseEvent.setButton(event.button)
          mouseEvent.setScrollData(0, event.wheelDelta)
          eventManager.dispatchEvent(mouseEvent)

          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )

      /* firefox fix */
      element.addEventListener(
        'DOMMouseScroll',
        (event) => {
          const pos = this.getHTMLElementPosition(element)
          const location = this.getPointByEvent(event, pos)

          const mouseEvent = this.getMouseEvent(location, pos, EventMouse.SCROLL)
          mouseEvent.setButton(event.button)
          mouseEvent.setScrollData(0, event.detail * -120)
          eventManager.dispatchEvent(mouseEvent)

          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )
    }

    if (window.navigator.msPointerEnabled) {
      const _pointerEventsMap = {
        MSPointerDown: this.handleTouchesBegin,
        MSPointerMove: this.handleTouchesMove,
        MSPointerUp: this.handleTouchesEnd,
        MSPointerCancel: this.handleTouchesCancel,
      }

      for (const eventName in _pointerEventsMap) {
        ;(function (_pointerEvent, _touchEvent) {
          element.addEventListener(
            _pointerEvent,
            (event) => {
              const pos = this.getHTMLElementPosition(element)
              pos.left -= document.documentElement.scrollLeft
              pos.top -= document.documentElement.scrollTop

              _touchEvent.call(this, [this.getTouchByXY(event.clientX, event.clientY, pos)])
              event.stopPropagation()
            },
            false,
          )
        })(eventName, _pointerEventsMap[eventName])
      }
    }

    if (supportTouches) {
      //register canvas touch event
      element.addEventListener(
        'touchstart',
        (event) => {
          if (!event.changedTouches) return

          const pos = this.getHTMLElementPosition(element)
          pos.left -= document.body.scrollLeft
          pos.top -= document.body.scrollTop
          this.handleTouchesBegin(this.getTouchesByEvent(event, pos))
          event.stopPropagation()
          event.preventDefault()
          element.focus()
        },
        false,
      )

      element.addEventListener(
        'touchmove',
        (event) => {
          if (!event.changedTouches) return

          const pos = this.getHTMLElementPosition(element)
          pos.left -= document.body.scrollLeft
          pos.top -= document.body.scrollTop
          this.handleTouchesMove(this.getTouchesByEvent(event, pos))
          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )

      element.addEventListener(
        'touchend',
        (event) => {
          if (!event.changedTouches) return

          const pos = this.getHTMLElementPosition(element)
          pos.left -= document.body.scrollLeft
          pos.top -= document.body.scrollTop
          this.handleTouchesEnd(this.getTouchesByEvent(event, pos))
          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )

      element.addEventListener(
        'touchcancel',
        (event) => {
          if (!event.changedTouches) return

          const pos = this.getHTMLElementPosition(element)
          pos.left -= document.body.scrollLeft
          pos.top -= document.body.scrollTop
          this.handleTouchesCancel(this.getTouchesByEvent(event, pos))
          event.stopPropagation()
          event.preventDefault()
        },
        false,
      )
    }

    //register keyboard event
    this._registerKeyboardEvent()

    //register Accelerometer event
    // this._registerAccelerometerEvent();

    this._isRegisterEvent = true
  },

  _registerKeyboardEvent: function () {},

  /**
   * Register Accelerometer event
   * @function
   */
  _registerAccelerometerEvent: function () {},

  /**
   * @function
   * @param {Number} dt
   */
  update: function (dt) {
    if (this._accelCurTime > this._accelInterval) {
      this._accelCurTime -= this._accelInterval
      eventManager.dispatchEvent(new EventAcceleration(this._acceleration))
    }
    this._accelCurTime += dt
  },
}
