export class Vertex2F {
  static BYTES_PER_ELEMENT = 8

  _arrayBuffer: ArrayBuffer
  _offset: number
  _view: Float32Array

  constructor(x?: number, y?: number, arrayBuffer?: ArrayBuffer, offset?: number) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(Vertex2F.BYTES_PER_ELEMENT)
    this._offset = offset || 0

    this._view = new Float32Array(this._arrayBuffer, this._offset, 2)
    this._view[0] = x || 0
    this._view[1] = y || 0
  }

  get x() {
    return this._view[0]
  }

  set x(xValue: number) {
    this._view[0] = xValue
  }

  get y() {
    return this._view[1]
  }

  set y(yValue: number) {
    this._view[1] = yValue
  }
}

// defineGetterSetter(Vertex2F.prototype, 'x', Vertex2F.prototype._getX, Vertex2F.prototype._setX)
// defineGetterSetter(Vertex2F.prototype, 'y', Vertex2F.prototype._getY, Vertex2F.prototype._setY)
