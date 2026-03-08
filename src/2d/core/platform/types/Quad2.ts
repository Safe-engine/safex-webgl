import { defineGetterSetter } from '../../sprites/SpritesPropertyDefine'
import { Vertex2F } from './Vertex2F'

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

  const locArrayBuffer = this._arrayBuffer
  let locOffset = this._offset
  const locElementLen = Vertex2F.BYTES_PER_ELEMENT
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
