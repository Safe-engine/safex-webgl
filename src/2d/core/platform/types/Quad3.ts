import { Vertex3F } from './Vertex3F'

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

  const locArrayBuffer = this._arrayBuffer
  let locOffset = this._offset
  const locElementLen = Vertex3F.BYTES_PER_ELEMENT
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
