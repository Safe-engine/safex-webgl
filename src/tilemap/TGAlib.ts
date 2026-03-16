export const TGA_OK = 0
export const TGA_ERROR_FILE_OPEN = 1
export const TGA_ERROR_READING_FILE = 2
export const TGA_ERROR_INDEXED_COLOR = 3
export const TGA_ERROR_MEMORY = 4
export const TGA_ERROR_COMPRESSED_FILE = 5

/**
 * TGA format
 * @param {Number} status
 * @param {Number} type
 * @param {Number} pixelDepth
 * @param {Number} width map width
 * @param {Number} height map height
 * @param {Array} imageData raw data
 * @param {Number} flipped
 * @constructor
 */
export const ImageTGA = function (status, type, pixelDepth, width, height, imageData, flipped) {
  this.status = status || 0
  this.type = type || 0
  this.pixelDepth = pixelDepth || 0
  this.width = width || 0
  this.height = height || 0
  this.imageData = imageData || []
  this.flipped = flipped || 0
}

/**
 * load the image header field from stream. We only keep those that matter!
 * @param {Array} buffer
 * @param {Number} bufSize
 * @param {ImageTGA} psInfo
 * @return {Boolean}
 */
export const tgaLoadHeader = function (buffer, bufSize, psInfo) {
  let step = 2
  if (step + 1 > bufSize) return false

  const binaryReader = new BinaryStreamReader(buffer)

  binaryReader.setOffset(step)
  psInfo.type = binaryReader.readByte()
  step += 10 // . step += sizeof(unsigned char) * 2; step += sizeof(signed short) * 4;

  if (step + 4 + 1 > bufSize) return false
  binaryReader.setOffset(step)
  psInfo.width = binaryReader.readUnsignedShort()
  psInfo.height = binaryReader.readUnsignedInteger()
  psInfo.pixelDepth = binaryReader.readByte()

  step += 5 // .  step += sizeof(unsigned char);  step += sizeof(signed short) * 2;
  if (step + 1 > bufSize) return false

  const garbage = binaryReader.readByte()
  psInfo.flipped = 0
  if (garbage & 0x20) psInfo.flipped = 1
  return true
}

/**
 * loads the image pixels. You shouldn't call this function directly.
 * @param {Array} buffer
 * @param {Number} bufSize
 * @param {ImageTGA} psInfo
 * @return {Boolean}
 */
export const tgaLoadImageData = function (buffer, bufSize, psInfo) {
  let i, aux
  const step = 18 // .size_t step = (sizeof(unsigned char) + sizeof(signed short)) * 6;

  // mode equal the number of components for each pixel
  const mode = 0 | (psInfo.pixelDepth / 2)
  // total is the number of unsigned chars we'll have to read
  const total = psInfo.height * psInfo.width * mode

  if (step + total > bufSize) return false

  psInfo.imageData = __getSubArray(buffer, step, step + total)

  // mode=3 or 4 implies that the image is RGB(A). However TGA
  // stores it as BGR(A) so we'll have to swap R and B.
  if (mode >= 3) {
    for (i = 0; i < total; i += mode) {
      aux = psInfo.imageData[i]
      psInfo.imageData[i] = psInfo.imageData[i + 2]
      psInfo.imageData[i + 2] = aux
    }
  }
  return true
}

/**
 * converts RGB to grayscale
 * @param {ImageTGA} psInfo
 */
export const tgaRGBtogreyscale = function (psInfo) {
  let i, j

  // if the image is already grayscale do nothing
  if (psInfo.pixelDepth === 8) return

  // compute the number of actual components
  const mode = psInfo.pixelDepth / 8

  // allocate an array for the new image data
  const newImageData = new Uint8Array(psInfo.height * psInfo.width)
  if (newImageData === null) return

  // convert pixels: grayscale = o.30 * R + 0.59 * G + 0.11 * B
  for (i = 0, j = 0; j < psInfo.width * psInfo.height; i += mode, j++)
    newImageData[j] = 0.3 * psInfo.imageData[i] + 0.59 * psInfo.imageData[i + 1] + 0.11 * psInfo.imageData[i + 2]

  // reassign pixelDepth and type according to the new image type
  psInfo.pixelDepth = 8
  psInfo.type = 3
  // reassigning imageData to the new array.
  psInfo.imageData = newImageData
}

/**
 * releases the memory used for the image
 * @param {ImageTGA} psInfo
 */
export const tgaDestroy = function (psInfo) {
  if (!psInfo) return

  psInfo.imageData = null
  // psInfo = null
}

/**
 * Load RLE image data
 * @param buffer
 * @param bufSize
 * @param psInfo
 * @returns {boolean}
 */
export const tgaLoadRLEImageData = function (buffer, bufSize, psInfo) {
  let skip
  let i,
    index = 0,
    flag = 0
  let aux = [],
    runlength = 0

  let step = 18 // . size_t step = (sizeof(unsigned char) + sizeof(signed short)) * 6;

  // mode equal the number of components for each pixel
  const mode = psInfo.pixelDepth / 8
  // total is the number of unsigned chars we'll have to read
  const total = psInfo.height * psInfo.width

  for (i = 0; i < total; i++) {
    // if we have a run length pending, run it
    if (runlength !== 0) {
      // we do, update the run length count
      runlength--
      skip = flag !== 0
    } else {
      // otherwise, read in the run length token
      if (step + 1 > bufSize) break
      runlength = buffer[step]
      step += 1

      // see if it's a RLE encoded sequence
      flag = runlength & 0x80
      if (flag) runlength -= 128
      skip = 0
    }

    // do we need to skip reading this pixel?
    if (!skip) {
      // no, read in the pixel data
      if (step + mode > bufSize) break
      aux = __getSubArray(buffer, step, step + mode)
      step += mode

      // mode=3 or 4 implies that the image is RGB(A). However TGA
      // stores it as BGR(A) so we'll have to swap R and B.
      if (mode >= 3) {
        const tmp = aux[0]
        aux[0] = aux[2]
        aux[2] = tmp
      }
    }

    // add the pixel to our image
    for (let j = 0; j < mode; j++) psInfo.imageData[index + j] = aux[j]

    index += mode
  }

  return true
}

