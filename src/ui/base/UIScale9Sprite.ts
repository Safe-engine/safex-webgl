import { game, renderer } from '../..'
import { SpriteFrame, spriteFrameCache } from '../../core'
import { Node } from '../../core/base-nodes/Node'
import { _Rect, p, Rect, rectEqualToZero, Size, sizeEqualToSize } from '../../core/cocoa/Geometry'
import { BlendFunc } from '../../core/platform/BlendFunc'
import { FIX_ARTIFACTS_BY_STRECHING_TEXEL } from '../../core/platform/Config'
import { BLEND_DST, BLEND_SRC, contentScaleFactor, ONE, rectPointsToPixels, SRC_ALPHA } from '../../core/platform/Macro'
import { SpriteLoadManager } from '../../core/sprites/SpriteLoadManager'
import { error, log } from '../../helper/Debugger'
import { _renderType } from '../../helper/engine'
import { textureCache } from '../../textures'
import { Scale9SpriteWebGLRenderCmd } from './UIScale9SpriteWebGLRenderCmd'

const dataPool = {
  _pool: {},
  _lengths: [],
  put: function (data) {
    const length = data.length
    if (!this._pool[length]) {
      this._pool[length] = [data]
      this._lengths.push(length)
      this._lengths.sort()
    } else {
      this._pool[length].push(data)
    }
  },
  get: function (length) {
    let id
    for (let i = 0; i < this._lengths.length; i++) {
      if (this._lengths[i] >= length) {
        id = this._lengths[i]
        break
      }
    }
    if (id) {
      return this._pool[id].pop()
    } else {
      return undefined
    }
  },
}

// var FIX_ARTIFACTS_BY_STRECHING_TEXEL = FIX_ARTIFACTS_BY_STRECHING_TEXEL
const cornerId = []
let webgl

const simpleQuadGenerator = {
  _rebuildQuads_base: function (sprite, spriteFrame, contentSize, isTrimmedContentSize) {
    //build vertices
    let vertices = sprite._vertices
    const wt = sprite._renderCmd._worldTransform
    let l, b, r, t
    if (isTrimmedContentSize) {
      l = 0
      b = 0
      r = contentSize.width
      t = contentSize.height
    } else {
      const originalSize = spriteFrame._originalSize
      const rect = spriteFrame._rect
      const offset = spriteFrame._offset
      const scaleX = contentSize.width / originalSize.width
      const scaleY = contentSize.height / originalSize.height
      const trimmLeft = offset.x + (originalSize.width - rect.width) / 2
      const trimmRight = offset.x - (originalSize.width - rect.width) / 2
      const trimmedBottom = offset.y + (originalSize.height - rect.height) / 2
      const trimmedTop = offset.y - (originalSize.height - rect.height) / 2

      l = trimmLeft * scaleX
      b = trimmedBottom * scaleY
      r = contentSize.width + trimmRight * scaleX
      t = contentSize.height + trimmedTop * scaleY
    }

    if (vertices.length < 8) {
      dataPool.put(vertices)
      vertices = dataPool.get(8) || new Float32Array(8)
      sprite._vertices = vertices
    }
    // bl, br, tl, tr
    if (webgl) {
      vertices[0] = l * wt.a + b * wt.c + wt.tx
      vertices[1] = l * wt.b + b * wt.d + wt.ty
      vertices[2] = r * wt.a + b * wt.c + wt.tx
      vertices[3] = r * wt.b + b * wt.d + wt.ty
      vertices[4] = l * wt.a + t * wt.c + wt.tx
      vertices[5] = l * wt.b + t * wt.d + wt.ty
      vertices[6] = r * wt.a + t * wt.c + wt.tx
      vertices[7] = r * wt.b + t * wt.d + wt.ty
    } else {
      vertices[0] = l
      vertices[1] = b
      vertices[2] = r
      vertices[3] = b
      vertices[4] = l
      vertices[5] = t
      vertices[6] = r
      vertices[7] = t
    }

    cornerId[0] = 0
    cornerId[1] = 2
    cornerId[2] = 4
    cornerId[3] = 6

    //build uvs
    if (sprite._uvsDirty) {
      this._calculateUVs(sprite, spriteFrame)
    }

    sprite._vertCount = 4
  },

  _calculateUVs: function (sprite, spriteFrame) {
    let uvs = sprite._uvs
    const atlasWidth = spriteFrame._texture._pixelsWide
    const atlasHeight = spriteFrame._texture._pixelsHigh
    let textureRect = spriteFrame._rect
    textureRect = rectPointsToPixels(textureRect)

    if (uvs.length < 8) {
      dataPool.put(uvs)
      uvs = dataPool.get(8) || new Float32Array(8)
      sprite._uvs = uvs
    }

    //uv computation should take spritesheet into account.
    let l, b, r, t
    const texelCorrect = FIX_ARTIFACTS_BY_STRECHING_TEXEL ? 0.5 : 0

    if (spriteFrame._rotated) {
      l = (textureRect.x + texelCorrect) / atlasWidth
      b = (textureRect.y + textureRect.width - texelCorrect) / atlasHeight
      r = (textureRect.x + textureRect.height - texelCorrect) / atlasWidth
      t = (textureRect.y + texelCorrect) / atlasHeight
      uvs[0] = l
      uvs[1] = t
      uvs[2] = l
      uvs[3] = b
      uvs[4] = r
      uvs[5] = t
      uvs[6] = r
      uvs[7] = b
    } else {
      l = (textureRect.x + texelCorrect) / atlasWidth
      b = (textureRect.y + textureRect.height - texelCorrect) / atlasHeight
      r = (textureRect.x + textureRect.width - texelCorrect) / atlasWidth
      t = (textureRect.y + texelCorrect) / atlasHeight
      uvs[0] = l
      uvs[1] = b
      uvs[2] = r
      uvs[3] = b
      uvs[4] = l
      uvs[5] = t
      uvs[6] = r
      uvs[7] = t
    }
  },
}

