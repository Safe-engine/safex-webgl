import * as base64js from 'base64-js'
import { gunzipSync } from 'fflate'

export function decodeGzipBase64(base64: string) {
  // base64 → bytes (gzip data)
  const compressed = base64js.toByteArray(base64)
  // gunzip → PNG binary
  const decompressed = gunzipSync(compressed)
  return decompressed
}

function unzipBase64(base64) {
  const binary = atob(base64)
  const input = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  // gunzip
  return gunzipSync(input)
}

/**
 * Unpack a gzipped byte string encoded as base64
 * @param {String} input Byte string encoded as base64
 * @param {Number} bytes Bytes per array item
 * @returns {Array} Unpacked byte array
 */
export function unzipBase64AsArray(input, bytes = 1) {
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
