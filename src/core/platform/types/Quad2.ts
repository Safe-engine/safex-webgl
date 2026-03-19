import { defineGetterSetter } from '../../../helper/getset'
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
export class Quad2 {
  static BYTES_PER_ELEMENT = 32

  declare _arrayBuffer: ArrayBuffer
  declare _offset: number
  declare _tl: Vertex2F
  declare _tr: Vertex2F
  declare _bl: Vertex2F
  declare _br: Vertex2F

  constructor(tl?: Vertex2F, tr?: Vertex2F, bl?: Vertex2F, br?: Vertex2F, arrayBuffer?: ArrayBuffer, offset?: number) {
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

  _getTL() {
    return this._tl
  }
  _setTL(tlValue: Vertex2F) {
    this._tl._view[0] = tlValue.x
    this._tl._view[1] = tlValue.y
  }

  _getTR() {
    return this._tr
  }
  _setTR(trValue: Vertex2F) {
    this._tr._view[0] = trValue.x
    this._tr._view[1] = trValue.y
  }

  _getBL() {
    return this._bl
  }
  _setBL(blValue: Vertex2F) {
    this._bl._view[0] = blValue.x
    this._bl._view[1] = blValue.y
  }

  _getBR() {
    return this._br
  }
  _setBR(brValue: Vertex2F) {
    this._br._view[0] = brValue.x
    this._br._view[1] = brValue.y
  }
}

defineGetterSetter(Quad2.prototype, 'tl', Quad2.prototype._getTL, Quad2.prototype._setTL)
defineGetterSetter(Quad2.prototype, 'tr', Quad2.prototype._getTR, Quad2.prototype._setTR)
defineGetterSetter(Quad2.prototype, 'bl', Quad2.prototype._getBL, Quad2.prototype._setBL)
defineGetterSetter(Quad2.prototype, 'br', Quad2.prototype._getBR, Quad2.prototype._setBR)
