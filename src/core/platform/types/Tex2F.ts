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

  get u() {
    return this._view[0]
  }

  set u(xValue: number) {
    this._view[0] = xValue
  }

  get v() {
    return this._view[1]
  }

  set v(yValue: number) {
    this._view[1] = yValue
  }
}
