import { game } from '../index';
import { log } from './Debugger';
import { create3DContext } from './engine';

const _tmpCanvas1 = document.createElement('canvas');
const _tmpCanvas2 = document.createElement('canvas');

let _renderType = 0;

/**
 * System variables
 * @namespace sys
 */
const sys = {
  /**
   * English language code
   * @memberof sys
   * @name LANGUAGE_ENGLISH
   * @constant
   */
  LANGUAGE_ENGLISH: 'en',

  /**
   * Chinese language code
   * @memberof sys
   * @name LANGUAGE_CHINESE
   * @constant
   */
  LANGUAGE_CHINESE: 'zh',

  /**
   * French language code
   * @memberof sys
   * @name LANGUAGE_FRENCH
   * @constant
   */
  LANGUAGE_FRENCH: 'fr',

  /**
   * Italian language code
   * @memberof sys
   * @name LANGUAGE_ITALIAN
   * @constant
   */
  LANGUAGE_ITALIAN: 'it',

  /**
   * German language code
   * @memberof sys
   * @name LANGUAGE_GERMAN
   * @constant
   */
  LANGUAGE_GERMAN: 'de',

  /**
   * Spanish language code
   * @memberof sys
   * @name LANGUAGE_SPANISH
   * @constant
   */
  LANGUAGE_SPANISH: 'es',

  /**
   * Dutch language code
   * @memberof sys
   * @name LANGUAGE_DUTCH
   * @constant
   */
  LANGUAGE_DUTCH: 'du',

  /**
   * Russian language code
   * @memberof sys
   * @name LANGUAGE_RUSSIAN
   * @constant
   */
  LANGUAGE_RUSSIAN: 'ru',

  /**
   * Korean language code
   * @memberof sys
   * @name LANGUAGE_KOREAN
   * @constant
   */
  LANGUAGE_KOREAN: 'ko',

  /**
   * Japanese language code
   * @memberof sys
   * @name LANGUAGE_JAPANESE
   * @constant
   */
  LANGUAGE_JAPANESE: 'ja',

  /**
   * Hungarian language code
   * @memberof sys
   * @name LANGUAGE_HUNGARIAN
   * @constant
   */
  LANGUAGE_HUNGARIAN: 'hu',

  /**
   * Portuguese language code
   * @memberof sys
   * @name LANGUAGE_PORTUGUESE
   * @constant
   */
  LANGUAGE_PORTUGUESE: 'pt',

  /**
   * Arabic language code
   * @memberof sys
   * @name LANGUAGE_ARABIC
   * @constant
   */
  LANGUAGE_ARABIC: 'ar',

  /**
   * Norwegian language code
   * @memberof sys
   * @name LANGUAGE_NORWEGIAN
   * @constant
   */
  LANGUAGE_NORWEGIAN: 'no',

  /**
   * Polish language code
   * @memberof sys
   * @name LANGUAGE_POLISH
   * @constant
   */
  LANGUAGE_POLISH: 'pl',

  /**
   * Unknown language code
   * @memberof sys
   * @name LANGUAGE_UNKNOWN
   * @constant
   */
  LANGUAGE_UNKNOWN: 'unknown',

  /**
   * @memberof sys
   * @name OS_IOS
   * @constant
   */
  OS_IOS: 'iOS',
  /**
   * @memberof sys
   * @name OS_ANDROID
   * @constant
   */
  OS_ANDROID: 'Android',
  /**
   * @memberof sys
   * @name OS_WINDOWS
   * @constant
   */
  OS_WINDOWS: 'Windows',
  /**
   * @memberof sys
   * @name OS_MARMALADE
   * @constant
   */
  OS_MARMALADE: 'Marmalade',
  /**
   * @memberof sys
   * @name OS_LINUX
   * @constant
   */
  OS_LINUX: 'Linux',
  /**
   * @memberof sys
   * @name OS_BADA
   * @constant
   */
  OS_BADA: 'Bada',
  /**
   * @memberof sys
   * @name OS_BLACKBERRY
   * @constant
   */
  OS_BLACKBERRY: 'Blackberry',
  /**
   * @memberof sys
   * @name OS_OSX
   * @constant
   */
  OS_OSX: 'OS X',
  /**
   * @memberof sys
   * @name OS_WP8
   * @constant
   */
  OS_WP8: 'WP8',
  /**
   * @memberof sys
   * @name OS_WINRT
   * @constant
   */
  OS_WINRT: 'WINRT',
  /**
   * @memberof sys
   * @name OS_UNKNOWN
   * @constant
   */
  OS_UNKNOWN: 'Unknown',

  /**
   * @memberof sys
   * @name UNKNOWN
   * @constant
   * @default
   */
  UNKNOWN: -1,
  /**
   * @memberof sys
   * @name WIN32
   * @constant
   * @default
   */
  WIN32: 0,
  /**
   * @memberof sys
   * @name LINUX
   * @constant
   * @default
   */
  LINUX: 1,
  /**
   * @memberof sys
   * @name MACOS
   * @constant
   * @default
   */
  MACOS: 2,
  /**
   * @memberof sys
   * @name ANDROID
   * @constant
   * @default
   */
  ANDROID: 3,
  /**
   * @memberof sys
   * @name IPHONE
   * @constant
   * @default
   */
  IPHONE: 4,
  /**
   * @memberof sys
   * @name IPAD
   * @constant
   * @default
   */
  IPAD: 5,
  /**
   * @memberof sys
   * @name BLACKBERRY
   * @constant
   * @default
   */
  BLACKBERRY: 6,
  /**
   * @memberof sys
   * @name NACL
   * @constant
   * @default
   */
  NACL: 7,
  /**
   * @memberof sys
   * @name EMSCRIPTEN
   * @constant
   * @default
   */
  EMSCRIPTEN: 8,
  /**
   * @memberof sys
   * @name TIZEN
   * @constant
   * @default
   */
  TIZEN: 9,
  /**
   * @memberof sys
   * @name WINRT
   * @constant
   * @default
   */
  WINRT: 10,
  /**
   * @memberof sys
   * @name WP8
   * @constant
   * @default
   */
  WP8: 11,
  /**
   * @memberof sys
   * @name MOBILE_BROWSER
   * @constant
   * @default
   */
  MOBILE_BROWSER: 100,
  /**
   * @memberof sys
   * @name DESKTOP_BROWSER
   * @constant
   * @default
   */
  DESKTOP_BROWSER: 101,

  BROWSER_TYPE_WECHAT: 'wechat',
  BROWSER_TYPE_ANDROID: 'androidbrowser',
  BROWSER_TYPE_IE: 'ie',
  BROWSER_TYPE_QQ_APP: 'qq', // QQ App
  BROWSER_TYPE_QQ: 'qqbrowser',
  BROWSER_TYPE_MOBILE_QQ: 'mqqbrowser',
  BROWSER_TYPE_UC: 'ucbrowser',
  BROWSER_TYPE_360: '360browser',
  BROWSER_TYPE_BAIDU_APP: 'baiduboxapp',
  BROWSER_TYPE_BAIDU: 'baidubrowser',
  BROWSER_TYPE_MAXTHON: 'maxthon',
  BROWSER_TYPE_OPERA: 'opera',
  BROWSER_TYPE_OUPENG: 'oupeng',
  BROWSER_TYPE_MIUI: 'miuibrowser',
  BROWSER_TYPE_FIREFOX: 'firefox',
  BROWSER_TYPE_SAFARI: 'safari',
  BROWSER_TYPE_CHROME: 'chrome',
  BROWSER_TYPE_LIEBAO: 'liebao',
  BROWSER_TYPE_QZONE: 'qzone',
  BROWSER_TYPE_SOUGOU: 'sogou',
  BROWSER_TYPE_UNKNOWN: 'unknown',

  /**
   * Is native ? This is set to be true in jsb auto.
   * @memberof sys
   * @name isNative
   */
  isNative: false,

  /**
   * Indicate whether system is mobile system
   * @memberof sys
   * @name isMobile
   */
  isMobile: false,

  /**
   * Indicate the running platform
   * @memberof sys
   * @name platform
   */
  platform: 0,

  /**
   * Indicate the current language of the running system
   * @memberof sys
   * @name language
   */
  language: '',

  /**
   * Indicate the running os name
   * @memberof sys
   * @name os
   */
  os: '',
  /**
   * Indicate the running os version string
   * @memberof sys
   * @name osVersion
   */
  osVersion: '',
  /**
   * Indicate the running os main version number
   * @memberof sys
   * @name osMainVersion
   */
  osMainVersion: 0,

  /**
   * Indicate the running browser type
   * @memberof sys
   * @name browserType
   */
  browserType: '',

  /**
   * Indicate the running browser version
   * @memberof sys
   * @name browserVersion
   */
  browserVersion: '',

  /**
   * Indicate the real pixel resolution of the whole game window
   * @memberof sys
   * @name windowPixelResolution
   */
  windowPixelResolution: {
    width: 0,
    height: 0
  },

  _checkWebGLRenderMode() {
    if (_renderType !== game.RENDER_TYPE_WEBGL) {
      throw new Error('This feature supports WebGL render mode only.');
    }
  },

  // Whether or not the Canvas BlendModes are supported.
  _supportCanvasNewBlendModes: false,

  /**
   * The capabilities of the current platform
   * @memberof sys
   * @name capabilities
   */
  capabilities: {
    canvas: false,
    opengl: false,
    touches: false,
    mouse: false,
    keyboard: false,
    accelerometer: false,
  },

  /**
   * Forces the garbage collection, only available in JSB
   * @memberof sys
   * @name garbageCollect
   */
  garbageCollect() {
    // N/A in cocos2d-html5
  },

  /**
   * Dumps rooted objects, only available in JSB
   * @memberof sys
   * @name dumpRoot
   */
  dumpRoot() {
    // N/A in cocos2d-html5
  },

  /**
   * Restart the JS VM, only available in JSB
   * @memberof sys
   * @name restartVM
   */
  restartVM() {
    // N/A in cocos2d-html5
  },

  /**
   * Clean a script in the JS VM, only available in JSB
   * @memberof sys
   * @name cleanScript
   * @param jsfile
   */
  cleanScript(jsfile: string) {
    // N/A in cocos2d-html5
  },

  /**
   * Check whether an object is valid,
   * In web engine, it will return true if the object exist
   * In native engine, it will return true if the JS object and the correspond native object are both valid
   * @memberof sys
   * @name isObjectValid
   * @param obj
   * @return Validity of the object
   */
  isObjectValid(obj: any): boolean {
    return !!obj;
  },

  /**
   * Dump system informations
   * @memberof sys
   * @name dump
   */
  dump() {
    let str = '';
    str += `isMobile : ${this.isMobile}\r\n`;
    str += `language : ${this.language}\r\n`;
    str += `browserType : ${this.browserType}\r\n`;
    str += `browserVersion : ${this.browserVersion}\r\n`;
    str += `capabilities : ${JSON.stringify(this.capabilities)}\r\n`;
    str += `os : ${this.os}\r\n`;
    str += `osVersion : ${this.osVersion}\r\n`;
    str += `platform : ${this.platform}\r\n`;
    str += `Using ${_renderType === game.RENDER_TYPE_WEBGL ? 'WEBGL' : 'CANVAS'} renderer.\r\n`;
    log(str);
  },

  /**
   * Open a url in browser
   * @memberof sys
   * @name openURL
   * @param url
   */
  openURL(url: string) {
    window.open(url);
  },

  /**
   * Get the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
   * @memberof sys
   * @name now
   * @return
   */
  now(): number {
    if (Date.now) {
      return Date.now();
    }
    else {
      return +(new Date());
    }
  },

  localStorage: window.localStorage,
};

