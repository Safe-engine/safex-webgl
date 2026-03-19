/**
 * @class Tex2F
 * @param {Number} u
 * @param {Number} v
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
export class Tex2F {
  static BYTES_PER_ELEMENT = 8

  declare _arrayBuffer: ArrayBuffer
  declare _offset: number
  declare _view: Float32Array

  constructor(u?: number, v?: number, arrayBuffer?: ArrayBuffer, offset?: number) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(Tex2F.BYTES_PER_ELEMENT)
    this._offset = offset || 0

    this._view = new Float32Array(this._arrayBuffer, this._offset, 2)
    this._view[0] = u || 0
    this._view[1] = v || 0
  }

  _getU() {
    return this._view[0]
  }

  _setU(xValue: number) {
    this._view[0] = xValue
  }

  _getV() {
    return this._view[1]
  }

  _setV(yValue: number) {
    this._view[1] = yValue
  }
}

// defineGetterSetter(Tex2F.prototype, 'u', Tex2F.prototype._getU, Tex2F.prototype._setU)
// defineGetterSetter(Tex2F.prototype, 'v', Tex2F.prototype._getV, Tex2F.prototype._setV)
