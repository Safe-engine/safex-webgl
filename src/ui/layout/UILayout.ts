import { pLength, pSub, Sprite } from '../../core'
import { Node } from '../../core/base-nodes/Node'
import { p, Rect, Size } from '../../core/cocoa/Geometry'
import { Color, color, FLT_MAX } from '../../core/platform'
import { assert, log } from '../../helper/Debugger'
import { DrawNode } from '../../shape-nodes/DrawNode'
import { Scale9Sprite } from '../base/UIScale9Sprite'
import { Widget } from '../base/UIWidget'
import { LayoutParameter, LinearLayoutParameter, RelativeLayoutParameter } from './UILayoutParameter'
import { LayoutWebGLRenderCmd } from './UILayoutWebGLRenderCmd'

export class Layout extends Widget {
  _clippingEnabled = false
  _backGroundScale9Enabled = null
  _backGroundImage = null
  _backGroundImageFileName = null
  _backGroundImageCapInsets = null
  _colorType = null
  _bgImageTexType = Widget.LOCAL_TEXTURE
  _colorRender = null
  _gradientRender = null
  _color = null
  _startColor = null
  _endColor = null
  _alongVector = null
  _opacity = 255
  _backGroundImageTextureSize = null
  _layoutType = null
  _doLayoutDirty = true
  _clippingRectDirty = true
  _clippingType = null
  _clippingStencil = null
  _scissorRectDirty = false
  _clippingRect = null
  _clippingParent = null
  _className = 'Layout'
  _backGroundImageColor = null
  _finalPositionX = 0
  _finalPositionY = 0

  _backGroundImageOpacity = 0

  _loopFocus = false //whether enable loop focus or not
  __passFocusToChild = true //on default, it will pass the focus to the next nearest widget
  _isFocusPassing = false //when finding the next focused widget, use this variable to pass focus between layout & widget
  _isInterceptTouch = false

  /**
   * To specify a user-defined functor to decide which child widget of the layout should get focused
   * @function
   * @param {Number} direction
   * @param {Widget} current
   */
  onPassFocusToChild = null
  declare _renderCmd: LayoutWebGLRenderCmd

  /**
   * Allocates and initializes an UILayout.
   * Constructor of Layout
   * @function
   * @example
   * // example
   * var uiLayout = new Layout();
   */
  constructor() {
    super()
    this._layoutType = Layout.ABSOLUTE
    this._widgetType = Widget.TYPE_CONTAINER
    this._clippingType = Layout.CLIPPING_SCISSOR
    this._colorType = Layout.BG_COLOR_NONE

    this.ignoreContentAdaptWithSize(false)
    this.setContentSize(Size(0, 0))
    this.setAnchorPoint(0, 0)
    this.onPassFocusToChild = this._findNearestChildWidgetIndex.bind(this)

    this._backGroundImageCapInsets = Rect(0, 0, 0, 0)

    this._color = color(255, 255, 255, 255)
    this._startColor = color(255, 255, 255, 255)
    this._endColor = color(255, 255, 255, 255)
    this._alongVector = p(0, -1)
    this._backGroundImageTextureSize = Size(0, 0)

    this._clippingRect = Rect(0, 0, 0, 0)
    this._backGroundImageColor = color(255, 255, 255, 255)
  }

  /**
   * Calls its parent's onEnter, and calls its clippingStencil's onEnter if clippingStencil isn't null.
   * @override
   */
  onEnter() {
    super.onEnter()
    if (this._clippingStencil) this._clippingStencil._performRecursive(Node._stateCallbackType.onEnter)
    this._doLayoutDirty = true
    this._clippingRectDirty = true
  }

  /**
   *  Calls its parent's onExit, and calls its clippingStencil's onExit if clippingStencil isn't null.
   *  @override
   */
  onExit() {
    super.onExit()
    if (this._clippingStencil) this._clippingStencil._performRecursive(Node._stateCallbackType.onExit)
  }

