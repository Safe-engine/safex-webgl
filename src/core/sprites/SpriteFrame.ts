import { _LogInfos, error } from '../../helper/Debugger'
import { textureCache } from '../../textures/TextureCache'
import { Texture2D } from '../../textures/TexturesWebGL'
import { p, Point, Rect, Size } from '../cocoa/Geometry'
import { EventHelper } from '../event-manager/EventHelper'
import { _pointPixelsToPointsOut, _sizePixelsToPointsOut, rectPixelsToPoints, rectPointsToPixels } from '../platform/Macro'

/**
 * <p>
/**
 * SpriteFrame represents a frame (Rect within a texture).
 * This file preserves legacy static helpers (create, createWithTexture)
 * and re-attaches EventHelper methods to the prototype for runtime compatibility.
 */
export class SpriteFrame extends EventHelper {
  declare _offset: Point
  declare _originalSize: Size
  declare _rectInPixels: Rect
  declare _rotated: boolean
  declare _rect: Rect
  declare _offsetInPixels: Point
  declare _originalSizeInPixels: Size
  declare _texture?: Texture2D
  declare _textureFilename: string
  declare _textureLoaded: boolean

  constructor(filename?: string | Texture2D, rectArg?: Rect, rotated?: boolean, offset?: Point, originalSize?: Size) {
    super()
    this._offset = p(0, 0)
    this._offsetInPixels = p(0, 0)
    this._originalSize = Size(0, 0)
    this._rotated = false
    this._originalSizeInPixels = Size(0, 0)
    // this._textureFilename = ''
    // this._texture = null
    this._textureLoaded = false

    if (filename !== undefined && rectArg !== undefined) {
      if (rotated === undefined || offset === undefined || originalSize === undefined) {
        this.initWithTexture(filename, rectArg)
      } else {
        this.initWithTexture(filename, rectArg, rotated, offset, originalSize)
      }
    }
  }

  textureLoaded() {
    return this._textureLoaded
  }

  addLoadedEventListener(callback: any, target: any) {
    // legacy alias
    this.addEventListener('load', callback, target)
  }

  getRectInPixels() {
    const loc = this._rectInPixels
    return Rect(loc.x, loc.y, loc.width, loc.height)
  }

  setRectInPixels(rectInPixels: Rect) {
    if (!this._rectInPixels) this._rectInPixels = Rect(0, 0, 0, 0)
    this._rectInPixels.x = rectInPixels.x
    this._rectInPixels.y = rectInPixels.y
    this._rectInPixels.width = rectInPixels.width
    this._rectInPixels.height = rectInPixels.height
    this._rect = rectPixelsToPoints(rectInPixels)
  }

  isRotated() {
    return this._rotated
  }

  setRotated(bRotated: boolean) {
    this._rotated = bRotated
  }

  getRect() {
    const r = this._rect
    return Rect(r.x, r.y, r.width, r.height)
  }

  setRect(r: Rect) {
    if (!this._rect) this._rect = Rect(0, 0, 0, 0)
    this._rect.x = r.x
    this._rect.y = r.y
    this._rect.width = r.width
    this._rect.height = r.height
    this._rectInPixels = rectPointsToPixels(this._rect)
  }

  getOffsetInPixels() {
    return p(this._offsetInPixels)
  }

  setOffsetInPixels(offsetInPixels: Point) {
    this._offsetInPixels.x = offsetInPixels.x
    this._offsetInPixels.y = offsetInPixels.y
    _pointPixelsToPointsOut(this._offsetInPixels, this._offset)
  }

  getOriginalSizeInPixels() {
    return Size(this._originalSizeInPixels)
  }

  setOriginalSizeInPixels(sizeInPixels: Size) {
    this._originalSizeInPixels.width = sizeInPixels.width
    this._originalSizeInPixels.height = sizeInPixels.height
  }

  getOriginalSize() {
    return Size(this._originalSize)
  }

  setOriginalSize(sizeInPixels: Size) {
    this._originalSize.width = sizeInPixels.width
    this._originalSize.height = sizeInPixels.height
  }

