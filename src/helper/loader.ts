import { game } from '..'
import { CONCURRENCY_HTTP_REQUEST_COUNT } from '../core/platform/Macro'
import { AsyncPool } from './AsyncPool'
import { error, log } from './Debugger'
import { _renderType } from './engine'
import { path } from './path'
import { sys } from './sys'

const _isNodeJs = false
window.ENABLE_IMAGE_POOL = true
const imagePool = {
  _pool: new Array(10),
  _MAX: 10,
  _smallImg: 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=',

  count: 0,
  get: function () {
    if (this.count > 0) {
      this.count--
      const result = this._pool[this.count]
      this._pool[this.count] = null
      return result
    } else {
      return new Image()
    }
  },
  put: function (img) {
    const pool = this._pool
    if (img instanceof HTMLImageElement && this.count < this._MAX) {
      img.src = this._smallImg
      pool[this.count] = img
      this.count++
    }
  },
}

/**
 * Singleton instance of Loader.
 * @name loader
 * @member {Loader}
 * @memberof cc
 */
export const loader = (function () {
  const _register = {}, //register of loaders
    _langPathCache = {}, //cache for lang path
    _aliases = {}, //aliases for res url
    _queue = {}, // Callback queue for resources already loading
    _urlRegExp = new RegExp('^(?:https?|ftp)://\\S*$', 'i')

  return /** @lends Loader# */ {
    /**
     * Root path of resources.
     * @type {String}
     */
    resPath: '',

    /**
     * Root path of audio resources
     * @type {String}
     */
    audioPath: '',

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
      const xhr = new XMLHttpRequest() as SafexXMLHttpRequest
      xhr.timeout = 10000
      if (xhr.ontimeout === undefined) {
        xhr._timeoutId = -1
      }
      return xhr
    },

    isLoading: function (url) {
      return _queue[url] !== undefined
    },
    /**
     * Load a single resource as txt.
     * @param {string} url
     * @param {function} [cb] arguments are : err, txt
     */
    loadTxt: function (url, cb) {
      if (!_isNodeJs) {
        const xhr: SafexXMLHttpRequest = this.getXMLHttpRequest(),
          errInfo = `load ${url} failed!`
        xhr.open('GET', url, true)
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
          // IE-specific logic here
          xhr.setRequestHeader('Accept-Charset', 'utf-8')
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4)
              xhr.status === 200 || xhr.status === 0 ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null)
          }
        } else {
          if (xhr.overrideMimeType) xhr.overrideMimeType('text/plain; charset=utf-8')
          const loadCallback = function () {
            xhr.removeEventListener('load', loadCallback)
            xhr.removeEventListener('error', errorCallback)
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId)
            } else {
              xhr.removeEventListener('timeout', timeoutCallback)
            }
            if (xhr.readyState === 4) {
              xhr.status === 200 || xhr.status === 0 ? cb(null, xhr.responseText) : cb({ status: xhr.status, errorMessage: errInfo }, null)
            }
          }
          const errorCallback = function () {
            xhr.removeEventListener('load', loadCallback)
            xhr.removeEventListener('error', errorCallback)
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId)
            } else {
              xhr.removeEventListener('timeout', timeoutCallback)
            }
            cb({ status: xhr.status, errorMessage: errInfo }, null)
          }
          const timeoutCallback = function () {
            xhr.removeEventListener('load', loadCallback)
            xhr.removeEventListener('error', errorCallback)
            if (xhr._timeoutId >= 0) {
              clearTimeout(xhr._timeoutId)
            } else {
              xhr.removeEventListener('timeout', timeoutCallback)
            }
            cb({ status: xhr.status, errorMessage: `Request timeout: ${errInfo}` }, null)
          }
          xhr.addEventListener('load', loadCallback)
          xhr.addEventListener('error', errorCallback)
          if (xhr.ontimeout === undefined) {
            xhr._timeoutId = setTimeout(function () {
              timeoutCallback()
            }, xhr.timeout)
          } else {
            xhr.addEventListener('timeout', timeoutCallback)
          }
        }
        xhr.send(null)
        // } else {
        //   var fs = require("fs");
        //   fs.readFile(url, function (err, data) {
        //     err ? cb(err) : cb(null, data.toString());
        //   });
      }
    },
    /**
     * Load a single resource as json.
     * @param {string} url
     * @param {function} [cb] arguments are : err, json
     */
    loadJson: function (url, cb) {
      this.loadTxt(url, function (err, txt) {
        if (err) {
          cb(err)
        } else {
          try {
            const result = JSON.parse(txt)
            cb(null, result)
          } catch (e) {
            throw new Error(`parse json [${url}] failed : ${e.message}`)
          }
        }
      })
    },

    _checkIsImageURL: function (url) {
      const ext = /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(url)
      return ext != null
    },
    /**
     * Load a single image.
     * @param {!string} url
     * @param {object} [option]
     * @param {function} callback
     * @returns {Image}
     */
    loadImg: function (url, option, callback?, img?) {
      const opt = {
        isCrossOrigin: true,
      }
      if (callback !== undefined) opt.isCrossOrigin = option.isCrossOrigin === undefined ? opt.isCrossOrigin : option.isCrossOrigin
      else if (option !== undefined) callback = option

      const texture = this.getRes(url)
      if (texture) {
        callback && callback(null, texture)
        return null
      }

      const queue = _queue[url]
      if (queue) {
        queue.callbacks.push(callback)
        return queue.img
      }

      img = img || imagePool.get()
      if (opt.isCrossOrigin && location.origin !== 'file://') img.crossOrigin = 'Anonymous'
      else img.crossOrigin = null

      const loadCallback = function () {
        this.removeEventListener('load', loadCallback, false)
        this.removeEventListener('error', errorCallback, false)

        const queue = _queue[url]
        if (queue) {
          const callbacks = queue.callbacks
          for (let i = 0; i < callbacks.length; ++i) {
            const cb = callbacks[i]
            if (cb) {
              cb(null, img)
            }
          }
          queue.img = null
          delete _queue[url]
        }

        if (window.ENABLE_IMAGE_POOL && _renderType === game.RENDER_TYPE_WEBGL) {
          imagePool.put(img)
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      const errorCallback = function () {
        this.removeEventListener('load', loadCallback, false)
        this.removeEventListener('error', errorCallback, false)

        if (window.location.protocol !== 'https:' && img.crossOrigin && img.crossOrigin.toLowerCase() === 'anonymous') {
          opt.isCrossOrigin = false
          self.release(url)
          loader.loadImg(url, opt, callback, img)
        } else {
          const queue = _queue[url]
          if (queue) {
            const callbacks = queue.callbacks
            for (let i = 0; i < callbacks.length; ++i) {
              const cb = callbacks[i]
              if (cb) {
                cb('load image failed')
              }
            }
            queue.img = null
            delete _queue[url]
          }

          if (_renderType === game.RENDER_TYPE_WEBGL) {
            imagePool.put(img)
          }
        }
      }

      _queue[url] = {
        img: img,
        callbacks: callback ? [callback] : [],
      }

      img.addEventListener('load', loadCallback)
      img.addEventListener('error', errorCallback)
      img.src = url
      return img
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
      let url = null
      let type = item.type
      if (type) {
        type = `.${type.toLowerCase()}`
        url = item.src ? item.src : item.name + type
      } else {
        url = item
        type = path.extname(url)
      }

      const obj = this.getRes(url)
      if (obj) return cb(null, obj)
      let loader = null
      if (type) {
        loader = _register[type.toLowerCase()]
      }
      if (!loader) {
        error(`loader for [${type}] doesn't exist!`)
        return cb()
      }
      let realUrl = url
      if (!_urlRegExp.test(url)) {
        const basePath = loader.getBasePath ? loader.getBasePath() : this.resPath
        realUrl = this.getUrl(basePath, url)
      }

      if (game.config['noCache'] && typeof realUrl === 'string') {
        if (this._noCacheRex.test(realUrl)) realUrl += `&_t=${Date.now()}`
        else realUrl += `?_t=${Date.now()}`
      }
      loader.load(realUrl, url, item, (err, data) => {
        if (err) {
          log(err)
          this.cache[url] = null
          delete this.cache[url]
          cb({ status: 520, errorMessage: err }, null)
        } else {
          this.cache[url] = data
          cb(null, data)
        }
      })
    },
    _noCacheRex: /\?/,

    /**
     * Get url with basePath.
     * @param {string} basePath
     * @param {string} [url]
     * @returns {*}
     */
    getUrl: function (basePath, url) {
      if (basePath !== undefined && url === undefined) {
        url = basePath
        let type = path.extname(url)
        type = type ? type.toLowerCase() : ''
        const loader = _register[type]
        if (!loader) basePath = this.resPath
        else basePath = loader.getBasePath ? loader.getBasePath() : this.resPath
      }
      url = path.join(basePath || '', url)
      if (url.match(/[/(\\\\)]lang[/(\\\\)]/i)) {
        if (_langPathCache[url]) return _langPathCache[url]
        const extname = path.extname(url) || ''
        url = _langPathCache[url] = `${url.substring(0, url.length - extname.length)}_${sys.language}${extname}`
      }
      return url
    },

    /**
     * Load resources then call the callback.
     * @param {string} resources
     * @param {function} [option] callback or trigger
     * @param {function|Object} [loadCallback]
     * @return {AsyncPool}
     */
    load(resources, option, loadCallback?) {
      if (!Array.isArray(resources)) resources = [resources]

      if (typeof option === 'function') {
        option = { cb: option }
      }

      const asyncPool = new AsyncPool(
        resources,
        CONCURRENCY_HTTP_REQUEST_COUNT,
        (value, index, done, pool) => {
          this._loadResIterator(value, index, (err, result) => {
            option.trigger?.call(option.triggerTarget, result, pool.size, pool.finishedSize)
            done(err, result)
          })
        },
        option.cb ?? loadCallback,
        option.cbTarget,
      )

      asyncPool.flow()
      return asyncPool
    },

    _handleAliases: function (fileNames, cb) {
      const resList = []
      for (const key in fileNames) {
        const value = fileNames[key]
        _aliases[key] = value
        resList.push(value)
      }
      this.load(resList, cb)
    },

    loadAliases: function (url, callback) {
      const dict = this.getRes(url)
      if (!dict) {
        this.load(url, function (err, results) {
          this._handleAliases(results[0]['filenames'], callback)
        })
      } else this._handleAliases(dict['filenames'], callback)
    },

    /**
     * Register a resource loader into loader.
     * @param {string} extNames
     * @param {function} loader
     */
    register: function (extNames, loader) {
      if (!extNames || !loader) return
      if (typeof extNames === 'string') return (_register[extNames.trim().toLowerCase()] = loader)
      for (let i = 0, li = extNames.length; i < li; i++) {
        _register[`.${extNames[i].trim().toLowerCase()}`] = loader
      }
    },

    /**
     * Get resource data by url.
     * @param url
     * @returns {*}
     */
    getRes: function (url) {
      return this.cache[url] || this.cache[_aliases[url]]
    },

    /**
     * Get aliase by url.
     * @param url
     * @returns {*}
     */
    _getAliase: function (url) {
      return _aliases[url]
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release: function (url) {
      const cache = this.cache
      const queue = _queue[url]
      if (queue) {
        queue.img = null
        delete _queue[url]
      }
      delete cache[url]
      delete cache[_aliases[url]]
      delete _aliases[url]
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll: function () {
      const locCache = this.cache
      for (const key in locCache) delete locCache[key]
      for (const key in _aliases) delete _aliases[key]
    },
  }
})()