const scale9QuadGenerator = {
  x: new Array(4),
  y: new Array(4),
  _rebuildQuads_base: function (sprite, spriteFrame, contentSize, insetLeft, insetRight, insetTop, insetBottom) {
    //build vertices
    let vertices = sprite._vertices
    const wt = sprite._renderCmd._worldTransform
    // const rect = spriteFrame._rect

    const leftWidth = insetLeft
    const rightWidth = insetRight
    // const centerWidth = rect.width - leftWidth - rightWidth
    const topHeight = insetTop
    const bottomHeight = insetBottom
    // const centerHeight = rect.height - topHeight - bottomHeight

    const preferSize = contentSize
    let sizableWidth = preferSize.width - leftWidth - rightWidth
    let sizableHeight = preferSize.height - topHeight - bottomHeight
    let xScale = preferSize.width / (leftWidth + rightWidth)
    let yScale = preferSize.height / (topHeight + bottomHeight)
    xScale = xScale > 1 ? 1 : xScale
    yScale = yScale > 1 ? 1 : yScale
    sizableWidth = sizableWidth < 0 ? 0 : sizableWidth
    sizableHeight = sizableHeight < 0 ? 0 : sizableHeight
    const x = this.x
    const y = this.y
    x[0] = 0
    x[1] = leftWidth * xScale
    x[2] = x[1] + sizableWidth
    x[3] = preferSize.width
    y[0] = 0
    y[1] = bottomHeight * yScale
    y[2] = y[1] + sizableHeight
    y[3] = preferSize.height

    if (vertices.length < 32) {
      dataPool.put(vertices)
      vertices = dataPool.get(32) || new Float32Array(32)
      sprite._vertices = vertices
    }
    let offset = 0,
      row,
      col
    if (webgl) {
      for (row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
          vertices[offset] = x[col] * wt.a + y[row] * wt.c + wt.tx
          vertices[offset + 1] = x[col] * wt.b + y[row] * wt.d + wt.ty
          offset += 2
        }
      }
    } else {
      for (row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
          vertices[offset] = x[col]
          vertices[offset + 1] = y[row]
          offset += 2
        }
      }
    }

    cornerId[0] = 0
    cornerId[1] = 6
    cornerId[2] = 24
    cornerId[3] = 30

    //build uvs
    if (sprite._uvsDirty) {
      this._calculateUVs(sprite, spriteFrame, insetLeft, insetRight, insetTop, insetBottom)
    }
  },

  _calculateUVs: function (sprite, spriteFrame, insetLeft, insetRight, insetTop, insetBottom) {
    let uvs = sprite._uvs
    let rect = spriteFrame._rect
    const atlasWidth = spriteFrame._texture._pixelsWide
    const atlasHeight = spriteFrame._texture._pixelsHigh

    //caculate texture coordinate
    let textureRect = spriteFrame._rect
    textureRect = rectPointsToPixels(textureRect)
    rect = rectPointsToPixels(rect)
    const scale = contentScaleFactor()

    const leftWidth = insetLeft * scale
    const rightWidth = insetRight * scale
    const centerWidth = rect.width - leftWidth - rightWidth
    const topHeight = insetTop * scale
    const bottomHeight = insetBottom * scale
    const centerHeight = rect.height - topHeight - bottomHeight

    if (uvs.length < 32) {
      dataPool.put(uvs)
      uvs = dataPool.get(32) || new Float32Array(32)
      sprite._uvs = uvs
    }

    //uv computation should take spritesheet into account.
    const u = this.x
    const v = this.y
    const texelCorrect = FIX_ARTIFACTS_BY_STRECHING_TEXEL ? 0.5 : 0
    let offset = 0,
      row,
      col

    if (spriteFrame._rotated) {
      u[0] = (textureRect.x + texelCorrect) / atlasWidth
      u[1] = (bottomHeight + textureRect.x) / atlasWidth
      u[2] = (bottomHeight + centerHeight + textureRect.x) / atlasWidth
      u[3] = (textureRect.x + textureRect.height - texelCorrect) / atlasWidth

      v[3] = (textureRect.y + texelCorrect) / atlasHeight
      v[2] = (leftWidth + textureRect.y) / atlasHeight
      v[1] = (leftWidth + centerWidth + textureRect.y) / atlasHeight
      v[0] = (textureRect.y + textureRect.width - texelCorrect) / atlasHeight

      for (row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
          uvs[offset] = u[row]
          uvs[offset + 1] = v[3 - col]
          offset += 2
        }
      }
    } else {
      u[0] = (textureRect.x + texelCorrect) / atlasWidth
      u[1] = (leftWidth + textureRect.x) / atlasWidth
      u[2] = (leftWidth + centerWidth + textureRect.x) / atlasWidth
      u[3] = (textureRect.x + textureRect.width - texelCorrect) / atlasWidth

      v[3] = (textureRect.y + texelCorrect) / atlasHeight
      v[2] = (topHeight + textureRect.y) / atlasHeight
      v[1] = (topHeight + centerHeight + textureRect.y) / atlasHeight
      v[0] = (textureRect.y + textureRect.height - texelCorrect) / atlasHeight

      for (row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
          uvs[offset] = u[col]
          uvs[offset + 1] = v[row]
          offset += 2
        }
      }
    }
  },
}

