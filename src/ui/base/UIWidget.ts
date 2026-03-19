import { renderer } from '../..'
import { Node } from '../../core/base-nodes/Node'
import { p, Rect, rectContainsPoint, Size } from '../../core/cocoa/Geometry'
import { EventListener } from '../../core/event-manager'
import { EventFocus } from '../../core/event-manager/EventFocus'
import { createEventListener, eventManager } from '../../core/event-manager/EventManager'
import { arrayRemoveObject, SHADER_SPRITE_POSITION_TEXTURECOLOR, SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY } from '../../core/platform'
import { log } from '../../helper/Debugger'
import { shaderCache } from '../../shaders/ShaderCache'
// import { Layout } from '../layout/UILayout'
import { LayoutParameter } from '../layout/UILayoutParameter'
import { FocusNavigationController } from './FocusNavigationController'
import { ProtectedNode } from './ProtectedNode'
import { WidgetWebGLRenderCmd } from './UIWidgetRenderCmd'

export const __LAYOUT_COMPONENT_NAME = '__ui_layout'

export class Widget extends ProtectedNode {
  _enabled = true ///< Highest control of widget
  _bright = true ///< is this widget bright
  _touchEnabled = false ///< is this widget touch endabled

  declare _brightStyle ///< bright style

  declare _touchBeganPosition ///< touch began point
  declare _touchMovePosition ///< touch moved point
  declare _touchEndPosition ///< touch ended point

  declare _touchEventListener
  declare _touchEventSelector

  _name = 'default'
  _widgetType = null
  _actionTag = 0
  _customSize = null
  declare _layoutParameterDictionary
  _layoutParameterType = 0

  _focused = false
  _focusEnabled = true

  _ignoreSize = false
  _affectByClipping = false

  _sizeType = null
  _sizePercent = null
  _positionType = null
  _positionPercent = null
  _hit = false
  _nodes = null
  _touchListener = null
  _className = 'Widget'
  _flippedX = false
  _flippedY = false
  _opacity = 255
  _highlight = false

  declare _touchEventCallback
  declare _clickEventListener

  _propagateTouchEvents = true
  _unifySize = false

  declare _callbackName
  declare _callbackType
  _inViewRect = true
  /**
   * <p>
   *    When a widget lose/get focus, this method will be called. Be Caution when you provide your own version,       <br/>
   *    you must call widget.setFocused(true/false) to change the focus state of the current focused widget;
   * </p>
   */
  declare onFocusChanged

  /**
   * use this function to manually specify the next focused widget regards to each direction
   */
  declare onNextFocusedWidget
  declare _sizeDirty

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @function
   */
  constructor() {
    super()
    this._brightStyle = Widget.BRIGHT_STYLE_NONE
    this._touchBeganPosition = p(0, 0)
    this._touchMovePosition = p(0, 0)
    this._touchEndPosition = p(0, 0)
    this._widgetType = Widget.TYPE_WIDGET
    this._customSize = Size(0, 0)
    this._layoutParameterDictionary = {}
    this._sizeType = Widget.SIZE_ABSOLUTE
    this._sizePercent = p(0, 0)
    this._positionType = Widget.POSITION_ABSOLUTE
    this._positionPercent = p(0, 0)
    this._nodes = []
    this._layoutParameterType = LayoutParameter.NONE
    this.init()
  }

  /**
   * initializes state of widget. please do not call this function by yourself, you should pass the parameters to constructor to initialize it.
   * @returns {boolean}
   */
  init() {
    this._layoutParameterDictionary = {}
    this._initRenderer()
    this.setBright(true)

    this.onFocusChanged = this.onFocusChange
    this.onNextFocusedWidget = null
    this.setAnchorPoint(p(0.5, 0.5))

    this.ignoreContentAdaptWithSize(true)
    return true
  }

  /**
   * Calls updateSizeAndPosition and its parent's onEnter
   * @override
   */
  onEnter() {
    const locListener = this._touchListener
    if (locListener && !locListener._isRegistered() && this._touchEnabled) eventManager.addListener(locListener, this)
    this.updateSizeAndPosition()
    if (this._sizeDirty) this._onSizeChanged()
    super.onEnter()
  }

  /**
   * Calls unscheduleUpdate and its parent's onExit
   * @override
   */
  onExit() {
    this.unscheduleUpdate()
    super.onExit()
  }

  /**
   * The direct parent when it's a widget also, otherwise equals null
   * @returns {Widget|null}
   */
  getWidgetParent() {
    const widget = this.getParent()
    if (widget instanceof Widget) return widget
    return null
  }

  _updateContentSizeWithTextureSize(size) {
    if (this._unifySize) {
      this.setContentSize(size)
      return
    }
    this.setContentSize(this._ignoreSize ? size : this._customSize)
  }

  _isAncestorsEnabled() {
    const parentWidget = this._getAncensterWidget(this)
    if (parentWidget == null) return true
    if (parentWidget && !parentWidget.isEnabled()) return false

    return parentWidget._isAncestorsEnabled()
  }

  /**
   * Allow widget touch events to propagate to its parents. Set false will disable propagation
   * @since v3.2
   * @param {Boolean} isPropagate
   */
  setPropagateTouchEvents(isPropagate) {
    this._propagateTouchEvents = isPropagate
  }

  /**
   * Return whether the widget is propagate touch events to its parents or not
   * @since v3.2
   * @returns {boolean}
   */
  isPropagateTouchEvents() {
    return this._propagateTouchEvents
  }

  /**
   * Specify widget to swallow touches or not
   * @since v3.2
   * @param {Boolean} swallow
   */
  setSwallowTouches(swallow) {
    if (this._touchListener) this._touchListener.setSwallowTouches(swallow)
  }

  /**
   * Return whether the widget is swallowing touch or not
   * @since v3.2
   * @returns {boolean}
   */
  isSwallowTouches() {
    if (this._touchListener) {
      //return true;                           //todo need test
      return this._touchListener.isSwallowTouches()
    }
    return false
  }

  _getAncensterWidget(node) {
    if (null == node) return null

    const parent = node.getParent()
    if (null == parent) return null

    if (parent instanceof Widget) return parent
    else return this._getAncensterWidget(parent.getParent())
  }

