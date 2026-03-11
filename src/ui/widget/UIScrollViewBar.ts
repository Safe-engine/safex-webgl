import { p } from '../../core/cocoa/Geometry'
import { color } from '../../core/platform'
import { ProtectedNode } from '../base/ProtectedNode'
import { helper } from '../base/UIHelper'
import { ScrollView } from './UIScrollView'

export class ScrollViewBar extends ProtectedNode {
  _parentScroll: any = null
  _direction: number | null = null

  _upperHalfCircle: any = null
  _lowerHalfCircle: any = null
  _body: any = null

  _opacity = 255

  _marginFromBoundary = 0
  _marginForLength = 0

  _touching = false

  _autoHideEnabled = true
  autoHideTime = 0
  _autoHideRemainingTime = 0

  _className = 'ScrollViewBar'

  // static constants (declared here for TypeScript)
  static DEFAULT_COLOR: any
  static DEFAULT_MARGIN: number
  static DEFAULT_AUTO_HIDE_TIME: number
  static DEFAULT_SCROLLBAR_OPACITY: number
  static HALF_CIRCLE_IMAGE_KEY: string
  static HALF_CIRCLE_IMAGE: string
  static BODY_IMAGE_1_PIXEL_HEIGHT_KEY: string
  static BODY_IMAGE_1_PIXEL_HEIGHT: string

  /**
   * Allocates and initializes a UIScrollViewBar.
   * Constructor of ScrollViewBar. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {ScrollView} parent A parent of scroll bar.
   * @param {ScrollView.DIR_NONE | ScrollView.DIR_HORIZONTAL | ScrollView.DIR_VERTICAL | ScrollView.DIR_BOTH} direction
   */
  constructor(parent: any, direction: number) {
    super()
    this._direction = direction
    this._parentScroll = parent

    this._marginFromBoundary = ScrollViewBar.DEFAULT_MARGIN
    this._marginForLength = ScrollViewBar.DEFAULT_MARGIN
    this.opacity = 255 * ScrollViewBar.DEFAULT_SCROLLBAR_OPACITY
    this.autoHideTime = ScrollViewBar.DEFAULT_AUTO_HIDE_TIME
    this._autoHideEnabled = true

    this.init()

    this.setCascadeColorEnabled(true)
    this.setCascadeOpacityEnabled(true)
  }

  /**
   * Initializes a ScrollViewBar. Please do not call this function by yourself, you should pass the parameters to constructor to initialize it.
   * @returns {boolean}
   */
  init(): boolean {
    this._upperHalfCircle = helper._createSpriteFromBase64(ScrollViewBar.HALF_CIRCLE_IMAGE, ScrollViewBar.HALF_CIRCLE_IMAGE_KEY)
    this._upperHalfCircle.setAnchorPoint(p(0.5, 0))

    this._lowerHalfCircle = helper._createSpriteFromBase64(ScrollViewBar.HALF_CIRCLE_IMAGE, ScrollViewBar.HALF_CIRCLE_IMAGE_KEY)
    this._lowerHalfCircle.setAnchorPoint(p(0.5, 0))
    this._lowerHalfCircle.setScaleY(-1)

    this.addProtectedChild(this._upperHalfCircle)
    this.addProtectedChild(this._lowerHalfCircle)

    this._body = helper._createSpriteFromBase64(ScrollViewBar.BODY_IMAGE_1_PIXEL_HEIGHT, ScrollViewBar.BODY_IMAGE_1_PIXEL_HEIGHT_KEY)
    this._body.setAnchorPoint(p(0.5, 0))
    this.addProtectedChild(this._body)

    this.setColor(ScrollViewBar.DEFAULT_COLOR)
    this.onScrolled(p(0, 0))
    ProtectedNode.prototype.setOpacity.call(this, 0)
    this._autoHideRemainingTime = 0

    if (this._direction === ScrollView.DIR_HORIZONTAL) {
      this.setRotation(90)
    }
    return true
  }

  onEnter() {
    super.onEnter()
    this.scheduleUpdate()
  }

