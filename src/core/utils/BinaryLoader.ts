import { log } from '../../helper'
import { getXMLHttpRequest } from '../../helper/loader'

export const loadBinary = function (url, cb) {
  const xhr = getXMLHttpRequest(),
    errInfo = `load ${url} failed!`
  xhr.open('GET', url, true)
  xhr.responseType = 'arraybuffer'
  if (_IEFilter) {
    // IE-specific logic here
    xhr.setRequestHeader('Accept-Charset', 'x-user-defined')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const fileContents = _convertResponseBodyToText(xhr['responseBody'])
        cb(null, _str2Uint8Array(fileContents))
      } else cb(errInfo)
    }
  } else {
    if (xhr.overrideMimeType) xhr.overrideMimeType('text/plain; charset=x-user-defined')
    xhr.onload = function () {
      xhr.readyState === 4 && xhr.status === 200 ? cb(null, new Uint8Array(xhr.response)) : cb(errInfo)
    }
  }
  xhr.send(null)
}

const _IEFilter =
  /msie/i.test(navigator.userAgent) &&
  !/opera/i.test(navigator.userAgent) &&
  window.IEBinaryToArray_ByteStr &&
  window.IEBinaryToArray_ByteStr_Last

const _str2Uint8Array = function (strData) {
  if (!strData) return null

  const arrData = new Uint8Array(strData.length)
  for (let i = 0; i < strData.length; i++) {
    arrData[i] = strData.charCodeAt(i) & 0xff
  }
  return arrData
}

/**
 * Load binary data by url synchronously
 * @function
 * @param {String} url
 * @return {Uint8Array}
 */
export const loadBinarySync = function (url) {
  const req = getXMLHttpRequest()
  req.timeout = 0
  const errInfo = `load ${url} failed!`
  req.open('GET', url, false)
  let arrayInfo = null
  if (_IEFilter) {
    req.setRequestHeader('Accept-Charset', 'x-user-defined')
    req.send(null)
    if (req.status !== 200) {
      log(errInfo)
      return null
    }

    const fileContents = _convertResponseBodyToText(req['responseBody'])
    if (fileContents) {
      arrayInfo = _str2Uint8Array(fileContents)
    }
  } else {
    if (req.overrideMimeType) req.overrideMimeType('text/plain; charset=x-user-defined')
    req.send(null)
    if (req.status !== 200) {
      log(errInfo)
      return null
    }

    arrayInfo = _str2Uint8Array(req.responseText)
  }
  return arrayInfo
}

if (_IEFilter) {
  const IEBinaryToArray_ByteStr_Script =
    '<!-- IEBinaryToArray_ByteStr -->\r\n' +
    //"<script type='text/vbscript'>\r\n" +
    'Function IEBinaryToArray_ByteStr(Binary)\r\n' +
    '   IEBinaryToArray_ByteStr = CStr(Binary)\r\n' +
    'End Function\r\n' +
    'Function IEBinaryToArray_ByteStr_Last(Binary)\r\n' +
    '   Dim lastIndex\r\n' +
    '   lastIndex = LenB(Binary)\r\n' +
    '   if lastIndex mod 2 Then\r\n' +
    '       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n' +
    '   Else\r\n' +
    '       IEBinaryToArray_ByteStr_Last = ' +
    '""' +
    '\r\n' +
    '   End If\r\n' +
    'End Function\r\n' // +
  //"</script>\r\n";

  // inject VBScript
  //document.write(IEBinaryToArray_ByteStr_Script);
  const myVBScript = document.createElement('script')
  myVBScript.type = 'text/vbscript'
  myVBScript.textContent = IEBinaryToArray_ByteStr_Script
  document.body.appendChild(myVBScript)
}
// helper to convert from responseBody to a "responseText" like thing
const _convertResponseBodyToText = function (binary) {
  const byteMapping = {}
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
      byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j)
    }
  }
  const rawBytes = window.IEBinaryToArray_ByteStr(binary)
  const lastChr = window.IEBinaryToArray_ByteStr_Last(binary)
  return (
    rawBytes.replace(/[\s\S]/g, function (match) {
      return byteMapping[match]
    }) + lastChr
  )
}