/**
 * ImageTGA Flip
 * @param {ImageTGA} psInfo
 */
export const tgaFlipImage = function (psInfo) {
  // mode equal the number of components for each pixel
  const mode = psInfo.pixelDepth / 8
  const rowbytes = psInfo.width * mode

  for (let y = 0; y < psInfo.height / 2; y++) {
    const row = __getSubArray(psInfo.imageData, y * rowbytes, y * rowbytes + rowbytes)
    __setDataToArray(__getSubArray(psInfo.imageData, (psInfo.height - (y + 1)) * rowbytes, rowbytes), psInfo.imageData, y * rowbytes)
    __setDataToArray(row, psInfo.imageData, (psInfo.height - (y + 1)) * rowbytes)
  }
  psInfo.flipped = 0
}

export const __getSubArray = function (array, start, end) {
  if (array instanceof Array) return array.slice(start, end)
  else return array.subarray(start, end)
}

export const __setDataToArray = function (sourceData, destArray, startIndex) {
  for (let i = 0; i < sourceData.length; i++) destArray[startIndex + i] = sourceData[i]
}

/**
 * Binary Stream Reader
 *
 * @class
 * @param binaryData
 */
export class BinaryStreamReader {
  _binaryData = null
  _offset = 0
  declare _data: Uint8Array

  /**
   * <p>The BinaryStreamReader's constructor. <br/>
   * This function will automatically be invoked when you create a node using new construction: "var node = new BinaryStreamReader()".<br/>
   * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
   * @param binaryData
   */
  constructor(binaryData) {
    this._binaryData = binaryData
  }

  /**
   * Set the binaryData.
   * @param binaryData
   */
  setBinaryData(binaryData) {
    this._binaryData = binaryData
    this._offset = 0
  }

  /**
   * Gets the binaryData.
   * @returns {Object}
   */
  getBinaryData() {
    return this._binaryData
  }

  _checkSize(neededBits) {
    if (!(this._offset + Math.ceil(neededBits / 8) < this._data.length)) throw new Error('Index out of bound')
  }

  _decodeFloat(precisionBits, exponentBits) {
    const length = precisionBits + exponentBits + 1
    const size = length >> 3
    this._checkSize(length)

    const bias = Math.pow(2, exponentBits - 1) - 1
    const signal = this._readBits(precisionBits + exponentBits, 1, size)
    const exponent = this._readBits(precisionBits, exponentBits, size)
    let significand = 0
    let divisor = 2
    let curByte = 0 //length + (-precisionBits >> 3) - 1;
    let startBit
    do {
      const byteValue = this._readByte(++curByte, size)
      startBit = precisionBits % 8 || 8
      let mask = 1 << startBit
      while ((mask >>= 1)) {
        if (byteValue & mask) significand += 1 / divisor
        divisor *= 2
      }
    } while ((precisionBits -= startBit))

    this._offset += size

    return exponent === (bias << 1) + 1
      ? significand
        ? NaN
        : signal
          ? -Infinity
          : +Infinity
      : (1 + signal * -2) *
          (exponent || significand
            ? !exponent
              ? Math.pow(2, -bias + 1) * significand
              : Math.pow(2, exponent - bias) * (1 + significand)
            : 0)
  }

  _readByte(i, size) {
    return this._data[this._offset + size - i - 1]
  }

  _decodeInt(bits, signed) {
    const x = this._readBits(0, bits, bits / 8)
    const max = Math.pow(2, bits)
    const result = signed && x >= max / 2 ? x - max : x

    this._offset += bits / 8
    return result
  }

  _shl(a, b) {
    for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) === 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1) {}
    return a
  }

  _readBits(start, length, size) {
    const offsetLeft = (start + length) % 8
    const offsetRight = start % 8
    const curByte = size - (start >> 3) - 1
    let lastByte = size + (-(start + length) >> 3)
    let diff = curByte - lastByte

    let sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1)

    if (diff && offsetLeft) sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << ((diff-- << 3) - offsetRight)

    while (diff) sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight)

    return sum
  }

  readInteger() {
    return this._decodeInt(32, true)
  }

  readUnsignedInteger() {
    return this._decodeInt(32, false)
  }

  readSingle() {
    return this._decodeFloat(23, 8)
  }

  readShort() {
    return this._decodeInt(16, true)
  }

  readUnsignedShort() {
    return this._decodeInt(16, false)
  }

  readByte() {
    const readByte = this._data[this._offset]
    this._offset += 1
    return readByte
  }

  readData(start, end) {
    if (this._binaryData instanceof Array) {
      return this._binaryData.slice(start, end)
    } else {
      //typed array
      return this._binaryData.subarray(start, end)
    }
  }

  setOffset(offset) {
    this._offset = offset
  }

  getOffset() {
    return this._offset
  }
}
