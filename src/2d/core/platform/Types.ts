import { Game, game } from '../../..'
import { _renderType } from '../../../helper/engine'
import { defineGetterSetter } from '../sprites/SpritesPropertyDefine'
import { color } from './Color'

/**
 * the device accelerometer reports values for each axis in units of g-force
 * @class Acceleration
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} timestamp
 */
export const Acceleration = function (x, y, z, timestamp) {
  this.x = x || 0
  this.y = y || 0
  this.z = z || 0
  this.timestamp = timestamp || 0
}

/**
 * @class Vertex2F
 * @param {Number} x
 * @param {Number}y
 * @param {Array} arrayBuffer
 * @param {Number}offset
 * @constructor
 */
export const Vertex2F = function (x, y, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex2F.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  this._view = new Float32Array(this._arrayBuffer, this._offset, 2)
  this._view[0] = x || 0
  this._view[1] = y || 0
}
/**
 * @constant
 * @type {number}
 */
Vertex2F.BYTES_PER_ELEMENT = 8

_p = Vertex2F.prototype
_p._getX = function () {
  return this._view[0]
}
_p._setX = function (xValue) {
  this._view[0] = xValue
}
_p._getY = function () {
  return this._view[1]
}
_p._setY = function (yValue) {
  this._view[1] = yValue
}
/** @expose */
_p.x
defineGetterSetter(_p, 'x', _p._getX, _p._setX)
/** @expose */
_p.y
defineGetterSetter(_p, 'y', _p._getY, _p._setY)

/**
 * @class Vertex3F
 * @param {Number} x
 * @param {Number} y
 * @param {Number}z
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export const Vertex3F = function (x, y, z, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex3F.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  const locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset
  this._view = new Float32Array(locArrayBuffer, locOffset, 3)
  this._view[0] = x || 0
  this._view[1] = y || 0
  this._view[2] = z || 0
}
/**
 * @constant
 * @type {number}
 */
Vertex3F.BYTES_PER_ELEMENT = 12

_p = Vertex3F.prototype
_p._getX = function () {
  return this._view[0]
}
_p._setX = function (xValue) {
  this._view[0] = xValue
}
_p._getY = function () {
  return this._view[1]
}
_p._setY = function (yValue) {
  this._view[1] = yValue
}
_p._getZ = function () {
  return this._view[2]
}
_p._setZ = function (zValue) {
  this._view[2] = zValue
}
/** @expose */
_p.x
defineGetterSetter(_p, 'x', _p._getX, _p._setX)
/** @expose */
_p.y
defineGetterSetter(_p, 'y', _p._getY, _p._setY)
/** @expose */
_p.z
defineGetterSetter(_p, 'z', _p._getZ, _p._setZ)

/**
 * @class Tex2F
 * @param {Number} u
 * @param {Number} v
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
Tex2F = function (u, v, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(Tex2F.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  this._view = new Float32Array(this._arrayBuffer, this._offset, 2)
  this._view[0] = u || 0
  this._view[1] = v || 0
}
/**
 * @constants
 * @type {number}
 */
Tex2F.BYTES_PER_ELEMENT = 8

_p = Tex2F.prototype
_p._getU = function () {
  return this._view[0]
}
_p._setU = function (xValue) {
  this._view[0] = xValue
}
_p._getV = function () {
  return this._view[1]
}
_p._setV = function (yValue) {
  this._view[1] = yValue
}
/** @expose */
_p.u
defineGetterSetter(_p, 'u', _p._getU, _p._setU)
/** @expose */
_p.v
defineGetterSetter(_p, 'v', _p._getV, _p._setV)

/**
 * @class Quad2
 * @param {Vertex2F} tl
 * @param {Vertex2F} tr
 * @param {Vertex2F} bl
 * @param {Vertex2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export const Quad2 = function (tl, tr, bl, br, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(Quad2.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset,
    locElementLen = Vertex2F.BYTES_PER_ELEMENT
  this._tl = tl ? new Vertex2F(tl.x, tl.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._tr = tr ? new Vertex2F(tr.x, tr.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._bl = bl ? new Vertex2F(bl.x, bl.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._br = br ? new Vertex2F(br.x, br.y, locArrayBuffer, locOffset) : new Vertex2F(0, 0, locArrayBuffer, locOffset)
}
/**
 * @constant
 * @type {number}
 */