  _isAncestorsVisible(node) {
    if (null == node) return true

    const parent = node.getParent()

    if (parent && !parent.isVisible()) return false
    return this._isAncestorsVisible(parent)
  }

  /**
   * <p>
   *     Sets whether the widget is enabled                                                                                    <br/>
   *     true if the widget is enabled, widget may be touched , false if the widget is disabled, widget cannot be touched.     <br/>
   *     The default value is true, a widget is default to enabled
   * </p>
   * @param {Boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled
    this.setBright(enabled)
  }

  /**
   * initializes renderer of widget.
   */
  _initRenderer() {}

  /**
   * Sets _customSize of Widget, if ignoreSize is true, the content size is its renderer's contentSize, otherwise the content size is parameter.
   * and updates size percent by parent content size. At last, updates its children's size and position.
   * @param {Size|Number} contentSize content size or width of content size
   * @param {Number} [height]
   * @override
   */
  setContentSize(contentSize: Size | number, height?) {
    super.setContentSize(contentSize, height)

    const locWidth = this._contentSize.width
    const locHeight = this._contentSize.height

    this._customSize.width = locWidth
    this._customSize.height = locHeight
    if (this._unifySize) {
      //unify size logic
    } else if (this._ignoreSize) {
      this._contentSize = this.getVirtualRendererSize()
    }
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      const pSize = widgetParent ? widgetParent.getContentSize() : this._parent.getContentSize()
      this._sizePercent.x = pSize.width > 0.0 ? locWidth / pSize.width : 0.0
      this._sizePercent.y = pSize.height > 0.0 ? locHeight / pSize.height : 0.0
    }