/**
 * <p>
 * A 9-slice sprite for cocos2d UI.                                                                    <br/>
 *                                                                                                     <br/>
 * 9-slice scaling allows you to specify how scaling is applied                                        <br/>
 * to specific areas of a sprite. With 9-slice scaling (3x3 grid),                                     <br/>
 * you can ensure that the sprite does not become distorted when                                       <br/>
 * scaled.                                                                                             <br/>
 * @see http://yannickloriot.com/library/ios/cccontrolextension/Classes/CCScale9Sprite.html            <br/>
 * </p>
 * @class
 * @extends Node
 *
 * @property {Size}  preferredSize   - The preferred size of the 9-slice sprite
 * @property {Rect}  capInsets       - The cap insets of the 9-slice sprite
 * @property {Number}   insetLeft       - The left inset of the 9-slice sprite
 * @property {Number}   insetTop        - The top inset of the 9-slice sprite
 * @property {Number}   insetRight      - The right inset of the 9-slice sprite
 * @property {Number}   insetBottom     - The bottom inset of the 9-slice sprite
 */

export class Scale9Sprite extends Node {
  //resource data, could be async loaded.
  _spriteFrame: SpriteFrame = null

  //scale 9 data
  _insetLeft = 0
  _insetRight = 0
  _insetTop = 0
  _insetBottom = 0
  //blend function
  _blendFunc: BlendFunc = null
  //sliced or simple
  _renderingType = 1
  //bright or not
  _brightState = 0
  _opacityModifyRGB = false
  //rendering quads shared by canvas and webgl
  _rawVerts: any = null
  _rawUvs: any = null
  declare _vertices: Float32Array
  declare _uvs: Float32Array
  _vertCount = 0
  _quadsDirty = true
  _uvsDirty = true
  _isTriangle = false
  _isTrimmedContentSize = false
  _textureLoaded = false

