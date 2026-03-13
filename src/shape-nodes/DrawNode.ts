import { _renderContext } from '..'
import { cardinalSplineAt, getControlPointAt } from '../actions/ActionCatmullRom'
import { Node, pNormalizeIn } from '../core'
import { p, Rect } from '../core/cocoa/Geometry'
import {
  BlendFunc,
  Color,
  color,
  incrementGLDraws,
  ONE_MINUS_SRC_ALPHA,
  SHADER_POSITION_LENGTHTEXTURECOLOR,
  SRC_ALPHA,
  VERTEX_ATTRIB_COLOR,
  VERTEX_ATTRIB_POSITION,
  VERTEX_ATTRIB_TEX_COORDS,
} from '../core/platform'
import { DRAWNODE_TOTAL_VERTICES } from '../core/platform/Config'
import { GlobalVertexBuffer } from '../core/renderer/GlobalVertexBuffer'
import { warn } from '../helper/Debugger'
import { shaderCache } from '../shaders/ShaderCache'
import { DrawNodeWebGLRenderCmd } from './DrawNodeWebGLRenderCmd'

export class DrawNode extends Node {
  static TYPE_DOT = 0
  static TYPE_SEGMENT = 1
  static TYPE_POLY = 2
  _buffer = null
  _blendFunc = null
  _lineWidth = 1
  _drawColor = null
  _localBB: Rect
  declare _renderCmd: DrawNodeWebGLRenderCmd

  setLocalBB(rectorX, y, width, height) {
    const localBB = this._localBB
    if (y === undefined) {
      localBB.x = rectorX.x
      localBB.y = rectorX.y
      localBB.width = rectorX.width
      localBB.height = rectorX.height
    } else {
      localBB.x = rectorX
      localBB.y = y
      localBB.width = width
      localBB.height = height
    }
  }
  /**
   * Gets the blend func
   * @returns {Object}
   */
  getBlendFunc() {
    return this._blendFunc
  }

  /**
   * Set the blend func
   * @param blendFunc
   * @param dst
   */
  setBlendFunc(blendFunc, dst) {
    if (dst === undefined) {
      this._blendFunc.src = blendFunc.src
      this._blendFunc.dst = blendFunc.dst
    } else {
      this._blendFunc.src = blendFunc
      this._blendFunc.dst = dst
    }
  }

  /**
   * line width setter
   * @param {Number} width
   */
  setLineWidth(width) {
    this._lineWidth = width
  }

  /**
   * line width getter
   * @returns {Number}
   */
  getLineWidth() {
    return this._lineWidth
  }

  /**
   * draw color setter
   * @param {Color} color
   */
  setDrawColor(color) {
    const locDrawColor = this._drawColor
    locDrawColor.r = color.r
    locDrawColor.g = color.g
    locDrawColor.b = color.b
    locDrawColor.a = color.a == null ? 255 : color.a
  }

