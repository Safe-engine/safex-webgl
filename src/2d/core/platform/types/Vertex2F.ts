import { defineGetterSetter } from '../../sprites/SpritesPropertyDefine'

/**
 * @class Vertex2F
 * @param {Number} x
 * @param {Number}y
 * @param {Array} arrayBuffer
 * @param {Number}offset
 * @constructor
 */
export const Vertex2F = function (x, y, arrayBuffer?, offset?) {
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