  //v3.3
  _flippedX = false
  _flippedY = false
  _className = 'Scale9Sprite'

  _loader: SpriteLoadManager
  _capInsetsInternal: Rect
  _cacheCapInsets: Rect
  declare _renderCmd: Scale9SpriteWebGLRenderCmd

  /**
   * Constructor function.
   * @function
   * @param {string|SpriteFrame} file file name of texture or a SpriteFrame
   * @param {Rect} rectOrCapInsets
   * @param {Rect} capInsets
   * @returns {Scale9Sprite}
   */
  constructor(file?: any, rectOrCapInsets?: any, capInsets?: any) {
    super()

    //for async texture load
    this._loader = new SpriteLoadManager()

    this._renderCmd.setState(this._brightState)
    this._blendFunc = BlendFunc._alphaPremultiplied()
    this.setAnchorPoint(p(0.5, 0.5))
    // Init vertex data for simple
    this._rawVerts = null
    this._rawUvs = null
    this._vertices = dataPool.get(8) || new Float32Array(8)
    this._uvs = dataPool.get(8) || new Float32Array(8)

    if (file !== undefined) {
      if (file instanceof SpriteFrame) this.initWithSpriteFrame(file, rectOrCapInsets)
      else {
        const frame = spriteFrameCache.getSpriteFrame(file)
        if (frame) this.initWithSpriteFrame(frame, rectOrCapInsets)
        else this.initWithFile(file, rectOrCapInsets, capInsets)
      }
    }

    if (webgl === undefined) {
      webgl = _renderType === game.RENDER_TYPE_WEBGL
    }
  }

  textureLoaded() {
    return this._textureLoaded
  }

  getCapInsets() {
    return Rect(this._capInsetsInternal)
  }

  _asyncSetCapInsets() {
    this.removeEventListener('load', this._asyncSetCapInsets, this)
    this.setCapInsets(this._cacheCapInsets)
    this._cacheCapInsets = null
  }

  setCapInsets(capInsets) {
    // Asynchronous loading texture requires this data
    // This data does not take effect immediately, so it does not affect the existing texture.
    if (!this.loaded()) {
      this._cacheCapInsets = capInsets
      this.removeEventListener('load', this._asyncSetCapInsets, this)
      this.addEventListener('load', this._asyncSetCapInsets, this)
      return false
    }

    this._capInsetsInternal = capInsets
    this._updateCapInsets(this._spriteFrame._rect, this._capInsetsInternal)
  }

  _updateCapInsets(rect, capInsets) {
    if (!capInsets || !rect || rectEqualToZero(capInsets)) {
      rect = rect || { x: 0, y: 0, width: this._contentSize.width, height: this._contentSize.height }
      this._capInsetsInternal = Rect(rect.width / 3, rect.height / 3, rect.width / 3, rect.height / 3)
    } else {
      this._capInsetsInternal = capInsets
    }

    if (!rectEqualToZero(rect)) {
      this._insetLeft = this._capInsetsInternal.x
      this._insetTop = this._capInsetsInternal.y
      this._insetRight = rect.width - this._insetLeft - this._capInsetsInternal.width
      this._insetBottom = rect.height - this._insetTop - this._capInsetsInternal.height
    }
  }