  /**
   * draw color getter
   * @returns {Color}
   */
  getDrawColor() {
    return color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a)
  }
  // 9600 vertices by default configurable in ccConfig.js
  // 20 is 2 float for position, 4 int for color and 2 float for uv
  _sharedBuffer = null
  FLOAT_PER_VERTEX = 2 + 1 + 2
  VERTEX_BYTE = this.FLOAT_PER_VERTEX * 4
  FLOAT_PER_TRIANGLE = 3 * this.FLOAT_PER_VERTEX
  TRIANGLE_BYTES = this.FLOAT_PER_TRIANGLE * 4
  MAX_INCREMENT = 200

  _vertices = []
  _from = p()
  _to = p()
  _color = new Uint32Array(1)

  // Used in drawSegment
  _n = p()
  _t = p()
  _nw = p()
  _tw = p()
  _extrude = []

  _bufferCapacity = 0
  _vertexCount = 0

  _offset = 0
  _occupiedSize = 0
  _f32Buffer = null
  _ui32Buffer = null

  _dirty = false
  _className = 'DrawNodeWebGL'

  manualRelease = false

  constructor(capacity?: number, manualRelease?: boolean) {
    super()

    if (!this._sharedBuffer) {
      this._sharedBuffer = new GlobalVertexBuffer(_renderContext, DRAWNODE_TOTAL_VERTICES * this.VERTEX_BYTE)
    }

    this._renderCmd._shaderProgram = shaderCache.programForKey(SHADER_POSITION_LENGTHTEXTURECOLOR)
    this._blendFunc = new BlendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)
    this._drawColor = color(255, 255, 255, 255)

    this._bufferCapacity = capacity || 64
    this.manualRelease = manualRelease

    this._dirty = true
    this._localBB = Rect()
  }

  onEnter() {
    Node.prototype.onEnter.call(this)
    if (this._occupiedSize < this._bufferCapacity) {
      this._ensureCapacity(this._bufferCapacity)
    }
  }

  onExit() {
    if (!this.manualRelease) {
      this.release()
    }
    Node.prototype.onExit.call(this)
  }

  release() {
    if (this._occupiedSize > 0) {
      this._vertexCount = 0
      this._sharedBuffer.freeBuffer(this._offset, this.VERTEX_BYTE * this._occupiedSize)
      this._occupiedSize = 0
    }
  }

  _ensureCapacity(count) {
    const prev = this._occupiedSize
    const prevOffset = this._offset
    if (count > prev || this._bufferCapacity > prev) {
      const request = Math.max(Math.min(prev + prev, this.MAX_INCREMENT), count, this._bufferCapacity)
      // free previous buffer
      if (prev !== 0) {
        this._sharedBuffer.freeBuffer(prevOffset, this.VERTEX_BYTE * prev)
        this._occupiedSize = 0
      }
      const offset = (this._offset = this._sharedBuffer.requestBuffer(this.VERTEX_BYTE * request))
      if (offset >= 0) {
        this._occupiedSize = this._bufferCapacity = request
        // 5 floats per vertex
        this._f32Buffer = new Float32Array(this._sharedBuffer.data, offset, this.FLOAT_PER_VERTEX * this._occupiedSize)
        this._ui32Buffer = new Uint32Array(this._sharedBuffer.data, offset, this.FLOAT_PER_VERTEX * this._occupiedSize)

        // Copy old data
        if (prev !== 0 && prevOffset !== offset) {
          // offset is in byte, we need to transform to float32 index
          const last = prevOffset / 4 + prev * this.FLOAT_PER_VERTEX
          for (let i = offset / 4, j = prevOffset / 4; j < last; i++, j++) {
            this._sharedBuffer.dataArray[i] = this._sharedBuffer.dataArray[j]
          }
        }

        return true
      } else {
        warn(`Failed to allocate buffer for DrawNode= buffer for ${request} vertices requested`)
        return false
      }
    } else {
      return true
    }
  }

  drawRect(origin, destination, fillColor, lineWidth?, lineColor?) {
    lineWidth = lineWidth == null ? this._lineWidth : lineWidth
    lineColor = lineColor || this._drawColor
    this._vertices.length = 0
    this._vertices.push(origin.x, origin.y, destination.x, origin.y, destination.x, destination.y, origin.x, destination.y)
    if (fillColor == null) this._drawSegments(this._vertices, lineWidth, lineColor, true)
    else this.drawPoly(this._vertices, fillColor, lineWidth, lineColor)
    this._vertices.length = 0
  }

  drawCircle(center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
    lineWidth = lineWidth || this._lineWidth
    color = color || this._drawColor
    const coef = (2.0 * Math.PI) / segments
    let i
    let len
    this._vertices.length = 0
    for (i = 0; i <= segments; i++) {
      const rads = i * coef
      const j = radius * Math.cos(rads + angle) + center.x
      const k = radius * Math.sin(rads + angle) + center.y
      this._vertices.push(j, k)
    }
    if (drawLineToCenter) this._vertices.push(center.x, center.y)

    lineWidth *= 0.5
    for (i = 0, len = this._vertices.length - 2; i < len; i += 2) {
      this._from.x = this._vertices[i]
      this._from.y = this._vertices[i + 1]
      this._to.x = this._vertices[i + 2]
      this._to.y = this._vertices[i + 3]
      this.drawSegment(this._from, this._to, lineWidth, color)
    }
    this._vertices.length = 0
  }

  drawQuadBezier(origin, control, destination, segments, lineWidth, color) {
    lineWidth = lineWidth || this._lineWidth
    color = color || this._drawColor
    let t = 0.0
    this._vertices.length = 0
    for (let i = 0; i < segments; i++) {
      const x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x
      const y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y
      this._vertices.push(x, y)
      t += 1.0 / segments
    }
    this._vertices.push(destination.x, destination.y)
    this._drawSegments(this._vertices, lineWidth, color, false)
    this._vertices.length = 0
  }

  drawCubicBezier(origin, control1, control2, destination, segments, lineWidth, color) {
    lineWidth = lineWidth || this._lineWidth
    color = color || this._drawColor
    let t = 0
    this._vertices.length = 0
    for (let i = 0; i < segments; i++) {
      const x =
        Math.pow(1 - t, 3) * origin.x +
        3.0 * Math.pow(1 - t, 2) * t * control1.x +
        3.0 * (1 - t) * t * t * control2.x +
        t * t * t * destination.x
      const y =
        Math.pow(1 - t, 3) * origin.y +
        3.0 * Math.pow(1 - t, 2) * t * control1.y +
        3.0 * (1 - t) * t * t * control2.y +
        t * t * t * destination.y
      this._vertices.push(x, y)
      t += 1.0 / segments
    }
    this._vertices.push(destination.x, destination.y)
    this._drawSegments(this._vertices, lineWidth, color, false)
    this._vertices.length = 0
  }

  drawCatmullRom(points, segments, lineWidth, color) {
    this.drawCardinalSpline(points, 0.5, segments, lineWidth, color)
  }

  drawCardinalSpline(config, tension, segments, lineWidth, color) {
    lineWidth = lineWidth || this._lineWidth
    color = color || this._drawColor
    let p
    let lt
    const deltaT = 1.0 / config.length
    this._vertices.length = 0

    for (let i = 0; i < segments + 1; i++) {
      const dt = i / segments

      // border
      if (dt === 1) {
        p = config.length - 1
        lt = 1
      } else {
        p = 0 | (dt / deltaT)
        lt = (dt - deltaT * p) / deltaT
      }

      // Interpolate
      cardinalSplineAt(
        getControlPointAt(config, p - 1),
        getControlPointAt(config, p - 0),
        getControlPointAt(config, p + 1),
        getControlPointAt(config, p + 2),
        tension,
        lt,
        this._from,
      )
      this._vertices.push(this._from.x, this._from.y)
    }

    lineWidth *= 0.5
    for (let j = 0, len = this._vertices.length - 2; j < len; j += 2) {
      this._from.x = this._vertices[j]
      this._from.y = this._vertices[j + 1]
      this._to.x = this._vertices[j + 2]
      this._to.y = this._vertices[j + 3]
      this.drawSegment(this._from, this._to, lineWidth, color)
    }
    this._vertices.length = 0
  }

  drawDots(points, radius, color) {
    if (!points || points.length === 0) return
    color = color || this._drawColor
    for (let i = 0, len = points.length; i < len; i++) {
      this.drawDot(points[i], radius, color)
    }
  }

  _render() {
    const gl = _renderContext
    if (this._offset < 0 || this._vertexCount <= 0) {
      return
    }

    if (this._dirty) {
      // bindBuffer is done in updateSubData
      this._sharedBuffer.updateSubData(this._offset, this._f32Buffer)
      this._dirty = false
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._sharedBuffer.vertexBuffer)
    }

    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR)
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS)

    // vertex
    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, this.VERTEX_BYTE, 0)
    // color
    gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, this.VERTEX_BYTE, 8)
    // texcood
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, this.VERTEX_BYTE, 12)

    gl.drawArrays(gl.TRIANGLES, this._offset / this.VERTEX_BYTE, this._vertexCount)
    incrementGLDraws(1)
    //checkGLErrorDebug();
  }

  appendVertexData(x, y, color, u, v) {
    const f32Buffer = this._f32Buffer
    // Float offset = byte offset / 4 + vertex count * floats by vertex
    const offset = this._vertexCount * this.FLOAT_PER_VERTEX
    f32Buffer[offset] = x
    f32Buffer[offset + 1] = y
    this._color[0] = (color.a << 24) | (color.b << 16) | (color.g << 8) | color.r
    this._ui32Buffer[offset + 2] = this._color[0]
    f32Buffer[offset + 3] = u
    f32Buffer[offset + 4] = v
    this._vertexCount++
  }

  drawDot(pos, radius, color?) {
    color = color || this._drawColor
    if (color.a == null) color.a = 255
    const l = pos.x - radius,
      b = pos.y - radius,
      r = pos.x + radius,
      t = pos.y + radius

    const vertexCount = 2 * 3
    const succeed = this._ensureCapacity(this._vertexCount + vertexCount)
    if (!succeed) return

    // lb, lt, rt, lb, rt, rb
    this.appendVertexData(l, b, color, -1, -1)
    this.appendVertexData(l, t, color, -1, 1)
    this.appendVertexData(r, t, color, 1, 1)
    this.appendVertexData(l, b, color, -1, -1)
    this.appendVertexData(r, t, color, 1, 1)
    this.appendVertexData(r, b, color, 1, -1)

    this._dirty = true
  }

  drawSegment(from, to, radius?, color?) {
    color = color || this.getDrawColor()
    if (color.a == null) color.a = 255
    radius = radius || this._lineWidth * 0.5
    const vertexCount = 6 * 3
    const succeed = this._ensureCapacity(this._vertexCount + vertexCount)
    if (!succeed) return

    const a = from,
      b = to
    // var n = normalize(perp(sub(b, a)))
    const _n = this._n,
      _t = this._t,
      _nw = this._nw,
      _tw = this._tw
    _n.x = a.y - b.y
    _n.y = b.x - a.x
    pNormalizeIn(_n)
    // var t = perp(n);
    _t.x = -_n.y
    _t.y = _n.x
    // var nw = mult(n, radius), tw = mult(t, radius);
    pMultOut(_n, radius, _nw)
    pMultOut(_t, radius, _tw)

    // var v0 = sub(b, add(nw, tw)); uv0 = neg(add(n, t))
    const v0x = b.x - _nw.x - _tw.x,
      v0y = b.y - _nw.y - _tw.y,
      u0 = -(_n.x + _t.x),
      v0 = -(_n.y + _t.y)
    // var v1 = add(b, sub(nw, tw)); uv1 = sub(n, t)
    const v1x = b.x + _nw.x - _tw.x,
      v1y = b.y + _nw.y - _tw.y,
      u1 = _n.x - _t.x,
      v1 = _n.y - _t.y
    // var v2 = sub(b, nw); uv2 = neg(n)
    const v2x = b.x - _nw.x,
      v2y = b.y - _nw.y,
      u2 = -_n.x,
      v2 = -_n.y
    // var v3 = add(b, nw); uv3 = n
    const v3x = b.x + _nw.x,
      v3y = b.y + _nw.y,
      u3 = _n.x,
      v3 = _n.y
    // var v4 = sub(a, nw); uv4 = neg(n)
    const v4x = a.x - _nw.x,
      v4y = a.y - _nw.y,
      u4 = u2,
      v4 = v2
    // var v5 = add(a, nw); uv5 = n
    const v5x = a.x + _nw.x,
      v5y = a.y + _nw.y,
      u5 = _n.x,
      v5 = _n.y
    // var v6 = sub(a, sub(nw, tw)); uv6 = sub(t, n)
    const v6x = a.x - _nw.x + _tw.x,
      v6y = a.y - _nw.y + _tw.y,
      u6 = _t.x - _n.x,
      v6 = _t.y - _n.y
    // var v7 = add(a, add(nw, tw)); uv7 = add(n, t)
    const v7x = a.x + _nw.x + _tw.x,
      v7y = a.y + _nw.y + _tw.y,
      u7 = _n.x + _t.x,
      v7 = _n.y + _t.y

    this.appendVertexData(v0x, v0y, color, u0, v0)
    this.appendVertexData(v1x, v1y, color, u1, v1)
    this.appendVertexData(v2x, v2y, color, u2, v2)

    this.appendVertexData(v3x, v3y, color, u3, v3)
    this.appendVertexData(v1x, v1y, color, u1, v1)
    this.appendVertexData(v2x, v2y, color, u2, v2)

    this.appendVertexData(v3x, v3y, color, u3, v3)
    this.appendVertexData(v4x, v4y, color, u4, v4)
    this.appendVertexData(v2x, v2y, color, u2, v2)

    this.appendVertexData(v3x, v3y, color, u3, v3)
    this.appendVertexData(v4x, v4y, color, u4, v4)
    this.appendVertexData(v5x, v5y, color, u5, v5)

    this.appendVertexData(v6x, v6y, color, u6, v6)
    this.appendVertexData(v4x, v4y, color, u4, v4)
    this.appendVertexData(v5x, v5y, color, u5, v5)

    this.appendVertexData(v6x, v6y, color, u6, v6)
    this.appendVertexData(v7x, v7y, color, u7, v7)
    this.appendVertexData(v5x, v5y, color, u5, v5)
    this._dirty = true
  }

  drawPoly(verts, fillColor: Color, borderWidth: number, borderColor: Color) {
    // Backward compatibility
    if (typeof verts[0] === 'object') {
      this._vertices.length = 0
      for (let i = 0; i < verts.length; i++) {
        this._vertices.push(verts[i].x, verts[i].y)
      }
      verts = this._vertices
    }

    if (fillColor == null) {
      this._drawSegments(verts, borderWidth, borderColor, true)
      return
    }
    if (fillColor.a == null) fillColor.a = 255
    if (borderColor.a == null) borderColor.a = 255
    borderWidth = borderWidth == null ? this._lineWidth : borderWidth
    borderWidth *= 0.5
    let v0x, v0y, v1x, v1y, v2x, v2y
    let factor, offx, offy
    let i
    let count = verts.length
    this._extrude.length = 0
    for (i = 0; i < count; i += 2) {
      v0x = verts[(i - 2 + count) % count]
      v0y = verts[(i - 1 + count) % count]
      v1x = verts[i]
      v1y = verts[i + 1]
      v2x = verts[(i + 2) % count]
      v2y = verts[(i + 3) % count]
      // var n1 = normalize(perp(sub(v1, v0)));
      // var n2 = normalize(perp(sub(v2, v1)));
      const _n = this._n,
        _nw = this._nw
      _n.x = v0y - v1y
      _n.y = v1x - v0x
      _nw.x = v1y - v2y
      _nw.y = v2x - v1x
      pNormalizeIn(_n)
      pNormalizeIn(_nw)
      // var offset = mult(add(n1, n2), 1.0 / (dot(n1, n2) + 1.0));
      factor = _n.x * _nw.x + _n.y * _nw.y + 1
      offx = (_n.x + _nw.x) / factor
      offy = (_n.y + _nw.y) / factor
      // extrude[i] = {offset: offset, n: n2};
      this._extrude.push(offx, offy, _nw.x, _nw.y)
    }
    // The actual input vertex count
    count = count / 2
    const outline = borderWidth > 0.0,
      triangleCount = 3 * count - 2,
      vertexCount = 3 * triangleCount
    const succeed = this._ensureCapacity(this._vertexCount + vertexCount)
    if (!succeed) return

    const inset = outline == false ? 0.5 : 0.0
    for (i = 0; i < count - 2; i++) {
      // v0 = sub(verts[0], multi(extrude[0].offset, inset));
      v0x = verts[0] - this._extrude[0] * inset
      v0y = verts[1] - this._extrude[1] * inset
      // v1 = sub(verts[i + 1], multi(extrude[i + 1].offset, inset));
      v1x = verts[i * 2 + 2] - this._extrude[(i + 1) * 4] * inset
      v1y = verts[i * 2 + 3] - this._extrude[(i + 1) * 4 + 1] * inset
      // v2 = sub(verts[i + 2], multi(extrude[i + 2].offset, inset));
      v2x = verts[i * 2 + 4] - this._extrude[(i + 2) * 4] * inset
      v2y = verts[i * 2 + 5] - this._extrude[(i + 2) * 4 + 1] * inset

      this.appendVertexData(v0x, v0y, fillColor, 0, 0)
      this.appendVertexData(v1x, v1y, fillColor, 0, 0)
      this.appendVertexData(v2x, v2y, fillColor, 0, 0)
    }

    let off0x
    let off0y
    let off1x
    let off1y
    const bw = outline ? borderWidth : 0.5
    const color = outline ? borderColor : fillColor
    let in0x
    let in0y
    let in1x
    let in1y
    let out0x
    let out0y
    let out1x
    let out1y
    for (i = 0; i < count; i++) {
      const j = (i + 1) % count
      v0x = verts[i * 2]
      v0y = verts[i * 2 + 1]
      v1x = verts[j * 2]
      v1y = verts[j * 2 + 1]
      const _n = this._n,
        _nw = this._nw
      _n.x = this._extrude[i * 4 + 2]
      _n.y = this._extrude[i * 4 + 3]
      _nw.x = outline ? -_n.x : 0
      _nw.y = outline ? -_n.y : 0
      off0x = this._extrude[i * 4]
      off0y = this._extrude[i * 4 + 1]
      off1x = this._extrude[j * 4]
      off1y = this._extrude[j * 4 + 1]

      in0x = v0x - off0x * bw
      in0y = v0y - off0y * bw
      in1x = v1x - off1x * bw
      in1y = v1y - off1y * bw
      out0x = v0x + off0x * bw
      out0y = v0y + off0y * bw
      out1x = v1x + off1x * bw
      out1y = v1y + off1y * bw

      this.appendVertexData(in0x, in0y, color, _nw.x, _nw.y)
      this.appendVertexData(in1x, in1y, color, _nw.x, _nw.y)
      this.appendVertexData(out1x, out1y, color, _n.x, _n.y)

      this.appendVertexData(in0x, in0y, color, _nw.x, _nw.y)
      this.appendVertexData(out0x, out0y, color, _n.x, _n.y)
      this.appendVertexData(out1x, out1y, color, _n.x, _n.y)
    }
    this._extrude.length = 0
    this._vertices.length = 0
    this._dirty = true
  }

  _drawSegments(verts, borderWidth, borderColor, closePoly) {
    borderWidth = borderWidth == null ? this._lineWidth : borderWidth
    if (borderWidth <= 0) return

    borderColor = borderColor || this._drawColor
    if (borderColor.a == null) borderColor.a = 255
    borderWidth *= 0.5

    let v0x,
      v0y,
      v1x,
      v1y,
      v2x,
      v2y,
      factor,
      offx,
      offy,
      i,
      count = verts.length
    this._extrude.length = 0
    for (i = 0; i < count; i += 2) {
      v0x = verts[(i - 2 + count) % count]
      v0y = verts[(i - 1 + count) % count]
      v1x = verts[i]
      v1y = verts[i + 1]
      v2x = verts[(i + 2) % count]
      v2y = verts[(i + 3) % count]
      // var n1 = normalize(perp(sub(v1, v0)));
      // var n2 = normalize(perp(sub(v2, v1)));
      const _n = this._n,
        _nw = this._nw
      _n.x = v0y - v1y
      _n.y = v1x - v0x
      _nw.x = v1y - v2y
      _nw.y = v2x - v1x
      pNormalizeIn(_n)
      pNormalizeIn(_nw)
      // var offset = multi(add(n1, n2), 1.0 / (dot(n1, n2) + 1.0));
      factor = _n.x * _nw.x + _n.y * _nw.y + 1
      offx = (_n.x + _nw.x) / factor
      offy = (_n.y + _nw.y) / factor
      // extrude[i] = {offset: offset, n: n2};
      this._extrude.push(offx, offy, _nw.x, _nw.y)
    }

    // The actual input vertex count
    count = count / 2
    const triangleCount = 3 * count - 2,
      vertexCount = 3 * triangleCount
    const succeed = this._ensureCapacity(this._vertexCount + vertexCount)
    if (!succeed) return

    const len = closePoly ? count : count - 1
    let off0x
    let off0y
    let off1x
    let off1y
    let in0x
    let in0y
    let in1x
    let in1y
    let out0x
    let out0y
    let out1x
    let out1y
    for (i = 0; i < len; i++) {
      const j = (i + 1) % count
      v0x = verts[i * 2]
      v0y = verts[i * 2 + 1]
      v1x = verts[j * 2]
      v1y = verts[j * 2 + 1]
      const _n = this._n
      _n.x = this._extrude[i * 4 + 2]
      _n.y = this._extrude[i * 4 + 3]
      off0x = this._extrude[i * 4]
      off0y = this._extrude[i * 4 + 1]
      off1x = this._extrude[j * 4]
      off1y = this._extrude[j * 4 + 1]
      in0x = v0x - off0x * borderWidth
      in0y = v0y - off0y * borderWidth
      in1x = v1x - off1x * borderWidth
      in1y = v1y - off1y * borderWidth
      out0x = v0x + off0x * borderWidth
      out0y = v0y + off0y * borderWidth
      out1x = v1x + off1x * borderWidth
      out1y = v1y + off1y * borderWidth

      this.appendVertexData(in0x, in0y, borderColor, -_n.x, -_n.y)
      this.appendVertexData(in1x, in1y, borderColor, -_n.x, -_n.y)
      this.appendVertexData(out1x, out1y, borderColor, _n.x, _n.y)

      this.appendVertexData(in0x, in0y, borderColor, -_n.x, -_n.y)
      this.appendVertexData(out0x, out0y, borderColor, _n.x, _n.y)
      this.appendVertexData(out1x, out1y, borderColor, _n.x, _n.y)
    }
    this._extrude.length = 0
    this._dirty = true
  }

  clear() {
    this.release()
    this._dirty = true
  }

  _createRenderCmd() {
    return new DrawNodeWebGLRenderCmd(this)
  }
}

function pMultOut(pin, floatVar, pout) {
  pout.x = pin.x * floatVar
  pout.y = pin.y * floatVar
}