Quad2.BYTES_PER_ELEMENT = 32

_p = Quad2.prototype
_p._getTL = function () {
  return this._tl
}
_p._setTL = function (tlValue) {
  this._tl._view[0] = tlValue.x
  this._tl._view[1] = tlValue.y
}
_p._getTR = function () {
  return this._tr
}
_p._setTR = function (trValue) {
  this._tr._view[0] = trValue.x
  this._tr._view[1] = trValue.y
}
_p._getBL = function () {
  return this._bl
}
_p._setBL = function (blValue) {
  this._bl._view[0] = blValue.x
  this._bl._view[1] = blValue.y
}
_p._getBR = function () {
  return this._br
}
_p._setBR = function (brValue) {
  this._br._view[0] = brValue.x
  this._br._view[1] = brValue.y
}

/** @expose */
_p.tl
defineGetterSetter(_p, 'tl', _p._getTL, _p._setTL)
/** @expose */
_p.tr
defineGetterSetter(_p, 'tr', _p._getTR, _p._setTR)
/** @expose */
_p.bl
defineGetterSetter(_p, 'bl', _p._getBL, _p._setBL)
/** @expose */
_p.br
defineGetterSetter(_p, 'br', _p._getBR, _p._setBR)

/**
 * A 3D Quad. 4 * 3 floats
 * @Class Quad3
 * @Construct
 * @param {Vertex3F} bl
 * @param {Vertex3F} br
 * @param {Vertex3F} tl
 * @param {Vertex3F} tr
 */