  initWithFile(file, rect?: Rect, capInsets?: Rect) {
    if (file instanceof _Rect) {
      file = rect
      capInsets = file
      rect = Rect(0, 0, 0, 0)
    } else {
      rect = rect || Rect(0, 0, 0, 0)
      capInsets = capInsets || Rect(0, 0, 0, 0)
    }

    if (!file) throw new Error('Scale9Sprite.initWithFile(): file should be non-null')

    let texture = textureCache.getTextureForKey(file)
    if (!texture) {
      texture = textureCache.addImage(file)
    }

    const locLoaded = texture.isLoaded()
    this._textureLoaded = locLoaded
    this._loader.clear()
    if (!locLoaded) {
      this._loader.once(
        texture,
        function () {
          this.initWithFile(file, rect, capInsets)
          this.dispatchEvent('load')
        },
        this,
      )
      return false
    }

    //in this function, the texture already make sure is loaded.
    if (rectEqualToZero(rect)) {
      const textureSize = texture.getContentSize()
      rect = Rect(0, 0, textureSize.width, textureSize.height)
    }
    this.setTexture(texture, rect)
    this._updateCapInsets(rect, capInsets)

    return true
  }

  updateWithBatchNode(batchNode, originalRect, rotated, capInsets) {
    if (!batchNode) {
      return false
    }

    const texture = batchNode.getTexture()
    this._loader.clear()
    if (!texture.isLoaded()) {
      this._loader.once(
        texture,
        function () {
          this.updateWithBatchNode(batchNode, originalRect, rotated, capInsets)
          this.dispatchEvent('load')
        },
        this,
      )
      return false
    }

    this.setTexture(texture, originalRect)
    this._updateCapInsets(originalRect, capInsets)

    return true
  }

  /**
   * Initializes a 9-slice sprite with an sprite frame
   * @param spriteFrameOrSFName The sprite frame object.
   */
  initWithSpriteFrame(spriteFrame, capInsets) {
    this.setSpriteFrame(spriteFrame)

    capInsets = capInsets || Rect(0, 0, 0, 0)

    this._updateCapInsets(spriteFrame._rect, capInsets)
  }

  initWithSpriteFrameName(spriteFrameName, capInsets?) {
    if (!spriteFrameName) throw new Error('Scale9Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null')
    const frame = spriteFrameCache.getSpriteFrame(spriteFrameName)
    if (frame == null) {
      log('Scale9Sprite.initWithSpriteFrameName(): cant find the sprite frame by spriteFrameName')
      return false
    }
    this.setSpriteFrame(frame)
    capInsets = capInsets || Rect(0, 0, 0, 0)
    this._updateCapInsets(frame._rect, capInsets)
  }

  loaded() {
    if (this._spriteFrame === null) {
      return false
    } else {
      return this._spriteFrame.textureLoaded()
    }
  }

  /**
   * Change the texture file of 9 slice sprite
   *
   * @param textureOrTextureFile The name of the texture file.
   */
  setTexture(texture, rect) {
    const spriteFrame = new SpriteFrame(texture, rect)
    this.setSpriteFrame(spriteFrame)
  }

  _updateBlendFunc() {
    // it's possible to have an untextured sprite
    const blendFunc = this._blendFunc
    if (!this._spriteFrame || !this._spriteFrame._texture.hasPremultipliedAlpha()) {
      if (blendFunc.src === ONE && blendFunc.dst === BLEND_DST) {
        blendFunc.src = SRC_ALPHA
      }
      this._opacityModifyRGB = false
    } else {
      if (blendFunc.src === SRC_ALPHA && blendFunc.dst === BLEND_DST) {
        blendFunc.src = ONE
      }
      this._opacityModifyRGB = true
    }
  }

  setOpacityModifyRGB(value) {
    if (this._opacityModifyRGB !== value) {
      this._opacityModifyRGB = value
      this._renderCmd._setColorDirty()
    }
  }

  isOpacityModifyRGB() {
    return this._opacityModifyRGB
  }