  getTexture(): Texture2D {
    if (this._texture) return this._texture
    if (!this._textureFilename) {
      const locTexture = textureCache.addImage(this._textureFilename)
      if (locTexture) this._textureLoaded = locTexture.isLoaded()
      return locTexture
    }
    return null
  }

  setTexture(texture: Texture2D) {
    if (this._texture !== texture) {
      const locLoaded = texture.isLoaded()
      this._textureLoaded = locLoaded
      this._texture = texture
      if (!locLoaded) {
        texture.addEventListener(
          'load',
          function (sender: any) {
            this._textureLoaded = true
            const locRect = this._rect
            if (locRect.width === 0 && locRect.height === 0) {
              const w = sender.width,
                h = sender.height
              this._rect.width = w
              this._rect.height = h
              this._rectInPixels = rectPointsToPixels(this._rect)
              this._originalSizeInPixels.width = this._rectInPixels.width
              this._originalSizeInPixels.height = this._rectInPixels.height
              this._originalSize.width = w
              this._originalSize.height = h
            }
            // dispatch 'load' event
            this.dispatchEvent('load')
          },
          this,
        )
      }
    }
  }

  getOffset() {
    return p(this._offset)
  }

  setOffset(offsets: Point) {
    this._offset.x = offsets.x
    this._offset.y = offsets.y
  }

  clone() {
    const frame = new SpriteFrame()
    frame.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels)
    frame.setTexture(this._texture)
    return frame
  }

  copyWithZone() {
    const copy = new SpriteFrame()
    copy.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels)
    copy.setTexture(this._texture)
    return copy
  }

  copy() {
    return this.copyWithZone()
  }

  initWithTexture(texture: string | Texture2D, rectArg: Rect, rotated?: boolean, offset?: Point, originalSize?: Size) {
    let rectLocal = rectArg
    if (arguments.length === 2) rectLocal = rectPointsToPixels(rectLocal)

    offset = offset || p(0, 0)
    originalSize = originalSize || rectLocal
    rotated = rotated || false

    if (typeof texture === 'string') {
      this._texture = null
      this._textureFilename = texture
    } else if (texture instanceof Texture2D) {
      this.setTexture(texture)
    }

    texture = this.getTexture()

    this._rectInPixels = rectLocal
    this._rect = rectPixelsToPoints(rectLocal)

    if (texture && texture.url && texture.isLoaded()) {
      let _x, _y
      if (rotated) {
        _x = rectLocal.x + rectLocal.height
        _y = rectLocal.y + rectLocal.width
      } else {
        _x = rectLocal.x + rectLocal.width
        _y = rectLocal.y + rectLocal.height
      }
      if (_x > texture.getPixelsWide()) {
        error(_LogInfos.RectWidth, texture.url)
      }
      if (_y > texture.getPixelsHigh()) {
        error(_LogInfos.RectHeight, texture.url)
      }
    }

    this._offsetInPixels.x = offset.x
    this._offsetInPixels.y = offset.y
    _pointPixelsToPointsOut(offset, this._offset)
    this._originalSizeInPixels.width = originalSize.width
    this._originalSizeInPixels.height = originalSize.height
    _sizePixelsToPointsOut(originalSize, this._originalSize)
    this._rotated = rotated
    return true
  }

  static _frameWithTextureForCanvas(texture: any, rectArg: Rect, rotated: boolean, offset: Point, originalSize: Size) {
    const spriteFrame = new SpriteFrame()
    spriteFrame._texture = texture
    spriteFrame._rectInPixels = rectArg
    spriteFrame._rect = rectPixelsToPoints(rectArg)
    spriteFrame._offsetInPixels.x = offset.x
    spriteFrame._offsetInPixels.y = offset.y
    _pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset)
    spriteFrame._originalSizeInPixels.width = originalSize.width
    spriteFrame._originalSizeInPixels.height = originalSize.height
    _sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize)
    spriteFrame._rotated = rotated
    return spriteFrame
  }
}
