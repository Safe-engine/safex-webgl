export const formatStr = function (...args: any[]): string {
  let l = args.length;
  if (l < 1) return "";
  let str = args[0];
  let needToFormat = typeof str !== "object";
  for (let i = 1; i < l; ++i) {
    let arg = args[i];
    if (needToFormat) {
      while (true) {
        let result = null;
        if (typeof arg === "number") {
          result = str.match(/(%d)|(%s)/);
          if (result) {
            str = str.replace(/(%d)|(%s)/, arg);
            break;
          }
        }
        result = str.match(/%s/);
        if (result)
          str = str.replace(/%s/, arg);
        else
          str += "    " + arg;
        break;
      }
    } else
      str += "    " + arg;
  }
  return str;
};