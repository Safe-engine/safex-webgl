export const formatStr = function (...args: any[]): string {
  const l = args.length
  if (l < 1) return ''
  let str = args[0]
  const needToFormat = typeof str !== 'object'
  for (let i = 1; i < l; ++i) {
    const arg = args[i]
    if (needToFormat) {
      while (true) {
        let result
        if (typeof arg === 'number') {
          result = str.match(/(%d)|(%s)/)
          if (result) {
            str = str.replace(/(%d)|(%s)/, arg)
            break
          }
        }
        result = str.match(/%s/)
        if (result) str = str.replace(/%s/, arg)
        else str += `    ${arg}`
        break
      }
    } else str += `    ${arg}`
  }
  return str
}
//
// return the string found by key in dict.
// @param {string} key
// @param {object} dict
// @return {String} "" if not found; return the string if found.
// @private
//
export function locValueForKey(key, dict) {
  if (dict) {
    const pString = dict[key]
    return pString != null ? pString : ''
  }
  return ''
}
