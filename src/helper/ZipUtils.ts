import { toByteArray } from 'base64-js'
import { decompressSync, gunzipSync } from 'fflate'

export function decodeGzipBase64(base64: string) {
  // base64 → bytes (gzip data)
  const compressed = decodeAsArray(base64)
  // gunzip → PNG binary
  return gunzipSync(compressed)
}

function unzipBase64(base64: string) {
  const binary = atob(base64)
  const input = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return gunzipSync(input)
}

/**
 * Unpack a gzipped byte string encoded as base64
 * @param {String} input Byte string encoded as base64
 * @param {Number} bytes Bytes per array item
 * @returns {Array} Unpacked byte array
 */
export function unzipBase64AsArray(input: string, bytes = 1) {
  const data = unzipBase64(input)
  // convert to array
  const len = data.length / bytes
  const result = new Array(len)
  for (let i = 0; i < len; i++) {
    result[i] = 0
    for (let j = 0; j < bytes; j++) {
      result[i] += data[i * bytes + j] << (j * 8)
    }
  }
  // console.log('unzipBase64AsArray', data, result)
  return result
}

export function decodeAsArray(base64: string) {
  const compressed = toByteArray(base64)
  return compressed
}

export function zlibDecompressBase64(base64: string) {
  const compressed = decodeAsArray(base64)
  const inflator = decompressSync(compressed)
  return uint8ArrayToUint32Array(inflator)
}

export function uint8ArrayToUint32Array(uint8Arr: Uint8Array) {
  if (uint8Arr.length % 4 !== 0) return null
  const arrLen = uint8Arr.length / 4
  const retArr = window.Uint32Array ? new Uint32Array(arrLen) : []
  for (let i = 0; i < arrLen; i++) {
    const offset = i * 4
    retArr[i] = uint8Arr[offset] + uint8Arr[offset + 1] * (1 << 8) + uint8Arr[offset + 2] * (1 << 16) + uint8Arr[offset + 3] * (1 << 24)
  }
  return retArr
}
