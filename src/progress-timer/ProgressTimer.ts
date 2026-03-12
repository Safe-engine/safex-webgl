import { game } from '..'
import { clampf, pClamp, Sprite } from '../core'
import { Node } from '../core/base-nodes/Node'
import { p, Point } from '../core/cocoa/Geometry'
import { defineGetterSetter } from '../core/sprites/SpritesPropertyDefine'
import { _renderType } from '../helper/engine'
import { ProgressTimerWebGLRenderCmd } from './ProgressTimerWebGLRenderCmd'

export class ProgressTimer extends Node {
  static TEXTURE_COORDS_COUNT = 4
  static TEXTURE_COORDS = 0x4b
  static TYPE_RADIAL = 0
  static TYPE_BAR = 1

  _type: number
  _percentage = 0.0
  _sprite: Sprite = null
  _midPoint: Point = null
  _barChangeRate: Point = null
  _reverseDirection = false
  _className = 'ProgressTimer'

  declare midPoint: Point
  declare barChangeRate: Point
  declare type: number
  declare percentage: number
  declare sprite: Sprite
  declare reverseDir: boolean

  /**
   * constructor of ProgressTimer
   * @param {Sprite} sprite
   */
  constructor(sprite?: any) {
    super()
    this._type = ProgressTimer.TYPE_RADIAL
    this._percentage = 0.0
    this._midPoint = p(0, 0)
    this._barChangeRate = p(0, 0)
    this._reverseDirection = false
    this._sprite = null

    sprite && this.initWithSprite(sprite)
  }

  onEnter() {
    super.onEnter()
    if (_renderType === game.RENDER_TYPE_WEBGL) {
      this._renderCmd.initCmd()
      this._renderCmd._updateProgress()
    }
  }

  cleanup() {
    if (_renderType === game.RENDER_TYPE_WEBGL) {
      this._renderCmd.releaseData()
    }
    super.cleanup()
  }

  /**
   *    Midpoint is used to modify the progress start position.
   *    If you're using radials type then the midpoint changes the center point
   *    If you're using bar type the the midpoint changes the bar growth
   *        it expands from the center but clamps to the sprites edge so:
   *        you want a left to right then set the midpoint all the way to p(0,y)
   *        you want a right to left then set the midpoint all the way to p(1,y)
   *        you want a bottom to top then set the midpoint all the way to p(x,0)
   *        you want a top to bottom then set the midpoint all the way to p(x,1)
   *  @return {Point}
   */
  getMidpoint() {
    return p(this._midPoint.x, this._midPoint.y)
  }

  /**
   * Midpoint setter
   * @param {Point} mpoint
   */
  setMidpoint(mpoint: any) {
    this._midPoint = pClamp(mpoint, p(0, 0), p(1, 1))
  }

  /**
   *    This allows the bar type to move the component at a specific rate
   *    Set the component to 0 to make sure it stays at 100%.
   *    For example you want a left to right bar but not have the height stay 100%
   *    Set the rate to be p(0,1); and set the midpoint to = p(0,.5f);
   *  @return {Point}
   */
  getBarChangeRate() {
    return p(this._barChangeRate.x, this._barChangeRate.y)
  }

  /**
   * @param {Point} barChangeRate
   */
  setBarChangeRate(barChangeRate: any) {
    this._barChangeRate = pClamp(barChangeRate, p(0, 0), p(1, 1))
  }

  /**
   *  Change the percentage to change progress
   * @return {ProgressTimer.TYPE_RADIAL|ProgressTimer.TYPE_BAR}
   */
  getType() {
    return this._type
  }

  /**
   * Percentages are from 0 to 100
   * @return {Number}
   */
  getPercentage() {
    return this._percentage
  }

  /**
   * The image to show the progress percentage, retain
   * @return {Sprite}
   */
  getSprite() {
    return this._sprite
  }

  /**
   * from 0-100
   * @param {Number} percentage
   */
  setPercentage(percentage: number) {
    if (this._percentage !== percentage) {
      this._percentage = clampf(percentage, 0, 100)
      this._renderCmd._updateProgress()
    }
  }

  /**
   * only use for jsbinding
   * @param bValue
   */
  setOpacityModifyRGB(bValue: any) {}

  /**
   * only use for jsbinding
   * @returns {boolean}
   */
  isOpacityModifyRGB() {
    return false
  }

  /**
   * return if reverse direction
   * @returns {boolean}
   */
  isReverseDirection() {
    return this._reverseDirection
  }

  /**
   * set color of sprite
   * @param {Color} color
   */
  setColor(color: any) {
    this._sprite.color = color
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty)
  }

  /**
   *  set opacity of sprite
   * @param {Number} opacity
   */
  setOpacity(opacity: number) {
    this._sprite.opacity = opacity
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty)
  }

  /**
   * return color of sprite
   * @return {Color}
   */
  getColor() {
    return this._sprite.color
  }

  /**
   * return Opacity of sprite
   * @return {Number}
   */
  getOpacity() {
    return this._sprite.opacity
  }

  /**
   * set reverse ProgressTimer
   * @param {Boolean} reverse
   */
  setReverseProgress(reverse: boolean) {
    if (this._reverseDirection !== reverse) {
      this._reverseDirection = reverse
      this._renderCmd.resetVertexData()
    }
  }

  /**
   * set sprite for ProgressTimer
   * @param {Sprite} sprite
   */
  setSprite(sprite: Sprite) {
    if (this._sprite !== sprite) {
      this._sprite = sprite
      if (sprite) {
        this.setContentSize(sprite.width, sprite.height)
        sprite.ignoreAnchorPointForPosition(true)
      } else {
        this.setContentSize(0, 0)
      }
      this._renderCmd.resetVertexData()
    }
  }

  /**
   * set Progress type of ProgressTimer
   * @param {ProgressTimer.TYPE_RADIAL|ProgressTimer.TYPE_BAR} type
   */
  setType(type: number) {
    if (type !== this._type) {
      this._type = type
      this._renderCmd.resetVertexData()
    }
  }

  /**
   * Reverse Progress setter
   * @param {Boolean} reverse
   */
  setReverseDirection(reverse: boolean) {
    if (this._reverseDirection !== reverse) {
      this._reverseDirection = reverse
      this._renderCmd.resetVertexData()
    }
  }

  /**
   * Initializes a progress timer with the sprite as the shape the timer goes through
   * @param {Sprite} sprite
   * @return {Boolean}
   */
  initWithSprite(sprite: any) {
    this.percentage = 0
    this.setAnchorPoint(0.5, 0.5)

    this._type = ProgressTimer.TYPE_RADIAL
    this._reverseDirection = false
    this.midPoint = p(0.5, 0.5)
    this.barChangeRate = p(1, 1)
    this.setSprite(sprite)
    this._renderCmd.resetVertexData()
    return true
  }

  _createRenderCmd() {
    return new ProgressTimerWebGLRenderCmd(this)
  }
}

// Extended properties
const _p = ProgressTimer.prototype

defineGetterSetter(_p, 'midPoint', _p.getMidpoint, _p.setMidpoint)
defineGetterSetter(_p, 'barChangeRate', _p.getBarChangeRate, _p.setBarChangeRate)
defineGetterSetter(_p, 'type', _p.getType, _p.setType)
defineGetterSetter(_p, 'percentage', _p.getPercentage, _p.setPercentage)
defineGetterSetter(_p, 'sprite', _p.getSprite, _p.setSprite)
defineGetterSetter(_p, 'reverseDir', _p.isReverseDirection, _p.setReverseDirection)
