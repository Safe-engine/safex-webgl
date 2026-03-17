import { gunzipSync } from 'fflate'

export function unzipBase64AsArray(base64, bytes = 1) {
  // base64 -> Uint8Array
  const binary = atob(base64)
  const input = Uint8Array.from(binary, (c) => c.charCodeAt(0))

  // gunzip
  const data = gunzipSync(input)

  // convert to array
  const len = data.length / bytes
  const result = new Array(len)

  for (let i = 0; i < len; i++) {
    let value = 0
    for (let j = 0; j < bytes; j++) {
      value |= data[i * bytes + j] << (j * 8)
    }
    result[i] = value
  }

  return result
}