const win = window;
const nav = win.navigator;
const doc = document;
const docEle = doc.documentElement;
const ua = nav.userAgent.toLowerCase();

sys.isMobile = /mobile|android|iphone|ipad/.test(ua);
sys.platform = sys.isMobile ? sys.MOBILE_BROWSER : sys.DESKTOP_BROWSER;

let currLanguage = nav.language;
currLanguage = currLanguage ? currLanguage : (nav as any).browserLanguage;
currLanguage = currLanguage ? currLanguage.split('-')[0] : sys.LANGUAGE_ENGLISH;
sys.language = currLanguage;

// Get the os of system
let isAndroid = false;
let iOS = false;
let osVersion = '';
let osMainVersion = 0;
let uaResult = /android (\d+(?:\.\d+)+)/i.exec(ua) || /android (\d+(?:\.\d+)+)/i.exec(nav.platform);
if (uaResult) {
  isAndroid = true;
  osVersion = uaResult[1] || '';
  osMainVersion = parseInt(osVersion, 10) || 0;
}
uaResult = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(ua);
if (uaResult) {
  iOS = true;
  osVersion = uaResult[2] || '';
  osMainVersion = parseInt(osVersion, 10) || 0;
}
else if (/(iPhone|iPad|iPod)/.exec(nav.platform)) {
  iOS = true;
  osVersion = '';
  osMainVersion = 0;
}

