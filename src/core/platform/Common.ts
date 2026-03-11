export const KEY = {
  none: 0,

  // android
  back: 6,
  menu: 18,

  backspace: 8,
  tab: 9,

  enter: 13,

  shift: 16, //should use shiftkey instead
  ctrl: 17, //should use ctrlkey
  alt: 18, //should use altkey
  pause: 19,
  capslock: 20,

  escape: 27,
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  select: 41,

  insert: 45,
  Delete: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,

  num0: 96,
  num1: 97,
  num2: 98,
  num3: 99,
  num4: 100,
  num5: 101,
  num6: 102,
  num7: 103,
  num8: 104,
  num9: 105,
  '*': 106,
  '+': 107,
  '-': 109,
  numdel: 110,
  '/': 111,
  f1: 112, //f1-f12 don't work on ie
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,

  numlock: 144,
  scrolllock: 145,

  ';': 186,
  semicolon: 186,
  equal: 187,
  '=': 187,
  ',': 188,
  comma: 188,
  dash: 189,
  '.': 190,
  period: 190,
  forwardslash: 191,
  grave: 192,
  '[': 219,
  openbracket: 219,
  backslash: 220,
  ']': 221,
  closebracket: 221,
  quote: 222,

  // gamepad control
  dpadLeft: 1000,
  dpadRight: 1001,
  dpadUp: 1003,
  dpadDown: 1004,
  dpadCenter: 1005,
}

/**
 * Image Format:JPG
 * @constant
 * @type {Number}
 */
export const FMT_JPG = 0

/**
 * Image Format:PNG
 * @constant
 * @type {Number}
 */
export const FMT_PNG = 1

/**
 * Image Format:TIFF
 * @constant
 * @type {Number}
 */
export const FMT_TIFF = 2

/**
 * Image Format:RAWDATA
 * @constant
 * @type {Number}
 */
export const FMT_RAWDATA = 3

/**
 * Image Format:WEBP
 * @constant
 * @type {Number}
 */
export const FMT_WEBP = 4

/**
 * Image Format:UNKNOWN
 * @constant
 * @type {Number}
 */
export const FMT_UNKNOWN = 5

/**
 * get image format by image data
 * @function
 * @param {Array} imgData
 * @returns {Number}
 */
export const getImageFormatByData = function (imgData) {
  // if it is a png file buffer.
  if (
    imgData.length > 8 &&
    imgData[0] === 0x89 &&
    imgData[1] === 0x50 &&
    imgData[2] === 0x4e &&
    imgData[3] === 0x47 &&
    imgData[4] === 0x0d &&
    imgData[5] === 0x0a &&
    imgData[6] === 0x1a &&
    imgData[7] === 0x0a
  ) {
    return FMT_PNG
  }

  // if it is a tiff file buffer.
  if (
    imgData.length > 2 &&
    ((imgData[0] === 0x49 && imgData[1] === 0x49) ||
      (imgData[0] === 0x4d && imgData[1] === 0x4d) ||
      (imgData[0] === 0xff && imgData[1] === 0xd8))
  ) {
    return FMT_TIFF
  }
  return FMT_UNKNOWN
}
