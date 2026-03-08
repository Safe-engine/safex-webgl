import { defineGetterSetter } from '../../sprites/SpritesPropertyDefine'

/**
 * @class Tex2F
 * @param {Number} u
 * @param {Number} v
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export const Tex2F = function (u, v, arrayBuffer, offset) {
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
