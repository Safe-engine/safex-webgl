import { _renderContext } from '../..'
import { global } from '../../helper/global'
import { glBindTexture2DN, glBlendFunc } from '../../shaders/GLStateCache'
import { Matrix4 } from '../kazmath/mat4'
import { color } from '../platform/Color'
import {
  arrayRemoveObject,
  BATCH_VERTEX_COUNT,
  VERTEX_ATTRIB_COLOR,
  VERTEX_ATTRIB_POSITION,
  VERTEX_ATTRIB_TEX_COORDS,
} from '../platform/Macro'

export const rendererWebGL = (function () {
  // Internal variables
  // Batching general informations
  const _batchedInfo = {
    // The batched texture, all batching element should have the same texture
    texture: null,
    // The batched blend source, all batching element should have the same blend source
    blendSrc: null,
    // The batched blend destination, all batching element should have the same blend destination
    blendDst: null,
    // The batched gl program state, all batching element should have the same state
    glProgramState: null,
  }
  const _sizePerVertex = 6
  let _batchBroken = false,
    _indexBuffer: WebGLBuffer = null,
    _vertexBuffer: WebGLBuffer = null,
    // Total vertex size
    _maxVertexSize = 0,
    // Current batching vertex size
    _batchingSize = 0,
    // Current batching index size
    _indexSize = 0,
    // Float size per vertex
    // buffer data and views
    _vertexData = null,
    _vertexDataSize = 0,
    _vertexDataF32 = null,
    _vertexDataUI32 = null,
    _indexData: Uint16Array = null,
    _prevIndexSize = 0,
    _pureQuad = true
  // _IS_IOS = false

  // Inspired from @Heishe's gotta-batch-them-all branch
  // https://github.com/Talisca/cocos2d-html5/commit/de731f16414eb9bcaa20480006897ca6576d362c
  function updateBuffer(numVertex) {
    const gl = _renderContext
    // Update index buffer size
    if (_indexBuffer) {
      const indexCount = Math.ceil(numVertex / 4) * 6
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _indexBuffer)
      _indexData = new Uint16Array(indexCount)
      let currentQuad = 0
      for (let i = 0, len = indexCount; i < len; i += 6) {
        _indexData[i] = currentQuad + 0
        _indexData[i + 1] = currentQuad + 1
        _indexData[i + 2] = currentQuad + 2
        _indexData[i + 3] = currentQuad + 1
        _indexData[i + 4] = currentQuad + 2
        _indexData[i + 5] = currentQuad + 3
        currentQuad += 4
      }
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _indexData, gl.DYNAMIC_DRAW)
    }
    // Update vertex buffer size
    if (_vertexBuffer) {
      _vertexDataSize = numVertex * _sizePerVertex
      const byteLength = _vertexDataSize * 4
      _vertexData = new ArrayBuffer(byteLength)
      _vertexDataF32 = new Float32Array(_vertexData)
      _vertexDataUI32 = new Uint32Array(_vertexData)
      // Init buffer data
      gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, _vertexDataF32, gl.DYNAMIC_DRAW)
    }
    // Downsize by 200 to avoid vertex data overflow
    _maxVertexSize = numVertex - 200
  }

  // Inspired from @Heishe's gotta-batch-them-all branch
  // https://github.com/Talisca/cocos2d-html5/commit/de731f16414eb9bcaa20480006897ca6576d362c
  function initQuadBuffer(numVertex) {
    const gl = _renderContext
    if (_indexBuffer === null) {
      // TODO do user need to release the memory ?
      _vertexBuffer = gl.createBuffer()
      _indexBuffer = gl.createBuffer()
    }
    updateBuffer(numVertex)
  }

  const VertexType = {
    QUAD: 0,
    TRIANGLE: 1,
    CUSTOM: 2,
  }

  return {
    _allNeedDraw: false,
    mat4Identity: null,

    childrenOrderDirty: true,
    assignedZ: 0,
    assignedZStep: 1 / 100,

    VertexType: VertexType,

    _transformNodePool: [], //save nodes transform dirty
    _renderCmds: [], //save renderer commands

    _isCacheToBufferOn: false, //a switch that whether cache the rendererCmd to cacheToCanvasCmds
    _cacheToBufferCmds: {}, // an array saves the renderer commands need for cache to other canvas
    _cacheInstanceIds: [],
    _currentID: 0,
    _clearColor: color(0, 0, 0, 255), //background color,default BLACK

    init: function () {
      const gl = _renderContext
      gl.disable(gl.CULL_FACE)
      gl.disable(gl.DEPTH_TEST)

      this.mat4Identity = new Matrix4()
      this.mat4Identity.identity()
      initQuadBuffer(BATCH_VERTEX_COUNT)
      // if (sys.os === sys.OS_IOS) {
      //   _IS_IOS = true
      // }
    },

    getVertexSize: function () {
      return _maxVertexSize
    },

    getRenderCmd: function (renderableObject) {
      //TODO Add renderCmd pool here
      return renderableObject._createRenderCmd()
    },

    _turnToCacheMode: function (renderTextureID) {
      this._isCacheToBufferOn = true
      renderTextureID = renderTextureID || 0
      if (!this._cacheToBufferCmds[renderTextureID]) {
        this._cacheToBufferCmds[renderTextureID] = []
      } else {
        this._cacheToBufferCmds[renderTextureID].length = 0
      }
      if (this._cacheInstanceIds.indexOf(renderTextureID) === -1) {
        this._cacheInstanceIds.push(renderTextureID)
      }
      this._currentID = renderTextureID
    },

    _turnToNormalMode: function () {
      this._isCacheToBufferOn = false
    },

    _removeCache: function (instanceID) {
      instanceID = instanceID || this._currentID
      const cmds = this._cacheToBufferCmds[instanceID]
      if (cmds) {
        cmds.length = 0
        delete this._cacheToBufferCmds[instanceID]
      }

      const locIDs = this._cacheInstanceIds
      arrayRemoveObject(locIDs, instanceID)
    },

    /**
     * drawing all renderer command to cache canvas' context
     * @param {Number} [renderTextureId]
     */
    _renderingToBuffer: function (renderTextureId) {
      renderTextureId = renderTextureId || this._currentID
      const locCmds = this._cacheToBufferCmds[renderTextureId]
      const ctx = _renderContext
      this.rendering(ctx, locCmds)
      this._removeCache(renderTextureId)

      const locIDs = this._cacheInstanceIds
      if (locIDs.length === 0) this._isCacheToBufferOn = false
      else this._currentID = locIDs[locIDs.length - 1]
    },

    //reset renderer's flag
    resetFlag: function () {
      if (this.childrenOrderDirty) {
        this.childrenOrderDirty = false
      }
      this._transformNodePool.length = 0
    },

    //update the transform data
    transform: function () {
      const locPool = this._transformNodePool
      //sort the pool
      locPool.sort(this._sortNodeByLevelAsc)
      //transform node
      let i, len, cmd
      for (i = 0, len = locPool.length; i < len; i++) {
        cmd = locPool[i]
        cmd.updateStatus()
      }
      locPool.length = 0
    },

    transformDirty: function () {
      return this._transformNodePool.length > 0
    },

    _sortNodeByLevelAsc: function (n1, n2) {
      return n1._curLevel - n2._curLevel
    },

    pushDirtyNode: function (node) {
      //if (this._transformNodePool.indexOf(node) === -1)
      this._transformNodePool.push(node)
    },

    clearRenderCommands: function () {
      // Copy previous command list for late check in rendering
      this._renderCmds.length = 0
    },

    clear: function () {
      const gl = _renderContext
      gl.clearColor(this._clearColor.r / 255, this._clearColor.g / 255, this._clearColor.b / 255, this._clearColor.a / 255)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },

    setDepthTest: function (enable) {
      const gl = _renderContext
      if (enable) {
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
      } else {
        gl.disable(gl.DEPTH_TEST)
      }
    },

    pushRenderCommand: function (cmd) {
      if (!cmd.rendering && !cmd.uploadData) return
      if (this._isCacheToBufferOn) {
        const currentId = this._currentID,
          locCmdBuffer = this._cacheToBufferCmds
        const cmdList = locCmdBuffer[currentId]
        if (cmdList.indexOf(cmd) === -1) cmdList.push(cmd)
      } else {
        if (this._renderCmds.indexOf(cmd) === -1) {
          this._renderCmds.push(cmd)
        }
      }
    },

    _increaseBatchingSize: function (increment, vertexType, indices) {
      vertexType = vertexType || VertexType.QUAD
      let i, curr
      switch (vertexType) {
        case VertexType.QUAD:
          for (i = 0; i < increment; i += 4) {
            curr = _batchingSize + i
            _indexData[_indexSize++] = curr + 0
            _indexData[_indexSize++] = curr + 1
            _indexData[_indexSize++] = curr + 2
            _indexData[_indexSize++] = curr + 1
            _indexData[_indexSize++] = curr + 2
            _indexData[_indexSize++] = curr + 3
          }
          break
        case VertexType.TRIANGLE:
          _pureQuad = false
          for (i = 0; i < increment; i += 3) {
            curr = _batchingSize + i
            _indexData[_indexSize++] = curr + 0
            _indexData[_indexSize++] = curr + 1
            _indexData[_indexSize++] = curr + 2
          }
          break
        case VertexType.CUSTOM: {
          // CUSTOM type increase the indices data
          _pureQuad = false
          const len = indices.length
          for (i = 0; i < len; i++) {
            _indexData[_indexSize++] = _batchingSize + indices[i]
          }
          break
        }
        default:
          return
      }
      _batchingSize += increment
    },

    _updateBatchedInfo: function (texture, blendFunc, glProgramState) {
      if (
        texture !== _batchedInfo.texture ||
        blendFunc.src !== _batchedInfo.blendSrc ||
        blendFunc.dst !== _batchedInfo.blendDst ||
        glProgramState !== _batchedInfo.glProgramState
      ) {
        // Draw batched elements
        this._batchRendering()
        // Update _batchedInfo
        _batchedInfo.texture = texture
        _batchedInfo.blendSrc = blendFunc.src
        _batchedInfo.blendDst = blendFunc.dst
        _batchedInfo.glProgramState = glProgramState

        return true
      } else {
        return false
      }
    },

    _breakBatch: function () {
      _batchBroken = true
    },

    _uploadBufferData: function (cmd) {
      if (_batchingSize >= _maxVertexSize) {
        this._batchRendering()
      }

      // Check batching
      const node = cmd._node
      const texture = node._texture || (node._spriteFrame && node._spriteFrame._texture)
      const blendSrc = node._blendFunc.src
      const blendDst = node._blendFunc.dst
      const glProgramState = cmd._glProgramState
      if (
        _batchBroken ||
        _batchedInfo.texture !== texture ||
        _batchedInfo.blendSrc !== blendSrc ||
        _batchedInfo.blendDst !== blendDst ||
        _batchedInfo.glProgramState !== glProgramState
      ) {
        // Draw batched elements
        this._batchRendering()
        // Update _batchedInfo
        _batchedInfo.texture = texture
        _batchedInfo.blendSrc = blendSrc
        _batchedInfo.blendDst = blendDst
        _batchedInfo.glProgramState = glProgramState
        _batchBroken = false
      }

      // Upload vertex data
      const len = cmd.uploadData(_vertexDataF32, _vertexDataUI32, _batchingSize * _sizePerVertex)
      if (len > 0) {
        this._increaseBatchingSize(len, cmd.vertexType)
      }
    },

    _batchRendering: function () {
      if (_batchingSize === 0 || !_batchedInfo.texture) {
        return
      }

      const gl = _renderContext
      const texture = _batchedInfo.texture
      const glProgramState = _batchedInfo.glProgramState
      const uploadAll = _batchingSize > _maxVertexSize * 0.5

      if (glProgramState) {
        glProgramState.apply()
        glProgramState.getGLProgram()._updateProjectionUniform()
      }

      glBlendFunc(_batchedInfo.blendSrc, _batchedInfo.blendDst)
      glBindTexture2DN(0, texture) // = glBindTexture2D(texture);

      gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer)
      // upload the vertex data to the gl buffer
      if (uploadAll) {
        gl.bufferData(gl.ARRAY_BUFFER, _vertexDataF32, gl.DYNAMIC_DRAW)
      } else {
        const view = _vertexDataF32.subarray(0, _batchingSize * _sizePerVertex)
        gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW)
      }

      gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
      gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)
      gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)
      gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0)
      gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12)
      gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _indexBuffer)
      if (!_prevIndexSize || !_pureQuad || _indexSize > _prevIndexSize) {
        if (uploadAll) {
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _indexData, gl.DYNAMIC_DRAW)
        } else {
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _indexData.subarray(0, _indexSize), gl.DYNAMIC_DRAW)
        }
      }
      gl.drawElements(gl.TRIANGLES, _indexSize, gl.UNSIGNED_SHORT, 0)

      global.g_NumberOfDraws++

      if (_pureQuad) {
        _prevIndexSize = _indexSize
      } else {
        _prevIndexSize = 0
        _pureQuad = true
      }
      _batchingSize = 0
      _indexSize = 0
    },

    rendering: function (ctx: WebGLRenderingContext, cmds?: any[]) {
      const locCmds = cmds || this._renderCmds
      let i, len, cmd
      const context = ctx || _renderContext

      // Reset buffer for rendering
      const gl = _renderContext
      context.bindBuffer(gl.ARRAY_BUFFER, null)
      for (i = 0, len = locCmds.length; i < len; ++i) {
        cmd = locCmds[i]
        if (!cmd.needDraw()) continue

        // console.log('cmd', cmd)
        if (cmd.uploadData) {
          this._uploadBufferData(cmd)
        } else {
          if (_batchingSize > 0) {
            this._batchRendering()
          }
          cmd.rendering(context)
        }
      }
      this._batchRendering()
      _batchedInfo.texture = null
    },
  }
})()