let osName: string = sys.OS_UNKNOWN;
if (nav.appVersion.indexOf('Win') !== -1) osName = sys.OS_WINDOWS;
else if (iOS) osName = sys.OS_IOS;
else if (nav.appVersion.indexOf('Mac') !== -1) osName = sys.OS_OSX;
else if (nav.appVersion.indexOf('X11') !== -1 && nav.appVersion.indexOf('Linux') === -1) osName = (sys as any).OS_UNIX;
else if (isAndroid) osName = sys.OS_ANDROID;
else if (nav.appVersion.indexOf('Linux') !== -1) osName = sys.OS_LINUX;

sys.os = osName;
sys.osVersion = osVersion;
sys.osMainVersion = osMainVersion;

(function () {
  const typeReg1 = /micromessenger|mqqbrowser|sogou|qzone|liebao|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|trident|miuibrowser/i;
  const typeReg2 = /qqbrowser|qq|chrome|safari|firefox|opr|oupeng|opera/i;
  let browserTypes = typeReg1.exec(ua);
  if (!browserTypes) browserTypes = typeReg2.exec(ua);
  let browserType = browserTypes ? browserTypes[0] : sys.BROWSER_TYPE_UNKNOWN;
  if (browserType === 'micromessenger') {
    browserType = sys.BROWSER_TYPE_WECHAT;
  } else if (browserType === 'safari' && isAndroid) {
    browserType = sys.BROWSER_TYPE_ANDROID;
  } else if (browserType === 'trident') {
    browserType = sys.BROWSER_TYPE_IE;
  } else if (browserType === '360 aphone') {
    browserType = sys.BROWSER_TYPE_360;
  } else if (browserType === 'mxbrowser') {
    browserType = sys.BROWSER_TYPE_MAXTHON;
  } else if (browserType === 'opr') {
    browserType = sys.BROWSER_TYPE_OPERA;
  }

  sys.browserType = browserType;
})();

