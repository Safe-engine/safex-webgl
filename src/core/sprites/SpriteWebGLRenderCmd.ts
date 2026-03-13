import { renderer } from '../..'
import { _LogInfos, error, log } from '../../helper/Debugger'
import { shaderCache } from '../../shaders/ShaderCache'
import { NodeWebGLRenderCmd } from '../base-nodes/NodeWebGLRenderCmd'
import { pointEqualToPoint, Rect, rectEqualToRect, rectEqualToZero } from '../cocoa/Geometry'
import { FIX_ARTIFACTS_BY_STRECHING_TEXEL } from '../platform/Config'
import { BLEND_DST, ONE, rectPointsToPixels, SHADER_SPRITE_POSITION_TEXTURECOLOR, SRC_ALPHA } from '../platform/Macro'
import { Sprite } from './Sprite'

export class SpriteWebGLRenderCmd extends NodeWebGLRenderCmd {
  declare _vertices: any[]
  declare _color: Uint32Array
  declare _dirty: boolean
  declare _recursiveDirty: boolean
  // declare _spriteCmdCtor: any
  declare _textureLoaded: any
  declare _rect: Rect
  declare texture: any
  declare _node: Sprite

  constructor(renderable: Sprite) {
    super(renderable)
    // new this._rootCtor(renderable)
    this._needDraw = true

    this._vertices = [
      { x: 0, y: 0, u: 0, v: 0 }, // tl
      { x: 0, y: 0, u: 0, v: 0 }, // bl
      { x: 0, y: 0, u: 0, v: 0 }, // tr
      { x: 0, y: 0, u: 0, v: 0 }, // br
    ]
    this._color = new Uint32Array(1)
    this._dirty = false
    this._recursiveDirty = false

    this._shaderProgram = shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR)
    // this._spriteCmdCtor = SpriteWebGLRenderCmd
  }

  declare updateBlendFunc: (blendFunc: any) => void

  setDirtyFlag(dirtyFlag: any): void {
    super.setDirtyFlag(dirtyFlag)
    this._dirty = true
  }

  setDirtyRecursively(value: boolean): void {
    this._recursiveDirty = value
    this._dirty = value
    // recursively set dirty
    const locChildren = this._node._children
    let child
    const l = locChildren ? locChildren.length : 0
    for (let i = 0; i < l; i++) {
      child = locChildren[i]
      child instanceof Sprite && child._renderCmd.setDirtyRecursively(value)
    }
  }

  _setBatchNodeForAddChild(child: any): boolean {
    const node = this._node
    if (node._batchNode) {
      if (!(child instanceof Sprite)) {
        log(_LogInfos.Sprite_addChild)
        return false
      }
      if (child.getTexture()._webTextureObj !== node.textureAtlas.texture._webTextureObj) log(_LogInfos.Sprite_addChild_2)

      //put it in descendants array of batch node
      node._batchNode.appendChild(child)
      if (!node._reorderChildDirty) node._setReorderChildDirtyRecursively()
    }
    return true
  }

  _handleTextureForRotatedTexture(texture: any): any {
    return texture
  }

  isFrameDisplayed(frame: any): boolean {
    const node = this._node
    return (
      rectEqualToRect(frame.getRect(), node._rect) &&
      frame.getTexture().getName() === node._texture.getName() &&
      pointEqualToPoint(frame.getOffset(), node._unflippedOffsetPositionFromCenter)
    )
  }

  _textureLoadedCallback(sender: any): void {
    if (this._textureLoaded) return

    this._textureLoaded = true
    let locRect = this._rect
    if (!locRect) {
      locRect = Rect(0, 0, sender.width, sender.height)
    } else if (rectEqualToZero(locRect)) {
      locRect.width = sender.width
      locRect.height = sender.height
    }

    this.texture = sender
    this.setTextureRect(locRect, this._rectRotated)

    // by default use "Self Render".
    // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
    this.setBatchNode(this._batchNode)
    this.dispatchEvent('load')

    // Force refresh the render command list
    renderer.childrenOrderDirty = true
  }
  setTextureRect(locRect: any, _rectRotated: any) {
    throw new Error('Method not implemented.')
  }
  _rectRotated: boolean
  setBatchNode(_batchNode: any) {
    throw new Error('Method not implemented.')
  }
  _batchNode: any
  dispatchEvent(arg0: string) {
    throw new Error('Method not implemented.')
  }

  _setTextureCoords(rect: any, needConvert?: boolean): void {
    if (needConvert === undefined) needConvert = true
    if (needConvert) rect = rectPointsToPixels(rect)
    const node = this._node

    const tex = node._batchNode ? node.textureAtlas.texture : node._texture
    const uvs = this._vertices
    if (!tex) return

    const atlasWidth = tex.pixelsWidth
    const atlasHeight = tex.pixelsHeight

    let left, right, top, bottom, tempSwap
    if (node._rectRotated) {
      if (FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
        left = (2 * rect.x + 1) / (2 * atlasWidth)
        right = left + (rect.height * 2 - 2) / (2 * atlasWidth)
        top = (2 * rect.y + 1) / (2 * atlasHeight)
        bottom = top + (rect.width * 2 - 2) / (2 * atlasHeight)
      } else {
        left = rect.x / atlasWidth
        right = (rect.x + rect.height) / atlasWidth
        top = rect.y / atlasHeight
        bottom = (rect.y + rect.width) / atlasHeight
      }

      if (node._flippedX) {
        tempSwap = top
        top = bottom
        bottom = tempSwap
      }

      if (node._flippedY) {
        tempSwap = left
        left = right
        right = tempSwap
      }

      uvs[0].u = right // tl
      uvs[0].v = top // tl
      uvs[1].u = left // bl
      uvs[1].v = top // bl
      uvs[2].u = right // tr
      uvs[2].v = bottom // tr
      uvs[3].u = left // br
      uvs[3].v = bottom // br
    } else {
      if (FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
        left = (2 * rect.x + 1) / (2 * atlasWidth)
        right = left + (rect.width * 2 - 2) / (2 * atlasWidth)
        top = (2 * rect.y + 1) / (2 * atlasHeight)
        bottom = top + (rect.height * 2 - 2) / (2 * atlasHeight)
      } else {
        left = rect.x / atlasWidth
        right = (rect.x + rect.width) / atlasWidth
        top = rect.y / atlasHeight
        bottom = (rect.y + rect.height) / atlasHeight
      }

      if (node._flippedX) {
        tempSwap = left
        left = right
        right = tempSwap
      }

      if (node._flippedY) {
        tempSwap = top
        top = bottom
        bottom = tempSwap
      }

      uvs[0].u = left // tl
      uvs[0].v = top // tl
      uvs[1].u = left // bl
      uvs[1].v = bottom // bl
      uvs[2].u = right // tr
      uvs[2].v = top // tr
      uvs[3].u = right // br
      uvs[3].v = bottom // br
    }
  }

  _setColorDirty(): void {}

  _updateBlendFunc(): void {
    if (this._batchNode) {
      log(_LogInfos.Sprite__updateBlendFunc)
      return
    }

    // it's possible to have an untextured sprite
    const node = this._node,
      blendFunc = node._blendFunc
    if (!node._texture || !node._texture.hasPremultipliedAlpha()) {
      if (blendFunc.src === ONE && blendFunc.dst === BLEND_DST) {
        blendFunc.src = SRC_ALPHA
      }
      node.setOpacityModifyRGB(false)
    } else {
      if (blendFunc.src === SRC_ALPHA && blendFunc.dst === BLEND_DST) {
        blendFunc.src = ONE
      }
      node.setOpacityModifyRGB(true)
    }
  }

  _setTexture(texture: any): void {
    const node = this._node
    if (node._texture !== texture) {
      node._textureLoaded = texture ? texture._textureLoaded : false
      node._texture = texture

      // Update texture rect and blend func
      if (texture) {
        const texSize = texture._contentSize
        const rt = Rect(0, 0, texSize.width, texSize.height)
        node.setTextureRect(rt)
        this._updateBlendFunc()
      }

      if (node._textureLoaded) {
        // Force refresh the render command list
        renderer.childrenOrderDirty = true
      }
    }
  }

  _checkTextureBoundary(texture: any, rect: any, rotated: boolean): void {
    if (texture && texture.url) {
      let _x, _y
      if (rotated) {
        _x = rect.x + rect.height
        _y = rect.y + rect.width
      } else {
        _x = rect.x + rect.width
        _y = rect.y + rect.height
      }
      if (_x > texture.width) {
        error(_LogInfos.RectWidth, texture.url)
      }
      if (_y > texture.height) {
        error(_LogInfos.RectHeight, texture.url)
      }
    }
  }

  transform(parentCmd: any, recursive?: boolean): void {
    this.originTransform(parentCmd, recursive)

    const node = this._node,
      lx = node._offsetPosition.x,
      rx = lx + node._rect.width,
      by = node._offsetPosition.y,
      ty = by + node._rect.height,
      wt = this._worldTransform,
      wtx = wt.tx,
      wty = wt.ty,
      lxa = lx * wt.a,
      lxb = lx * wt.b,
      rxa = rx * wt.a,
      rxb = rx * wt.b,
      tyc = ty * wt.c,
      tyd = ty * wt.d,
      byc = by * wt.c,
      byd = by * wt.d

    const vertices = this._vertices
    vertices[0].x = lxa + tyc + wtx // tl
    vertices[0].y = lxb + tyd + wty
    vertices[1].x = lxa + byc + wtx // bl
    vertices[1].y = lxb + byd + wty
    vertices[2].x = rxa + tyc + wtx // tr
    vertices[2].y = rxb + tyd + wty
    vertices[3].x = rxa + byc + wtx // br
    vertices[3].y = rxb + byd + wty
  }

  needDraw(): boolean {
    const locTexture = this._node._texture
    return this._needDraw && !!locTexture
  }

  uploadData(f32buffer: any, ui32buffer: any, vertexDataOffset: number): number {
    const node = this._node
    const locTexture = node._texture
    if (!(locTexture && locTexture._textureLoaded && node._rect.width && node._rect.height) || !this._displayedOpacity) return 0

    // Fill in vertex data with quad information (4 vertices for sprite)
    const opacity = this._displayedOpacity
    let r = this._displayedColor.r,
      g = this._displayedColor.g,
      b = this._displayedColor.b
    if (node._opacityModifyRGB) {
      const a = opacity / 255
      r *= a
      g *= a
      b *= a
    }
    this._color[0] = (opacity << 24) | (b << 16) | (g << 8) | r
    const z = node._vertexZ

    const vertices = this._vertices
    let i
    const len = vertices.length
    let vertex,
      offset = vertexDataOffset
    for (i = 0; i < len; ++i) {
      vertex = vertices[i]
      f32buffer[offset] = vertex.x
      f32buffer[offset + 1] = vertex.y
      f32buffer[offset + 2] = z
      ui32buffer[offset + 3] = this._color[0]
      f32buffer[offset + 4] = vertex.u
      f32buffer[offset + 5] = vertex.v
      offset += 6
    }

    return len
  }
}
