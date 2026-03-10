import { defineGetterSetter } from '../../sprites/SpritesPropertyDefine'

export class _WebGLColor {
  static BYTES_PER_ELEMENT = 4

  _arrayBuffer: ArrayBuffer
  _offset: number
  _view: Uint8Array
  a_undefined?: boolean

  constructor(r?: number, g?: number, b?: number, a?: number, arrayBuffer?: ArrayBuffer, offset?: number) {
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

  _getR() {
    return this._view[0]
  }

  _setR(value: number) {
    this._view[0] = value < 0 ? 0 : value
  }

  _getG() {
    return this._view[1]
  }

  _setG(value: number) {
    this._view[1] = value < 0 ? 0 : value
  }

  _getB() {
    return this._view[2]
  }

  _setB(value: number) {
    this._view[2] = value < 0 ? 0 : value
  }

  _getA() {
    return this._view[3]
  }

  _setA(value: number) {
    this._view[3] = value < 0 ? 0 : value
  }
}

// attach property accessors to prototype
const _pProto = _WebGLColor.prototype

defineGetterSetter(_pProto, 'r', _pProto._getR, _pProto._setR)
defineGetterSetter(_pProto, 'g', _pProto._getG, _pProto._setG)
defineGetterSetter(_pProto, 'b', _pProto._getB, _pProto._setB)
defineGetterSetter(_pProto, 'a', _pProto._getA, _pProto._setA)