    if (this._running) {
      this._onSizeChanged()
    } else {
      this._sizeDirty = true
    }
  }

  _setWidth(w) {
    if (w === this._contentSize.width) {
      return
    }
    super._setWidth(w)
    this._customSize.width = w
    if (this._unifySize) {
      //unify size logic
    } else if (this._ignoreSize) {
      this._contentSize = this.getVirtualRendererSize()
    }

    if (this._running) {
      const widgetParent = this.getWidgetParent()
      const locWidth = widgetParent ? widgetParent.width : this._parent.width
      this._sizePercent.x = locWidth > 0 ? this._customSize.width / locWidth : 0
    }

    if (this._running) {
      this._onSizeChanged()
    } else {
      this._sizeDirty = true
    }
  }
  _setHeight(h) {
    if (h === this._contentSize.height) {
      return
    }

    Node.prototype._setHeight.call(this, h)
    this._customSize.height = h
    if (this._unifySize) {
      //unify size logic
    } else if (this._ignoreSize) {
      this._contentSize = this.getVirtualRendererSize()
    }

    if (this._running) {
      const widgetParent = this.getWidgetParent()
      const locH = widgetParent ? widgetParent.height : this._parent.height
      this._sizePercent.y = locH > 0 ? this._customSize.height / locH : 0
    }

    if (this._running) {
      this._onSizeChanged()
    } else {
      this._sizeDirty = true
    }
  }

  /**
   * Changes the percent that is widget's percent size
   * @param {Point} percent that is widget's percent size, width and height value from 0 to 1.
   */
  setSizePercent(percent) {
    this._sizePercent.x = percent.x
    this._sizePercent.y = percent.y
    let width = this._customSize.width,
      height = this._customSize.height
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      if (widgetParent) {
        width = widgetParent.width * percent.x
        height = widgetParent.height * percent.y
      } else {
        width = this._parent.width * percent.x
        height = this._parent.height * percent.y
      }
    }
    if (this._ignoreSize) this.setContentSize(this.getVirtualRendererSize())
    else this.setContentSize(width, height)

    this._customSize.width = width
    this._customSize.height = height
  }

  _setWidthPercent(percent) {
    this._sizePercent.x = percent
    let width = this._customSize.width
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      width = (widgetParent ? widgetParent.width : this._parent.width) * percent
    }
    if (this._ignoreSize) this._setWidth(this.getVirtualRendererSize().width)
    else this._setWidth(width)
    this._customSize.width = width
  }
  _setHeightPercent(percent) {
    this._sizePercent.y = percent
    let height = this._customSize.height
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      height = (widgetParent ? widgetParent.height : this._parent.height) * percent
    }
    if (this._ignoreSize) this._setHeight(this.getVirtualRendererSize().height)
    else this._setHeight(height)
    this._customSize.height = height
  }

  /**
   * updates its size by size type and its position by position type.
   * @param {Size} [parentSize] parent size
   */
  updateSizeAndPosition(parentSize?) {
    if (!parentSize) {
      const widgetParent = this.getWidgetParent()
      if (widgetParent) parentSize = widgetParent.getLayoutSize()
      else parentSize = this._parent.getContentSize()
    }

    switch (this._sizeType) {
      case Widget.SIZE_ABSOLUTE:
        if (this._ignoreSize) this.setContentSize(this.getVirtualRendererSize())
        else this.setContentSize(this._customSize)
        this._sizePercent.x = parentSize.width > 0 ? this._customSize.width / parentSize.width : 0
        this._sizePercent.y = parentSize.height > 0 ? this._customSize.height / parentSize.height : 0
        break
      case Widget.SIZE_PERCENT: {
        const cSize = Size(parentSize.width * this._sizePercent.x, parentSize.height * this._sizePercent.y)
        if (this._ignoreSize) this.setContentSize(this.getVirtualRendererSize())
        else this.setContentSize(cSize)
        this._customSize.width = cSize.width
        this._customSize.height = cSize.height
        break
      }
      default:
        break
    }
    this._onSizeChanged()
    let absPos = this.getPosition()
    switch (this._positionType) {
      case Widget.POSITION_ABSOLUTE:
        if (parentSize.width <= 0 || parentSize.height <= 0) {
          this._positionPercent.x = this._positionPercent.y = 0
        } else {
          this._positionPercent.x = absPos.x / parentSize.width
          this._positionPercent.y = absPos.y / parentSize.height
        }
        break
      case Widget.POSITION_PERCENT:
        absPos = p(parentSize.width * this._positionPercent.x, parentSize.height * this._positionPercent.y)
        break
      default:
        break
    }
    // if (this._parent instanceof ImageView) {
    //   const renderer = this._parent._imageRenderer
    //   if (renderer && !renderer._textureLoaded) return
    // }
    this.setPosition(absPos)
  }

  /**TEXTURE_RES_TYPE
   * Changes the size type of widget.
   * @param {Widget.SIZE_ABSOLUTE|Widget.SIZE_PERCENT} type that is widget's size type
   */
  setSizeType(type) {
    this._sizeType = type
  }

  /**
   * Gets the size type of widget.
   * @returns {Widget.SIZE_ABSOLUTE|Widget.SIZE_PERCENT} that is widget's size type
   */
  getSizeType() {
    return this._sizeType
  }

  /**
   * Ignore the widget size
   * @param {Boolean} ignore true that widget will ignore it's size, use texture size, false otherwise. Default value is true.
   */
  ignoreContentAdaptWithSize(ignore) {
    if (this._unifySize) {
      this.setContentSize(this._customSize)
      return
    }

    if (this._ignoreSize === ignore) return

    this._ignoreSize = ignore
    this.setContentSize(ignore ? this.getVirtualRendererSize() : this._customSize)
    //this._onSizeChanged();
  }

  /**
   * Gets whether ignore the content size (custom size)
   * @returns {boolean}  true that widget will ignore it's size, use texture size, false otherwise.
   */
  isIgnoreContentAdaptWithSize() {
    return this._ignoreSize
  }

  /**
   * Get custom size of Widget
   * @returns {Size}
   */
  getCustomSize() {
    return Size(this._customSize)
  }

  /**
   * Gets layout size of Widget.
   * @returns {Size}
   */
  getLayoutSize() {
    return Size(this._contentSize)
  }

  /**
   * Returns size percent of Widget
   * @returns {Point}
   */
  getSizePercent() {
    return this._sizePercent
  }
  _getWidthPercent() {
    return this._sizePercent.x
  }
  _getHeightPercent() {
    return this._sizePercent.y
  }

  /**
   *  Gets world position of Widget.
   * @returns {Point} world position of Widget.
   */
  getWorldPosition() {
    return this.convertToWorldSpace(p(this._anchorPoint.x * this._contentSize.width, this._anchorPoint.y * this._contentSize.height))
  }

  /**
   * Gets the Virtual Renderer of widget.
   * @returns {Widget}
   */
  getVirtualRenderer() {
    return this
  }

  /**
   * Gets the content size of widget.  Content size is widget's texture size.
   */
  getVirtualRendererSize() {
    return Size(this._contentSize)
  }

  /**
   * call back function called when size changed.
   */
  _onSizeChanged() {
    const locChildren = this.getChildren()
    for (let i = 0, len = locChildren.length; i < len; i++) {
      const child = locChildren[i]
      if (child instanceof Widget) child.updateSizeAndPosition()
    }
    this._sizeDirty = false
  }

  /**
   * Sets whether the widget is touch enabled. The default value is false, a widget is default to touch disabled
   * @param {Boolean} enable  true if the widget is touch enabled, false if the widget is touch disabled.
   */
  setTouchEnabled(enable) {
    if (this._touchEnabled === enable) return

    this._touchEnabled = enable //TODO need consider remove and re-add.
    if (this._touchEnabled) {
      if (!this._touchListener)
        this._touchListener = createEventListener({
          event: EventListener.TOUCH_ONE_BY_ONE,
          swallowTouches: true,
          onTouchBegan: this.onTouchBegan.bind(this),
          onTouchMoved: this.onTouchMoved.bind(this),
          onTouchEnded: this.onTouchEnded.bind(this),
        })
      eventManager.addListener(this._touchListener, this)
    } else {
      eventManager.removeListener(this._touchListener)
    }
  }

  /**
   * Returns whether or not touch is enabled.
   * @returns {boolean} true if the widget is touch enabled, false if the widget is touch disabled.
   */
  isTouchEnabled() {
    return this._touchEnabled
  }

  /**
   * Determines if the widget is highlighted
   * @returns {boolean} true if the widget is highlighted, false if the widget is not highlighted .
   */
  isHighlighted() {
    return this._highlight
  }

  /**
   * Sets whether the widget is highlighted. The default value is false, a widget is default to not highlighted
   * @param highlight true if the widget is highlighted, false if the widget is not highlighted.
   */
  setHighlighted(highlight) {
    if (highlight === this._highlight) return
    this._highlight = highlight
    if (this._bright) {
      if (this._highlight) this.setBrightStyle(Widget.BRIGHT_STYLE_HIGH_LIGHT)
      else this.setBrightStyle(Widget.BRIGHT_STYLE_NORMAL)
    } else this._onPressStateChangedToDisabled()
  }

  /**
   * Determines if the widget is on focused
   * @returns {boolean} whether the widget is focused or not
   */
  isFocused() {
    return this._focused
  }

  /**
   * Sets whether the widget is on focused
   * The default value is false, a widget is default to not on focused
   * @param {boolean} focus  pass true to let the widget get focus or pass false to let the widget lose focus
   */
  setFocused(focus) {
    this._focused = focus
    //make sure there is only one focusedWidget
    if (focus) {
      Widget._focusedWidget = this
      if (Widget._focusNavigationController) Widget._focusNavigationController._setFirstFocsuedWidget(this)
    }
  }

  /**
   * returns whether the widget could accept focus.
   * @returns {boolean} true represent the widget could accept focus, false represent the widget couldn't accept focus
   */
  isFocusEnabled() {
    return this._focusEnabled
  }

  /**
   * sets whether the widget could accept focus.
   * @param {Boolean} enable true represent the widget could accept focus, false represent the widget couldn't accept focus
   */
  setFocusEnabled(enable) {
    this._focusEnabled = enable
  }

  /**
   * <p>
   *     When a widget is in a layout, you could call this method to get the next focused widget within a specified direction. <br/>
   *     If the widget is not in a layout, it will return itself
   * </p>
   * @param direction the direction to look for the next focused widget in a layout
   * @param current  the current focused widget
   * @return  the next focused widget in a layout
   */
  findNextFocusedWidget(direction, current) {
    if (null === this.onNextFocusedWidget || null == this.onNextFocusedWidget(direction)) {
      const isLayout = current._layoutType
      if (this.isFocused() || isLayout) {
        const layout: any = this.getParent()
        if (null === layout || !layout._layoutType) {
          //the outer layout's default behaviour is : loop focus
          if (isLayout) return current.findNextFocusedWidget(direction, current)
          return current
        } else return layout.findNextFocusedWidget(direction, current)
      } else return current
    } else {
      const getFocusWidget = this.onNextFocusedWidget(direction)
      this.dispatchFocusEvent(this, getFocusWidget)
      return getFocusWidget
    }
  }

  /**
   * when a widget calls this method, it will get focus immediately.
   */
  requestFocus() {
    if (this === Widget._focusedWidget) return
    this.dispatchFocusEvent(Widget._focusedWidget, this)
  }

  /**
   * no matter what widget object you call this method on , it will return you the exact one focused widget
   */
  getCurrentFocusedWidget() {
    return Widget._focusedWidget
  }

  /**
   * Sends the touch event to widget's parent, its subclass will override it, e.g. ScrollView, PageView
   * @param {Number}  eventType
   * @param {Widget} sender
   * @param {Touch} touch
   */
  interceptTouchEvent(eventType, sender, touch) {
    const widgetParent = this.getWidgetParent()
    if (widgetParent) widgetParent.interceptTouchEvent(eventType, sender, touch)
  }

  /**
   * This method is called when a focus change event happens
   * @param {Widget} widgetLostFocus
   * @param {Widget} widgetGetFocus
   */
  onFocusChange(widgetLostFocus, widgetGetFocus) {
    //only change focus when there is indeed a get&lose happens
    if (widgetLostFocus) widgetLostFocus.setFocused(false)
    if (widgetGetFocus) widgetGetFocus.setFocused(true)
  }

  /**
   * Dispatch a EventFocus through a EventDispatcher
   * @param {Widget} widgetLostFocus
   * @param {Widget} widgetGetFocus
   */
  dispatchFocusEvent(widgetLostFocus, widgetGetFocus) {
    //if the widgetLoseFocus doesn't get focus, it will use the previous focused widget instead
    if (widgetLostFocus && !widgetLostFocus.isFocused()) widgetLostFocus = Widget._focusedWidget

    if (widgetGetFocus !== widgetLostFocus) {
      if (widgetGetFocus && widgetGetFocus.onFocusChanged) widgetGetFocus.onFocusChanged(widgetLostFocus, widgetGetFocus)
      if (widgetLostFocus && widgetGetFocus.onFocusChanged) widgetLostFocus.onFocusChanged(widgetLostFocus, widgetGetFocus)
      eventManager.dispatchEvent(new EventFocus(widgetLostFocus, widgetGetFocus))
    }
  }

  /**
   *  Sets whether the widget is bright. The default value is true, a widget is default to bright
   * @param {Boolean} bright true if the widget is bright, false if the widget is dark.
   */
  setBright(bright) {
    this._bright = bright
    if (this._bright) {
      this._brightStyle = Widget.BRIGHT_STYLE_NONE
      this.setBrightStyle(Widget.BRIGHT_STYLE_NORMAL)
    } else this._onPressStateChangedToDisabled()
  }

  /**
   * To set the bright style of Widget.
   * @param {Number} style BRIGHT_NORMAL the widget is normal state, BRIGHT_HIGHLIGHT the widget is height light state.
   */
  setBrightStyle(style) {
    if (this._brightStyle === style) return

    style = style || Widget.BRIGHT_STYLE_NORMAL
    this._brightStyle = style
    switch (this._brightStyle) {
      case Widget.BRIGHT_STYLE_NORMAL:
        this._onPressStateChangedToNormal()
        break
      case Widget.BRIGHT_STYLE_HIGH_LIGHT:
        this._onPressStateChangedToPressed()
        break
      default:
        break
    }
  }

  _onPressStateChangedToNormal() {}

  _onPressStateChangedToPressed() {}

  _onPressStateChangedToDisabled() {}

  _updateChildrenDisplayedRGBA() {
    this.setColor(this.getColor())
    this.setOpacity(this.getOpacity())
  }

  /**
   * A call back function when widget lost of focus.
   */
  didNotSelectSelf() {}

  /**
   * <p>
   *    The callback of touch began event.                                                               <br/>
   *    If the bounding box of Widget contains the touch point, it will do the following things:    <br/>
   *      1. sets highlight state,                                                                       <br/>
   *      2. sends event to parent widget by interceptTouchEvent                                         <br/>
   *      3. calls the callback of touch began event.                                                    <br/>
   *      4. returns true,                                                                               <br/>
   *    otherwise returns false directly.                                                                <br/>
   * </p>
   * @override
   * @param {Touch} touch
   * @param {Event} event
   * @returns {boolean}
   */
  onTouchBegan(touch, event) {
    this._hit = false
    if (this.isVisible() && this.isEnabled() && this._isAncestorsEnabled() && this._isAncestorsVisible(this)) {
      const touchPoint = touch.getLocation()
      this._touchBeganPosition.x = touchPoint.x
      this._touchBeganPosition.y = touchPoint.y
      if (this.hitTest(this._touchBeganPosition) && this.isClippingParentContainsPoint(this._touchBeganPosition)) this._hit = true
    }
    if (!this._hit) {
      return false
    }
    this.setHighlighted(true)

    /*
     * Propagate touch events to its parents
     */
    if (this._propagateTouchEvents) {
      this.propagateTouchEvent(Widget.TOUCH_BEGAN, this, touch)
    }

    this._pushDownEvent()
    return true
  }

  propagateTouchEvent(event, sender, touch) {
    const widgetParent = this.getWidgetParent()
    if (widgetParent) {
      widgetParent.interceptTouchEvent(event, sender, touch)
    }
  }

  /**
   * <p>
   *    The callback of touch moved event.                                                                                                <br/>
   *    It sets the highlight state by touch, sends event to parent widget by interceptTouchEvent and calls the callback of touch moved event.
   * </p>
   * @param {Touch} touch
   * @param {Event} event
   */
  onTouchMoved(touch, event) {
    const touchPoint = touch.getLocation()
    this._touchMovePosition.x = touchPoint.x
    this._touchMovePosition.y = touchPoint.y
    this.setHighlighted(this.hitTest(touchPoint))
    /*
     * Propagate touch events to its parents
     */
    if (this._propagateTouchEvents) this.propagateTouchEvent(Widget.TOUCH_MOVED, this, touch)
    this._moveEvent()
  }

  /**
   * <p>
   *      The callback of touch end event
   *      It sends event to parent widget by interceptTouchEvent,
   *      calls the callback of touch end event (highlight= true) or touch canceled event (highlight= false).
   *      sets the highlight state to false ,
   * </p>
   * @param touch
   * @param event
   */
  onTouchEnded(touch, event) {
    const touchPoint = touch.getLocation()
    this._touchEndPosition.x = touchPoint.x
    this._touchEndPosition.y = touchPoint.y
    /*
     * Propagate touch events to its parents
     */
    if (this._propagateTouchEvents) this.propagateTouchEvent(Widget.TOUCH_ENDED, this, touch)

    const highlight = this._highlight
    this.setHighlighted(false)
    if (highlight) this._releaseUpEvent()
    else this._cancelUpEvent()
  }

  /**
   * A call back function called when widget is selected, and on touch canceled.
   * @param {Point} touchPoint
   */
  onTouchCancelled(touchPoint, event?) {
    this.setHighlighted(false)
    this._cancelUpEvent()
  }

  /**
   * A call back function called when widget is selected, and on touch long clicked.
   * @param {Point} touchPoint
   */
  onTouchLongClicked(touchPoint) {
    this.longClickEvent()
  }

  //call back function called widget's state changed to dark.
  _pushDownEvent() {
    if (this._touchEventCallback) this._touchEventCallback(this, Widget.TOUCH_BEGAN)
    if (this._touchEventListener && this._touchEventSelector)
      this._touchEventSelector.call(this._touchEventListener, this, Widget.TOUCH_BEGAN)
  }

  _moveEvent() {
    if (this._touchEventCallback) this._touchEventCallback(this, Widget.TOUCH_MOVED)
    if (this._touchEventListener && this._touchEventSelector)
      this._touchEventSelector.call(this._touchEventListener, this, Widget.TOUCH_MOVED)
  }

  _releaseUpEvent() {
    if (this._touchEventCallback) this._touchEventCallback(this, Widget.TOUCH_ENDED)
    if (this._touchEventListener && this._touchEventSelector)
      this._touchEventSelector.call(this._touchEventListener, this, Widget.TOUCH_ENDED)
    if (this._clickEventListener) this._clickEventListener(this)
  }

  _cancelUpEvent() {
    if (this._touchEventCallback) this._touchEventCallback(this, Widget.TOUCH_CANCELED)
    if (this._touchEventListener && this._touchEventSelector)
      this._touchEventSelector.call(this._touchEventListener, this, Widget.TOUCH_CANCELED)
  }

  longClickEvent() {
    //TODO it will implement in v3.1
  }

  /**
   * Sets the touch event target/selector of the Widget
   * @param {Function} selector
   * @param {Object} target
   */
  addTouchEventListener(selector, target?) {
    if (target === undefined) this._touchEventCallback = selector
    else {
      this._touchEventSelector = selector
      this._touchEventListener = target
    }
  }

  addClickEventListener(callback) {
    this._clickEventListener = callback
  }

  /**
   * Checks a point if is in widget's space
   * @param {Point} pt
   * @returns {boolean} true if the point is in widget's space, false otherwise.
   */
  hitTest(pt) {
    const bb = Rect(0, 0, this._contentSize.width, this._contentSize.height)
    return rectContainsPoint(bb, this.convertToNodeSpace(pt))
  }

  /**
   * returns whether clipping parent widget contains point.
   * @param {Point} pt location point
   * @returns {Boolean}
   */
  isClippingParentContainsPoint(pt) {
    this._affectByClipping = false
    let parent: any = this.getParent()
    let clippingParent = null
    while (parent) {
      if (parent._layoutType) {
        if (parent.isClippingEnabled()) {
          this._affectByClipping = true
          clippingParent = parent
          break
        }
      }
      parent = parent.getParent()
    }

    if (!this._affectByClipping) return true

    if (clippingParent) {
      if (clippingParent.hitTest(pt)) return clippingParent.isClippingParentContainsPoint(pt)
      return false
    }
    return true
  }

  /**
   * Calls the checkChildInfo of widget's parent, its subclass will override it.
   * @param {number} handleState
   * @param {Widget} sender
   * @param {Point} touchPoint
   */
  checkChildInfo(handleState, sender, touchPoint) {
    const widgetParent = this.getWidgetParent()
    if (widgetParent) widgetParent.checkChildInfo(handleState, sender, touchPoint)
  }

  /**
   * Changes the position (x,y) of the widget .
   * The original point (0,0) is at the left-bottom corner of screen.
   * @override
   * @param {Point|Number} pos
   * @param {Number} [posY]
   */
  setPosition(pos, posY?) {
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      if (widgetParent) {
        const pSize = widgetParent.getContentSize()
        if (pSize.width <= 0 || pSize.height <= 0) {
          this._positionPercent.x = 0
          this._positionPercent.y = 0
        } else {
          if (posY === undefined) {
            this._positionPercent.x = pos.x / pSize.width
            this._positionPercent.y = pos.y / pSize.height
          } else {
            this._positionPercent.x = pos / pSize.width
            this._positionPercent.y = posY / pSize.height
          }
        }
      }
    }

    Node.prototype.setPosition.call(this, pos, posY)
    //this._positionType = Widget.POSITION_ABSOLUTE;
  }

  setPositionX(x) {
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      if (widgetParent) {
        const pw = widgetParent.width
        if (pw <= 0) this._positionPercent.x = 0
        else this._positionPercent.x = x / pw
      }
    }

    Node.prototype.setPositionX.call(this, x)
  }
  setPositionY(y) {
    if (this._running) {
      const widgetParent = this.getWidgetParent()
      if (widgetParent) {
        const ph = widgetParent.height
        if (ph <= 0) this._positionPercent.y = 0
        else this._positionPercent.y = y / ph
      }
    }

    Node.prototype.setPositionY.call(this, y)
  }

  /**
   * Changes the position (x,y) of the widget
   * @param {Point} percent
   */
  setPositionPercent(percent) {
    this._setXPercent(percent.x)
    this._setYPercent(percent.y)
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }
  _setXPercent(percent) {
    this._positionPercent.x = percent
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }
  _setYPercent(percent) {
    this._positionPercent.y = percent
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  /**
   * Gets the percent (x,y) of the widget
   * @returns {Point} The percent (x,y) of the widget in OpenGL coordinates
   */
  getPositionPercent() {
    return p(this._positionPercent)
  }

  _getXPercent() {
    return this._positionPercent.x
  }
  _getYPercent() {
    return this._positionPercent.y
  }

  /**
   * Changes the position type of the widget
   * @param {Number} type  the position type of widget
   */
  setPositionType(type) {
    this._positionType = type
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  /**
   * Gets the position type of the widget
   * @returns {Number} the position type of widget
   */
  getPositionType() {
    return this._positionType
  }

  /**
   * Sets whether the widget should be flipped horizontally or not.
   * @param {Boolean} flipX true if the widget should be flipped horizontally, false otherwise.
   */
  setFlippedX(flipX) {
    const realScale = this.getScaleX()
    this._flippedX = flipX
    this.setScaleX(realScale)
  }

  /**
   * <p>
   *   Returns the flag which indicates whether the widget is flipped horizontally or not.             <br/>
   *   It only flips the texture of the widget, and not the texture of the widget's children.          <br/>
   *   Also, flipping the texture doesn't alter the anchorPoint.                                       <br/>
   *   If you want to flip the anchorPoint too, and/or to flip the children too use:                   <br/>
   *   widget.setScaleX(sprite.getScaleX() * -1);
   * </p>
   * @returns {Boolean} true if the widget is flipped horizontally, false otherwise.
   */
  isFlippedX() {
    return this._flippedX
  }

  /**
   * Sets whether the widget should be flipped vertically or not.
   * @param {Boolean} flipY  true if the widget should be flipped vertically, false otherwise.
   */
  setFlippedY(flipY) {
    const realScale = this.getScaleY()
    this._flippedY = flipY
    this.setScaleY(realScale)
  }

  /**
   * <p>
   *     Return the flag which indicates whether the widget is flipped vertically or not.                <br/>
   *     It only flips the texture of the widget, and not the texture of the widget's children.          <br/>
   *     Also, flipping the texture doesn't alter the anchorPoint.                                       <br/>
   *     If you want to flip the anchorPoint too, and/or to flip the children too use:                   <br/>
   *     widget.setScaleY(widget.getScaleY() * -1);
   * </p>
   * @returns {Boolean} true if the widget is flipped vertically, false otherwise.
   */
  isFlippedY() {
    return this._flippedY
  }

  _adaptRenderers() {}

  /**
   * Determines if the widget is bright
   * @returns {boolean} true if the widget is bright, false if the widget is dark.
   */
  isBright() {
    return this._bright
  }

  /**
   * Determines if the widget is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this._enabled
  }

  /**
   * Gets the left boundary position of this widget.
   * @returns {number}
   */
  getLeftBoundary() {
    return this.getPositionX() - this._getAnchorX() * this._contentSize.width
  }

  /**
   * Gets the bottom boundary position of this widget.
   * @returns {number}
   */
  getBottomBoundary() {
    return this.getPositionY() - this._getAnchorY() * this._contentSize.height
  }

  /**
   * Gets the right boundary position of this widget.
   * @returns {number}
   */
  getRightBoundary() {
    return this.getLeftBoundary() + this._contentSize.width
  }

  /**
   * Gets the top boundary position of this widget.
   * @returns {number}
   */
  getTopBoundary() {
    return this.getBottomBoundary() + this._contentSize.height
  }

  /**
   * Gets the position of touch began event.
   * @returns {Point}
   */
  getTouchBeganPosition() {
    return p(this._touchBeganPosition)
  }

  /**
   * Gets the position of touch moved event
   * @returns {Point}
   */
  getTouchMovePosition() {
    return p(this._touchMovePosition)
  }

  /**
   * Gets the position of touch end event
   * @returns {Point}
   */
  getTouchEndPosition() {
    return p(this._touchEndPosition)
  }

  /**
   * get widget type
   * @returns {Widget.TYPE_WIDGET|Widget.TYPE_CONTAINER}
   */
  getWidgetType() {
    return this._widgetType
  }

  /**
   * Gets LayoutParameter of widget.
   * @param {LayoutParameter} parameter
   */
  setLayoutParameter(parameter) {
    if (!parameter) return
    this._layoutParameterDictionary[parameter.getLayoutType()] = parameter
    this._layoutParameterType = parameter.getLayoutType()
  }

  /**
   * Gets layout parameter
   * @param {LayoutParameter.NONE|LayoutParameter.LINEAR|LayoutParameter.RELATIVE} type
   * @returns {LayoutParameter}
   */
  getLayoutParameter(type?) {
    const t = type || this._layoutParameterType
    return this._layoutParameterDictionary[t]
  }

  /**
   * Returns the "class name" of widget.
   * @returns {string}
   */
  getDescription() {
    return 'Widget'
  }

  /**
   * Clones a new widget.
   * @returns {Widget}
   */
  clone() {
    const clonedWidget = this._createCloneInstance()
    clonedWidget._copyProperties(this)
    clonedWidget._copyClonedWidgetChildren(this)
    return clonedWidget
  }

  _createCloneInstance() {
    return new Widget()
  }

  _copyClonedWidgetChildren(model) {
    const widgetChildren = model.getChildren()
    for (let i = 0; i < widgetChildren.length; i++) {
      const locChild = widgetChildren[i]
      if (locChild instanceof Widget) this.addChild(locChild.clone())
    }
  }

  _copySpecialProperties(model) {}

  _copyProperties(widget) {
    this.setEnabled(widget.isEnabled())
    this.setVisible(widget.isVisible())
    this.setBright(widget.isBright())
    this.setTouchEnabled(widget.isTouchEnabled())
    this.setLocalZOrder(widget.getLocalZOrder())
    this.setTag(widget.getTag())
    this.setName(widget.getName())
    this.setActionTag(widget.getActionTag())

    this._ignoreSize = widget._ignoreSize

    this.setContentSize(widget._contentSize)
    this._customSize.width = widget._customSize.width
    this._customSize.height = widget._customSize.height

    this._copySpecialProperties(widget)
    this._sizeType = widget.getSizeType()
    this._sizePercent.x = widget._sizePercent.x
    this._sizePercent.y = widget._sizePercent.y

    this._positionType = widget._positionType
    this._positionPercent.x = widget._positionPercent.x
    this._positionPercent.y = widget._positionPercent.y

    this.setPosition(widget.getPosition())
    this.setAnchorPoint(widget.getAnchorPoint())
    this.setScaleX(widget.getScaleX())
    this.setScaleY(widget.getScaleY())
    this.setRotation(widget.getRotation())
    this.setRotationX(widget.getRotationX())
    this.setRotationY(widget.getRotationY())
    this.setFlippedX(widget.isFlippedX())
    this.setFlippedY(widget.isFlippedY())
    this.setColor(widget.getColor())
    this.setOpacity(widget.getOpacity())

    this._touchEventCallback = widget._touchEventCallback
    this._touchEventListener = widget._touchEventListener
    this._touchEventSelector = widget._touchEventSelector
    this._clickEventListener = widget._clickEventListener
    this._focused = widget._focused
    this._focusEnabled = widget._focusEnabled
    this._propagateTouchEvents = widget._propagateTouchEvents

    for (const key in widget._layoutParameterDictionary) {
      const parameter = widget._layoutParameterDictionary[key]
      if (parameter) this.setLayoutParameter(parameter.clone())
    }
  }

  /*temp action*/
  setActionTag(tag) {
    this._actionTag = tag
  }

  getActionTag() {
    return this._actionTag
  }

  /**
   * Gets the left boundary position of this widget.
   * @deprecated since v3.0, please use getLeftBoundary instead.
   * @returns {number}
   */
  getLeftInParent() {
    log('getLeftInParent is deprecated. Please use getLeftBoundary instead.')
    return this.getLeftBoundary()
  }

  /**
   * Gets the bottom boundary position of this widget.
   * @deprecated since v3.0, please use getBottomBoundary instead.
   * @returns {number}
   */
  getBottomInParent() {
    log('getBottomInParent is deprecated. Please use getBottomBoundary instead.')
    return this.getBottomBoundary()
  }

  /**
   * Gets the right boundary position of this widget.
   * @deprecated since v3.0, please use getRightBoundary instead.
   * @returns {number}
   */
  getRightInParent() {
    log('getRightInParent is deprecated. Please use getRightBoundary instead.')
    return this.getRightBoundary()
  }

  /**
   * Gets the top boundary position of this widget.
   * @deprecated since v3.0, please use getTopBoundary instead.
   * @returns {number}
   */
  getTopInParent() {
    log('getTopInParent is deprecated. Please use getTopBoundary instead.')
    return this.getTopBoundary()
  }

  /**
   * Gets the touch end point of widget when widget is selected.
   * @deprecated since v3.0, please use getTouchEndPosition instead.
   * @returns {Point} the touch end point.
   */
  getTouchEndPos() {
    log('getTouchEndPos is deprecated. Please use getTouchEndPosition instead.')
    return this.getTouchEndPosition()
  }

  /**
   *Gets the touch move point of widget when widget is selected.
   * @deprecated since v3.0, please use getTouchMovePosition instead.
   * @returns {Point} the touch move point.
   */
  getTouchMovePos() {
    log('getTouchMovePos is deprecated. Please use getTouchMovePosition instead.')
    return this.getTouchMovePosition()
  }

  /**
   * Checks a point if in parent's area.
   * @deprecated since v3.0, please use isClippingParentContainsPoint instead.
   * @param {Point} pt
   * @returns {Boolean}
   */
  clippingParentAreaContainPoint(pt) {
    log('clippingParentAreaContainPoint is deprecated. Please use isClippingParentContainsPoint instead.')
    this.isClippingParentContainsPoint(pt)
  }

  /**
   * Gets the touch began point of widget when widget is selected.
   * @deprecated since v3.0, please use getTouchBeganPosition instead.
   * @returns {Point} the touch began point.
   */
  getTouchStartPos() {
    log('getTouchStartPos is deprecated. Please use getTouchBeganPosition instead.')
    return this.getTouchBeganPosition()
  }

  /**
   * Changes the size that is widget's size
   * @deprecated since v3.0, please use setContentSize instead.
   * @param {Size} size  that is widget's size
   */
  setSize(size) {
    this.setContentSize(size)
  }

  /**
   * Returns size of widget
   * @deprecated since v3.0, please use getContentSize instead.
   * @returns {Size}
   */
  getSize() {
    return this.getContentSize()
  }

  /**
   * Adds a node for widget (this function is deleted in -x)
   * @param {Node} node
   * @param {Number} zOrder
   * @param {Number} tag
   * @deprecated since v3.0, please use addChild instead.
   */
  addNode(node, zOrder, tag) {
    if (node instanceof Widget) {
      log('Please use addChild to add a Widget.')
      return
    }
    Node.prototype.addChild.call(this, node, zOrder, tag)
    this._nodes.push(node)
  }

  /**
   * Gets node by tag
   * @deprecated since v3.0, please use getChildByTag instead.
   * @param {Number} tag
   * @returns {Node}
   */
  getNodeByTag(tag) {
    const _nodes = this._nodes
    for (let i = 0; i < _nodes.length; i++) {
      const node = _nodes[i]
      if (node && node.getTag() === tag) {
        return node
      }
    }
    return null
  }

  /**
   * Returns all children.
   * @deprecated since v3.0, please use getChildren instead.
   * @returns {Array}
   */
  getNodes() {
    return this._nodes
  }

  /**
   * Removes a node from Widget
   * @deprecated since v3.0, please use removeChild instead.
   * @param {Node} node
   * @param {Boolean} cleanup
   */
  removeNode(node, cleanup) {
    Node.prototype.removeChild.call(this, node, cleanup)
    arrayRemoveObject(this._nodes, node)
  }

  _getNormalGLProgram() {
    return shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR)
  }

  _getGrayGLProgram() {
    return shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY)
  }

  /**
   * Removes node by tag
   * @deprecated since v3.0, please use removeChildByTag instead.
   * @param {Number} tag
   * @param {Boolean} [cleanup]
   */
  removeNodeByTag(tag, cleanup) {
    const node = this.getChildByTag(tag)
    if (!node) log('cocos2d: removeNodeByTag(tag = %d): child not found!', tag)
    else this.removeChild(node, cleanup)
  }

  /**
   * Removes all node
   * @deprecated since v3.0, please use removeAllChildren instead.
   */
  removeAllNodes() {
    for (let i = 0; i < this._nodes.length; i++) {
      const node = this._nodes[i]
      Node.prototype.removeChild.call(this, node)
    }
    this._nodes.length = 0
  }

  _findLayout() {
    renderer.childrenOrderDirty = true
    let layout: any = this._parent
    while (layout) {
      if (layout._doLayout) {
        layout._doLayoutDirty = true
        break
      } else layout = layout._parent
    }
  }

  /**
   * @since v3.2
   * @returns {boolean} true represent the widget use Unify Size, false represent the widget couldn't use Unify Size
   */
  isUnifySizeEnabled() {
    return this._unifySize
  }

  /**
   * @since v3.2
   * @param {Boolean} enable enable Unify Size of a widget
   */
  setUnifySizeEnabled(enable) {
    this._unifySize = enable
  }

  //override the scale functions.
  setScaleX(scaleX) {
    if (this._flippedX) scaleX = scaleX * -1
    Node.prototype.setScaleX.call(this, scaleX)
  }
  setScaleY(scaleY) {
    if (this._flippedY) scaleY = scaleY * -1
    Node.prototype.setScaleY.call(this, scaleY)
  }
  setScale(scaleX, scaleY) {
    if (scaleY === undefined) scaleY = scaleX
    this.setScaleX(scaleX)
    this.setScaleY(scaleY)
  }

  getScaleX() {
    let originalScale = Node.prototype.getScaleX.call(this)
    if (this._flippedX) originalScale = originalScale * -1.0
    return originalScale
  }
  getScaleY() {
    let originalScale = Node.prototype.getScaleY.call(this)
    if (this._flippedY) originalScale = originalScale * -1.0
    return originalScale
  }
  getScale() {
    if (this.getScaleX() !== this.getScaleY()) log('Widget#scale. ScaleX != ScaleY. Dont know which one to return')
    return this.getScaleX()
  }

  /**
   * Sets callback name to widget.
   * @since v3.3
   * @param {String} callbackName
   */
  setCallbackName(callbackName) {
    this._callbackName = callbackName
  }

  /**
   * Gets callback name of widget
   * @since v3.3
   * @returns {String|Null}
   */
  getCallbackName() {
    return this._callbackName
  }

  /**
   * Sets callback type to widget
   * @since v3.3
   * @param {String} callbackType
   */
  setCallbackType(callbackType) {
    this._callbackType = callbackType
  }

  /**
   * Gets callback type of widget
   * @since v3.3
   * @returns {String|null}
   */
  getCallbackType() {
    return this._callbackType
  }

  _createRenderCmd() {
    return new WidgetWebGLRenderCmd(this)
  }

  // Static properties
  static _focusedWidget = null //both layout & widget will be stored in this variable
  static _focusNavigationController = null

  /**
   * call this method with parameter true to enable the Android Dpad focus navigation feature
   * @note it doesn't implemented on Web
   * @param {Boolean} enable set true to enable dpad focus navigation, otherwise disable dpad focus navigation
   */
  static enableDpadNavigation(enable) {
    if (enable) {
      if (null == Widget._focusNavigationController) {
        Widget._focusNavigationController = new FocusNavigationController()
        if (Widget._focusedWidget) {
          Widget._focusNavigationController._setFirstFocsuedWidget(Widget._focusedWidget)
        }
      }
      Widget._focusNavigationController.enableFocusNavigation(true)
    } else {
      if (Widget._focusNavigationController) {
        Widget._focusNavigationController.enableFocusNavigation(false)
        Widget._focusNavigationController = null
      }
    }
  }

  /**
   * Gets the focused widget of current stage.
   * @function
   * @returns {null|Widget}
   */
  static getCurrentFocusedWidget() {
    return Widget._focusedWidget
  }

  // Constants
  //bright style
  /**
   * None bright style of Widget.
   * @constant
   * @type {number}
   */
  static BRIGHT_STYLE_NONE = -1
  /**
   * Normal bright style of Widget.
   * @constant
   * @type {number}
   */
  static BRIGHT_STYLE_NORMAL = 0
  /**
   * Light bright style of Widget.
   * @constant
   * @type {number}
   */
  static BRIGHT_STYLE_HIGH_LIGHT = 1

  //widget type
  /**
   * The type code of Widget for ccui controls.
   * @constant
   * @type {number}
   */
  static TYPE_WIDGET = 0
  /**
   * The type code of Container for ccui controls.
   * @constant
   * @type {number}
   */
  static TYPE_CONTAINER = 1

  //Focus Direction
  /**
   * The left of Focus direction for Widget
   * @constant
   * @type {number}
   */
  static LEFT = 0
  /**
   * The right of Focus direction for Widget
   * @constant
   * @type {number}
   */
  static RIGHT = 1
  /**
   * The up of Focus direction for Widget
   * @constant
   * @type {number}
   */
  static UP = 2
  /**
   * The down of Focus direction for Widget
   * @constant
   * @type {number}
   */
  static DOWN = 3

  //texture resource type
  /**
   * The image file texture type of Widget loads.
   * @constant
   * @type {number}
   */
  static LOCAL_TEXTURE = 0
  /**
   * The sprite frame texture type of Widget loads.
   * @constant
   * @type {number}
   */
  static PLIST_TEXTURE = 1

  //touch event type
  /**
   * The touch began type of Widget's touch event
   * @constant
   * @type {number}
   */
  static TOUCH_BEGAN = 0
  /**
   * The touch moved type of Widget's touch event
   * @constant
   * @type {number}
   */
  static TOUCH_MOVED = 1
  /**
   * The touch end type of Widget's touch event
   * @constant
   * @type {number}
   */
  static TOUCH_ENDED = 2
  /**
   * The touch canceled type of Widget's touch event
   * @constant
   * @type {number}
   */
  static TOUCH_CANCELED = 3

  //size type
  /**
   * The absolute of Widget's size type.
   * @constant
   * @type {number}
   */
  static SIZE_ABSOLUTE = 0
  /**
   * The percent of Widget's size type.
   * @constant
   * @type {number}
   */
  static SIZE_PERCENT = 1

  //position type
  /**
   * The absolute of Widget's position type.
   * @constant
   * @type {number}
   */
  static POSITION_ABSOLUTE = 0
  /**
   * The percent of Widget's position type.
   * @constant
   * @type {number}
   */
  static POSITION_PERCENT = 1
}
