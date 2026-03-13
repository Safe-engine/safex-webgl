import { game } from '../..'
import { Node, Sprite } from '../../core'
import { p, Rect, Size } from '../../core/cocoa/Geometry'
import { _renderType } from '../../helper/engine'
import { Scale9Sprite } from '../base/UIScale9Sprite'
import { Widget } from '../base/UIWidget'

/**
 * The Slider control of Cocos UI.
 * @class
 * @extends Widget
 *
 * @property {Number}   percent     - The current progress of loadingbar
 */
export class Slider extends Widget {
  declare _barRenderer: any
  declare _progressBarRenderer: any
  declare _barTextureSize: Size
  declare _progressBarTextureSize: Size
  declare _slidBallNormalRenderer: Sprite
  declare _slidBallPressedRenderer: Sprite
  declare _slidBallDisabledRenderer: Sprite
  declare _slidBallRenderer: Node
  _barLength = 0
  _percent = 0
  _scale9Enabled = false
  _prevIgnoreSize = true
  _textureFile = ''
  _progressBarTextureFile = ''
  _slidBallNormalTextureFile = ''
  _slidBallPressedTextureFile = ''
  _slidBallDisabledTextureFile = ''
  declare _capInsetsBarRenderer
  declare _capInsetsProgressBarRenderer
  declare _sliderEventListener
  declare _sliderEventSelector
  _barTexType = Widget.LOCAL_TEXTURE
  _progressBarTexType = Widget.LOCAL_TEXTURE
  _ballNTexType = Widget.LOCAL_TEXTURE
  _ballPTexType = Widget.LOCAL_TEXTURE
  _ballDTexType = Widget.LOCAL_TEXTURE
  _isTextureLoaded = false
  _className = 'Slider'
  _barRendererAdaptDirty = true
  _progressBarRendererDirty = true
  _unifySize = false
  _zoomScale = 0.1

  _sliderBallNormalTextureScaleX = 1
  _sliderBallNormalTextureScaleY = 1
  declare _ccEventCallback
  /**
   * allocates and initializes a UISlider.
   * Constructor of Slider. override it to extend the construction behavior, remember to call "super()" in the extended constructor.
   * @example
   * // example
   * var uiSlider = new Slider();
   */
  constructor(barTextureName?: string, normalBallTextureName?: string, resType?: number) {
    super()
    this._barTextureSize = Size(0, 0)
    this._progressBarTextureSize = Size(0, 0)
    this._capInsetsBarRenderer = Rect(0, 0, 0, 0)
    this._capInsetsProgressBarRenderer = Rect(0, 0, 0, 0)

    resType = resType || 0
    this.setTouchEnabled(true)
    this._initRenderer()
    if (barTextureName) {
      this.loadBarTexture(barTextureName, resType)
    }
    if (normalBallTextureName) {
      this.loadSlidBallTextures(normalBallTextureName, normalBallTextureName, normalBallTextureName, resType)
    }
  }

  _initRenderer() {
    //todo use Scale9Sprite
    this._barRenderer = new Sprite()
    this._progressBarRenderer = new Sprite()
    this._progressBarRenderer.setAnchorPoint(0.0, 0.5)
    this.addProtectedChild(this._barRenderer, Slider.BASEBAR_RENDERER_ZORDER, -1)
    this.addProtectedChild(this._progressBarRenderer, Slider.PROGRESSBAR_RENDERER_ZORDER, -1)
    this._slidBallNormalRenderer = new Sprite()
    this._slidBallPressedRenderer = new Sprite()
    this._slidBallPressedRenderer.setVisible(false)
    this._slidBallDisabledRenderer = new Sprite()
    this._slidBallDisabledRenderer.setVisible(false)
    this._slidBallRenderer = new Node()
    this._slidBallRenderer.addChild(this._slidBallNormalRenderer)
    this._slidBallRenderer.addChild(this._slidBallPressedRenderer)
    this._slidBallRenderer.addChild(this._slidBallDisabledRenderer)
    this._slidBallRenderer.setCascadeColorEnabled(true)
    this._slidBallRenderer.setCascadeOpacityEnabled(true)

    this.addProtectedChild(this._slidBallRenderer, Slider.BALL_RENDERER_ZORDER, -1)
  }