  /**
   * <p>
   *     Calls adaptRenderers (its subclass will override it.) and do layout.
   *     If clippingEnabled is true, it will clip/scissor area.
   * </p>
   * @override
   * @param {Node} [parent]
   */
  visit(parent) {
    const cmd = this._renderCmd,
      parentCmd = parent ? parent._renderCmd : null

    // quick return if not visible
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd)
      return
    }

    this._adaptRenderers()
    this._doLayout()

    cmd.visit(parentCmd)

    const stencilClipping = this._clippingEnabled && this._clippingType === Layout.CLIPPING_STENCIL
    const scissorClipping = this._clippingEnabled && this._clippingType === Layout.CLIPPING_SCISSOR

    if (stencilClipping) {
      cmd.stencilClippingVisit(parentCmd)
    } else if (scissorClipping) {
      cmd.scissorClippingVisit(parentCmd)
    }

    let i
    const children = this._children
    const len = children.length
    let child
    let j
    const pChildren = this._protectedChildren
    const pLen = pChildren.length
    let pChild

    if (this._reorderChildDirty) this.sortAllChildren()
    if (this._reorderProtectedChildDirty) this.sortAllProtectedChildren()
    // draw children zOrder < 0
    for (i = 0; i < len; i++) {
      child = children[i]
      if (child._localZOrder < 0) {
        child.visit(this)
      } else break
    }
    for (j = 0; j < pLen; j++) {
      pChild = pChildren[j]
      if (pChild._localZOrder < 0) {
        cmd._changeProtectedChild(pChild)
        pChild.visit(this)
      } else break
    }
    // draw children zOrder >= 0
    for (; i < len; i++) {
      children[i].visit(this)
    }
    for (; j < pLen; j++) {
      pChild = pChildren[j]
      cmd._changeProtectedChild(pChild)
      pChild.visit(this)
    }

    if (stencilClipping) {
      cmd.postStencilVisit()
    } else if (scissorClipping) {
      cmd.postScissorVisit()
    }

    cmd._dirtyFlag = 0
  }

  /**
   * If a layout is loop focused which means that the focus movement will be inside the layout
   * @param {Boolean} loop pass true to let the focus movement loop inside the layout
   */
  setLoopFocus(loop) {
    this._loopFocus = loop
  }

  /**
   * Gets whether enable focus loop
   * @returns {boolean}  If focus loop is enabled, then it will return true, otherwise it returns false. The default value is false.
   */
  isLoopFocus() {
    return this._loopFocus
  }

  /**
   * Specifies whether the layout pass its focus to its child
   * @param pass To specify whether the layout pass its focus to its child
   */
  setPassFocusToChild(pass) {
    this.__passFocusToChild = pass
  }

  /**
   * Returns whether the layout will pass the focus to its children or not. The default value is true
   * @returns {boolean} To query whether the layout will pass the focus to its children or not. The default value is true
   */
  isPassFocusToChild() {
    return this.__passFocusToChild
  }

  /**
   * When a widget is in a layout, you could call this method to get the next focused widget within a specified direction.
   * If the widget is not in a layout, it will return itself
   * @param {Number} direction the direction to look for the next focused widget in a layout
   * @param {Widget} current the current focused widget
   * @returns {Widget} return the index of widget in the layout
   */
  findNextFocusedWidget(direction, current) {
    if (this._isFocusPassing || this.isFocused()) {
      const parent: any = this.getParent()
      this._isFocusPassing = false
      if (this.__passFocusToChild) {
        const w = this._passFocusToChild(direction, current)
        if (w instanceof Layout && parent) {
          parent._isFocusPassing = true
          return parent.findNextFocusedWidget(direction, this)
        }
        return w
      }

      if (null == parent || !(parent instanceof Layout)) return this
      parent._isFocusPassing = true
      return parent.findNextFocusedWidget(direction, this)
    } else if (current.isFocused() || current instanceof Layout) {
      if (this._layoutType === Layout.LINEAR_HORIZONTAL) {
        switch (direction) {
          case Widget.LEFT:
            return this._getPreviousFocusedWidget(direction, current)
            break
          case Widget.RIGHT:
            return this._getNextFocusedWidget(direction, current)
            break
          case Widget.DOWN:
          case Widget.UP:
            if (this._isLastWidgetInContainer(this, direction)) {
              if (this._isWidgetAncestorSupportLoopFocus(current, direction))
                return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
              return current
            } else {
              return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
            }
            break
          default:
            assert(0, 'Invalid Focus Direction')
            return current
        }
      } else if (this._layoutType === Layout.LINEAR_VERTICAL) {
        switch (direction) {
          case Widget.LEFT:
          case Widget.RIGHT:
            if (this._isLastWidgetInContainer(this, direction)) {
              if (this._isWidgetAncestorSupportLoopFocus(current, direction))
                return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
              return current
            } else return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
          case Widget.DOWN:
            return this._getNextFocusedWidget(direction, current)
          case Widget.UP:
            return this._getPreviousFocusedWidget(direction, current)
          default:
            assert(0, 'Invalid Focus Direction')
            return current
        }
      } else {
        assert(0, 'Un Supported Layout type, please use VBox and HBox instead!!!')
        return current
      }
    } else return current
  }

  /**
   * Adds a widget to the container.
   * @param {Widget} widget
   * @param {Number} [zOrder]
   * @param {Number|string} [tag] tag or name
   * @override
   */
  addChild(widget, zOrder, tag) {
    if (widget instanceof Widget) {
      this._supplyTheLayoutParameterLackToChild(widget)
    }
    Widget.prototype.addChild.call(this, widget, zOrder, tag)
    this._doLayoutDirty = true
  }

  /**
   * Removes child widget from Layout, and sets the layout dirty flag to true.
   * @param {Widget} widget
   * @param {Boolean} [cleanup=true]
   * @override
   */
  removeChild(widget, cleanup) {
    Widget.prototype.removeChild.call(this, widget, cleanup)
    this._doLayoutDirty = true
  }

  /**
   * Removes all children from the container with a cleanup, and sets the layout dirty flag to true.
   * @param {Boolean} cleanup
   */
  removeAllChildren(cleanup) {
    Widget.prototype.removeAllChildren.call(this, cleanup)
    this._doLayoutDirty = true
  }

  /**
   * Removes all children from the container, do a cleanup to all running actions depending on the cleanup parameter,
   * and sets the layout dirty flag to true.
   * @param {Boolean} cleanup true if all running actions on all children nodes should be cleanup, false otherwise.
   */
  removeAllChildrenWithCleanup(cleanup) {
    Widget.prototype.removeAllChildrenWithCleanup.call(this, cleanup)
    this._doLayoutDirty = true
  }

  /**
   * Gets if layout is clipping enabled.
   * @returns {Boolean} if layout is clipping enabled.
   */
  isClippingEnabled() {
    return this._clippingEnabled
  }

  /**
   * Changes if layout can clip it's content and locChild.
   * If you really need this, please enable it. But it would reduce the rendering efficiency.
   * @param {Boolean} able clipping enabled.
   */
  setClippingEnabled(able) {
    if (able === this._clippingEnabled) return
    this._clippingEnabled = able
    switch (this._clippingType) {
      case Layout.CLIPPING_SCISSOR:
      case Layout.CLIPPING_STENCIL:
        if (able) {
          this._clippingStencil = new DrawNode()
          this._renderCmd.rebindStencilRendering(this._clippingStencil)
          if (this._running) this._clippingStencil._performRecursive(Node._stateCallbackType.onEnter)
          this._setStencilClippingSize(this._contentSize)
        } else {
          if (this._running && this._clippingStencil) this._clippingStencil._performRecursive(Node._stateCallbackType.onExit)
          this._clippingStencil = null
        }
        break
      default:
        break
    }
  }

  /**
   * Sets clipping type to Layout
   * @param {Layout.CLIPPING_STENCIL|Layout.CLIPPING_SCISSOR} type
   */
  setClippingType(type) {
    if (type === this._clippingType) return
    const clippingEnabled = this.isClippingEnabled()
    this.setClippingEnabled(false)
    this._clippingType = type
    this.setClippingEnabled(clippingEnabled)
  }

  /**
   * Gets clipping type of Layout
   * @returns {Layout.CLIPPING_STENCIL|Layout.CLIPPING_SCISSOR}
   */
  getClippingType() {
    return this._clippingType
  }

  _setStencilClippingSize(size) {
    if (this._clippingEnabled) {
      const rect = []
      rect[0] = p(0, 0)
      rect[1] = p(size.width, 0)
      rect[2] = p(size.width, size.height)
      rect[3] = p(0, size.height)
      const green = Color.GREEN
      this._clippingStencil.clear()
      this._clippingStencil.setLocalBB && this._clippingStencil.setLocalBB(0, 0, size.width, size.height)
      this._clippingStencil.drawPoly(rect, 4, green, 0, green)
    }
  }

  _getClippingRect() {
    if (this._clippingRectDirty) {
      const worldPos = this.convertToWorldSpace(p(0, 0))
      const t = this.getNodeToWorldTransform()
      const scissorWidth = this._contentSize.width * t.a
      const scissorHeight = this._contentSize.height * t.d
      let parentClippingRect
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let parent: Node = this

      while (parent) {
        parent = parent.getParent()
        if (parent && parent instanceof Layout && parent.isClippingEnabled()) {
          this._clippingParent = parent
          break
        }
      }

      if (this._clippingParent) {
        parentClippingRect = this._clippingParent._getClippingRect()

        this._clippingRect.x = Math.max(worldPos.x, parentClippingRect.x)
        this._clippingRect.y = Math.max(worldPos.y, parentClippingRect.y)

        const right = Math.min(worldPos.x + scissorWidth, parentClippingRect.x + parentClippingRect.width)
        const top = Math.min(worldPos.y + scissorHeight, parentClippingRect.y + parentClippingRect.height)

        this._clippingRect.width = Math.max(0.0, right - this._clippingRect.x)
        this._clippingRect.height = Math.max(0.0, top - this._clippingRect.y)
      } else {
        this._clippingRect.x = worldPos.x
        this._clippingRect.y = worldPos.y
        this._clippingRect.width = scissorWidth
        this._clippingRect.height = scissorHeight
      }
      this._clippingRectDirty = false
    }
    return this._clippingRect
  }

  _onSizeChanged() {
    Widget.prototype._onSizeChanged.call(this)
    const locContentSize = this._contentSize
    this._setStencilClippingSize(locContentSize)
    this._doLayoutDirty = true
    this._clippingRectDirty = true
    if (this._backGroundImage) {
      this._backGroundImage.setPosition(locContentSize.width * 0.5, locContentSize.height * 0.5)
      if (this._backGroundScale9Enabled && this._backGroundImage instanceof Scale9Sprite)
        this._backGroundImage.setPreferredSize(locContentSize)
    }
    if (this._colorRender) this._colorRender.setContentSize(locContentSize)
    if (this._gradientRender) this._gradientRender.setContentSize(locContentSize)
  }

  /**
   * Sets background image use scale9 renderer.
   * @param {Boolean} able  true that use scale9 renderer, false otherwise.
   */
  setBackGroundImageScale9Enabled(able) {
    if (this._backGroundScale9Enabled === able) return
    this.removeProtectedChild(this._backGroundImage)
    this._backGroundImage = null
    this._backGroundScale9Enabled = able
    this._addBackGroundImage()
    this.setBackGroundImage(this._backGroundImageFileName, this._bgImageTexType)
    this.setBackGroundImageCapInsets(this._backGroundImageCapInsets)
  }

  /**
   * Get whether background image is use scale9 renderer.
   * @returns {Boolean}
   */
  isBackGroundImageScale9Enabled() {
    return this._backGroundScale9Enabled
  }

  /**
   * Sets a background image for layout
   * @param {String} fileName
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  setBackGroundImage(fileName, texType) {
    if (!fileName) return
    texType = texType || Widget.LOCAL_TEXTURE
    if (this._backGroundImage === null) {
      this._addBackGroundImage()
      this.setBackGroundImageScale9Enabled(this._backGroundScale9Enabled)
    }
    this._backGroundImageFileName = fileName
    this._bgImageTexType = texType
    const locBackgroundImage = this._backGroundImage
    switch (this._bgImageTexType) {
      case Widget.LOCAL_TEXTURE:
        locBackgroundImage.initWithFile(fileName)
        break
      case Widget.PLIST_TEXTURE:
        locBackgroundImage.initWithSpriteFrameName(fileName)
        break
      default:
        break
    }
    if (this._backGroundScale9Enabled) locBackgroundImage.setPreferredSize(this._contentSize)

    this._backGroundImageTextureSize = locBackgroundImage.getContentSize()
    locBackgroundImage.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5)
    this._updateBackGroundImageColor()
  }

  /**
   * Sets a background image CapInsets for layout, if the background image is a scale9 render.
   * @param {Rect} capInsets capinsets of background image.
   */
  setBackGroundImageCapInsets(capInsets) {
    if (!capInsets) return
    const locInsets = this._backGroundImageCapInsets
    locInsets.x = capInsets.x
    locInsets.y = capInsets.y
    locInsets.width = capInsets.width
    locInsets.height = capInsets.height
    if (this._backGroundScale9Enabled) this._backGroundImage.setCapInsets(capInsets)
  }

  /**
   * Gets background image capinsets of Layout.
   * @returns {Rect}
   */
  getBackGroundImageCapInsets() {
    return Rect(this._backGroundImageCapInsets)
  }

  _supplyTheLayoutParameterLackToChild(locChild) {
    if (!locChild) {
      return
    }
    switch (this._layoutType) {
      case Layout.ABSOLUTE:
        break
      case Layout.LINEAR_HORIZONTAL:
      case Layout.LINEAR_VERTICAL: {
        const layoutParameter = locChild.getLayoutParameter(LayoutParameter.LINEAR)
        if (!layoutParameter) locChild.setLayoutParameter(new LinearLayoutParameter())
        break
      }
      case Layout.RELATIVE: {
        const layoutParameter = locChild.getLayoutParameter(LayoutParameter.RELATIVE)
        if (!layoutParameter) locChild.setLayoutParameter(new RelativeLayoutParameter())
        break
      }
      default:
        break
    }
  }

  _addBackGroundImage() {
    const contentSize = this._contentSize
    if (this._backGroundScale9Enabled) {
      this._backGroundImage = new Scale9Sprite()
      this._backGroundImage.setPreferredSize(contentSize)
    } else this._backGroundImage = new Sprite()
    this.addProtectedChild(this._backGroundImage, Layout.BACKGROUND_IMAGE_ZORDER, -1)
    this._backGroundImage.setPosition(contentSize.width * 0.5, contentSize.height * 0.5)
  }

  /**
   * Remove the background image of Layout.
   */
  removeBackGroundImage() {
    if (!this._backGroundImage) return
    this.removeProtectedChild(this._backGroundImage)
    this._backGroundImage = null
    this._backGroundImageFileName = ''
    this._backGroundImageTextureSize.width = 0
    this._backGroundImageTextureSize.height = 0
  }

  /**
   * Sets Color Type for Layout.
   * @param {Layout.BG_COLOR_NONE|Layout.BG_COLOR_SOLID|Layout.BG_COLOR_GRADIENT} type
   */
  setBackGroundColorType(type) {
    if (this._colorType === type) return
    switch (this._colorType) {
      case Layout.BG_COLOR_NONE:
        if (this._colorRender) {
          this.removeProtectedChild(this._colorRender)
          this._colorRender = null
        }
        if (this._gradientRender) {
          this.removeProtectedChild(this._gradientRender)
          this._gradientRender = null
        }
        break
      case Layout.BG_COLOR_SOLID:
        if (this._colorRender) {
          this.removeProtectedChild(this._colorRender)
          this._colorRender = null
        }
        break
      case Layout.BG_COLOR_GRADIENT:
        if (this._gradientRender) {
          this.removeProtectedChild(this._gradientRender)
          this._gradientRender = null
        }
        break
      default:
        break
    }
    this._colorType = type
    switch (this._colorType) {
      case Layout.BG_COLOR_NONE:
        break
      // case Layout.BG_COLOR_SOLID:
      //   this._colorRender = new LayerColor()
      //   this._colorRender.setContentSize(this._contentSize)
      //   this._colorRender.setOpacity(this._opacity)
      //   this._colorRender.setColor(this._color)
      //   this.addProtectedChild(this._colorRender, Layout.BACKGROUND_RENDERER_ZORDER, -1)
      //   break
      // case Layout.BG_COLOR_GRADIENT:
      //   this._gradientRender = new LayerGradient(color(255, 0, 0, 255), color(0, 255, 0, 255))
      //   this._gradientRender.setContentSize(this._contentSize)
      //   this._gradientRender.setOpacity(this._opacity)
      //   this._gradientRender.setStartColor(this._startColor)
      //   this._gradientRender.setEndColor(this._endColor)
      //   this._gradientRender.setVector(this._alongVector)
      //   this.addProtectedChild(this._gradientRender, Layout.BACKGROUND_RENDERER_ZORDER, -1)
      //   break
      default:
        break
    }
  }

  /**
   * Get background color type of Layout.
   * @returns {Layout.BG_COLOR_NONE|Layout.BG_COLOR_SOLID|Layout.BG_COLOR_GRADIENT}
   */
  getBackGroundColorType() {
    return this._colorType
  }

  /**
   * Sets background color for layout, if color type is Layout.COLOR_SOLID
   * @param {Color} color
   * @param {Color} [endColor]
   */
  setBackGroundColor(color, endColor?) {
    if (!endColor) {
      this._color.r = color.r
      this._color.g = color.g
      this._color.b = color.b
      if (this._colorRender) this._colorRender.setColor(color)
    } else {
      this._startColor.r = color.r
      this._startColor.g = color.g
      this._startColor.b = color.b
      if (this._gradientRender) this._gradientRender.setStartColor(color)

      this._endColor.r = endColor.r
      this._endColor.g = endColor.g
      this._endColor.b = endColor.b
      if (this._gradientRender) this._gradientRender.setEndColor(endColor)
    }
  }

  /**
   * Gets background color of Layout, if color type is Layout.COLOR_SOLID.
   * @returns {Color}
   */
  getBackGroundColor() {
    const tmpColor = this._color
    return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a)
  }

  /**
   * Gets background start color of Layout
   * @returns {Color}
   */
  getBackGroundStartColor() {
    const tmpColor = this._startColor
    return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a)
  }

  /**
   * Gets background end color of Layout
   * @returns {Color}
   */
  getBackGroundEndColor() {
    const tmpColor = this._endColor
    return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a)
  }

  /**
   * Sets background opacity to Layout.
   * @param {number} opacity
   */
  setBackGroundColorOpacity(opacity) {
    this._opacity = opacity
    switch (this._colorType) {
      case Layout.BG_COLOR_NONE:
        break
      case Layout.BG_COLOR_SOLID:
        this._colorRender.setOpacity(opacity)
        break
      case Layout.BG_COLOR_GRADIENT:
        this._gradientRender.setOpacity(opacity)
        break
      default:
        break
    }
  }

  /**
   * Get background opacity value of Layout.
   * @returns {Number}
   */
  getBackGroundColorOpacity() {
    return this._opacity
  }

  /**
   * Sets background color vector for layout, if color type is Layout.COLOR_GRADIENT
   * @param {Point} vector
   */
  setBackGroundColorVector(vector) {
    this._alongVector.x = vector.x
    this._alongVector.y = vector.y
    if (this._gradientRender) {
      this._gradientRender.setVector(vector)
    }
  }

  /**
   *  Gets background color vector of Layout, if color type is Layout.COLOR_GRADIENT
   * @returns {Point}
   */
  getBackGroundColorVector() {
    return this._alongVector
  }

  /**
   * Sets backGround image color
   * @param {Color} color
   */
  setBackGroundImageColor(color) {
    this._backGroundImageColor.r = color.r
    this._backGroundImageColor.g = color.g
    this._backGroundImageColor.b = color.b

    this._updateBackGroundImageColor()
  }

  /**
   * Sets backGround image Opacity
   * @param {Number} opacity
   */
  setBackGroundImageOpacity(opacity) {
    this._backGroundImageColor.a = opacity
    this.getBackGroundImageColor()
  }

  /**
   * Gets backGround image color
   * @returns {Color}
   */
  getBackGroundImageColor() {
    const color = this._backGroundImageColor
    return color(color.r, color.g, color.b, color.a)
  }

  /**
   * Gets backGround image opacity
   * @returns {Number}
   */
  getBackGroundImageOpacity() {
    return this._backGroundImageColor.a
  }

  _updateBackGroundImageColor() {
    if (this._backGroundImage) this._backGroundImage.setColor(this._backGroundImageColor)
  }

  /**
   * Gets background image texture size.
   * @returns {Size}
   */
  getBackGroundImageTextureSize() {
    return this._backGroundImageTextureSize
  }

  /**
   * Sets LayoutType to Layout, LayoutManager will do layout by layout type..
   * @param {Layout.ABSOLUTE|Layout.LINEAR_VERTICAL|Layout.LINEAR_HORIZONTAL|Layout.RELATIVE} type
   */
  setLayoutType(type) {
    this._layoutType = type
    const layoutChildrenArray = this._children
    let locChild
    for (let i = 0; i < layoutChildrenArray.length; i++) {
      locChild = layoutChildrenArray[i]
      if (locChild instanceof Widget) this._supplyTheLayoutParameterLackToChild(locChild)
    }
    this._doLayoutDirty = true
  }

  /**
   * Gets LayoutType of Layout.
   * @returns {null}
   */
  getLayoutType() {
    return this._layoutType
  }

  /**
   * request to refresh widget layout, it will do layout at visit calls
   */
  requestDoLayout() {
    this._doLayoutDirty = true
  }

  _doLayout() {
    if (!this._doLayoutDirty) return

    this.sortAllChildren()

    // const executant = getLayoutManager(this._layoutType)
    // if (executant) executant._doLayout(this)
    this._doLayoutDirty = false
  }

  _getLayoutContentSize() {
    return this.getContentSize()
  }

  _getLayoutElements() {
    return this.getChildren()
  }

  _updateBackGroundImageOpacity() {
    if (this._backGroundImage) this._backGroundImage.setOpacity(this._backGroundImageOpacity)
  }

  _updateBackGroundImageRGBA() {
    if (this._backGroundImage) {
      this._backGroundImage.setColor(this._backGroundImageColor)
      this._backGroundImage.setOpacity(this._backGroundImageOpacity)
    }
  }

  /**
   * Gets the content size of the layout, it will accumulate all its children's content size
   * @returns {Size}
   * @private
   */
  _getLayoutAccumulatedSize() {
    const children = this.getChildren()
    const layoutSize = Size(0, 0)
    let widgetCount = 0,
      locSize
    for (let i = 0, len = children.length; i < len; i++) {
      const layout = children[i]
      if (null !== layout && layout instanceof Layout) {
        locSize = layout._getLayoutAccumulatedSize()
        layoutSize.width += locSize.width
        layoutSize.height += locSize.height
      } else {
        if (layout instanceof Widget) {
          widgetCount++
          const m = layout.getLayoutParameter().getMargin()
          locSize = layout.getContentSize()
          layoutSize.width += locSize.width + (m.right + m.left) * 0.5
          layoutSize.height += locSize.height + (m.top + m.bottom) * 0.5
        }
      }
    }

    //substract extra size
    const type = this.getLayoutType()
    if (type === Layout.LINEAR_HORIZONTAL) layoutSize.height = layoutSize.height - (layoutSize.height / widgetCount) * (widgetCount - 1)

    if (type === Layout.LINEAR_VERTICAL) layoutSize.width = layoutSize.width - (layoutSize.width / widgetCount) * (widgetCount - 1)
    return layoutSize
  }

  /**
   * When the layout get focused, it the layout pass the focus to its child, it will use this method to determine which child      <br/>
   * will get the focus.  The current algorithm to determine which child will get focus is nearest-distance-priority algorithm
   * @param {Number} direction next focused widget direction
   * @param {Widget} baseWidget
   * @returns {Number}
   * @private
   */
  _findNearestChildWidgetIndex(direction, baseWidget) {
    if (baseWidget == null || baseWidget === this) return this._findFirstFocusEnabledWidgetIndex()

    let index = 0
    const locChildren = this.getChildren()
    const count = locChildren.length
    let widgetPosition

    let distance = FLT_MAX,
      found = 0
    if (direction === Widget.LEFT || direction === Widget.RIGHT || direction === Widget.DOWN || direction === Widget.UP) {
      widgetPosition = this._getWorldCenterPoint(baseWidget)
      while (index < count) {
        const w = locChildren[index]
        if (w && w instanceof Widget && w.isFocusEnabled()) {
          const length =
            w instanceof Layout ? w._calculateNearestDistance(baseWidget) : pLength(pSub(this._getWorldCenterPoint(w), widgetPosition))
          if (length < distance) {
            found = index
            distance = length
          }
        }
        index++
      }
      return found
    }
    log('invalid focus direction!')
    return 0
  }

  /**
   * When the layout get focused, it the layout pass the focus to its child, it will use this method to determine which child
   * will get the focus.  The current algorithm to determine which child will get focus is farthest-distance-priority algorithm
   * @param {Number} direction next focused widget direction
   * @param {Widget} baseWidget
   * @returns {Number} The index of child widget in the container
   * @private
   */
  _findFarthestChildWidgetIndex(direction, baseWidget) {
    if (baseWidget == null || baseWidget === this) return this._findFirstFocusEnabledWidgetIndex()

    let index = 0
    const locChildren = this.getChildren()
    const count = locChildren.length

    let distance = -FLT_MAX,
      found = 0
    if (direction === Widget.LEFT || direction === Widget.RIGHT || direction === Widget.DOWN || direction === Widget.UP) {
      const widgetPosition = this._getWorldCenterPoint(baseWidget)
      while (index < count) {
        const w = locChildren[index]
        if (w && w instanceof Widget && w.isFocusEnabled()) {
          const length =
            w instanceof Layout ? w._calculateFarthestDistance(baseWidget) : pLength(pSub(this._getWorldCenterPoint(w), widgetPosition))
          if (length > distance) {
            found = index
            distance = length
          }
        }
        index++
      }
      return found
    }
    log('invalid focus direction!!!')
    return 0
  }

  /**
   * calculate the nearest distance between the baseWidget and the children of the layout
   * @param {Widget} baseWidget the base widget which will be used to calculate the distance between the layout's children and itself
   * @returns {Number} return the nearest distance between the baseWidget and the layout's children
   * @private
   */
  _calculateNearestDistance(baseWidget) {
    let distance = FLT_MAX
    const widgetPosition = this._getWorldCenterPoint(baseWidget)
    const locChildren = this._children

    for (let i = 0, len = locChildren.length; i < len; i++) {
      const widget = locChildren[i]
      let length
      if (widget instanceof Layout) length = widget._calculateNearestDistance(baseWidget)
      else {
        if (widget instanceof Widget && widget.isFocusEnabled()) length = pLength(pSub(this._getWorldCenterPoint(widget), widgetPosition))
        else continue
      }
      if (length < distance) distance = length
    }
    return distance
  }

  /**
   * calculate the farthest distance between the baseWidget and the children of the layout
   * @param baseWidget
   * @returns {number}
   * @private
   */
  _calculateFarthestDistance(baseWidget) {
    let distance = -FLT_MAX
    const widgetPosition = this._getWorldCenterPoint(baseWidget)
    const locChildren = this._children

    for (let i = 0, len = locChildren.length; i < len; i++) {
      const layout = locChildren[i]
      let length
      if (layout instanceof Layout) length = layout._calculateFarthestDistance(baseWidget)
      else {
        if (layout instanceof Widget && layout.isFocusEnabled()) {
          const wPosition = this._getWorldCenterPoint(layout)
          length = pLength(pSub(wPosition, widgetPosition))
        } else continue
      }

      if (length > distance) distance = length
    }
    return distance
  }

  /**
   * when a layout pass the focus to it's child, use this method to determine which algorithm to use, nearest or farthest distance algorithm or not
   * @param direction
   * @param baseWidget
   * @private
   */
  _findProperSearchingFunctor(direction, baseWidget) {
    if (baseWidget === undefined) return

    const previousWidgetPosition = this._getWorldCenterPoint(baseWidget)
    const widgetPosition = this._getWorldCenterPoint(this._findFirstNonLayoutWidget())
    if (direction === Widget.LEFT) {
      this.onPassFocusToChild =
        previousWidgetPosition.x > widgetPosition.x ? this._findNearestChildWidgetIndex : this._findFarthestChildWidgetIndex
    } else if (direction === Widget.RIGHT) {
      this.onPassFocusToChild =
        previousWidgetPosition.x > widgetPosition.x ? this._findFarthestChildWidgetIndex : this._findNearestChildWidgetIndex
    } else if (direction === Widget.DOWN) {
      this.onPassFocusToChild =
        previousWidgetPosition.y > widgetPosition.y ? this._findNearestChildWidgetIndex : this._findFarthestChildWidgetIndex
    } else if (direction === Widget.UP) {
      this.onPassFocusToChild =
        previousWidgetPosition.y < widgetPosition.y ? this._findNearestChildWidgetIndex : this._findFarthestChildWidgetIndex
    } else log('invalid direction!')
  }

  /**
   * find the first non-layout widget in this layout
   * @returns {Widget}
   * @private
   */
  _findFirstNonLayoutWidget() {
    const locChildren = this._children
    for (let i = 0, len = locChildren.length; i < len; i++) {
      const child = locChildren[i]
      if (child instanceof Layout) {
        const widget = child._findFirstNonLayoutWidget()
        if (widget) return widget
      } else {
        if (child instanceof Widget) return child
      }
    }
    return null
  }

  /**
   * find the first focus enabled widget index in the layout, it will recursive searching the child widget
   * @returns {number}
   * @private
   */
  _findFirstFocusEnabledWidgetIndex() {
    let index = 0
    const locChildren = this.getChildren()
    const count = locChildren.length
    while (index < count) {
      const w = locChildren[index]
      if (w && w instanceof Widget && w.isFocusEnabled()) return index
      index++
    }
    return 0
  }

  /**
   * find a focus enabled child Widget in the layout by index
   * @param index
   * @returns {*}
   * @private
   */
  _findFocusEnabledChildWidgetByIndex(index) {
    const widget = this._getChildWidgetByIndex(index)
    if (widget) {
      if (widget.isFocusEnabled()) return widget
      index = index + 1
      return this._findFocusEnabledChildWidgetByIndex(index)
    }
    return null
  }

  /**
   * get the center point of a widget in world space
   * @param {Widget} widget
   * @returns {Point}
   * @private
   */
  _getWorldCenterPoint(widget) {
    //FIXEDME: we don't need to calculate the content size of layout anymore
    const widgetSize = widget instanceof Layout ? widget._getLayoutAccumulatedSize() : widget.getContentSize()
    return widget.convertToWorldSpace(p(widgetSize.width / 2, widgetSize.height / 2))
  }

  /**
   * this method is called internally by nextFocusedWidget. When the dir is Right/Down, then this method will be called
   * @param {Number} direction
   * @param {Widget} current the current focused widget
   * @returns {Widget} the next focused widget
   * @private
   */
  _getNextFocusedWidget(direction, current) {
    let nextWidget
    const locChildren = this._children
    let previousWidgetPos = locChildren.indexOf(current)
    previousWidgetPos = previousWidgetPos + 1
    if (previousWidgetPos < locChildren.length) {
      nextWidget = this._getChildWidgetByIndex(previousWidgetPos)
      //handle widget
      if (nextWidget) {
        if (nextWidget.isFocusEnabled()) {
          if (nextWidget instanceof Layout) {
            nextWidget._isFocusPassing = true
            return nextWidget.findNextFocusedWidget(direction, nextWidget)
          } else {
            this.dispatchFocusEvent(current, nextWidget)
            return nextWidget
          }
        } else return this._getNextFocusedWidget(direction, nextWidget)
      } else return current
    } else {
      if (this._loopFocus) {
        if (this._checkFocusEnabledChild()) {
          previousWidgetPos = 0
          nextWidget = this._getChildWidgetByIndex(previousWidgetPos)
          if (nextWidget.isFocusEnabled()) {
            if (nextWidget instanceof Layout) {
              nextWidget._isFocusPassing = true
              return nextWidget.findNextFocusedWidget(direction, nextWidget)
            } else {
              this.dispatchFocusEvent(current, nextWidget)
              return nextWidget
            }
          } else return this._getNextFocusedWidget(direction, nextWidget)
        } else return current instanceof Layout ? current : Widget._focusedWidget
      } else {
        if (this._isLastWidgetInContainer(current, direction)) {
          if (this._isWidgetAncestorSupportLoopFocus(this, direction))
            return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
          return current instanceof Layout ? current : Widget._focusedWidget
        } else return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
      }
    }
  }

  /**
   * this method is called internally by nextFocusedWidget. When the dir is Left/Up, then this method will be called
   * @param direction
   * @param {Widget} current the current focused widget
   * @returns {Widget} the next focused widget
   * @private
   */
  _getPreviousFocusedWidget(direction, current) {
    let nextWidget
    const locChildren = this._children
    let previousWidgetPos = locChildren.indexOf(current)
    previousWidgetPos = previousWidgetPos - 1
    if (previousWidgetPos >= 0) {
      nextWidget = this._getChildWidgetByIndex(previousWidgetPos)
      if (nextWidget.isFocusEnabled()) {
        if (nextWidget instanceof Layout) {
          nextWidget._isFocusPassing = true
          return nextWidget.findNextFocusedWidget(direction, nextWidget)
        }
        this.dispatchFocusEvent(current, nextWidget)
        return nextWidget
      } else return this._getPreviousFocusedWidget(direction, nextWidget) //handling the disabled widget, there is no actual focus lose or get, so we don't need any envet
    } else {
      if (this._loopFocus) {
        if (this._checkFocusEnabledChild()) {
          previousWidgetPos = locChildren.length - 1
          nextWidget = this._getChildWidgetByIndex(previousWidgetPos)
          if (nextWidget.isFocusEnabled()) {
            if (nextWidget instanceof Layout) {
              nextWidget._isFocusPassing = true
              return nextWidget.findNextFocusedWidget(direction, nextWidget)
            } else {
              this.dispatchFocusEvent(current, nextWidget)
              return nextWidget
            }
          } else return this._getPreviousFocusedWidget(direction, nextWidget)
        } else return current instanceof Layout ? current : Widget._focusedWidget
      } else {
        if (this._isLastWidgetInContainer(current, direction)) {
          if (this._isWidgetAncestorSupportLoopFocus(this, direction))
            return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
          return current instanceof Layout ? current : Widget._focusedWidget
        } else return Widget.prototype.findNextFocusedWidget.call(this, direction, this)
      }
    }
  }

  /**
   * find the nth element in the _children array. Only the Widget descendant object will be returned
   * @param {Number} index
   * @returns {Widget}
   * @private
   */
  _getChildWidgetByIndex(index) {
    const locChildren = this._children
    const size = locChildren.length
    let count = 0
    const oldIndex = index
    while (index < size) {
      const firstChild = locChildren[index]
      if (firstChild && firstChild instanceof Widget) return firstChild
      count++
      index++
    }

    let begin = 0
    while (begin < oldIndex) {
      const child = locChildren[begin]
      if (child && child instanceof Widget) return child
      count++
      begin++
    }
    return null
  }

  /**
   * whether it is the last element according to all their parents
   * @param {Widget} widget
   * @param {Number} direction
   * @returns {Boolean}
   * @private
   */
  _isLastWidgetInContainer(widget, direction) {
    const parent = widget.getParent()
    if (parent == null || !(parent instanceof Layout)) return true

    const container = parent.getChildren()
    const index = container.indexOf(widget)
    if (parent.getLayoutType() === Layout.LINEAR_HORIZONTAL) {
      if (direction === Widget.LEFT) {
        if (index === 0) return this._isLastWidgetInContainer(parent, direction)
        else return false
      }
      if (direction === Widget.RIGHT) {
        if (index === container.length - 1) return this._isLastWidgetInContainer(parent, direction)
        else return false
      }
      if (direction === Widget.DOWN) return this._isLastWidgetInContainer(parent, direction)

      if (direction === Widget.UP) return this._isLastWidgetInContainer(parent, direction)
    } else if (parent.getLayoutType() === Layout.LINEAR_VERTICAL) {
      if (direction === Widget.UP) {
        if (index === 0) return this._isLastWidgetInContainer(parent, direction)
        else return false
      }
      if (direction === Widget.DOWN) {
        if (index === container.length - 1) return this._isLastWidgetInContainer(parent, direction)
        else return false
      }
      if (direction === Widget.LEFT) return this._isLastWidgetInContainer(parent, direction)

      if (direction === Widget.RIGHT) return this._isLastWidgetInContainer(parent, direction)
    } else {
      log('invalid layout Type')
      return false
    }
  }

  /**
   * Lookup any parent widget with a layout type as the direction, if the layout is loop focused, then return true, otherwise it returns false.
   * @param {Widget} widget
   * @param {Number} direction
   * @returns {Boolean}
   * @private
   */
  _isWidgetAncestorSupportLoopFocus(widget, direction) {
    const parent = widget.getParent()
    if (parent == null || !(parent instanceof Layout)) return false
    if (parent.isLoopFocus()) {
      const layoutType = parent.getLayoutType()
      if (layoutType === Layout.LINEAR_HORIZONTAL) {
        if (direction === Widget.LEFT || direction === Widget.RIGHT) return true
        else return this._isWidgetAncestorSupportLoopFocus(parent, direction)
      }
      if (layoutType === Layout.LINEAR_VERTICAL) {
        if (direction === Widget.DOWN || direction === Widget.UP) return true
        else return this._isWidgetAncestorSupportLoopFocus(parent, direction)
      } else {
        assert(0, 'invalid layout type')
        return false
      }
    } else return this._isWidgetAncestorSupportLoopFocus(parent, direction)
  }

  /**
   * pass the focus to the layout's next focus enabled child
   * @param {Number} direction
   * @param {Widget} current
   * @returns {Widget}
   * @private
   */
  _passFocusToChild(direction, current) {
    if (this._checkFocusEnabledChild()) {
      const previousWidget = Widget.getCurrentFocusedWidget()
      this._findProperSearchingFunctor(direction, previousWidget)
      const index = this.onPassFocusToChild(direction, previousWidget)

      const widget = this._getChildWidgetByIndex(index)
      if (widget instanceof Layout) {
        widget._isFocusPassing = true
        return widget.findNextFocusedWidget(direction, widget)
      } else {
        this.dispatchFocusEvent(current, widget)
        return widget
      }
    } else return this
  }

  /**
   * If there are no focus enabled child in the layout, it will return false, otherwise it returns true
   * @returns {boolean}
   * @private
   */
  _checkFocusEnabledChild() {
    const locChildren = this._children
    for (let i = 0, len = locChildren.length; i < len; i++) {
      const widget = locChildren[i]
      if (widget && widget instanceof Widget && widget.isFocusEnabled()) return true
    }
    return false
  }

  /**
   * Returns the "class name" of widget.
   * @returns {string}
   */
  getDescription() {
    return 'Layout'
  }

  _createCloneInstance() {
    return new Layout()
  }

  _copyClonedWidgetChildren(model) {
    Widget.prototype._copyClonedWidgetChildren.call(this, model)
  }

  _copySpecialProperties(layout) {
    if (!(layout instanceof Layout)) return
    this.setBackGroundImageScale9Enabled(layout._backGroundScale9Enabled)
    this.setBackGroundImage(layout._backGroundImageFileName, layout._bgImageTexType)
    this.setBackGroundImageCapInsets(layout._backGroundImageCapInsets)
    this.setBackGroundColorType(layout._colorType)
    this.setBackGroundColor(layout._color)
    this.setBackGroundColor(layout._startColor, layout._endColor)
    this.setBackGroundColorOpacity(layout._opacity)
    this.setBackGroundColorVector(layout._alongVector)
    this.setLayoutType(layout._layoutType)
    this.setClippingEnabled(layout._clippingEnabled)
    this.setClippingType(layout._clippingType)
    this._loopFocus = layout._loopFocus
    this.__passFocusToChild = layout.__passFocusToChild
    this._isInterceptTouch = layout._isInterceptTouch
  }

  /**
   * force refresh widget layout
   */
  forceDoLayout() {
    this.requestDoLayout()
    this._doLayout()
  }

  _createRenderCmd() {
    return new LayoutWebGLRenderCmd(this)
  }

  //layoutBackGround color type
  /**
   * The None of Layout's background color type
   * @constant
   * @type {number}
   */
  static BG_COLOR_NONE = 0
  /**
   * The solid of Layout's background color type, it will use a LayerColor to draw the background.
   * @constant
   * @type {number}
   */
  static BG_COLOR_SOLID = 1
  /**
   * The gradient of Layout's background color type, it will use a LayerGradient to draw the background.
   * @constant
   * @type {number}
   */
  static BG_COLOR_GRADIENT = 2

  //Layout type
  /**
   * The absolute of Layout's layout type.
   * @type {number}
   * @constant
   */
  static ABSOLUTE = 0
  /**
   * The vertical of Layout's layout type.
   * @type {number}
   * @constant
   */
  static LINEAR_VERTICAL = 1
  /**
   * The horizontal of Layout's layout type.
   * @type {number}
   * @constant
   */
  static LINEAR_HORIZONTAL = 2
  /**
   * The relative of Layout's layout type.
   * @type {number}
   * @constant
   */
  static RELATIVE = 3

  //Layout clipping type
  /**
   * The stencil of Layout's clipping type.
   * @type {number}
   * @constant
   */
  static CLIPPING_STENCIL = 0
  /**
   * The scissor of Layout's clipping type.
   * @type {number}
   * @constant
   */
  static CLIPPING_SCISSOR = 1

  /**
   * The zOrder value of Layout's image background.
   * @type {number}
   * @constant
   */
  static BACKGROUND_IMAGE_ZORDER = -1
  /**
   * The zOrder value of Layout's color background.
   * @type {number}
   * @constant
   */
  static BACKGROUND_RENDERER_ZORDER = -2
}
