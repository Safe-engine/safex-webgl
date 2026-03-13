import { NodeWebGLRenderCmd } from '../../core/base-nodes/NodeWebGLRenderCmd'
import { SHADER_SPRITE_POSITION_TEXTURECOLOR, SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY } from '../../core/platform'
import { shaderCache } from '../../shaders/ShaderCache'
import { Scale9Sprite } from './UIScale9Sprite'

export class Scale9SpriteWebGLRenderCmd extends NodeWebGLRenderCmd {
  _color: Uint32Array<ArrayBuffer>
  _dirty: boolean
  declare _node: Scale9Sprite

  constructor(renderable) {
    super(renderable)

    this._needDraw = true

    this._color = new Uint32Array(1)
    this._dirty = false
    this._shaderProgram = shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR)
  }

  needDraw() {
    return this._needDraw && this._node.loaded()
  }

  _uploadSliced(vertices, uvs, color, z, f32buffer, ui32buffer, offset) {
    let off
    for (let r = 0; r < 3; ++r) {
      for (let c = 0; c < 3; ++c) {
        off = r * 8 + c * 2
        // lb
        f32buffer[offset] = vertices[off]
        f32buffer[offset + 1] = vertices[off + 1]
        f32buffer[offset + 2] = z
        ui32buffer[offset + 3] = color[0]
        f32buffer[offset + 4] = uvs[off]
        f32buffer[offset + 5] = uvs[off + 1]
        offset += 6
        // rb
        f32buffer[offset] = vertices[off + 2]
        f32buffer[offset + 1] = vertices[off + 3]
        f32buffer[offset + 2] = z
        ui32buffer[offset + 3] = color[0]
        f32buffer[offset + 4] = uvs[off + 2]
        f32buffer[offset + 5] = uvs[off + 3]
        offset += 6
        // lt
        f32buffer[offset] = vertices[off + 8]
        f32buffer[offset + 1] = vertices[off + 9]
        f32buffer[offset + 2] = z
        ui32buffer[offset + 3] = color[0]
        f32buffer[offset + 4] = uvs[off + 8]
        f32buffer[offset + 5] = uvs[off + 9]
        offset += 6
        // rt
        f32buffer[offset] = vertices[off + 10]
        f32buffer[offset + 1] = vertices[off + 11]
        f32buffer[offset + 2] = z
        ui32buffer[offset + 3] = color[0]
        f32buffer[offset + 4] = uvs[off + 10]
        f32buffer[offset + 5] = uvs[off + 11]
        offset += 6
      }
    }
    return 36
  }

  transform(parentCmd, recursive) {
    this.originTransform(parentCmd, recursive)
    this._node._rebuildQuads()
  }

  _setColorDirty() {}

  uploadData(f32buffer, ui32buffer, vertexDataOffset) {
    const node = this._node
    if (this._displayedOpacity === 0) {
      return 0
    }

    // Rebuild vertex data
    if (node._quadsDirty) {
      node._rebuildQuads()
    }

    // Color & z
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

    // Upload data
    const vertices = node._vertices
    const uvs = node._uvs
    const types = Scale9Sprite.RenderingType
    let offset = vertexDataOffset
    let len = 0
    switch (node._renderingType) {
      case types.SIMPLE:
        // Inline for performance
        len = this._node._vertCount
        for (let i = 0, srcOff = 0; i < len; i++, srcOff += 2) {
          f32buffer[offset] = vertices[srcOff]
          f32buffer[offset + 1] = vertices[srcOff + 1]
          f32buffer[offset + 2] = z
          ui32buffer[offset + 3] = this._color[0]
          f32buffer[offset + 4] = uvs[srcOff]
          f32buffer[offset + 5] = uvs[srcOff + 1]
          offset += 6
        }
        break
      case types.SLICED:
        len = this._uploadSliced(vertices, uvs, this._color, z, f32buffer, ui32buffer, offset)
        break
    }
    return len
  }

  setState(state) {
    if (state === Scale9Sprite.state.NORMAL) {
      this._shaderProgram = shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR)
    } else if (state === Scale9Sprite.state.GRAY) {
      this._shaderProgram = shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY)
    }
  }
}