  /**
   * Loads texture for slider bar.
   * @param {String} fileName
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadBarTexture(fileName: string, texType?: number) {
    if (!fileName) {
      return
    }
    texType = texType || Widget.LOCAL_TEXTURE
    this._textureFile = fileName
    this._barTexType = texType
    const barRenderer = this._barRenderer

    if (!barRenderer._textureLoaded) {
      barRenderer.addEventListener('load', () => {
        this.loadBarTexture(this._textureFile, this._barTexType)
      })
    }

    switch (this._barTexType) {
      case Widget.LOCAL_TEXTURE:
        //SetTexture cannot load resource
        barRenderer.initWithFile(fileName)
        break
      case Widget.PLIST_TEXTURE:
        //SetTexture cannot load resource
        barRenderer.initWithSpriteFrameName(fileName)
        break
      default:
        break
    }
    this._updateChildrenDisplayedRGBA()

    this._barRendererAdaptDirty = true
    this._progressBarRendererDirty = true
    this._updateContentSizeWithTextureSize(this._barRenderer.getContentSize())
    this._findLayout()
    this._barTextureSize = this._barRenderer.getContentSize()
  }

  /**
   * Loads dark state texture for slider progress bar.
   * @param {String} fileName
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadProgressBarTexture(fileName: string, texType?: number) {
    if (!fileName) {
      return
    }
    texType = texType || Widget.LOCAL_TEXTURE
    this._progressBarTextureFile = fileName
    this._progressBarTexType = texType
    const progressBarRenderer = this._progressBarRenderer

    if (!progressBarRenderer._textureLoaded) {
      progressBarRenderer.addEventListener('load', () => {
        this.loadProgressBarTexture(this._progressBarTextureFile, this._progressBarTexType)
      })
    }

    switch (this._progressBarTexType) {
      case Widget.LOCAL_TEXTURE:
        //SetTexture cannot load resource
        progressBarRenderer.initWithFile(fileName)
        break
      case Widget.PLIST_TEXTURE:
        //SetTexture cannot load resource
        progressBarRenderer.initWithSpriteFrameName(fileName)
        break
      default:
        break
    }
    this._updateChildrenDisplayedRGBA()

    this._progressBarRenderer.setAnchorPoint(p(0, 0.5))
    const tz = this._progressBarRenderer.getContentSize()
    this._progressBarTextureSize = { width: tz.width, height: tz.height }
    this._progressBarRendererDirty = true
    this._findLayout()
  }

  /**
   * Sets if slider is using scale9 renderer.
   * @param {Boolean} able
   */
  setScale9Enabled(able: boolean) {
    //todo use setScale9Enabled
    if (this._scale9Enabled === able) return

    this._scale9Enabled = able
    this.removeProtectedChild(this._barRenderer, true)
    this.removeProtectedChild(this._progressBarRenderer, true)

    if (this._scale9Enabled) {
      this._barRenderer = new Scale9Sprite()
      this._progressBarRenderer = new Scale9Sprite()
    } else {
      this._barRenderer = new Sprite()
      this._progressBarRenderer = new Sprite()
    }
    this.loadBarTexture(this._textureFile, this._barTexType)
    this.loadProgressBarTexture(this._progressBarTextureFile, this._progressBarTexType)
    this.addProtectedChild(this._barRenderer, Slider.BASEBAR_RENDERER_ZORDER, -1)
    this.addProtectedChild(this._progressBarRenderer, Slider.PROGRESSBAR_RENDERER_ZORDER, -1)
    if (this._scale9Enabled) {
      const ignoreBefore = this._ignoreSize
      this.ignoreContentAdaptWithSize(false)
      this._prevIgnoreSize = ignoreBefore
    } else {
      this.ignoreContentAdaptWithSize(this._prevIgnoreSize)
    }
    this.setCapInsetsBarRenderer(this._capInsetsBarRenderer)
    this.setCapInsetProgressBarRenderer(this._capInsetsProgressBarRenderer)
    this._barRendererAdaptDirty = true
    this._progressBarRendererDirty = true
  }