  /**
   * Set the scroll bar position from the left-bottom corner (horizontal) or right-top corner (vertical).
   * @param {Point} positionFromCorner The position from the left-bottom corner (horizontal) or right-top corner (vertical).
   */
  setPositionFromCorner(positionFromCorner: any) {
    if (this._direction === ScrollView.DIR_VERTICAL) {
      this._marginForLength = positionFromCorner.y
      this._marginFromBoundary = positionFromCorner.x
    } else {
      this._marginForLength = positionFromCorner.x
      this._marginFromBoundary = positionFromCorner.y
    }
  }

  /**
   * Get the scroll bar position from the left-bottom corner (horizontal) or right-top corner (vertical).
   * @returns {Point}
   */
  getPositionFromCorner(): any {
    if (this._direction === ScrollView.DIR_VERTICAL) {
      return p(this._marginFromBoundary, this._marginForLength)
    } else {
      return p(this._marginForLength, this._marginFromBoundary)
    }
  }

  /**
   * Set the scroll bar's width
   * @param {number} width The scroll bar's width
   */
  setWidth(width: number) {
    const scale = width / this._body.width
    this._body.setScaleX(scale)
    this._upperHalfCircle.setScale(scale)
    this._lowerHalfCircle.setScale(-scale)
  }

  /**
   * Get the scroll bar's width
   * @returns {number} the scroll bar's width
   */
  getWidth(): number {
    return this._body.getBoundingBox().width
  }

  /**
   * Set scroll bar auto hide state
   * @param {boolean} autoHideEnabled scroll bar auto hide state
   */
  setAutoHideEnabled(autoHideEnabled: boolean) {
    this._autoHideEnabled = autoHideEnabled

    if (!this._autoHideEnabled && !this._touching && this._autoHideRemainingTime <= 0)
      ProtectedNode.prototype.setOpacity.call(this, this.opacity)
    else ProtectedNode.prototype.setOpacity.call(this, 0)
  }

  /**
   * Query scroll bar auto hide state
   * @returns {boolean} True if scroll bar auto hide is enabled, false otherwise.
   */
  isAutoHideEnabled(): boolean {
    return this._autoHideEnabled
  }

  /**
   * Set scroll bar opacity
   * @param {number} opacity scroll bar opacity
   */
  setOpacity(opacity: number) {
    this._opacity = opacity
  }

  /**
   * Get scroll bar opacity
   * @returns {number}
   */
  getOpacity(): number {
    return this._opacity
  }

  _updateLength(length: number) {
    const ratio = length / this._body.getTextureRect().height
    this._body.setScaleY(ratio)
    this._upperHalfCircle.setPositionY(this._body.getPositionY() + length)
  }

  _processAutoHide(dt: number) {
    if (!this._autoHideEnabled || this._autoHideRemainingTime <= 0) {
      return
    } else if (this._touching) {
      // If it is touching, don'"t auto hide.
      return
    }

    this._autoHideRemainingTime -= dt
    if (this._autoHideRemainingTime <= this.autoHideTime) {
      this._autoHideRemainingTime = Math.max(0, this._autoHideRemainingTime)
      ProtectedNode.prototype.setOpacity.call(this, this._opacity * (this._autoHideRemainingTime / this.autoHideTime))
    }
  }

  update(dt: number) {
    this._processAutoHide(dt)
  }

  /**
   * This is called by parent ScrollView when a touch is began. Don'"t call this directly.
   */
  onTouchBegan() {
    if (!this._autoHideEnabled) {
      return
    }
    this._touching = true
  }

  /**
   * This is called by parent ScrollView when a touch is ended. Don'"t call this directly.
   */
  onTouchEnded() {
    if (!this._autoHideEnabled) {
      return
    }
    this._touching = false

    if (this._autoHideRemainingTime <= 0) {
      // If the remaining time is 0, it means that it didn'"t moved after touch started so scroll bar is not showing.
      return
    }
    this._autoHideRemainingTime = this.autoHideTime
  }

