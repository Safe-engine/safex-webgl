import { _renderContext } from '../..'
import { _tmp, global } from '../../helper/global'
import { TEXTURE_ATLAS_USE_TRIANGLE_STRIP } from '../core/platform/Config'
import { VERTEX_ATTRIB_COLOR, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TEX_COORDS } from '../core/platform/Macro'
import { glBindTexture2D } from '../shaders/GLStateCache'
import { TextureAtlas } from './TextureAtlas'

_tmp.WebGLTextureAtlas = function () {
  const _p = TextureAtlas.prototype
  _p._setupVBO = function () {
    const gl = _renderContext
    //create WebGLBuffer
    this._buffersVBO[0] = gl.createBuffer()
    this._buffersVBO[1] = gl.createBuffer()

    this._quadsWebBuffer = gl.createBuffer()
    this._mapBuffers()
  }

  _p._mapBuffers = function () {
    const gl = _renderContext

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1])
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)

    //checkGLErrorDebug();
  }

  /**
   * <p>Draws n quads from an index (offset). <br />
   * n + start can't be greater than the capacity of the atlas</p>
   * @param {Number} n
   * @param {Number} start
   */
  _p.drawNumberOfQuads = function (n, start) {
    start = start || 0
    if (0 === n || !this.texture || !this.texture.isLoaded()) return

    const gl = _renderContext
    glBindTexture2D(this.texture)

    //
    // Using VBO without VAO
    //
    //vertices
    //gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
    // XXX: update is done in draw... perhaps it should be done in a timer

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer)
    if (this.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW)
      this.dirty = false
    }

    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)

    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0) // vertices
    gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12) // colors
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16) // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1])

    if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP)
      gl.drawElements(gl.TRIANGLE_STRIP, n * 6, gl.UNSIGNED_SHORT, start * 6 * this._indices.BYTES_PER_ELEMENT)
    else gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, start * 6 * this._indices.BYTES_PER_ELEMENT)

    global.g_NumberOfDraws++
    //checkGLErrorDebug();
  }
}