  /**
   * Returns slider is using scale9 renderer or not.
   * @returns {Boolean}
   */
  isScale9Enabled() {
    return this._scale9Enabled
  }

  /**
   * override "ignoreContentAdaptWithSize" method of widget.
   * @param {Boolean} ignore
   */
  ignoreContentAdaptWithSize(ignore: boolean) {
    if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
      super.ignoreContentAdaptWithSize(ignore)
      this._prevIgnoreSize = ignore
    }
  }

  /**
   * Sets capinsets for slider, if slider is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsets(capInsets: any) {
    this.setCapInsetsBarRenderer(capInsets)
    this.setCapInsetProgressBarRenderer(capInsets)
  }

  /**
   * Sets capinsets for slider's renderer, if slider is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsetsBarRenderer(capInsets: any): any {
    if (!capInsets) return
    const locInsets = this._capInsetsBarRenderer
    locInsets.x = capInsets.x
    locInsets.y = capInsets.y
    locInsets.width = capInsets.width
    locInsets.height = capInsets.height
    if (!this._scale9Enabled) return
    this._barRenderer.setCapInsets(capInsets)
  }

  /**
   * Returns cap insets for slider.
   * @returns {Rect}
   */
  getCapInsetsBarRenderer(): any {
    return Rect(this._capInsetsBarRenderer)
  }

  /**
   * Sets capinsets of ProgressBar for slider, if slider is using scale9 renderer.
   * @param {Rect} capInsets
   */
  setCapInsetProgressBarRenderer(capInsets: any): any {
    if (!capInsets) return
    const locInsets = this._capInsetsProgressBarRenderer
    locInsets.x = capInsets.x
    locInsets.y = capInsets.y
    locInsets.width = capInsets.width
    locInsets.height = capInsets.height
    if (!this._scale9Enabled) return
    this._progressBarRenderer.setCapInsets(capInsets)
  }

  /**
   * Returns cap insets of ProgressBar for slider.
   * @returns {Rect}
   */
  getCapInsetsProgressBarRenderer() {
    return Rect(this._capInsetsProgressBarRenderer)
  }

  /**
   * Loads textures for slider ball.
   * @param {String} normal
   * @param {String} pressed
   * @param {String} disabled
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadSlidBallTextures(normal: string, pressed?: string, disabled?: string, texType?: number) {
    this.loadSlidBallTextureNormal(normal, texType)
    this.loadSlidBallTexturePressed(pressed, texType)
    this.loadSlidBallTextureDisabled(disabled, texType)
  }

  /**
   * Loads normal state texture for slider ball.
   * @param {String} normal
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadSlidBallTextureNormal(normal: string, texType?: number) {
    if (!normal) {
      return
    }
    texType = texType || Widget.LOCAL_TEXTURE
    this._slidBallNormalTextureFile = normal
    this._ballNTexType = texType

    if (!this._slidBallNormalRenderer._textureLoaded) {
      this._slidBallNormalRenderer.addEventListener('load', () => {
        this.loadSlidBallTextureNormal(this._slidBallNormalTextureFile, this._ballNTexType)
      })
    }

    switch (this._ballNTexType) {
      case Widget.LOCAL_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallNormalRenderer.initWithFile(normal)
        break
      case Widget.PLIST_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallNormalRenderer.initWithSpriteFrameName(normal)
        break
      default:
        break
    }
    this._updateChildrenDisplayedRGBA()
    this._findLayout()
  }

  /**
   * Loads selected state texture for slider ball.
   * @param {String} pressed
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadSlidBallTexturePressed(pressed: string, texType?: number) {
    if (!pressed) {
      return
    }
    texType = texType || Widget.LOCAL_TEXTURE
    this._slidBallPressedTextureFile = pressed
    this._ballPTexType = texType

    if (!this._slidBallPressedRenderer._textureLoaded) {
      this._slidBallPressedRenderer.addEventListener('load', () => {
        this.loadSlidBallTexturePressed(this._slidBallPressedTextureFile, this._ballPTexType)
      })
    }

    switch (this._ballPTexType) {
      case Widget.LOCAL_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallPressedRenderer.initWithFile(pressed)
        break
      case Widget.PLIST_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallPressedRenderer.initWithSpriteFrameName(pressed)
        break
      default:
        break
    }
    this._updateChildrenDisplayedRGBA()
    this._findLayout()
  }

  /**
   * Load dark state texture for slider ball.
   * @param {String} disabled
   * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
   */
  loadSlidBallTextureDisabled(disabled: string, texType?: number) {
    if (!disabled) {
      return
    }
    texType = texType || Widget.LOCAL_TEXTURE
    this._slidBallDisabledTextureFile = disabled
    this._ballDTexType = texType

    if (!this._slidBallDisabledRenderer._textureLoaded) {
      this._slidBallDisabledRenderer.addEventListener('load', () => {
        this.loadSlidBallTextureDisabled(this._slidBallDisabledTextureFile, this._ballDTexType)
      })
    }

    switch (this._ballDTexType) {
      case Widget.LOCAL_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallDisabledRenderer.initWithFile(disabled)
        break
      case Widget.PLIST_TEXTURE:
        //SetTexture cannot load resource
        this._slidBallDisabledRenderer.initWithSpriteFrameName(disabled)
        break
      default:
        break
    }
    this._updateChildrenDisplayedRGBA()
    this._findLayout()
  }

  /**
   * Changes the progress direction of slider.
   * @param {number} percent
   */
  setPercent(percent: number) {
    if (percent > 100) percent = 100
    if (percent < 0) percent = 0
    this._percent = percent
    const res = percent / 100.0
    const dis = this._barLength * res
    this._slidBallRenderer.setPosition(dis, this._contentSize.height / 2)
    if (this._scale9Enabled) this._progressBarRenderer.setPreferredSize(Size(dis, this._contentSize.height))
    else {
      const spriteRenderer = this._progressBarRenderer
      const rc = spriteRenderer.getTextureRect()
      spriteRenderer.setTextureRect(Rect(rc.x, rc.y, dis / spriteRenderer._scaleX, rc.height), spriteRenderer.isTextureRectRotated())
    }
  }

  /**
   * test the point whether location in loadingBar's bounding box.
   * @override
   * @param {Point} pt
   * @returns {boolean}
   */
  hitTest(pt: any) {
    const nsp = this._slidBallNormalRenderer.convertToNodeSpace(pt)
    const ballSize = this._slidBallNormalRenderer.getContentSize()
    const ballRect = Rect(0, 0, ballSize.width, ballSize.height)
    return nsp.x >= ballRect.x && nsp.x <= ballRect.x + ballRect.width && nsp.y >= ballRect.y && nsp.y <= ballRect.y + ballRect.height
  }

  onTouchBegan(touch: any, event: any) {
    const pass = super.onTouchBegan(touch, event)
    if (this._hit) {
      const nsp = this.convertToNodeSpace(this._touchBeganPosition)
      this.setPercent(this._getPercentWithBallPos(nsp.x))
      this._percentChangedEvent()
    }
    return pass
  }

  onTouchMoved(touch: any, event: any) {
    const touchPoint = touch.getLocation()
    const nsp = this.convertToNodeSpace(touchPoint)
    this.setPercent(this._getPercentWithBallPos(nsp.x))
    this._percentChangedEvent()
  }

  onTouchEnded(touch: any, event: any) {
    super.onTouchEnded(touch, event)
  }

  // onTouchCancelled(touch, event): any {
  //   super.onTouchCancelled(touch, event)
  // }

  /**
   * Returns percent with ball's position.
   * @param {Point} px
   * @returns {number}
   */
  _getPercentWithBallPos(px) {
    return (px / this._barLength) * 100
  }

  /**
   * add event listener
   * @param {Function} selector
   * @param {Object} [target=]
   * @deprecated since v3.0, please use addEventListener instead.
   */
  addEventListenerSlider(selector, target) {
    this.addEventListener(selector, target)
  }

  /**
   * Adds a callback
   * @param {Function} selector
   * @param {Object} [target=]
   */
  addEventListener(selector, target) {
    this._sliderEventSelector = selector //when target is undefined, _sliderEventSelector = _eventCallback
    this._sliderEventListener = target
  }

  _percentChangedEvent() {
    if (this._sliderEventSelector) {
      if (this._sliderEventListener) this._sliderEventSelector.call(this._sliderEventListener, this, Slider.EVENT_PERCENT_CHANGED)
      else this._sliderEventSelector(this, Slider.EVENT_PERCENT_CHANGED) // _eventCallback
    }
    if (this._ccEventCallback) this._ccEventCallback(this, Slider.EVENT_PERCENT_CHANGED)
  }

  /**
   * Gets the progress direction of slider.
   * @returns {number}
   */
  getPercent() {
    return this._percent
  }

  _onSizeChanged() {
    super._onSizeChanged()
    this._barRendererAdaptDirty = true
    this._progressBarRendererDirty = true
  }

  _adaptRenderers() {
    if (this._barRendererAdaptDirty) {
      this._barRendererScaleChangedWithSize()
      this._barRendererAdaptDirty = false
    }
    if (this._progressBarRendererDirty) {
      this._progressBarRendererScaleChangedWithSize()
      this._progressBarRendererDirty = false
    }
  }

  /**
   * Returns the content size of bar renderer.
   * @returns {Size}
   */
  getVirtualRendererSize() {
    return this._barRenderer.getContentSize()
  }

  /**
   * Returns the bar renderer.
   * @returns {Node}
   */
  getVirtualRenderer() {
    return this._barRenderer
  }

  _barRendererScaleChangedWithSize() {
    if (this._unifySize) {
      this._barLength = this._contentSize.width
      this._barRenderer.setPreferredSize(this._contentSize)
    } else if (this._ignoreSize) {
      this._barRenderer.setScale(1.0)
      this._barLength = this._contentSize.width
    } else {
      this._barLength = this._contentSize.width
      if (this._scale9Enabled) {
        this._barRenderer.setPreferredSize(this._contentSize)
        this._barRenderer.setScale(1.0)
      } else {
        const btextureSize = this._barTextureSize
        if (btextureSize.width <= 0.0 || btextureSize.height <= 0.0) {
          this._barRenderer.setScale(1.0)
        } else {
          const bscaleX = this._contentSize.width / btextureSize.width
          const bscaleY = this._contentSize.height / btextureSize.height
          this._barRenderer.setScaleX(bscaleX)
          this._barRenderer.setScaleY(bscaleY)
        }
      }
    }
    this._barRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0)
    this.setPercent(this._percent)
  }

  _progressBarRendererScaleChangedWithSize(): any {
    if (this._unifySize) {
      this._progressBarRenderer.setPreferredSize(this._contentSize)
    } else if (this._ignoreSize) {
      if (!this._scale9Enabled) {
        const ptextureSize = this._progressBarTextureSize
        const pscaleX = this._contentSize.width / ptextureSize.width
        const pscaleY = this._contentSize.height / ptextureSize.height
        this._progressBarRenderer.setScaleX(pscaleX)
        this._progressBarRenderer.setScaleY(pscaleY)
      }
    } else {
      if (this._scale9Enabled) {
        this._progressBarRenderer.setPreferredSize(this._contentSize)
        this._progressBarRenderer.setScale(1)
      } else {
        const ptextureSize = this._progressBarTextureSize
        if (ptextureSize.width <= 0.0 || ptextureSize.height <= 0.0) {
          this._progressBarRenderer.setScale(1.0)
          return
        }
        const pscaleX = this._contentSize.width / ptextureSize.width
        const pscaleY = this._contentSize.height / ptextureSize.height
        this._progressBarRenderer.setScaleX(pscaleX)
        this._progressBarRenderer.setScaleY(pscaleY)
      }
    }
    this._progressBarRenderer.setPosition(0.0, this._contentSize.height / 2.0)
    this.setPercent(this._percent)
  }

  _onPressStateChangedToNormal(): any {
    this._slidBallNormalRenderer.setVisible(true)
    this._slidBallPressedRenderer.setVisible(false)
    this._slidBallDisabledRenderer.setVisible(false)

    this._slidBallNormalRenderer.setScale(this._sliderBallNormalTextureScaleX, this._sliderBallNormalTextureScaleY)
    if (_renderType === game.RENDER_TYPE_WEBGL) {
      this._slidBallNormalRenderer._renderCmd._shaderProgram = this._getNormalGLProgram()
    } else {
      // TODO: add canvas support
    }
  }

  _onPressStateChangedToPressed(): any {
    if (!this._slidBallPressedTextureFile) {
      this._slidBallNormalRenderer.setScale(
        this._sliderBallNormalTextureScaleX + this._zoomScale,
        this._sliderBallNormalTextureScaleY + this._zoomScale,
      )
    } else {
      this._slidBallNormalRenderer.setVisible(false)
      this._slidBallPressedRenderer.setVisible(true)
      this._slidBallDisabledRenderer.setVisible(false)
    }
    if (_renderType === game.RENDER_TYPE_WEBGL) {
      this._slidBallNormalRenderer._renderCmd._shaderProgram = this._getNormalGLProgram()
    } else {
      // TODO: add canvas support
    }
  }

  _onPressStateChangedToDisabled(): any {
    if (this._slidBallDisabledTextureFile) {
      this._slidBallNormalRenderer.setVisible(false)
      this._slidBallDisabledRenderer.setVisible(true)
    } else {
      this._slidBallNormalRenderer.setVisible(true)
      this._slidBallNormalRenderer._renderCmd._shaderProgram = this._getGrayGLProgram()
    }
    this._slidBallNormalRenderer.setScale(this._sliderBallNormalTextureScaleX, this._sliderBallNormalTextureScaleY)
    this._slidBallPressedRenderer.setVisible(false)
  }

  setZoomScale(scale) {
    this._zoomScale = scale
  }

  getZoomScale() {
    return this._zoomScale
  }

  getSlidBallNormalRenderer() {
    return this._slidBallNormalRenderer
  }

  getSlidBallPressedRenderer() {
    return this._slidBallPressedRenderer
  }

  getSlidBallDisabledRenderer() {
    return this._slidBallDisabledRenderer
  }

  getSlidBallRenderer() {
    return this._slidBallRenderer
  }

  /**
   * Returns the "class name" of LoadingBar.
   * @returns {string}
   */
  getDescription() {
    return 'Slider'
  }

  _createCloneInstance() {
    return new Slider()
  }

  _copySpecialProperties(slider) {
    this._prevIgnoreSize = slider._prevIgnoreSize
    this.setScale9Enabled(slider._scale9Enabled)
    this.loadBarTexture(slider._textureFile, slider._barTexType)
    this.loadProgressBarTexture(slider._progressBarTextureFile, slider._progressBarTexType)
    this.loadSlidBallTextureNormal(slider._slidBallNormalTextureFile, slider._ballNTexType)
    this.loadSlidBallTexturePressed(slider._slidBallPressedTextureFile, slider._ballPTexType)
    this.loadSlidBallTextureDisabled(slider._slidBallDisabledTextureFile, slider._ballDTexType)
    this.setPercent(slider.getPercent())
    this._sliderEventListener = slider._sliderEventListener
    this._sliderEventSelector = slider._sliderEventSelector
    this._zoomScale = slider._zoomScale
    this._ccEventCallback = slider._ccEventCallback
  }

  /**
   * The percent change event flag of Slider.
   * @constant
   * @type {number}
   */
  static EVENT_PERCENT_CHANGED = 0

  //Render zorder
  /**
   * The zOrder value of Slider's base bar renderer.
   * @constant
   * @type {number}
   */
  static BASEBAR_RENDERER_ZORDER = -3
  /**
   * The zOrder value of Slider's progress bar renderer.
   * @constant
   * @type {number}
   */
  static PROGRESSBAR_RENDERER_ZORDER = -2
  /**
   * The zOrder value of Slider's ball renderer.
   * @constant
   * @type {number}
   */
  static BALL_RENDERER_ZORDER = -1
}