  /**
   * @brief This is called by parent ScrollView when the parent is scrolled. Don'"t call this directly.
   *
   * @param {Point} outOfBoundary amount how much the inner container of ScrollView is out of boundary
   */
  onScrolled(outOfBoundary: any) {
    if (this._autoHideEnabled) {
      this._autoHideRemainingTime = this.autoHideTime
      ProtectedNode.prototype.setOpacity.call(this, this.opacity)
    }

    const innerContainer = this._parentScroll.getInnerContainer()

    let innerContainerMeasure = 0
    let scrollViewMeasure = 0
    let outOfBoundaryValue = 0
    let innerContainerPosition = 0

    if (this._direction === ScrollView.DIR_VERTICAL) {
      innerContainerMeasure = innerContainer.height
      scrollViewMeasure = this._parentScroll.height
      outOfBoundaryValue = outOfBoundary.y
      innerContainerPosition = -innerContainer.getPositionY()
    } else if (this._direction === ScrollView.DIR_HORIZONTAL) {
      innerContainerMeasure = innerContainer.width
      scrollViewMeasure = this._parentScroll.width
      outOfBoundaryValue = outOfBoundary.x
      innerContainerPosition = -innerContainer.getPositionX()
    }

    const length = this._calculateLength(innerContainerMeasure, scrollViewMeasure, outOfBoundaryValue)
    const position = this._calculatePosition(innerContainerMeasure, scrollViewMeasure, innerContainerPosition, outOfBoundaryValue, length)
    this._updateLength(length)
    this.setPosition(position)
  }

  _calculateLength(innerContainerMeasure: number, scrollViewMeasure: number, outOfBoundaryValue: number): number {
    let denominatorValue = innerContainerMeasure
    if (outOfBoundaryValue !== 0) {
      // If it is out of boundary, the length of scroll bar gets shorter quickly.
      const GETTING_SHORTER_FACTOR = 20
      denominatorValue += (outOfBoundaryValue > 0 ? outOfBoundaryValue : -outOfBoundaryValue) * GETTING_SHORTER_FACTOR
    }

    const lengthRatio = scrollViewMeasure / denominatorValue
    return Math.abs(scrollViewMeasure - 2 * this._marginForLength) * lengthRatio
  }

  _calculatePosition(
    innerContainerMeasure: number,
    scrollViewMeasure: number,
    innerContainerPosition: number,
    outOfBoundaryValue: number,
    length: number,
  ) {
    let denominatorValue = innerContainerMeasure - scrollViewMeasure
    if (outOfBoundaryValue !== 0) {
      denominatorValue += Math.abs(outOfBoundaryValue)
    }

    let positionRatio = 0

    if (denominatorValue !== 0) {
      positionRatio = innerContainerPosition / denominatorValue
      positionRatio = Math.max(positionRatio, 0)
      positionRatio = Math.min(positionRatio, 1)
    }

    const position = (scrollViewMeasure - length - 2 * this._marginForLength) * positionRatio + this._marginForLength

    if (this._direction === ScrollView.DIR_VERTICAL) {
      return p(this._parentScroll.width - this._marginFromBoundary, position)
    } else {
      return p(position, this._marginFromBoundary)
    }
  }

  // accessors for TypeScript getters/setters

  get opacity(): number {
    return this.getOpacity()
  }
  set opacity(val: number) {
    this.setOpacity(val)
  }

  get autoHideEnabled(): boolean {
    return this.isAutoHideEnabled()
  }
  set autoHideEnabled(val: boolean) {
    this.setAutoHideEnabled(val)
  }
}

// static constants
ScrollViewBar.DEFAULT_COLOR = color(52, 65, 87)
ScrollViewBar.DEFAULT_MARGIN = 20
ScrollViewBar.DEFAULT_AUTO_HIDE_TIME = 0.2
ScrollViewBar.DEFAULT_SCROLLBAR_OPACITY = 0.4
ScrollViewBar.HALF_CIRCLE_IMAGE_KEY = '/__half_circle_image'
ScrollViewBar.HALF_CIRCLE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGCAMAAADAMI+zAAAAJ1BMVEX///////////////////////////////////////////////////9Ruv0SAAAADHRSTlMABgcbbW7Hz9Dz+PmlcJP5AAAAMElEQVR4AUXHwQ2AQAhFwYcLH1H6r1djzDK3ASxUpTBeK/uTCyz7dx54b44m4p5cD1MwAooEJyk3AAAAAElFTkSuQmCC'
ScrollViewBar.BODY_IMAGE_1_PIXEL_HEIGHT_KEY = '/__body_image_height'
ScrollViewBar.BODY_IMAGE_1_PIXEL_HEIGHT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAABCAMAAADdNb8LAAAAA1BMVEX///+nxBvIAAAACklEQVR4AWNABgAADQABYc2cpAAAAABJRU5ErkJggg=='