(function () {
  const versionReg1 = /(mqqbrowser|micromessenger|sogou|qzone|liebao|maxthon|mxbrowser|baidu)(mobile)?(browser)?\/?([\d.]+)/i;
  const versionReg2 = /(msie |rv:|firefox|chrome|ucbrowser|qq|oupeng|opera|opr|safari|miui)(mobile)?(browser)?\/?([\d.]+)/i;
  const tmp = ua.match(versionReg1) || ua.match(versionReg2);
  sys.browserVersion = tmp ? tmp[4] : '';
})();

const w = window.innerWidth || document.documentElement.clientWidth;
const h = window.innerHeight || document.documentElement.clientHeight;
const ratio = window.devicePixelRatio || 1;

sys.windowPixelResolution = {
  width: ratio * w,
  height: ratio * h
};

sys._supportCanvasNewBlendModes = (() => {
  const canvas = _tmpCanvas1;
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#000';
  context.fillRect(0, 0, 1, 1);
  context.globalCompositeOperation = 'multiply';

  const canvas2 = _tmpCanvas2;
  canvas2.width = 1;
  canvas2.height = 1;
  const context2 = canvas2.getContext('2d')!;
  context2.fillStyle = '#fff';
  context2.fillRect(0, 0, 1, 1);
  context.drawImage(canvas2, 0, 0, 1, 1);

  return context.getImageData(0, 0, 1, 1).data[0] === 0;
})();

