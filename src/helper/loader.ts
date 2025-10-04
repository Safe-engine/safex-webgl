
//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++
/**
 * Resource loading management. Created by in CCBoot.js as a singleton
 * loader.
 * @name Loader
 * @class
 * @memberof cc
 * @see loader
 */

var imagePool = {
  _pool: new Array(10),
  _MAX: 10,
  _smallImg: "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=",

  count: 0,
  get: function () {
    if (this.count > 0) {
      this.count--;
      var result = this._pool[this.count];
      this._pool[this.count] = null;
      return result;
    }
    else {
      return new Image();
    }
  },
  put: function (img) {
    var pool = this._pool;
    if (img instanceof HTMLImageElement && this.count < this._MAX) {
      img.src = this._smallImg;
      pool[this.count] = img;
      this.count++;
    }
  }
};

/**
 * Singleton instance of Loader.
 * @name loader
 * @member {Loader}
 * @memberof cc
 */
export const loader = (function () {
  var _jsCache = {}, //cache for js
    _register = {}, //register of loaders
    _langPathCache = {}, //cache for lang path
    _aliases = {}, //aliases for res url
    _queue = {}, // Callback queue for resources already loading
    _urlRegExp = new RegExp("^(?:https?|ftp)://\\S*$", "i");

  return /** @lends Loader# */{
    /**
     * Root path of resources.
     * @type {String}
     */
    resPath: "",

    /**
     * Root path of audio resources
     * @type {String}
     */
    audioPath: "",

    /**
     * Cache for data loaded.
     * @type {Object}
     */
    cache: {},

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest: function () {
      var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
      xhr.timeout = 10000;
      if (xhr.ontimeout === undefined) {
        xhr._timeoutId = -1;
      }
      return xhr;
    },

    //@MODE_BEGIN DEV

    _getArgs4Js: function (args) {
      var a0 = args[0], a1 = args[1], a2 = args[2], results = ["", null, null];

      if (args.length === 1) {
        results[1] = a0 instanceof Array ? a0 : [a0];
      } else if (args.length === 2) {
        if (typeof a1 === "function") {
          results[1] = a0 instanceof Array ? a0 : [a0];
          results[2] = a1;
        } else {
          results[0] = a0 || "";
          results[1] = a1 instanceof Array ? a1 : [a1];
        }
      } else if (args.length === 3) {
        results[0] = a0 || "";
        results[1] = a1 instanceof Array ? a1 : [a1];
        results[2] = a2;
      } else throw new Error("arguments error to load js!");
      return results;
    },

    isLoading: function (url) {
      return (_queue[url] !== undefined);
    },

    /**
     * Load js files.
     * If the third parameter doesn't exist, then the baseDir turns to be "".
     *
     * @param {string} [baseDir]   The pre path for jsList or the list of js path.
     * @param {array} jsList    List of js path.
     * @param {function} [cb]  Callback function
     * @returns {*}
     */
    loadJs: function (baseDir, jsList, cb) {
      var self = this,
        args = self._getArgs4Js(arguments);

      var preDir = args[0], list = args[1], callback = args[2];
      if (navigator.userAgent.indexOf("Trident/5") > -1) {
        self._loadJs4Dependency(preDir, list, 0, callback);
      } else {
        async.map(list, function (item, index, cb1) {
          var jsPath = path.join(preDir, item);
          if (_jsCache[jsPath]) return cb1(null);
          self._createScript(jsPath, false, cb1);
        }, callback);
      }
    },
    /**
     * Load js width loading image.
     *
     * @param {string} [baseDir]
     * @param {array} jsList
     * @param {function} [cb]
     */
    loadJsWithImg: function (baseDir, jsList, cb) {
      var self = this, jsLoadingImg = self._loadJsImg(),
        args = self._getArgs4Js(arguments);
      this.loadJs(args[0], args[1], function (err) {
        if (err) throw new Error(err);
        jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
        if (args[2]) args[2]();
      });
    },
    _createScript: function (jsPath, isAsync, cb) {
      var d = document, self = this, s = document.createElement('script');
      s.async = isAsync;
      _jsCache[jsPath] = true;
      if (game.config["noCache"] && typeof jsPath === "string") {
        if (self._noCacheRex.test(jsPath))
          s.src = jsPath + "&_t=" + (new Date() - 0);
        else
          s.src = jsPath + "?_t=" + (new Date() - 0);
      } else {
        s.src = jsPath;
      }
      s.addEventListener('load', function () {
        s.parentNode.removeChild(s);
        this.removeEventListener('load', arguments.callee, false);
        cb();
      }, false);
      s.addEventListener('error', function () {
        s.parentNode.removeChild(s);
        cb("Load " + jsPath + " failed!");
      }, false);
      d.body.appendChild(s);
    },
    _loadJs4Dependency: function (baseDir, jsList, index, cb) {
      if (index >= jsList.length) {
        if (cb) cb();
        return;
      }
      var self = this;
      self._createScript(path.join(baseDir, jsList[index]), false, function (err) {
        if (err) return cb(err);
        self._loadJs4Dependency(baseDir, jsList, index + 1, cb);
      });
    },
    _loadJsImg: function () {
      var d = document, jsLoadingImg = d.getElementById("cocos2d_loadJsImg");
      if (!jsLoadingImg) {
        jsLoadingImg = document.createElement('img');

        if (_loadingImage)
          jsLoadingImg.src = _loadingImage;

        var canvasNode = d.getElementById(game.config["id"]);
        canvasNode.style.backgroundColor = "transparent";
        canvasNode.parentNode.appendChild(jsLoadingImg);

        var canvasStyle = getComputedStyle ? getComputedStyle(canvasNode) : canvasNode.currentStyle;
        if (!canvasStyle)
          canvasStyle = { width: canvasNode.width, height: canvasNode.height };
        jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width) / 2 + "px";
        jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height) / 2 + "px";
        jsLoadingImg.style.position = "absolute";
      }
      return jsLoadingImg;
    },
    //@MODE_END DEV

    /**
     * Load a single resource as txt.
     * @param {string} url
     * @param {function} [cb] arguments are : err, txt
     */
    loadTxt: function (url, cb) {
      if (!_isNodeJs) {
        var xhr = this.getXMLHttpRequest(),
          errInfo = "load " + url + " failed!";
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
          // IE-specific logic here
          xhr.setRequestHeader("Accept-Charset", "utf-8");
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4)
              (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null);
          };
        } else {
          if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
          var loadCallback = function () {
            xhr.removeEventListener('load', loadCallback);
            xhr.removeEventListener('error', errorCallback);
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId);
            }
            else {
              xhr.removeEventListener('timeout', timeoutCallback);
            }
            if (xhr.readyState === 4) {
              (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null);
            }
          };
          var errorCallback = function () {
            xhr.removeEventListener('load', loadCallback);
            xhr.removeEventListener('error', errorCallback);
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId);
            }
            else {
              xhr.removeEventListener('timeout', timeoutCallback);
            }
            cb({ status: xhr.status, errorMessage: errInfo }, null);
          };
          var timeoutCallback = function () {
            xhr.removeEventListener('load', loadCallback);
            xhr.removeEventListener('error', errorCallback);
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId);
            }
            else {
              xhr.removeEventListener('timeout', timeoutCallback);
            }
            cb({ status: xhr.status, errorMessage: "Request timeout: " + errInfo }, null);
          };
          xhr.addEventListener('load', loadCallback);
          xhr.addEventListener('error', errorCallback);
          if (xhr.ontimeout === undefined) {
            xhr._timeoutId = setTimeout(function () {
              timeoutCallback();
            }, xhr.timeout);
          }
          else {
            xhr.addEventListener('timeout', timeoutCallback);
          }
        }
        xhr.send(null);
      } else {
        var fs = require("fs");
        fs.readFile(url, function (err, data) {
          err ? cb(err) : cb(null, data.toString());
        });
      }
    },

    loadCsb: function (url, cb) {
      var xhr = loader.getXMLHttpRequest(),
        errInfo = "load " + url + " failed!";
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      var loadCallback = function () {
        xhr.removeEventListener('load', loadCallback);
        xhr.removeEventListener('error', errorCallback);
        if (xhr._timeoutId >= 0) {
          clearTimeout(xhr._timeoutId);
        }
        else {
          xhr.removeEventListener('timeout', timeoutCallback);
        }
        var arrayBuffer = xhr.response; // Note: not oReq.responseText
        if (arrayBuffer) {
          window.msg = arrayBuffer;
        }
        if (xhr.readyState === 4) {
          (xhr.status === 200 || xhr.status === 0) ? cb(null, xhr.response) : cb({ status: xhr.status, errorMessage: errInfo }, null);
        }
      };
      var errorCallback = function () {
        xhr.removeEventListener('load', loadCallback);
        xhr.removeEventListener('error', errorCallback);
        if (xhr._timeoutId >= 0) {
          clearTimeout(xhr._timeoutId);
        }
        else {
          xhr.removeEventListener('timeout', timeoutCallback);
        }
        cb({ status: xhr.status, errorMessage: errInfo }, null);
      };
      var timeoutCallback = function () {
        xhr.removeEventListener('load', loadCallback);
        xhr.removeEventListener('error', errorCallback);
        if (xhr._timeoutId >= 0) {
          clearTimeout(xhr._timeoutId);
        }
        else {
          xhr.removeEventListener('timeout', timeoutCallback);
        }
        cb({ status: xhr.status, errorMessage: "Request timeout: " + errInfo }, null);
      };
      xhr.addEventListener('load', loadCallback);
      xhr.addEventListener('error', errorCallback);
      if (xhr.ontimeout === undefined) {
        xhr._timeoutId = setTimeout(function () {
          timeoutCallback();
        }, xhr.timeout);
      }
      else {
        xhr.addEventListener('timeout', timeoutCallback);
      }
      xhr.send(null);
    },

    /**
     * Load a single resource as json.
     * @param {string} url
     * @param {function} [cb] arguments are : err, json
     */
    loadJson: function (url, cb) {
      this.loadTxt(url, function (err, txt) {
        if (err) {
          cb(err);
        }
        else {
          try {
            var result = JSON.parse(txt);
          }
          catch (e) {
            throw new Error("parse json [" + url + "] failed : " + e);
            return;
          }
          cb(null, result);
        }
      });
    },

    _checkIsImageURL: function (url) {
      var ext = /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(url);
      return (ext != null);
    },
    /**
     * Load a single image.
     * @param {!string} url
     * @param {object} [option]
     * @param {function} callback
     * @returns {Image}
     */
    loadImg: function (url, option, callback, img) {
      var opt = {
        isCrossOrigin: true
      };
      if (callback !== undefined)
        opt.isCrossOrigin = option.isCrossOrigin === undefined ? opt.isCrossOrigin : option.isCrossOrigin;
      else if (option !== undefined)
        callback = option;

      var texture = this.getRes(url);
      if (texture) {
        callback && callback(null, texture);
        return null;
      }

      var queue = _queue[url];
      if (queue) {
        queue.callbacks.push(callback);
        return queue.img;
      }

      img = img || imagePool.get();
      if (opt.isCrossOrigin && location.origin !== "file://")
        img.crossOrigin = "Anonymous";
      else
        img.crossOrigin = null;

      var loadCallback = function () {
        this.removeEventListener('load', loadCallback, false);
        this.removeEventListener('error', errorCallback, false);

        var queue = _queue[url];
        if (queue) {
          var callbacks = queue.callbacks;
          for (var i = 0; i < callbacks.length; ++i) {
            var cb = callbacks[i];
            if (cb) {
              cb(null, img);
            }
          }
          queue.img = null;
          delete _queue[url];
        }

        if (window.ENABLE_IMAEG_POOL && _renderType === game.RENDER_TYPE_WEBGL) {
          imagePool.put(img);
        }
      };

      var self = this;
      var errorCallback = function () {
        this.removeEventListener('load', loadCallback, false);
        this.removeEventListener('error', errorCallback, false);

        if (window.location.protocol !== 'https:' && img.crossOrigin && img.crossOrigin.toLowerCase() === "anonymous") {
          opt.isCrossOrigin = false;
          self.release(url);
          loader.loadImg(url, opt, callback, img);
        } else {
          var queue = _queue[url];
          if (queue) {
            var callbacks = queue.callbacks;
            for (var i = 0; i < callbacks.length; ++i) {
              var cb = callbacks[i];
              if (cb) {
                cb("load image failed");
              }
            }
            queue.img = null;
            delete _queue[url];
          }

          if (_renderType === game.RENDER_TYPE_WEBGL) {
            imagePool.put(img);
          }
        }
      };

      _queue[url] = {
        img: img,
        callbacks: callback ? [callback] : []
      };

      img.addEventListener("load", loadCallback);
      img.addEventListener("error", errorCallback);
      img.src = url;
      return img;
    },

    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} [cb]
     * @returns {*}
     * @private
     */
    _loadResIterator: function (item, index, cb) {
      var self = this, url = null;
      var type = item.type;
      if (type) {
        type = "." + type.toLowerCase();
        url = item.src ? item.src : item.name + type;
      } else {
        url = item;
        type = path.extname(url);
      }

      var obj = self.getRes(url);
      if (obj)
        return cb(null, obj);
      var loader = null;
      if (type) {
        loader = _register[type.toLowerCase()];
      }
      if (!loader) {
        error("loader for [" + type + "] doesn't exist!");
        return cb();
      }
      var realUrl = url;
      if (!_urlRegExp.test(url)) {
        var basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        realUrl = self.getUrl(basePath, url);
      }

      if (game.config["noCache"] && typeof realUrl === "string") {
        if (self._noCacheRex.test(realUrl))
          realUrl += "&_t=" + (new Date() - 0);
        else
          realUrl += "?_t=" + (new Date() - 0);
      }
      loader.load(realUrl, url, item, function (err, data) {
        if (err) {
          log(err);
          self.cache[url] = null;
          delete self.cache[url];
          cb({ status: 520, errorMessage: err }, null);
        } else {
          self.cache[url] = data;
          cb(null, data);
        }
      });
    },
    _noCacheRex: /\?/,

    /**
     * Get url with basePath.
     * @param {string} basePath
     * @param {string} [url]
     * @returns {*}
     */
    getUrl: function (basePath, url) {
      var self = this, path = path;
      if (basePath !== undefined && url === undefined) {
        url = basePath;
        var type = path.extname(url);
        type = type ? type.toLowerCase() : "";
        var loader = _register[type];
        if (!loader)
          basePath = self.resPath;
        else
          basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
      }
      url = path.join(basePath || "", url);
      if (url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
        if (_langPathCache[url])
          return _langPathCache[url];
        var extname = path.extname(url) || "";
        url = _langPathCache[url] = url.substring(0, url.length - extname.length) + "_" + sys.language + extname;
      }
      return url;
    },

    /**
     * Load resources then call the callback.
     * @param {string} resources
     * @param {function} [option] callback or trigger
     * @param {function|Object} [loadCallback]
     * @return {AsyncPool}
     */
    load: function (resources, option, loadCallback) {
      var self = this;
      var len = arguments.length;
      if (len === 0)
        throw new Error("arguments error!");

      if (len === 3) {
        if (typeof option === "function") {
          if (typeof loadCallback === "function")
            option = { trigger: option, cb: loadCallback };
          else
            option = { cb: option, cbTarget: loadCallback };
        }
      } else if (len === 2) {
        if (typeof option === "function")
          option = { cb: option };
      } else if (len === 1) {
        option = {};
      }

      if (!(resources instanceof Array))
        resources = [resources];
      var asyncPool = new AsyncPool(
        resources, CONCURRENCY_HTTP_REQUEST_COUNT,
        function (value, index, AsyncPoolCallback, aPool) {
          self._loadResIterator(value, index, function (err) {
            var arr = Array.prototype.slice.call(arguments, 1);
            if (option.trigger)
              option.trigger.call(option.triggerTarget, arr[0], aPool.size, aPool.finishedSize);   //call trigger
            AsyncPoolCallback(err, arr[0]);
          });
        },
        option.cb, option.cbTarget);
      asyncPool.flow();
      return asyncPool;
    },

    _handleAliases: function (fileNames, cb) {
      var self = this;
      var resList = [];
      for (var key in fileNames) {
        var value = fileNames[key];
        _aliases[key] = value;
        resList.push(value);
      }
      this.load(resList, cb);
    },

    /**
     * <p>
     *     Loads alias map from the contents of a filename.                                        <br/>
     *                                                                                                                 <br/>
     *     @note The plist file name should follow the format below:                                                   <br/>
     *     <?xml version="1.0" encoding="UTF-8"?>                                                                      <br/>
     *         <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  <br/>
     *             <plist version="1.0">                                                                               <br/>
     *                 <dict>                                                                                          <br/>
     *                     <key>filenames</key>                                                                        <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>sounds/click.wav</key>                                                             <br/>
     *                         <string>sounds/click.caf</string>                                                       <br/>
     *                         <key>sounds/endgame.wav</key>                                                           <br/>
     *                         <string>sounds/endgame.caf</string>                                                     <br/>
     *                         <key>sounds/gem-0.wav</key>                                                             <br/>
     *                         <string>sounds/gem-0.caf</string>                                                       <br/>
     *                     </dict>                                                                                     <br/>
     *                     <key>metadata</key>                                                                         <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>version</key>                                                                      <br/>
     *                         <integer>1</integer>                                                                    <br/>
     *                     </dict>                                                                                     <br/>
     *                 </dict>                                                                                         <br/>
     *              </plist>                                                                                           <br/>
     * </p>
     * @param {String} url  The plist file name.
     * @param {Function} [callback]
     */
    loadAliases: function (url, callback) {
      var self = this, dict = self.getRes(url);
      if (!dict) {
        self.load(url, function (err, results) {
          self._handleAliases(results[0]["filenames"], callback);
        });
      } else
        self._handleAliases(dict["filenames"], callback);
    },

    /**
     * Register a resource loader into loader.
     * @param {string} extNames
     * @param {function} loader
     */
    register: function (extNames, loader) {
      if (!extNames || !loader) return;
      var self = this;
      if (typeof extNames === "string")
        return _register[extNames.trim().toLowerCase()] = loader;
      for (var i = 0, li = extNames.length; i < li; i++) {
        _register["." + extNames[i].trim().toLowerCase()] = loader;
      }
    },

    /**
     * Get resource data by url.
     * @param url
     * @returns {*}
     */
    getRes: function (url) {
      return this.cache[url] || this.cache[_aliases[url]];
    },

    /**
     * Get aliase by url.
     * @param url
     * @returns {*}
     */
    _getAliase: function (url) {
      return _aliases[url];
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release: function (url) {
      var cache = this.cache;
      var queue = _queue[url];
      if (queue) {
        queue.img = null;
        delete _queue[url];
      }
      delete cache[url];
      delete cache[_aliases[url]];
      delete _aliases[url];
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll: function () {
      var locCache = this.cache;
      for (var key in locCache)
        delete locCache[key];
      for (var key in _aliases)
        delete _aliases[key];
    }
  };
})();
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++
