import { game } from '../..'
import { Sprite } from '../../core'
import { p, rect, size } from '../../core/cocoa/Geometry'
import { defineGetterSetter } from '../../core/sprites/SpritesPropertyDefine'
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
  _barRenderer: any = null
  _progressBarRenderer: any = null
  _barTextureSize: any = null
  _progressBarTextureSize: any = null
  _slidBallNormalRenderer: any = null
  _slidBallPressedRenderer: any = null
  _slidBallDisabledRenderer: any = null
  _slidBallRenderer: any = null
  _barLength: number = 0
  _percent: number = 0
  _scale9Enabled: boolean = false
  _prevIgnoreSize: boolean = true
  _textureFile: string = ''
  _progressBarTextureFile: string = ''
  _slidBallNormalTextureFile: string = ''
  _slidBallPressedTextureFile: string = ''
  _slidBallDisabledTextureFile: string = ''
  _capInsetsBarRenderer: any = null
  _capInsetsProgressBarRenderer: any = null
  _sliderEventListener: any = null
  _sliderEventSelector: any = null
  _barTexType: number = Widget.LOCAL_TEXTURE
  _progressBarTexType: number = Widget.LOCAL_TEXTURE
  _ballNTexType: number = Widget.LOCAL_TEXTURE
  _ballPTexType: number = Widget.LOCAL_TEXTURE
  _ballDTexType: number = Widget.LOCAL_TEXTURE
  _isTextureLoaded: boolean = false
  _className: string = 'Slider'
  _barRendererAdaptDirty: boolean = true
  _progressBarRendererDirty: boolean = true
  _unifySize: boolean = false
  _zoomScale: number = 0.1

  _sliderBallNormalTextureScaleX: number = 1
  _sliderBallNormalTextureScaleY: number = 1

  /**
   * allocates and initializes a UISlider.
   * Constructor of Slider. override it to extend the construction behavior, remember to call "super()" in the extended constructor.
   * @example
   * // example
   * var uiSlider = new Slider();
   */
  constructor(barTextureName?: string, normalBallTextureName?: string, resType?: number) {
      this._barTextureSize = size(0, 0)
      this._progressBarTextureSize = size(0, 0)
      this._capInsetsBarRenderer = rect(0, 0, 0, 0)
      this._capInsetsProgressBarRenderer = rect(0, 0, 0, 0)
      super()

      resType = resType || 0
      this.setTouchEnabled(true)
      if (barTextureName) {
        this.loadBarTexture(barTextureName, resType)
      }
      if (normalBallTextureName) {
        this.loadSlidBallTextures(normalBallTextureName, resType)
      }
    }

    _initRenderer(): any {
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
    loadBarTexture(fileName: string, texType?: number): any {
      if (!fileName) {
        return
      }
      texType = texType || Widget.LOCAL_TEXTURE
      this._textureFile = fileName
      this._barTexType = texType
      const barRenderer = this._barRenderer

      const self = this
      if (!barRenderer._textureLoaded) {
        barRenderer.addEventListener('load', function () {
          self.loadBarTexture(self._textureFile, self._barTexType)
}
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
    loadProgressBarTexture(fileName: string, texType?: number): any {
      if (!fileName) {
        return
      }
      texType = texType || Widget.LOCAL_TEXTURE
      this._progressBarTextureFile = fileName
      this._progressBarTexType = texType
      const progressBarRenderer = this._progressBarRenderer

      const self = this
      if (!progressBarRenderer._textureLoaded) {
        progressBarRenderer.addEventListener('load', function () {
          self.loadProgressBarTexture(self._progressBarTextureFile, self._progressBarTexType)
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
    setScale9Enabled(able: boolean): any {
      //todo use setScale9Enabled
      if (this._scale9Enabled === able) return

      this._scale9Enabled = able
      this.removeProtectedChild(this._barRenderer, true)
      this.removeProtectedChild(this._progressBarRenderer, true)
      this._barRenderer = null
      this._progressBarRenderer = null
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
    isScale9Enabled(): any {
      return this._scale9Enabled
    }

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize(ignore: boolean): any {
      if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
        super.ignoreContentAdaptWithSize(, ignore)
        this._prevIgnoreSize = ignore
      }
    }

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {Rect} capInsets
     */
    setCapInsets(capInsets: any): any {
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
      return rect(this._capInsetsBarRenderer)
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
    getCapInsetsProgressBarRenderer(): any {
      return rect(this._capInsetsProgressBarRenderer)
    }

    /**
     * Loads textures for slider ball.
     * @param {String} normal
     * @param {String} pressed
     * @param {String} disabled
     * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextures(normal: string, pressed?: string, disabled?: string, texType?: number): any {
      this.loadSlidBallTextureNormal(normal, texType)
      this.loadSlidBallTexturePressed(pressed, texType)
      this.loadSlidBallTextureDisabled(disabled, texType)
    }

    /**
     * Loads normal state texture for slider ball.
     * @param {String} normal
     * @param {Widget.LOCAL_TEXTURE|Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextureNormal(normal: string, texType?: number): any {
      if (!normal) {
        return
      }
      texType = texType || Widget.LOCAL_TEXTURE
      this._slidBallNormalTextureFile = normal
      this._ballNTexType = texType

      const self = this
      if (!this._slidBallNormalRenderer._textureLoaded) {
        this._slidBallNormalRenderer.addEventListener('load', function () {
          self.loadSlidBallTextureNormal(self._slidBallNormalTextureFile, self._ballNTexType)
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
    loadSlidBallTexturePressed(pressed: string, texType?: number): any {
      if (!pressed) {
        return
      }
      texType = texType || Widget.LOCAL_TEXTURE
      this._slidBallPressedTextureFile = pressed
      this._ballPTexType = texType

      const self = this
      if (!this._slidBallPressedRenderer._textureLoaded) {
        this._slidBallPressedRenderer.addEventListener('load', function () {
          self.loadSlidBallTexturePressed(self._slidBallPressedTextureFile, self._ballPTexType)
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
    loadSlidBallTextureDisabled(disabled: string, texType?: number): any {
      if (!disabled) {
        return
      }
      texType = texType || Widget.LOCAL_TEXTURE
      this._slidBallDisabledTextureFile = disabled
      this._ballDTexType = texType

      const self = this
      if (!this._slidBallDisabledRenderer._textureLoaded) {
        this._slidBallDisabledRenderer.addEventListener('load', function () {
          self.loadSlidBallTextureDisabled(self._slidBallDisabledTextureFile, self._ballDTexType)
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
    setPercent(percent: number): any {
      if (percent > 100) percent = 100
      if (percent < 0) percent = 0
      this._percent = percent
      const res = percent / 100.0
      const dis = this._barLength * res
      this._slidBallRenderer.setPosition(dis, this._contentSize.height / 2)
      if (this._scale9Enabled) this._progressBarRenderer.setPreferredSize(size(dis, this._contentSize.height))
      else {
        const spriteRenderer = this._progressBarRenderer
        const rect = spriteRenderer.getTextureRect()
        spriteRenderer.setTextureRect(
          rect(rect.x, rect.y, dis / spriteRenderer._scaleX, rect.height),
          spriteRenderer.isTextureRectRotated(),
        )
      }
    }

    /**
     * test the point whether location in loadingBar's bounding box.
     * @override
     * @param {Point} pt
     * @returns {boolean}
     */
    hitTest(pt: any): any {
      const nsp = this._slidBallNormalRenderer.convertToNodeSpace(pt)
      const ballSize = this._slidBallNormalRenderer.getContentSize()
      const ballRect = rect(0, 0, ballSize.width, ballSize.height)
      return nsp.x >= ballRect.x && nsp.x <= ballRect.x + ballRect.width && nsp.y >= ballRect.y && nsp.y <= ballRect.y + ballRect.height
    }

    onTouchBegan(touch: any, event: any): any {
      const pass = super.onTouchBegan(, touch, event)
      if (this._hit) {
        const nsp = this.convertToNodeSpace(this._touchBeganPosition)
        this.setPercent(this._getPercentWithBallPos(nsp.x))
        this._percentChangedEvent()
      }
      return pass
    }

    onTouchMoved(touch: any, event: any): any {
      const touchPoint = touch.getLocation()
      const nsp = this.convertToNodeSpace(touchPoint)
      this.setPercent(this._getPercentWithBallPos(nsp.x))
      this._percentChangedEvent()
    }

    onTouchEnded(touch: any, event: any): any {
      super.onTouchEnded(, touch, event)
    }

    onTouchCancelled(touch, event): any {
      super.onTouchCancelled(, touch, event)
    }

    /**
     * Returns percent with ball's position.
     * @param {Point} px
     * @returns {number}
     */
    _getPercentWithBallPos(px): any {
      return (px / this._barLength) * 100
    }

    /**
     * add event listener
     * @param {Function} selector
     * @param {Object} [target=]
     * @deprecated since v3.0, please use addEventListener instead.
     */
    addEventListenerSlider(selector, target): any {
      this.addEventListener(selector, target)
    }

    /**
     * Adds a callback
     * @param {Function} selector
     * @param {Object} [target=]
     */
    addEventListener(selector, target): any {
      this._sliderEventSelector = selector //when target is undefined, _sliderEventSelector = _eventCallback
      this._sliderEventListener = target
    }

    _percentChangedEvent(): any {
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
    getPercent(): any {
      return this._percent
    }

    _onSizeChanged(): any {
      super._onSizeChanged()
      this._barRendererAdaptDirty = true
      this._progressBarRendererDirty = true
    }

    _adaptRenderers(): any {
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
    getVirtualRendererSize(): any {
      return this._barRenderer.getContentSize()
    }

    /**
     * Returns the bar renderer.
     * @returns {Node}
     */
    getVirtualRenderer(): any {
      return this._barRenderer
    }

    _barRendererScaleChangedWithSize(): any {
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
          var ptextureSize = this._progressBarTextureSize
          var pscaleX = this._contentSize.width / ptextureSize.width
          var pscaleY = this._contentSize.height / ptextureSize.height
          this._progressBarRenderer.setScaleX(pscaleX)
          this._progressBarRenderer.setScaleY(pscaleY)
        }
      } else {
        if (this._scale9Enabled) {
          this._progressBarRenderer.setPreferredSize(this._contentSize)
          this._progressBarRenderer.setScale(1)
        } else {
          var ptextureSize = this._progressBarTextureSize
          if (ptextureSize.width <= 0.0 || ptextureSize.height <= 0.0) {
            this._progressBarRenderer.setScale(1.0)
            return
          }
          var pscaleX = this._contentSize.width / ptextureSize.width
          var pscaleY = this._contentSize.height / ptextureSize.height
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
        if (_renderType === game.RENDER_TYPE_WEBGL) {
          this._slidBallNormalRenderer._renderCmd._shaderProgram = this._getGrayGLProgram()
        } else {
          // TODO: add canvas support
        }
      }
      this._slidBallNormalRenderer.setScale(this._sliderBallNormalTextureScaleX, this._sliderBallNormalTextureScaleY)
      this._slidBallPressedRenderer.setVisible(false)
    }

    setZoomScale(scale): any {
      this._zoomScale = scale
    }

    getZoomScale(): any {
      return this._zoomScale
    }

    getSlidBallNormalRenderer(): any {
      return this._slidBallNormalRenderer
    }

    getSlidBallPressedRenderer(): any {
      return this._slidBallPressedRenderer
    }

    getSlidBallDisabledRenderer(): any {
      return this._slidBallDisabledRenderer
    }

    getSlidBallRenderer(): any {
      return this._slidBallRenderer
    }

    /**
     * Returns the "class name" of LoadingBar.
     * @returns {string}
     */
    getDescription(): any {
      return 'Slider'
    }

    _createCloneInstance(): any {
      return new Slider()
    }

    _copySpecialProperties(slider): any {
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
     * allocates and initializes a UISlider.
     * @deprecated since v3.0, please use new Slider() instead.
     * @return {Slider}
     */
    static create(barTextureName?: string, normalBallTextureName?: string, resType?: number): Slider {
      return new Slider(barTextureName, normalBallTextureName, resType)
    }
  }

// Extended properties with getter/setter
Object.defineProperty(Slider.prototype, 'percent', {
  get: function () {
    return this.getPercent()
  },
  set: function (val) {
    this.setPercent(val)
  },
})

// Constant
//Slider event type
/**
 * The percent change event flag of Slider.
 * @constant
 * @type {number}
 */
Slider.EVENT_PERCENT_CHANGED = 0

//Render zorder
/**
 * The zOrder value of Slider's base bar renderer.
 * @constant
 * @type {number}
 */
Slider.BASEBAR_RENDERER_ZORDER = -3
/**
 * The zOrder value of Slider's progress bar renderer.
 * @constant
 * @type {number}
 */
Slider.PROGRESSBAR_RENDERER_ZORDER = -2
/**
 * The zOrder value of Slider's ball renderer.
 * @constant
 * @type {number}
 */
Slider.BALL_RENDERER_ZORDER = -1