  /**
   * Change the sprite frame of 9 slice sprite
   *
   * @param spriteFrameOrSFFileName The name of the texture file.
   */
  setSpriteFrame(spriteFrame) {
    if (spriteFrame) {
      this._spriteFrame = spriteFrame
      this._quadsDirty = true
      this._uvsDirty = true
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      const onResourceDataLoaded = function () {
        if (sizeEqualToSize(self._contentSize, Size(0, 0))) {
          self.setContentSize(self._spriteFrame._rect)
        }
        self._textureLoaded = true
        self._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
        renderer.childrenOrderDirty = true
      }
      self._textureLoaded = spriteFrame.textureLoaded()
      if (self._textureLoaded) {
        onResourceDataLoaded()
      } else {
        this._loader.clear()
        this._loader.once(
          spriteFrame,
          function () {
            onResourceDataLoaded()
            this.dispatchEvent('load')
          },
          this,
        )
      }
    }
  }

  /**
   * Sets the source blending function.
   *
   * @param blendFunc A structure with source and destination factor to specify pixel arithmetic. e.g. {GL_ONE, GL_ONE}, {GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA}.
   */
  setBlendFunc(blendFunc, dst) {
    if (dst === undefined) {
      this._blendFunc.src = blendFunc.src || BLEND_SRC
      this._blendFunc.dst = blendFunc.dst || BLEND_DST
    } else {
      this._blendFunc.src = blendFunc || BLEND_SRC
      this._blendFunc.dst = dst || BLEND_DST
    }
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * Returns the blending function that is currently being used.
   *
   * @return A BlendFunc structure with source and destination factor which specified pixel arithmetic.
   */
  getBlendFunc() {
    return new BlendFunc(this._blendFunc.src, this._blendFunc.dst)
  }

  setPreferredSize(preferredSize) {
    if (!preferredSize || sizeEqualToSize(this._contentSize, preferredSize)) return
    this.setContentSize(preferredSize)
  }

  getPreferredSize() {
    return this.getContentSize()
  }

  // overrides
  setContentSize(width, height?: number) {
    if (height === undefined) {
      height = width.height
      width = width.width
    }
    if (width === this._contentSize.width && height === this._contentSize.height) {
      return
    }

    super.setContentSize(width, height)
    this._quadsDirty = true
  }

  getContentSize() {
    if (this._renderingType === Scale9Sprite.RenderingType.SIMPLE) {
      if (this._spriteFrame) {
        return this._spriteFrame._originalSize
      }
      return Size(this._contentSize)
    } else {
      return Size(this._contentSize)
    }
  }

  _setWidth(value) {
    super._setWidth(value)
    this._quadsDirty = true
  }

  _setHeight(value) {
    super._setHeight(value)
    this._quadsDirty = true
  }

  /**
   * Change the state of 9-slice sprite.
   * @see `State`
   * @param state A enum value in State.
   */
  setState(state) {
    this._brightState = state
    this._renderCmd.setState(state)
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * Query the current bright state.
   * @return @see `State`
   */
  getState() {
    return this._brightState
  }

  /**
   * change the rendering type, could be simple or slice
   * @return @see `RenderingType`
   */
  setRenderingType(type) {
    if (this._renderingType === type) return

    this._renderingType = type
    this._quadsDirty = true
    this._uvsDirty = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * get the rendering type, could be simple or slice
   * @return @see `RenderingType`
   */
  getRenderingType() {
    return this._renderingType
  }

  /**
   * change the left border of 9 slice sprite, it should be specified before trimmed.
   * @param insetLeft left border.
   */
  setInsetLeft(insetLeft) {
    this._insetLeft = insetLeft
    this._quadsDirty = true
    this._uvsDirty = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * get the left border of 9 slice sprite, the result is specified before trimmed.
   * @return left border.
   */
  getInsetLeft() {
    return this._insetLeft
  }

  /**
   * change the top border of 9 slice sprite, it should be specified before trimmed.
   * @param insetTop top border.
   */
  setInsetTop(insetTop) {
    this._insetTop = insetTop
    this._quadsDirty = true
    this._uvsDirty = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * get the top border of 9 slice sprite, the result is specified before trimmed.
   * @return top border.
   */
  getInsetTop() {
    return this._insetTop
  }

  /**
   * change the right border of 9 slice sprite, it should be specified before trimmed.
   * @param insetRight right border.
   */
  setInsetRight(insetRight) {
    this._insetRight = insetRight
    this._quadsDirty = true
    this._uvsDirty = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * get the right border of 9 slice sprite, the result is specified before trimmed.
   * @return right border.
   */
  getInsetRight() {
    return this._insetRight
  }

  /**
   * change the bottom border of 9 slice sprite, it should be specified before trimmed.
   * @param insetBottom bottom border.
   */
  setInsetBottom(insetBottom) {
    this._insetBottom = insetBottom
    this._quadsDirty = true
    this._uvsDirty = true
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty)
  }

  /**
   * get the bottom border of 9 slice sprite, the result is specified before trimmed.
   * @return bottom border.
   */
  getInsetBottom() {
    return this._insetBottom
  }

  _rebuildQuads() {
    if (!this._spriteFrame || !this._spriteFrame._textureLoaded) {
      return
    }

    this._updateBlendFunc()

    this._isTriangle = false
    switch (this._renderingType) {
      case Scale9Sprite.RenderingType.SIMPLE:
        simpleQuadGenerator._rebuildQuads_base(this, this._spriteFrame, this._contentSize, this._isTrimmedContentSize)
        break
      case Scale9Sprite.RenderingType.SLICED:
        scale9QuadGenerator._rebuildQuads_base(
          this,
          this._spriteFrame,
          this._contentSize,
          this._insetLeft,
          this._insetRight,
          this._insetTop,
          this._insetBottom,
        )
        break
      default:
        this._quadsDirty = false
        this._uvsDirty = false
        error('Can not generate quad')
        return
    }

    this._quadsDirty = false
    this._uvsDirty = false
  }

  _createRenderCmd() {
    return new Scale9SpriteWebGLRenderCmd(this)
  }

  get preferredSize() {
    return this.getPreferredSize()
  }

  set preferredSize(value) {
    this.setPreferredSize(value)
  }

  get capInsets() {
    return this.getCapInsets()
  }

  set capInsets(value) {
    this.setCapInsets(value)
  }

  get insetLeft() {
    return this.getInsetLeft()
  }

  set insetLeft(value) {
    this.setInsetLeft(value)
  }

  get insetTop() {
    return this.getInsetTop()
  }

  set insetTop(value) {
    this.setInsetTop(value)
  }

  get insetRight() {
    return this.getInsetRight()
  }

  set insetRight(value) {
    this.setInsetRight(value)
  }

  get insetBottom() {
    return this.getInsetBottom()
  }

  set insetBottom(value) {
    this.setInsetBottom(value)
  }

  static POSITIONS_CENTRE = 0
  static POSITIONS_TOP = 1
  static POSITIONS_LEFT = 2
  static POSITIONS_RIGHT = 3
  static POSITIONS_BOTTOM = 4
  static POSITIONS_TOPRIGHT = 5
  static POSITIONS_TOPLEFT = 6
  static POSITIONS_BOTTOMRIGHT = 7

  static state = { NORMAL: 0, GRAY: 1 }

  static RenderingType = {
    /**
     * @property {Number} SIMPLE
     */
    SIMPLE: 0,
    /**
     * @property {Number} SLICED
     */
    SLICED: 1,
  }

  /**
   * create a Scale9Sprite with Sprite frame.
   * @deprecated since v3.0, please use "new Scale9Sprite(spriteFrame, capInsets)" instead.
   * @param {SpriteFrame} spriteFrame
   * @param {Rect} capInsets
   * @returns {Scale9Sprite}
   */
  static createWithSpriteFrame(spriteFrame, capInsets) {
    return new Scale9Sprite(spriteFrame, capInsets)
  }

  /**
   * create a Scale9Sprite with a Sprite frame name
   * @deprecated since v3.0, please use "new Scale9Sprite(spriteFrameName, capInsets)" instead.
   * @param {string} spriteFrameName
   * @param {Rect} capInsets
   * @returns {Scale9Sprite}
   */
  static createWithSpriteFrameName(spriteFrameName, capInsets) {
    const sprite = new Scale9Sprite()
    sprite.initWithSpriteFrameName(spriteFrameName, capInsets)
    return sprite
  }
}

// EventHelper.prototype.apply(Scale9Sprite.prototype)

// var RenderingType = Scale9Sprite.RenderingType
