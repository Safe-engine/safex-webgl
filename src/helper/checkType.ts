
export const isFunction = function (obj: any) {
  return typeof obj === 'function';
};
export const isNumber = function (obj: any) {
  return typeof obj === 'number' || Object.prototype.toString.call(obj) === '[object Number]';
};
export const isString = function (obj: any) {
  return typeof obj === 'string' || Object.prototype.toString.call(obj) === '[object String]';
};
export const isArray = function (obj: any) {
  return Array.isArray(obj) ||
    (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Array]');
};
export const isUndefined = function (obj: any) {
  return typeof obj === 'undefined';
};
export const isObject = function (obj: any) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === '[object Object]';
};
export const isCrossOrigin = function (url: string): boolean {
  if (!url) {
    export const log("invalid URL");
    return false;
  }
  const startIndex = url.indexOf("://");
  if (startIndex === -1) return false;
  const endIndex = url.indexOf("/", startIndex + 3);
  const urlOrigin = (endIndex === -1) ? url : url.substring(0, endIndex);
  return urlOrigin !== location.origin;
};
