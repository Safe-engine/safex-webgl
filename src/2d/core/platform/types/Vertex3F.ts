import type { defineGetterSetter } from "../../sprites/SpritesPropertyDefine"

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
