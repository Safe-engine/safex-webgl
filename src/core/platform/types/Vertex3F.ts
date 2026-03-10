export class Vertex3F {
  static BYTES_PER_ELEMENT = 12

  _arrayBuffer: ArrayBuffer
  _offset: number
  _view: Float32Array

  constructor(x = 0, y = 0, z = 0, arrayBuffer?: ArrayBuffer, offset?: number) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex3F.BYTES_PER_ELEMENT)
    this._offset = offset || 0

    const locArrayBuffer = this._arrayBuffer,
      locOffset = this._offset
    this._view = new Float32Array(locArrayBuffer, locOffset, 3)
    this._view[0] = x
    this._view[1] = y
    this._view[2] = z
  }

  get x(): number {
    return this._view[0]
  }
  set x(xValue: number) {
    this._view[0] = xValue
  }

  get y(): number {
    return this._view[1]
  }
  set y(yValue: number) {
    this._view[1] = yValue
  }

  get z(): number {
    return this._view[2]
  }
  set z(zValue: number) {
    this._view[2] = zValue
  }
}
