export class WebGLColor {
  static BYTES_PER_ELEMENT = 4

  declare _arrayBuffer: ArrayBuffer
  declare _offset: number
  declare _view: Uint8Array
  declare a_undefined?: boolean

  constructor(r?: number, g?: number, b?: number, a?: number, arrayBuffer?: ArrayBuffer, offset?: number) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(WebGLColor.BYTES_PER_ELEMENT)
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

  get r() {
    return this._view[0]
  }

  set r(value: number) {
    this._view[0] = value < 0 ? 0 : value
  }

  get g() {
    return this._view[1]
  }

  set g(value: number) {
    this._view[1] = value < 0 ? 0 : value
  }

  get b() {
    return this._view[2]
  }

  set b(value: number) {
    this._view[2] = value < 0 ? 0 : value
  }

  get a() {
    return this._view[3]
  }

  set a(value: number) {
    this._view[3] = value < 0 ? 0 : value
  }
}
