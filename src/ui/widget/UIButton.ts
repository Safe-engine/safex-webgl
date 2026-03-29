import { scaleTo } from '../../actions/ActionScale'
import { SpriteFrame, spriteFrameCache } from '../../core'
import { Rect, Size, sizeEqualToSize } from '../../core/cocoa/Geometry'
import { LabelTTF } from '../../core/labelttf/LabelTTF'
import { Color } from '../../core/platform'
import { VERTICAL_TEXT_ALIGNMENT_CENTER } from '../../core/platform/Types'
import { SpriteLoadManager } from '../../core/sprites/SpriteLoadManager'
import { log } from '../../helper/Debugger'
import { textureCache } from '../../textures'
import { Scale9Sprite } from '../base/UIScale9Sprite'
import { Widget } from '../base/UIWidget'

export class Button extends Widget {
  _buttonScale9Renderer: Scale9Sprite
  _buttonNormalSpriteFrame: SpriteFrame
  _buttonClickedSpriteFrame: SpriteFrame
  _buttonDisableSpriteFrame: SpriteFrame
  _titleRenderer: LabelTTF

  declare _normalFileName
  declare _clickedFileName
  declare _disabledFileName

  _prevIgnoreSize = true
  _scale9Enabled = false

  declare _capInsetsNormal: Rect

  _normalTexType: number = Widget.LOCAL_TEXTURE
  _pressedTexType: number = Widget.LOCAL_TEXTURE
  _disabledTexType: number = Widget.LOCAL_TEXTURE

  declare _normalTextureSize: Size

  pressedActionEnabled = false
  declare _titleColor: Color

  _zoomScale = 0.1

  _normalTextureLoaded = false
  _pressedTextureLoaded = false
  _disabledTextureLoaded = false

  _normalTextureAdaptDirty = true

  _fontName = 'Thonburi'
  _fontSize = 12
  _type = 0
  _normalLoader: SpriteLoadManager
  _clickedLoader: SpriteLoadManager
  _disabledLoader: SpriteLoadManager

  /**
   * Allocates and initializes a UIButton.
   * Constructor of Button. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {String} normalImage
   * @param {String} [selectedImage=""]
   * @param {String} [disableImage=""]
   * @param {Number} [texType=Widget.LOCAL_TEXTURE]
   * @example
   * // example
   * var uiButton = new Button();
   */
  constructor(normalImage?: string, selectedImage?: string, disableImage?: string, texType?: number) {
    super()
    this._capInsetsNormal = Rect(0, 0, 0, 0)
    this._normalTextureSize = Size(0, 0)
    this.setTouchEnabled(true)

    this._normalLoader = new SpriteLoadManager()
    this._clickedLoader = new SpriteLoadManager()
    this._disabledLoader = new SpriteLoadManager()
    this._initRenderer()
    if (normalImage) {
      this.loadTextures(normalImage, selectedImage, disableImage, texType)
    }
  }

  _createTitleRendererIfNeeded() {
    if (!this._titleRenderer) {
      this._titleRenderer = new LabelTTF('')
      this._titleRenderer.setAnchorPoint(0.5, 0.5)
      this._titleColor = Color.WHITE
      this._titleRenderer.setVerticalAlignment(VERTICAL_TEXT_ALIGNMENT_CENTER)
      this.addProtectedChild(this._titleRenderer, Button.TITLE_RENDERER_ZORDER, -1)
    }
  }

  _initRenderer() {
    this._buttonScale9Renderer = new Scale9Sprite()
    this._buttonScale9Renderer.setRenderingType(Scale9Sprite.RenderingType.SIMPLE)
    this.addProtectedChild(this._buttonScale9Renderer, Button.DISABLED_RENDERER_ZORDER, -1)
  }

