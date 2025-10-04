
//+++++++++++++++++++++++++Engine initialization function begin+++++++++++++++++++++++++++
(function () {

  var _tmpCanvas1 = document.createElement("canvas"),
    _tmpCanvas2 = document.createElement("canvas");

  cc.create3DContext = function (canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii], opt_attribs);
      } catch (e) {
      }
      if (context) {
        break;
      }
    }
    return context;
  };

  var _initSys = function () {
    /**
     * System variables
     * @namespace
     * @name cc.sys
     */
    cc.sys = {};
    var sys = cc.sys;

    /**
     * English language code
     * @memberof cc.sys
     * @name LANGUAGE_ENGLISH
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_ENGLISH = "en";

    /**
     * Chinese language code
     * @memberof cc.sys
     * @name LANGUAGE_CHINESE
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_CHINESE = "zh";

    /**
     * French language code
     * @memberof cc.sys
     * @name LANGUAGE_FRENCH
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_FRENCH = "fr";

    /**
     * Italian language code
     * @memberof cc.sys
     * @name LANGUAGE_ITALIAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_ITALIAN = "it";

    /**
     * German language code
     * @memberof cc.sys
     * @name LANGUAGE_GERMAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_GERMAN = "de";

    /**
     * Spanish language code
     * @memberof cc.sys
     * @name LANGUAGE_SPANISH
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_SPANISH = "es";

    /**
     * Spanish language code
     * @memberof cc.sys
     * @name LANGUAGE_DUTCH
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_DUTCH = "du";

    /**
     * Russian language code
     * @memberof cc.sys
     * @name LANGUAGE_RUSSIAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_RUSSIAN = "ru";

    /**
     * Korean language code
     * @memberof cc.sys
     * @name LANGUAGE_KOREAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_KOREAN = "ko";

    /**
     * Japanese language code
     * @memberof cc.sys
     * @name LANGUAGE_JAPANESE
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_JAPANESE = "ja";

    /**
     * Hungarian language code
     * @memberof cc.sys
     * @name LANGUAGE_HUNGARIAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_HUNGARIAN = "hu";

    /**
     * Portuguese language code
     * @memberof cc.sys
     * @name LANGUAGE_PORTUGUESE
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_PORTUGUESE = "pt";

    /**
     * Arabic language code
     * @memberof cc.sys
     * @name LANGUAGE_ARABIC
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_ARABIC = "ar";

    /**
     * Norwegian language code
     * @memberof cc.sys
     * @name LANGUAGE_NORWEGIAN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_NORWEGIAN = "no";

    /**
     * Polish language code
     * @memberof cc.sys
     * @name LANGUAGE_POLISH
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_POLISH = "pl";

    /**
     * Unknown language code
     * @memberof cc.sys
     * @name LANGUAGE_UNKNOWN
     * @constant
     * @type {Number}
     */
    sys.LANGUAGE_UNKNOWN = "unkonwn";

    /**
     * @memberof cc.sys
     * @name OS_IOS
     * @constant
     * @type {string}
     */
    sys.OS_IOS = "iOS";
    /**
     * @memberof cc.sys
     * @name OS_ANDROID
     * @constant
     * @type {string}
     */
    sys.OS_ANDROID = "Android";
    /**
     * @memberof cc.sys
     * @name OS_WINDOWS
     * @constant
     * @type {string}
     */
    sys.OS_WINDOWS = "Windows";
    /**
     * @memberof cc.sys
     * @name OS_MARMALADE
     * @constant
     * @type {string}
     */
    sys.OS_MARMALADE = "Marmalade";
    /**
     * @memberof cc.sys
     * @name OS_LINUX
     * @constant
     * @type {string}
     */
    sys.OS_LINUX = "Linux";
    /**
     * @memberof cc.sys
     * @name OS_BADA
     * @constant
     * @type {string}
     */
    sys.OS_BADA = "Bada";
    /**
     * @memberof cc.sys
     * @name OS_BLACKBERRY
     * @constant
     * @type {string}
     */
    sys.OS_BLACKBERRY = "Blackberry";
    /**
     * @memberof cc.sys
     * @name OS_OSX
     * @constant
     * @type {string}
     */
    sys.OS_OSX = "OS X";
    /**
     * @memberof cc.sys
     * @name OS_WP8
     * @constant
     * @type {string}
     */
    sys.OS_WP8 = "WP8";
    /**
     * @memberof cc.sys
     * @name OS_WINRT
     * @constant
     * @type {string}
     */
    sys.OS_WINRT = "WINRT";
    /**
     * @memberof cc.sys
     * @name OS_UNKNOWN
     * @constant
     * @type {string}
     */
    sys.OS_UNKNOWN = "Unknown";

    /**
     * @memberof cc.sys
     * @name UNKNOWN
     * @constant
     * @default
     * @type {Number}
     */
    sys.UNKNOWN = -1;
    /**
     * @memberof cc.sys
     * @name WIN32
     * @constant
     * @default
     * @type {Number}
     */
    sys.WIN32 = 0;
    /**
     * @memberof cc.sys
     * @name LINUX
     * @constant
     * @default
     * @type {Number}
     */
    sys.LINUX = 1;
    /**
     * @memberof cc.sys
     * @name MACOS
     * @constant
     * @default
     * @type {Number}
     */
    sys.MACOS = 2;
    /**
     * @memberof cc.sys
     * @name ANDROID
     * @constant
     * @default
     * @type {Number}
     */
    sys.ANDROID = 3;
    /**
     * @memberof cc.sys
     * @name IOS
     * @constant
     * @default
     * @type {Number}
     */
    sys.IPHONE = 4;
    /**
     * @memberof cc.sys
     * @name IOS
     * @constant
     * @default
     * @type {Number}
     */
    sys.IPAD = 5;
    /**
     * @memberof cc.sys
     * @name BLACKBERRY
     * @constant
     * @default
     * @type {Number}
     */
    sys.BLACKBERRY = 6;
    /**
     * @memberof cc.sys
     * @name NACL
     * @constant
     * @default
     * @type {Number}
     */
    sys.NACL = 7;
    /**
     * @memberof cc.sys
     * @name EMSCRIPTEN
     * @constant
     * @default
     * @type {Number}
     */
    sys.EMSCRIPTEN = 8;
    /**
     * @memberof cc.sys
     * @name TIZEN
     * @constant
     * @default
     * @type {Number}
     */
    sys.TIZEN = 9;
    /**
     * @memberof cc.sys
     * @name WINRT
     * @constant
     * @default
     * @type {Number}
     */
    sys.WINRT = 10;
    /**
     * @memberof cc.sys
     * @name WP8
     * @constant
     * @default
     * @type {Number}
     */
    sys.WP8 = 11;
    /**
     * @memberof cc.sys
     * @name MOBILE_BROWSER
     * @constant
     * @default
     * @type {Number}
     */
    sys.MOBILE_BROWSER = 100;
    /**
     * @memberof cc.sys
     * @name DESKTOP_BROWSER
     * @constant
     * @default
     * @type {Number}
     */
    sys.DESKTOP_BROWSER = 101;

    sys.BROWSER_TYPE_WECHAT = "wechat";
    sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    sys.BROWSER_TYPE_IE = "ie";
    sys.BROWSER_TYPE_QQ_APP = "qq"; // QQ App
    sys.BROWSER_TYPE_QQ = "qqbrowser";
    sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    sys.BROWSER_TYPE_UC = "ucbrowser";
    sys.BROWSER_TYPE_360 = "360browser";
    sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    sys.BROWSER_TYPE_MAXTHON = "maxthon";
    sys.BROWSER_TYPE_OPERA = "opera";
    sys.BROWSER_TYPE_OUPENG = "oupeng";
    sys.BROWSER_TYPE_MIUI = "miuibrowser";
    sys.BROWSER_TYPE_FIREFOX = "firefox";
    sys.BROWSER_TYPE_SAFARI = "safari";
    sys.BROWSER_TYPE_CHROME = "chrome";
    sys.BROWSER_TYPE_LIEBAO = "liebao";
    sys.BROWSER_TYPE_QZONE = "qzone";
    sys.BROWSER_TYPE_SOUGOU = "sogou";
    sys.BROWSER_TYPE_UNKNOWN = "unknown";

    /**
     * Is native ? This is set to be true in jsb auto.
     * @memberof cc.sys
     * @name isNative
     * @type {Boolean}
     */
    sys.isNative = false;

    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    /**
     * Indicate whether system is mobile system
     * @memberof cc.sys
     * @name isMobile
     * @type {Boolean}
     */
    sys.isMobile = /mobile|android|iphone|ipad/.test(ua);

    /**
     * Indicate the running platform
     * @memberof cc.sys
     * @name platform
     * @type {Number}
     */
    sys.platform = sys.isMobile ? sys.MOBILE_BROWSER : sys.DESKTOP_BROWSER;

    var currLanguage = nav.language;
    currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;

    /**
     * Indicate the current language of the running system
     * @memberof cc.sys
     * @name language
     * @type {String}
     */
    sys.language = currLanguage;

    // Get the os of system
    var isAndroid = false, iOS = false, osVersion = '', osMainVersion = 0;
    var uaResult = /android (\d+(?:\.\d+)+)/i.exec(ua) || /android (\d+(?:\.\d+)+)/i.exec(nav.platform);
    if (uaResult) {
      isAndroid = true;
      osVersion = uaResult[1] || '';
      osMainVersion = parseInt(osVersion) || 0;
    }
    uaResult = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(ua);
    if (uaResult) {
      iOS = true;
      osVersion = uaResult[2] || '';
      osMainVersion = parseInt(osVersion) || 0;
    }
    else if (/(iPhone|iPad|iPod)/.exec(nav.platform)) {
      iOS = true;
      osVersion = '';
      osMainVersion = 0;
    }

    var osName = sys.OS_UNKNOWN;
    if (nav.appVersion.indexOf("Win") !== -1) osName = sys.OS_WINDOWS;
    else if (iOS) osName = sys.OS_IOS;
    else if (nav.appVersion.indexOf("Mac") !== -1) osName = sys.OS_OSX;
    else if (nav.appVersion.indexOf("X11") !== -1 && nav.appVersion.indexOf("Linux") === -1) osName = sys.OS_UNIX;
    else if (isAndroid) osName = sys.OS_ANDROID;
    else if (nav.appVersion.indexOf("Linux") !== -1) osName = sys.OS_LINUX;

    /**
     * Indicate the running os name
     * @memberof cc.sys
     * @name os
     * @type {String}
     */
    sys.os = osName;
    /**
     * Indicate the running os version string
     * @memberof cc.sys
     * @name osVersion
     * @type {String}
     */
    sys.osVersion = osVersion;
    /**
     * Indicate the running os main version number
     * @memberof cc.sys
     * @name osMainVersion
     * @type {Number}
     */
    sys.osMainVersion = osMainVersion;

    /**
     * Indicate the running browser type
     * @memberof cc.sys
     * @name browserType
     * @type {String}
     */
    sys.browserType = sys.BROWSER_TYPE_UNKNOWN;
    /* Determine the browser type */
    (function () {
      var typeReg1 = /micromessenger|mqqbrowser|sogou|qzone|liebao|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|trident|miuibrowser/i;
      var typeReg2 = /qqbrowser|qq|chrome|safari|firefox|opr|oupeng|opera/i;
      var browserTypes = typeReg1.exec(ua);
      if (!browserTypes) browserTypes = typeReg2.exec(ua);
      var browserType = browserTypes ? browserTypes[0] : sys.BROWSER_TYPE_UNKNOWN;
      if (browserType === 'micromessenger')
        browserType = sys.BROWSER_TYPE_WECHAT;
      else if (browserType === "safari" && isAndroid)
        browserType = sys.BROWSER_TYPE_ANDROID;
      else if (browserType === "trident")
        browserType = sys.BROWSER_TYPE_IE;
      else if (browserType === "360 aphone")
        browserType = sys.BROWSER_TYPE_360;
      else if (browserType === "mxbrowser")
        browserType = sys.BROWSER_TYPE_MAXTHON;
      else if (browserType === "opr")
        browserType = sys.BROWSER_TYPE_OPERA;

      sys.browserType = browserType;
    })();

    /**
     * Indicate the running browser version
     * @memberof cc.sys
     * @name browserVersion
     * @type {String}
     */
    sys.browserVersion = "";
    /* Determine the browser version number */
    (function () {
      var versionReg1 = /(mqqbrowser|micromessenger|sogou|qzone|liebao|maxthon|mxbrowser|baidu)(mobile)?(browser)?\/?([\d.]+)/i;
      var versionReg2 = /(msie |rv:|firefox|chrome|ucbrowser|qq|oupeng|opera|opr|safari|miui)(mobile)?(browser)?\/?([\d.]+)/i;
      var tmp = ua.match(versionReg1);
      if (!tmp) tmp = ua.match(versionReg2);
      sys.browserVersion = tmp ? tmp[4] : "";
    })();

    var w = window.innerWidth || document.documentElement.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var ratio = window.devicePixelRatio || 1;

    /**
     * Indicate the real pixel resolution of the whole game window
     * @memberof cc.sys
     * @name windowPixelResolution
     * @type {Size}
     */
    sys.windowPixelResolution = {
      width: ratio * w,
      height: ratio * h
    };

    sys._checkWebGLRenderMode = function () {
      if (cc._renderType !== cc.game.RENDER_TYPE_WEBGL)
        throw new Error("This feature supports WebGL render mode only.");
    };

    //Whether or not the Canvas BlendModes are supported.
    sys._supportCanvasNewBlendModes = (function () {
      var canvas = _tmpCanvas1;
      canvas.width = 1;
      canvas.height = 1;
      var context = canvas.getContext('2d');
      context.fillStyle = '#000';
      context.fillRect(0, 0, 1, 1);
      context.globalCompositeOperation = 'multiply';

      var canvas2 = _tmpCanvas2;
      canvas2.width = 1;
      canvas2.height = 1;
      var context2 = canvas2.getContext('2d');
      context2.fillStyle = '#fff';
      context2.fillRect(0, 0, 1, 1);
      context.drawImage(canvas2, 0, 0, 1, 1);

      return context.getImageData(0, 0, 1, 1).data[0] === 0;
    })();

    // Adjust mobile css settings
    if (cc.sys.isMobile) {
      var fontStyle = document.createElement("style");
      fontStyle.type = "text/css";
      document.body.appendChild(fontStyle);

      fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
        + "-webkit-tap-highlight-color:rgba(0,0,0,0);}";
    }

    /**
     * cc.sys.localStorage is a local storage component.
     * @memberof cc.sys
     * @name localStorage
     * @type {Object}
     */
    try {
      var localStorage = sys.localStorage = win.localStorage;
      localStorage.setItem("storage", "");
      localStorage.removeItem("storage");
      localStorage = null;
    } catch (e) {
      var warn = function () {
        cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
      };
      sys.localStorage = {
        getItem: warn,
        setItem: warn,
        removeItem: warn,
        clear: warn
      };
    }

    var _supportCanvas = !!_tmpCanvas1.getContext("2d");
    var _supportWebGL = false;
    if (win.WebGLRenderingContext) {
      var tmpCanvas = document.createElement("CANVAS");
      try {
        var context = cc.create3DContext(tmpCanvas);
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
          var browserVer = parseFloat(sys.browserVersion);
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
      tmpCanvas = null;
    }

    /**
     * The capabilities of the current platform
     * @memberof cc.sys
     * @name capabilities
     * @type {Object}
     */
    var capabilities = sys.capabilities = {
      "canvas": _supportCanvas,
      "opengl": _supportWebGL
    };
    if (docEle['ontouchstart'] !== undefined || doc['ontouchstart'] !== undefined || nav.msPointerEnabled)
      capabilities["touches"] = true;
    if (docEle['onmouseup'] !== undefined)
      capabilities["mouse"] = true;
    if (docEle['onkeyup'] !== undefined)
      capabilities["keyboard"] = true;
    if (win.DeviceMotionEvent || win.DeviceOrientationEvent)
      capabilities["accelerometer"] = true;

    /**
     * Forces the garbage collection, only available in JSB
     * @memberof cc.sys
     * @name garbageCollect
     * @function
     */
    sys.garbageCollect = function () {
      // N/A in cocos2d-html5
    };

    /**
     * Dumps rooted objects, only available in JSB
     * @memberof cc.sys
     * @name dumpRoot
     * @function
     */
    sys.dumpRoot = function () {
      // N/A in cocos2d-html5
    };

    /**
     * Restart the JS VM, only available in JSB
     * @memberof cc.sys
     * @name restartVM
     * @function
     */
    sys.restartVM = function () {
      // N/A in cocos2d-html5
    };

    /**
     * Clean a script in the JS VM, only available in JSB
     * @memberof cc.sys
     * @name cleanScript
     * @param {String} jsfile
     * @function
     */
    sys.cleanScript = function (jsfile) {
      // N/A in cocos2d-html5
    };

    /**
     * Check whether an object is valid,
     * In web engine, it will return true if the object exist
     * In native engine, it will return true if the JS object and the correspond native object are both valid
     * @memberof cc.sys
     * @name isObjectValid
     * @param {Object} obj
     * @return {boolean} Validity of the object
     * @function
     */
    sys.isObjectValid = function (obj) {
      if (obj) return true;
      else return false;
    };

    /**
     * Dump system informations
     * @memberof cc.sys
     * @name dump
     * @function
     */
    sys.dump = function () {
      var self = this;
      var str = "";
      str += "isMobile : " + self.isMobile + "\r\n";
      str += "language : " + self.language + "\r\n";
      str += "browserType : " + self.browserType + "\r\n";
      str += "browserVersion : " + self.browserVersion + "\r\n";
      str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
      str += "os : " + self.os + "\r\n";
      str += "osVersion : " + self.osVersion + "\r\n";
      str += "platform : " + self.platform + "\r\n";
      str += "Using " + (cc._renderType === cc.game.RENDER_TYPE_WEBGL ? "WEBGL" : "CANVAS") + " renderer." + "\r\n";
      cc.log(str);
    };

    /**
     * Open a url in browser
     * @memberof cc.sys
     * @name openURL
     * @param {String} url
     */
    sys.openURL = function (url) {
      window.open(url);
    };

    /**
     * Get the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     * @memberof cc.sys
     * @name now
     * @return {Number}
     */
    sys.now = function () {
      if (Date.now) {
        return Date.now();
      }
      else {
        return +(new Date);
      }
    };
  };
  _initSys();

  _tmpCanvas1 = null;
  _tmpCanvas2 = null;

  //to make sure the cc.log, cc.warn, cc.error and cc.assert would not throw error before init by debugger mode.
  cc.log = cc.warn = cc.error = cc.assert = function () {
  };

  var _config = null,
    //cache for js and module that has added into jsList to be loaded.
    _jsAddedCache = {},
    _engineInitCalled = false,
    _engineLoadedCallback = null;

  cc._engineLoaded = false;

  function _determineRenderType(config) {
    var CONFIG_KEY = cc.game.CONFIG_KEY,
      userRenderMode = parseInt(config[CONFIG_KEY.renderMode]) || 0;

    // Adjust RenderType
    if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0)
      config[CONFIG_KEY.renderMode] = 0;

    // Determine RenderType
    cc._renderType = cc.game.RENDER_TYPE_CANVAS;
    cc._supportRender = false;

    if (userRenderMode === 0) {
      if (cc.sys.capabilities["opengl"]) {
        cc._renderType = cc.game.RENDER_TYPE_WEBGL;
        cc._supportRender = true;
      }
      else if (cc.sys.capabilities["canvas"]) {
        cc._renderType = cc.game.RENDER_TYPE_CANVAS;
        cc._supportRender = true;
      }
    }
    else if (userRenderMode === 1 && cc.sys.capabilities["canvas"]) {
      cc._renderType = cc.game.RENDER_TYPE_CANVAS;
      cc._supportRender = true;
    }
    else if (userRenderMode === 2 && cc.sys.capabilities["opengl"]) {
      cc._renderType = cc.game.RENDER_TYPE_WEBGL;
      cc._supportRender = true;
    }
  }

  function _getJsListOfModule(moduleMap, moduleName, dir) {
    if (_jsAddedCache[moduleName]) return null;
    dir = dir || "";
    var jsList = [];
    var tempList = moduleMap[moduleName];
    if (!tempList) throw new Error("can not find module [" + moduleName + "]");
    var ccPath = cc.path;
    for (var i = 0, li = tempList.length; i < li; i++) {
      var item = tempList[i];
      if (_jsAddedCache[item]) continue;
      var extname = ccPath.extname(item);
      if (!extname) {
        var arr = _getJsListOfModule(moduleMap, item, dir);
        if (arr) jsList = jsList.concat(arr);
      } else if (extname.toLowerCase() === ".js") jsList.push(ccPath.join(dir, item));
      _jsAddedCache[item] = 1;
    }
    return jsList;
  }

  function _afterEngineLoaded(config) {
    if (cc._initDebugSetting)
      cc._initDebugSetting(config[cc.game.CONFIG_KEY.debugMode]);
    cc._engineLoaded = true;
    console.log(cc.ENGINE_VERSION);
    if (_engineLoadedCallback) _engineLoadedCallback();
  }

  function _load(config) {
    var self = this;
    var CONFIG_KEY = cc.game.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = cc.loader;

    if (cc.Class) {
      // Single file loaded
      _afterEngineLoaded(config);
    } else {
      // Load cocos modules
      var ccModulesPath = cc.path.join(engineDir, "moduleConfig.json");
      loader.loadJson(ccModulesPath, function (err, modulesJson) {
        if (err) throw new Error(err);
        var modules = config["modules"] || [];
        var moduleMap = modulesJson["module"];
        var jsList = [];
        if (cc.sys.capabilities["opengl"] && modules.indexOf("base4webgl") < 0) modules.splice(0, 0, "base4webgl");
        else if (modules.indexOf("core") < 0) modules.splice(0, 0, "core");
        for (var i = 0, li = modules.length; i < li; i++) {
          var arr = _getJsListOfModule(moduleMap, modules[i], engineDir);
          if (arr) jsList = jsList.concat(arr);
        }
        cc.loader.loadJsWithImg(jsList, function (err) {
          if (err) throw err;
          _afterEngineLoaded(config);
        });
      });
    }
  }

  function _windowLoaded() {
    this.removeEventListener('load', _windowLoaded, false);
    _load(cc.game.config);
  }

  cc.initEngine = function (config, cb) {
    if (_engineInitCalled) {
      var previousCallback = _engineLoadedCallback;
      _engineLoadedCallback = function () {
        previousCallback && previousCallback();
        cb && cb();
      }
      return;
    }

    _engineLoadedCallback = cb;

    // Config uninitialized and given, initialize with it
    if (!cc.game.config && config) {
      cc.game.config = config;
    }
    // No config given and no config set before, load it
    else if (!cc.game.config) {
      cc.game._loadConfig();
    }
    config = cc.game.config;

    _determineRenderType(config);

    document.body ? _load(config) : cc._addEventListener(window, 'load', _windowLoaded, false);
    _engineInitCalled = true;
  };

})();
//+++++++++++++++++++++++++Engine initialization function end+++++++++++++++++++++++++++++