if (sys.isMobile) {
  const fontStyle = document.createElement('style');
  fontStyle.type = 'text/css';
  document.body.appendChild(fontStyle);

  fontStyle.textContent = 'body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;}'
    + '-webkit-tap-highlight-color:rgba(0,0,0,0);}';
}

try {
  const localStorage = sys.localStorage = win.localStorage;
  localStorage.setItem('storage', '');
  localStorage.removeItem('storage');
} catch (e) {
  const warn = () => {
    log("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
  };
  sys.localStorage = {
    getItem: warn,
    setItem: warn,
    removeItem: warn,
    clear: warn,
  } as any;
}

const _supportCanvas = !!_tmpCanvas1.getContext('2d');
let _supportWebGL = false;
if (win.WebGLRenderingContext) {
  const tmpCanvas = document.createElement('CANVAS');
  try {
    const context = create3DContext(tmpCanvas, {});
    if (context) {
      _supportWebGL = true;
    }

    if (_supportWebGL && sys.os === sys.OS_IOS && sys.osMainVersion === 9) {
      // Not activating WebGL in iOS 9 UIWebView because it may crash when entering background
      if (!window.indexedDB) {
        _supportWebGL = false;
      }
    }

    if (_supportWebGL && sys.os === sys.OS_ANDROID) {
      const browserVer = parseFloat(sys.browserVersion);
      switch (sys.browserType) {
        case sys.BROWSER_TYPE_MOBILE_QQ:
        case sys.BROWSER_TYPE_BAIDU:
        case sys.BROWSER_TYPE_BAIDU_APP:
          // QQ & Baidu Brwoser 6.2+ (using blink kernel)
          if (browserVer >= 6.2) {
            _supportWebGL = true;
          }
          else {
            _supportWebGL = false;
          }
          break;
        case sys.BROWSER_TYPE_CHROME:
          // Chrome on android supports WebGL from v.30
          if (browserVer >= 30.0) {
            _supportWebGL = true;
          } else {
            _supportWebGL = false;
          }
          break;
        case sys.BROWSER_TYPE_ANDROID:
          // Android 5+ default browser
          if (sys.osMainVersion && sys.osMainVersion >= 5) {
            _supportWebGL = true;
          }
          break;
        case sys.BROWSER_TYPE_UNKNOWN:
        case sys.BROWSER_TYPE_360:
        case sys.BROWSER_TYPE_MIUI:
        case sys.BROWSER_TYPE_UC:
          _supportWebGL = false;
      }
    }
  }
  catch (e) { }
}

sys.capabilities = {
  canvas: _supportCanvas,
  opengl: _supportWebGL,
  touches: false,
  mouse: false,
  keyboard: false,
  accelerometer: false,
};

if (docEle.ontouchstart !== undefined || (doc as any).ontouchstart !== undefined || nav.msPointerEnabled) {
  sys.capabilities.touches = true;
}
if (docEle.onmouseup !== undefined) {
  sys.capabilities.mouse = true;
}
if (docEle.onkeyup !== undefined) {
  sys.capabilities.keyboard = true;
}
if (win.DeviceMotionEvent || win.DeviceOrientationEvent) {
  sys.capabilities.accelerometer = true;
}

export { sys };
