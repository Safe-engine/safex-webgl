import { defineGetterSetter } from '../../sprites/SpritesPropertyDefine'
import { color } from '../Color'

export const _WebGLColor = function (r, g, b, a, arrayBuffer, offset) {
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