export const Quad3 = function (bl, br, tl, tr, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(Quad3.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset,
    locElementLen = Vertex3F.BYTES_PER_ELEMENT
  this.bl = bl ? new Vertex3F(bl.x, bl.y, bl.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this.br = br ? new Vertex3F(br.x, br.y, br.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this.tl = tl ? new Vertex3F(tl.x, tl.y, tl.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this.tr = tr ? new Vertex3F(tr.x, tr.y, tr.z, locArrayBuffer, locOffset) : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset)
}
/**
 * @constant
 * @type {number}
 */
Quad3.BYTES_PER_ELEMENT = 48

/**
 * @class V3F_C4B_T2F
 * @param {Vertex3F} vertices
 * @param {Color} colors
 * @param {Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export const V3F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(V3F_C4B_T2F.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset
  this._vertices = vertices
    ? new Vertex3F(vertices.x, vertices.y, vertices.z, locArrayBuffer, locOffset)
    : new Vertex3F(0, 0, 0, locArrayBuffer, locOffset)

  locOffset += Vertex3F.BYTES_PER_ELEMENT
  this._colors = colors
    ? new _WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset)
    : new _WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset)

  locOffset += _WebGLColor.BYTES_PER_ELEMENT
  this._texCoords = texCoords ? new Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) : new Tex2F(0, 0, locArrayBuffer, locOffset)
}
/**
 * @constant
 * @type {number}
 */
V3F_C4B_T2F.BYTES_PER_ELEMENT = 24

_p = V3F_C4B_T2F.prototype
_p._getVertices = function () {
  return this._vertices
}
_p._setVertices = function (verticesValue) {
  const locVertices = this._vertices
  locVertices._view[0] = verticesValue.x
  locVertices._view[1] = verticesValue.y
  locVertices._view[2] = verticesValue.z
}
_p._getColor = function () {
  return this._colors
}
_p._setColor = function (colorValue) {
  const locColors = this._colors
  locColors._view[0] = colorValue.r
  locColors._view[1] = colorValue.g
  locColors._view[2] = colorValue.b
  locColors._view[3] = colorValue.a
}
_p._getTexCoords = function () {
  return this._texCoords
}
_p._setTexCoords = function (texValue) {
  this._texCoords._view[0] = texValue.u
  this._texCoords._view[1] = texValue.v
}
/** @expose */
_p.vertices
defineGetterSetter(_p, 'vertices', _p._getVertices, _p._setVertices)
/** @expose */
_p.colors
defineGetterSetter(_p, 'colors', _p._getColor, _p._setColor)
/** @expose */
_p.texCoords
defineGetterSetter(_p, 'texCoords', _p._getTexCoords, _p._setTexCoords)

/**
 * @class V3F_C4B_T2F_Quad
 * @param {V3F_C4B_T2F} tl
 * @param {V3F_C4B_T2F} bl
 * @param {V3F_C4B_T2F} tr
 * @param {V3F_C4B_T2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
V3F_C4B_T2F_Quad = function (tl, bl, tr, br, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset,
    locElementLen = V3F_C4B_T2F.BYTES_PER_ELEMENT
  this._tl = tl
    ? new V3F_C4B_T2F(tl.vertices, tl.colors, tl.texCoords, locArrayBuffer, locOffset)
    : new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._bl = bl
    ? new V3F_C4B_T2F(bl.vertices, bl.colors, bl.texCoords, locArrayBuffer, locOffset)
    : new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._tr = tr
    ? new V3F_C4B_T2F(tr.vertices, tr.colors, tr.texCoords, locArrayBuffer, locOffset)
    : new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._br = br
    ? new V3F_C4B_T2F(br.vertices, br.colors, br.texCoords, locArrayBuffer, locOffset)
    : new V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
}
/**
 * @constant
 * @type {number}
 */
V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96
_p = V3F_C4B_T2F_Quad.prototype
_p._getTL = function () {
  return this._tl
}
_p._setTL = function (tlValue) {
  const locTl = this._tl
  locTl.vertices = tlValue.vertices
  locTl.colors = tlValue.colors
  locTl.texCoords = tlValue.texCoords
}
_p._getBL = function () {
  return this._bl
}
_p._setBL = function (blValue) {
  const locBl = this._bl
  locBl.vertices = blValue.vertices
  locBl.colors = blValue.colors
  locBl.texCoords = blValue.texCoords
}
_p._getTR = function () {
  return this._tr
}
_p._setTR = function (trValue) {
  const locTr = this._tr
  locTr.vertices = trValue.vertices
  locTr.colors = trValue.colors
  locTr.texCoords = trValue.texCoords
}
_p._getBR = function () {
  return this._br
}
_p._setBR = function (brValue) {
  const locBr = this._br
  locBr.vertices = brValue.vertices
  locBr.colors = brValue.colors
  locBr.texCoords = brValue.texCoords
}
_p._getArrayBuffer = function () {
  return this._arrayBuffer
}

/** @expose */
_p.tl
defineGetterSetter(_p, 'tl', _p._getTL, _p._setTL)
/** @expose */
_p.tr
defineGetterSetter(_p, 'tr', _p._getTR, _p._setTR)
/** @expose */
_p.bl
defineGetterSetter(_p, 'bl', _p._getBL, _p._setBL)
/** @expose */
_p.br
defineGetterSetter(_p, 'br', _p._getBR, _p._setBR)
/** @expose */
_p.arrayBuffer
defineGetterSetter(_p, 'arrayBuffer', _p._getArrayBuffer, null)

/**
 * @function
 * @returns {V3F_C4B_T2F_Quad}
 */
V3F_C4B_T2F_QuadZero = function () {
  return new V3F_C4B_T2F_Quad()
}

/**
 * @function
 * @param {V3F_C4B_T2F_Quad} sourceQuad
 * @return {V3F_C4B_T2F_Quad}
 */
V3F_C4B_T2F_QuadCopy = function (sourceQuad) {
  if (!sourceQuad) return V3F_C4B_T2F_QuadZero()

  //return new V3F_C4B_T2F_Quad(sourceQuad,tl,sourceQuad,bl,sourceQuad.tr,sourceQuad.br,null,0);
  const srcTL = sourceQuad.tl,
    srcBL = sourceQuad.bl,
    srcTR = sourceQuad.tr,
    srcBR = sourceQuad.br
  return {
    tl: {
      vertices: { x: srcTL.vertices.x, y: srcTL.vertices.y, z: srcTL.vertices.z },
      colors: { r: srcTL.colors.r, g: srcTL.colors.g, b: srcTL.colors.b, a: srcTL.colors.a },
      texCoords: { u: srcTL.texCoords.u, v: srcTL.texCoords.v },
    },
    bl: {
      vertices: { x: srcBL.vertices.x, y: srcBL.vertices.y, z: srcBL.vertices.z },
      colors: { r: srcBL.colors.r, g: srcBL.colors.g, b: srcBL.colors.b, a: srcBL.colors.a },
      texCoords: { u: srcBL.texCoords.u, v: srcBL.texCoords.v },
    },
    tr: {
      vertices: { x: srcTR.vertices.x, y: srcTR.vertices.y, z: srcTR.vertices.z },
      colors: { r: srcTR.colors.r, g: srcTR.colors.g, b: srcTR.colors.b, a: srcTR.colors.a },
      texCoords: { u: srcTR.texCoords.u, v: srcTR.texCoords.v },
    },
    br: {
      vertices: { x: srcBR.vertices.x, y: srcBR.vertices.y, z: srcBR.vertices.z },
      colors: { r: srcBR.colors.r, g: srcBR.colors.g, b: srcBR.colors.b, a: srcBR.colors.a },
      texCoords: { u: srcBR.texCoords.u, v: srcBR.texCoords.v },
    },
  }
}

/**
 * @function
 * @param {Array} sourceQuads
 * @returns {Array}
 */
V3F_C4B_T2F_QuadsCopy = function (sourceQuads) {
  if (!sourceQuads) return []

  const retArr = []
  for (let i = 0; i < sourceQuads.length; i++) {
    retArr.push(V3F_C4B_T2F_QuadCopy(sourceQuads[i]))
  }
  return retArr
}

//redefine V2F_C4B_T2F
/**
 * @class V2F_C4B_T2F
 * @param {Vertex2F} vertices
 * @param {Color} colors
 * @param {Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
V2F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(V2F_C4B_T2F.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset
  this._vertices = vertices
    ? new Vertex2F(vertices.x, vertices.y, locArrayBuffer, locOffset)
    : new Vertex2F(0, 0, locArrayBuffer, locOffset)
  locOffset += Vertex2F.BYTES_PER_ELEMENT
  this._colors = colors
    ? new _WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset)
    : new _WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset)
  locOffset += _WebGLColor.BYTES_PER_ELEMENT
  this._texCoords = texCoords ? new Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) : new Tex2F(0, 0, locArrayBuffer, locOffset)
}

/**
 * @constant
 * @type {number}
 */
V2F_C4B_T2F.BYTES_PER_ELEMENT = 20
_p = V2F_C4B_T2F.prototype
_p._getVertices = function () {
  return this._vertices
}
_p._setVertices = function (verticesValue) {
  this._vertices._view[0] = verticesValue.x
  this._vertices._view[1] = verticesValue.y
}
_p._getColor = function () {
  return this._colors
}
_p._setColor = function (colorValue) {
  const locColors = this._colors
  locColors._view[0] = colorValue.r
  locColors._view[1] = colorValue.g
  locColors._view[2] = colorValue.b
  locColors._view[3] = colorValue.a
}
_p._getTexCoords = function () {
  return this._texCoords
}
_p._setTexCoords = function (texValue) {
  this._texCoords._view[0] = texValue.u
  this._texCoords._view[1] = texValue.v
}

/** @expose */
_p.vertices
defineGetterSetter(_p, 'vertices', _p._getVertices, _p._setVertices)
/** @expose */
_p.colors
defineGetterSetter(_p, 'colors', _p._getColor, _p._setColor)
/** @expose */
_p.texCoords
defineGetterSetter(_p, 'texCoords', _p._getTexCoords, _p._setTexCoords)

//redefine V2F_C4B_T2F_Triangle
/**
 * @class V2F_C4B_T2F_Triangle
 * @param {V2F_C4B_T2F} a
 * @param {V2F_C4B_T2F} b
 * @param {V2F_C4B_T2F} c
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export const V2F_C4B_T2F_Triangle = function (a, b, c, arrayBuffer, offset) {
  this._arrayBuffer = arrayBuffer || new ArrayBuffer(V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT)
  this._offset = offset || 0

  let locArrayBuffer = this._arrayBuffer,
    locOffset = this._offset,
    locElementLen = V2F_C4B_T2F.BYTES_PER_ELEMENT
  this._a = a
    ? new V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, locArrayBuffer, locOffset)
    : new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._b = b
    ? new V2F_C4B_T2F(b.vertices, b.colors, b.texCoords, locArrayBuffer, locOffset)
    : new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
  locOffset += locElementLen
  this._c = c
    ? new V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, locArrayBuffer, locOffset)
    : new V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset)
}
/**
 * @constant
 * @type {number}
 */
V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60
_p = V2F_C4B_T2F_Triangle.prototype
_p._getA = function () {
  return this._a
}
_p._setA = function (aValue) {
  const locA = this._a
  locA.vertices = aValue.vertices
  locA.colors = aValue.colors
  locA.texCoords = aValue.texCoords
}
_p._getB = function () {
  return this._b
}
_p._setB = function (bValue) {
  const locB = this._b
  locB.vertices = bValue.vertices
  locB.colors = bValue.colors
  locB.texCoords = bValue.texCoords
}
_p._getC = function () {
  return this._c
}
_p._setC = function (cValue) {
  const locC = this._c
  lovertices = cValue.vertices
  locolors = cValue.colors
  lotexCoords = cValue.texCoords
}

/** @expose */
_p.a
defineGetterSetter(_p, 'a', _p._getA, _p._setA)
/** @expose */
_p.b
defineGetterSetter(_p, 'b', _p._getB, _p._setB)
/** @expose */
_p.c
defineGetterSetter(_p, 'c', _p._getC, _p._setC)

/**
 * Helper macro that creates an Vertex2F type composed of 2 floats: x, y
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {Vertex2F}
 */
export const vertex2 = function (x, y) {
  return new Vertex2F(x, y)
}

/**
 * Helper macro that creates an Vertex3F type composed of 3 floats: x, y, z
 * @function
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {Vertex3F}
 */
export const vertex3 = function (x, y, z) {
  return new Vertex3F(x, y, z)
}

/**
 * Helper macro that creates an Tex2F type: A texcoord composed of 2 floats: u, y
 * @function
 * @param {Number} u
 * @param {Number} v
 * @return {Tex2F}
 */
export const tex2 = function (u, v) {
  return new Tex2F(u, v)
}

/**
 * text alignment : left
 * @constant
 * @type Number
 */
export const TEXT_ALIGNMENT_LEFT = 0

/**
 * text alignment : center
 * @constant
 * @type Number
 */
export const TEXT_ALIGNMENT_CENTER = 1

/**
 * text alignment : right
 * @constant
 * @type Number
 */
export const TEXT_ALIGNMENT_RIGHT = 2

/**
 * text alignment : top
 * @constant
 * @type Number
 */
export const VERTICAL_TEXT_ALIGNMENT_TOP = 0

/**
 * text alignment : center
 * @constant
 * @type Number
 */
export const VERTICAL_TEXT_ALIGNMENT_CENTER = 1

/**
 * text alignment : bottom
 * @constant
 * @type Number
 */
export const VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2

game.addEventListener(Game.EVENT_RENDERER_INITD, function () {
  if (_renderType === Game.RENDER_TYPE_WEBGL) {
    //redefine Color
    _WebGLColor = function (r, g, b, a, arrayBuffer, offset) {
      this._arrayBuffer = arrayBuffer || new ArrayBuffer(_WebGLColor.BYTES_PER_ELEMENT)
      this._offset = offset || 0

      const locArrayBuffer = this._arrayBuffer,
        locOffset = this._offset
      this._view = new Uint8Array(locArrayBuffer, locOffset, 4)

      this._view[0] = r || 0
      this._view[1] = g || 0
      this._view[2] = b || 0
      this._view[3] = a == null ? 255 : a

      if (a === undefined) this.a_undefined = true
    }
    _WebGLColor.BYTES_PER_ELEMENT = 4
    _p = _WebGLColor.prototype
    _p._getR = function () {
      return this._view[0]
    }
    _p._setR = function (value) {
      this._view[0] = value < 0 ? 0 : value
    }
    _p._getG = function () {
      return this._view[1]
    }
    _p._setG = function (value) {
      this._view[1] = value < 0 ? 0 : value
    }
    _p._getB = function () {
      return this._view[2]
    }
    _p._setB = function (value) {
      this._view[2] = value < 0 ? 0 : value
    }
    _p._getA = function () {
      return this._view[3]
    }
    _p._setA = function (value) {
      this._view[3] = value < 0 ? 0 : value
    }
    defineGetterSetter(_p, 'r', _p._getR, _p._setR)
    defineGetterSetter(_p, 'g', _p._getG, _p._setG)
    defineGetterSetter(_p, 'b', _p._getB, _p._setB)
    defineGetterSetter(_p, 'a', _p._getA, _p._setA)
  }
})

const _p = color
/**
 * White color (255, 255, 255, 255)
 * @returns {Color}
 * @private
 */
_p._getWhite = function () {
  return color(255, 255, 255)
}

/**
 *  Yellow color (255, 255, 0, 255)
 * @returns {Color}
 * @private
 */
_p._getYellow = function () {
  return color(255, 255, 0)
}

/**
 *  Blue color (0, 0, 255, 255)
 * @type {Color}
 * @private
 */
_p._getBlue = function () {
  return color(0, 0, 255)
}

/**
 *  Green Color (0, 255, 0, 255)
 * @type {Color}
 * @private
 */
_p._getGreen = function () {
  return color(0, 255, 0)
}

/**
 *  Red Color (255, 0, 0, 255)
 * @type {Color}
 * @private
 */
_p._getRed = function () {
  return color(255, 0, 0)
}

/**
 *  Magenta Color (255, 0, 255, 255)
 * @type {Color}
 * @private
 */
_p._getMagenta = function () {
  return color(255, 0, 255)
}

/**
 *  Black Color (0, 0, 0, 255)
 * @type {Color}
 * @private
 */
_p._getBlack = function () {
  return color(0, 0, 0)
}

/**
 *  Orange Color (255, 127, 0, 255)
 * @type {_p}
 * @private
 */
_p._getOrange = function () {
  return color(255, 127, 0)
}

/**
 *  Gray Color (166, 166, 166, 255)
 * @type {_p}
 * @private
 */
_p._getGray = function () {
  return color(166, 166, 166)
}

/** @expose */
_p.WHITE
defineGetterSetter(_p, 'WHITE', _p._getWhite)
/** @expose */
_p.YELLOW
defineGetterSetter(_p, 'YELLOW', _p._getYellow)
/** @expose */
_p.BLUE
defineGetterSetter(_p, 'BLUE', _p._getBlue)
/** @expose */
_p.GREEN
defineGetterSetter(_p, 'GREEN', _p._getGreen)
/** @expose */
_p.RED
defineGetterSetter(_p, 'RED', _p._getRed)
/** @expose */
_p.MAGENTA
defineGetterSetter(_p, 'MAGENTA', _p._getMagenta)
/** @expose */
_p.BLACK
defineGetterSetter(_p, 'BLACK', _p._getBlack)
/** @expose */
_p.ORANGE
defineGetterSetter(_p, 'ORANGE', _p._getOrange)
/** @expose */
_p.GRAY
defineGetterSetter(_p, 'GRAY', _p._getGray)