  /**
   * Sets if button is using scale9 renderer.
   * @param {Boolean} able true that using scale9 renderer, false otherwise.
   */
  setScale9Enabled(able: boolean) {
    if (this._scale9Enabled === able) return

    this._brightStyle = Widget.BRIGHT_STYLE_NONE
    this._scale9Enabled = able

    if (this._scale9Enabled) {
      this._buttonScale9Renderer.setRenderingType(Scale9Sprite.RenderingType.SLICED)
    } else {
      this._buttonScale9Renderer.setRenderingType(Scale9Sprite.RenderingType.SIMPLE)
    }

    if (this._scale9Enabled) {
      const ignoreBefore = this._ignoreSize
      this.ignoreContentAdaptWithSize(false)
      this._prevIgnoreSize = ignoreBefore
    } else {
      this.ignoreContentAdaptWithSize(this._prevIgnoreSize)
    }
    this.setCapInsets(this._capInsetsNormal)

    this.setBright(this._bright)

    this._normalTextureAdaptDirty = true
  }

  /**
   *  Returns button is using scale9 renderer or not.
   * @returns {Boolean}
   */
  isScale9Enabled() {
    return this._scale9Enabled
  }

  /**
   * Sets whether ignore the widget size
   * @param {Boolean} ignore true that widget will ignore it's size, use texture size, false otherwise. Default value is true.
   * @override
   */
  ignoreContentAdaptWithSize(ignore) {
    if (this._unifySize) {
      this._updateContentSize()
      return
    }
    if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
      Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore)
      this._prevIgnoreSize = ignore
    }
  }

  /**
   * Returns the renderer size.
   * @returns {Size}
   */
  getVirtualRendererSize() {
    if (this._unifySize) return this._getNormalSize()

    if (!this._normalTextureLoaded) {
      if (this._titleRenderer && this._titleRenderer.getString().length > 0) {
        return this._titleRenderer.getContentSize()
      }
    }
    return Size(this._normalTextureSize)
  }

  /**
   * Load textures for button.
   * @param {String} normal normal state of texture's filename.
   * @param {String} selected  selected state of texture's filename.
   * @param {String} disabled  disabled state of texture's filename.
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadTextures(normal, selected, disabled, texType) {
    this.loadTextureNormal(normal, texType)
    this.loadTexturePressed(selected, texType)
    this.loadTextureDisabled(disabled, texType)
  }

  _createSpriteFrameWithFile(file: string) {
    let texture = textureCache.getTextureForKey(file) as any
    if (!texture) {
      texture = textureCache.addImage(file)
    }
    if (!texture._textureLoaded) {
      return texture
    }

    const textureSize = texture.getContentSize()
    const rc = Rect(0, 0, textureSize.width, textureSize.height)
    return new SpriteFrame(texture, rc)
  }

  _createSpriteFrameWithName(name) {
    const frame = spriteFrameCache.getSpriteFrame(name)
    if (frame == null) {
      log('Scale9Sprite.initWithSpriteFrameName(): cant find the sprite frame by spriteFrameName')
      return null
    }

    return frame
  }

  /**
   * Load normal state texture for button.
   * @param {String} normal normal state of texture's filename.
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadTextureNormal(normal: string, texType: number) {
    if (!normal) return

    texType = texType || Widget.LOCAL_TEXTURE
    this._normalFileName = normal
    this._normalTexType = texType

    let normalSpriteFrame: SpriteFrame
    switch (this._normalTexType) {
      case Widget.LOCAL_TEXTURE:
        normalSpriteFrame = this._createSpriteFrameWithFile(normal)
        break
      case Widget.PLIST_TEXTURE:
        if (normal[0] === '#') {
          normal = normal.substr(1, normal.length - 1)
        }
        normalSpriteFrame = this._createSpriteFrameWithName(normal)
        break
      default:
        break
    }

    if (!normalSpriteFrame) {
      return
    }

    if (!normalSpriteFrame._textureLoaded) {
      this._normalLoader.clear()
      this._normalLoader.once(
        normalSpriteFrame,
        () => {
          this.loadTextureNormal(this._normalFileName, this._normalTexType)
        },
        this,
      )
      return
    }

    this._normalTextureLoaded = normalSpriteFrame._textureLoaded
    this._buttonNormalSpriteFrame = normalSpriteFrame
    this._buttonScale9Renderer.setSpriteFrame(normalSpriteFrame)
    if (this._scale9Enabled) {
      this._buttonScale9Renderer.setCapInsets(this._capInsetsNormal)
    }

    // FIXME: https://github.com/cocos2d/cocos2d-x/issues/12249
    if (!this._ignoreSize && sizeEqualToSize(this._customSize, Size(0, 0))) {
      this._customSize = this._buttonScale9Renderer.getContentSize()
    }

    this._normalTextureSize = this._buttonScale9Renderer.getContentSize()
    this._updateChildrenDisplayedRGBA()
    if (this._unifySize) {
      if (this._scale9Enabled) {
        this._buttonScale9Renderer.setCapInsets(this._capInsetsNormal)
        this._updateContentSizeWithTextureSize(this._getNormalSize())
      }
    } else {
      this._updateContentSizeWithTextureSize(this._normalTextureSize)
    }

    this._normalTextureAdaptDirty = true
    this._findLayout()
  }

  /**
   * Load selected state texture for button.
   * @param {String} selected selected state of texture's filename.
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadTexturePressed(selected, texType) {
    if (!selected) return
    texType = texType || Widget.LOCAL_TEXTURE
    this._clickedFileName = selected
    this._pressedTexType = texType

    let clickedSpriteFrame: SpriteFrame
    switch (this._pressedTexType) {
      case Widget.LOCAL_TEXTURE:
        clickedSpriteFrame = this._createSpriteFrameWithFile(selected)
        break
      case Widget.PLIST_TEXTURE:
        if (selected[0] === '#') {
          selected = selected.substr(1, selected.length - 1)
        }
        clickedSpriteFrame = this._createSpriteFrameWithName(selected)
        break
      default:
        break
    }

    if (!clickedSpriteFrame) return

    if (!clickedSpriteFrame._textureLoaded) {
      this._clickedLoader.clear()
      this._clickedLoader.once(
        clickedSpriteFrame,
        () => {
          this.loadTexturePressed(this._clickedFileName, this._pressedTexType)
        },
        this,
      )
      return
    }

    this._buttonClickedSpriteFrame = clickedSpriteFrame
    this._updateChildrenDisplayedRGBA()

    this._pressedTextureLoaded = true
  }

  /**
   * Load dark state texture for button.
   * @param {String} disabled disabled state of texture's filename.
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadTextureDisabled(disabled, texType) {
    if (!disabled) return

    texType = texType || Widget.LOCAL_TEXTURE
    this._disabledFileName = disabled
    this._disabledTexType = texType

    let disabledSpriteframe
    switch (this._disabledTexType) {
      case Widget.LOCAL_TEXTURE:
        disabledSpriteframe = this._createSpriteFrameWithFile(disabled)
        break
      case Widget.PLIST_TEXTURE:
        if (disabled[0] === '#') {
          disabled = disabled.substr(1, disabled.length - 1)
        }
        disabledSpriteframe = this._createSpriteFrameWithName(disabled)
        break
      default:
        break
    }

    if (!disabledSpriteframe) return

    if (!disabledSpriteframe._textureLoaded) {
      this._disabledLoader.clear()
      this._disabledLoader.once(
        disabledSpriteframe,
        () => {
          this.loadTextureDisabled(this._disabledFileName, this._disabledTexType)
        },
        this,
      )
      return
    }

    this._buttonDisableSpriteFrame = disabledSpriteframe
    this._updateChildrenDisplayedRGBA()

    this._disabledTextureLoaded = true
    this._findLayout()
  }

  /**
   * Sets capinsets for button, if button is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsets(capInsets) {
    this.setCapInsetsNormalRenderer(capInsets)
  }

  /**
   * Sets capinsets for button, if button is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsetsNormalRenderer(capInsets) {
    if (!capInsets || !this._scale9Enabled) return

    let x = capInsets.x,
      y = capInsets.y
    let width = capInsets.width,
      height = capInsets.height
    if (this._normalTextureSize.width < width) {
      x = 0
      width = 0
    }
    if (this._normalTextureSize.height < height) {
      y = 0
      height = 0
    }

    const locInsets = this._capInsetsNormal
    locInsets.x = x
    locInsets.y = y
    locInsets.width = width
    locInsets.height = height

    this._capInsetsNormal = locInsets
    this._buttonScale9Renderer.setCapInsets(locInsets)
  }

  /**
   *  Returns normal renderer cap insets.
   * @returns {Rect}
   */
  getCapInsetsNormalRenderer() {
    return Rect(this._capInsetsNormal)
  }

  /**
   * Sets capinsets for button, if button is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsetsPressedRenderer(capInsets) {
    this.setCapInsetsNormalRenderer(capInsets)
  }

  /**
   *  Returns pressed renderer cap insets.
   * @returns {Rect}
   */
  getCapInsetsPressedRenderer() {
    return Rect(this._capInsetsNormal)
  }

  /**
   * Sets capinsets for button, if button is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsetsDisabledRenderer(capInsets) {
    this.setCapInsetsNormalRenderer(capInsets)
  }

  /**
   * Returns disable renderer cap insets.
   * @returns {Rect}
   */
  getCapInsetsDisabledRenderer() {
    return Rect(this._capInsetsNormal)
  }

  _onPressStateChangedToNormal() {
    this._buttonScale9Renderer.setSpriteFrame(this._buttonNormalSpriteFrame)

    this._buttonScale9Renderer.setState(Scale9Sprite.state.NORMAL)

    if (this._pressedTextureLoaded) {
      if (this.pressedActionEnabled) {
        this._buttonScale9Renderer.stopAllActions()
        this._buttonScale9Renderer.setScale(1.0)

        if (this._titleRenderer) {
          this._titleRenderer.stopAllActions()

          if (this._unifySize) {
            const zoomTitleAction = scaleTo(Button.ZOOM_ACTION_TIME_STEP, 1, 1)
            this._titleRenderer.runAction(zoomTitleAction)
          } else {
            this._titleRenderer.setScaleX(1)
            this._titleRenderer.setScaleY(1)
          }
        }
      }
    } else {
      this._buttonScale9Renderer.stopAllActions()
      this._buttonScale9Renderer.setScale(1.0)

      if (this._scale9Enabled) {
        this._buttonScale9Renderer.setColor(Color.WHITE)
      }

      if (this._titleRenderer) {
        this._titleRenderer.stopAllActions()

        this._titleRenderer.setScaleX(1)
        this._titleRenderer.setScaleY(1)
      }
    }
  }

  _onPressStateChangedToPressed() {
    this._buttonScale9Renderer.setState(Scale9Sprite.state.NORMAL)

    if (this._pressedTextureLoaded) {
      this._buttonScale9Renderer.setSpriteFrame(this._buttonClickedSpriteFrame)

      if (this.pressedActionEnabled) {
        this._buttonScale9Renderer.stopAllActions()

        const zoomAction = scaleTo(Button.ZOOM_ACTION_TIME_STEP, 1.0 + this._zoomScale, 1.0 + this._zoomScale)
        this._buttonScale9Renderer.runAction(zoomAction)

        if (this._titleRenderer) {
          this._titleRenderer.stopAllActions()
          this._titleRenderer.runAction(scaleTo(Button.ZOOM_ACTION_TIME_STEP, 1 + this._zoomScale, 1 + this._zoomScale))
        }
      }
    } else {
      this._buttonScale9Renderer.setSpriteFrame(this._buttonClickedSpriteFrame)

      this._buttonScale9Renderer.stopAllActions()
      this._buttonScale9Renderer.setScale(1.0 + this._zoomScale, 1.0 + this._zoomScale)

      if (this._titleRenderer) {
        this._titleRenderer.stopAllActions()
        this._titleRenderer.setScaleX(1 + this._zoomScale)
        this._titleRenderer.setScaleY(1 + this._zoomScale)
      }
    }
  }

  _onPressStateChangedToDisabled() {
    //if disable resource is null
    if (!this._disabledTextureLoaded) {
      if (this._normalTextureLoaded) {
        this._buttonScale9Renderer.setState(Scale9Sprite.state.GRAY)
      }
    } else {
      this._buttonScale9Renderer.setSpriteFrame(this._buttonDisableSpriteFrame)
    }

    this._buttonScale9Renderer.setScale(1.0)
  }

  _updateContentSize() {
    if (this._unifySize) {
      if (this._scale9Enabled) this.setContentSize(this._customSize)
      else {
        const s = this._getNormalSize()
        this.setContentSize(s)
      }
      this._onSizeChanged()
      return
    }

    if (this._ignoreSize) this.setContentSize(this.getVirtualRendererSize())
  }

  _onSizeChanged() {
    Widget.prototype._onSizeChanged.call(this)
    if (this._titleRenderer) {
      this._updateTitleLocation()
    }
    this._normalTextureAdaptDirty = true
  }

  /**
   * Gets the Virtual Renderer of widget.
   * @returns {Node}
   */
  getVirtualRenderer() {
    return this._buttonScale9Renderer as any
  }

  _normalTextureScaleChangedWithSize() {
    this._buttonScale9Renderer.setContentSize(this._contentSize)
    this._buttonScale9Renderer.setPosition(this._contentSize.width / 2, this._contentSize.height / 2)
  }

  _adaptRenderers() {
    if (this._normalTextureAdaptDirty) {
      this._normalTextureScaleChangedWithSize()
      this._normalTextureAdaptDirty = false
    }
  }

  _updateTitleLocation() {
    this._titleRenderer.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5)
  }

  /**
   * Changes if button can be clicked zoom effect.
   * @param {Boolean} enabled
   */
  setPressedActionEnabled(enabled) {
    this.pressedActionEnabled = enabled
  }

  /**
   * Sets title text to Button
   * @param {String} text
   */
  setTitleText(text) {
    if (text === this.getTitleText()) return

    this._createTitleRendererIfNeeded()

    this._titleRenderer.setString(text)
    if (this._ignoreSize) {
      const s = this.getVirtualRendererSize()
      this.setContentSize(s)
    } else {
      this._titleRenderer._renderCmd._updateTTF()
    }
  }

  /**
   * Returns title text of Button
   * @returns {String} text
   */
  getTitleText() {
    if (this._titleRenderer) {
      return this._titleRenderer.getString()
    }
    return ''
  }

  /**
   * Sets title color to Button.
   * @param {Color} color
   */
  setTitleColor(color) {
    this._createTitleRendererIfNeeded()
    this._titleRenderer.setFontFillColor(color)
  }

  /**
   * Returns title color of Button
   * @returns {Color}
   */
  getTitleColor() {
    if (this._titleRenderer) {
      return this._titleRenderer._getFillStyle()
    }
    return Color.WHITE
  }

  /**
   * Sets title fontSize to Button
   * @param {Size} size
   */
  setTitleFontSize(size) {
    this._createTitleRendererIfNeeded()

    this._titleRenderer.setFontSize(size)
    this._fontSize = size
  }

  /**
   * Returns title fontSize of Button.
   * @returns {Number}
   */
  getTitleFontSize() {
    if (this._titleRenderer) {
      return this._titleRenderer.getFontSize()
    }
    return this._fontSize
  }

  /**
   * When user pressed the button, the button will zoom to a scale.
   * The final scale of the button  equals (button original scale + _zoomScale)
   * @since v3.2
   * @param scale
   */
  setZoomScale(scale) {
    this._zoomScale = scale
  }

  /**
   * Returns a zoom scale
   * @since v3.2
   * @returns {number}
   */
  getZoomScale() {
    return this._zoomScale
  }

  /**
   * Returns the normalize of texture size
   * @since v3.3
   * @returns {Size}
   */
  getNormalTextureSize() {
    return this._normalTextureSize
  }

  /**
   * Sets title fontName to Button.
   * @param {String} fontName
   */
  setTitleFontName(fontName) {
    this._createTitleRendererIfNeeded()

    this._titleRenderer.setFontName(fontName)
    this._fontName = fontName
  }

  /**
   * Get the title renderer.
   * title ttf object.
   * @returns {LabelTTF}
   */
  getTitleRenderer() {
    return this._titleRenderer
  }

  /**
   * Gets title fontName of Button.
   * @returns {String}
   */
  getTitleFontName() {
    if (this._titleRenderer) {
      return this._titleRenderer.getFontName()
    }
    return this._fontName
  }

  _setTitleFont(font) {
    this._titleRenderer.setFontName(font)
  }
  _getTitleFont() {
    return this._titleRenderer.getFontName()
  }

  /**
   * Returns the "class name" of widget.
   * @override
   * @returns {string}
   */
  getDescription() {
    return 'Button'
  }

  _createCloneInstance() {
    return new Button()
  }

  _copySpecialProperties(uiButton) {
    this._prevIgnoreSize = uiButton._prevIgnoreSize
    this._capInsetsNormal = uiButton._capInsetsNormal
    this.setScale9Enabled(uiButton._scale9Enabled)

    this.loadTextureNormal(uiButton._normalFileName, uiButton._normalTexType)
    this.loadTexturePressed(uiButton._clickedFileName, uiButton._pressedTexType)
    this.loadTextureDisabled(uiButton._disabledFileName, uiButton._disabledTexType)

    if (uiButton._titleRenderer && uiButton._titleRenderer._string) {
      this.setTitleText(uiButton.getTitleText())
      this.setTitleFontName(uiButton.getTitleFontName())
      this.setTitleFontSize(uiButton.getTitleFontSize())
      this.setTitleColor(uiButton.getTitleColor())
    }
    this.setPressedActionEnabled(uiButton.pressedActionEnabled)
    this.setZoomScale(uiButton._zoomScale)
  }

  _getNormalSize() {
    let titleSize
    if (this._titleRenderer !== null) titleSize = this._titleRenderer.getContentSize()

    const imageSize = this._buttonScale9Renderer.getContentSize()
    const width = titleSize.width > imageSize.width ? titleSize.width : imageSize.width
    const height = titleSize.height > imageSize.height ? titleSize.height : imageSize.height

    return Size(width, height)
  }

  // Constants
  static NORMAL_RENDERER_ZORDER = -2
  static PRESSED_RENDERER_ZORDER = -2
  static DISABLED_RENDERER_ZORDER = -2
  static TITLE_RENDERER_ZORDER = -1
  static ZOOM_ACTION_TIME_STEP = 0.05
  static SYSTEM = 0
  static TTF = 1

  // Extended properties
  get titleText() {
    return this.getTitleText()
  }
  set titleText(value) {
    this.setTitleText(value)
  }

  get titleFont() {
    return this._getTitleFont()
  }
  set titleFont(value) {
    this._setTitleFont(value)
  }

  get titleFontSize() {
    return this.getTitleFontSize()
  }
  set titleFontSize(value) {
    this.setTitleFontSize(value)
  }

  get titleFontName() {
    return this.getTitleFontName()
  }
  set titleFontName(value) {
    this.setTitleFontName(value)
  }

  get titleColor() {
    return this.getTitleColor()
  }
  set titleColor(value) {
    this.setTitleColor(value)
  }
}

// Constants (legacy access)
/**
 * The normal renderer's zOrder value of Button.
 * @constant
 * @type {number}
 */
Button.NORMAL_RENDERER_ZORDER = -2
/**
 * The pressed renderer's zOrder value Button.
 * @constant
 * @type {number}
 */
Button.PRESSED_RENDERER_ZORDER = -2
/**
 * The disabled renderer's zOrder value of Button.
 * @constant
 * @type {number}
 */
Button.DISABLED_RENDERER_ZORDER = -2
/**
 * The title renderer's zOrder value of Button.
 * @constant
 * @type {number}
 */
Button.TITLE_RENDERER_ZORDER = -1

/**
 * the zoom action time step of Button
 * @constant
 * @type {number}
 */
Button.ZOOM_ACTION_TIME_STEP = 0.05

/**
 * @ignore
 */
Button.SYSTEM = 0
Button.TTF = 1
