import { game } from '..'
import { _LogInfos, assert, log } from '../helper/Debugger'
import { loader } from '../helper/loader'
import { path } from '../helper/path'
import { Texture2D } from './TexturesWebGL'

export const textureCache = /** @lends textureCache# */ {
  _textures: {},
  _textureColorsCache: {},
  _textureKeySeq: 0 | (Math.random() * 1000),

  _loadedTexturesBefore: {},

  //handleLoadedTexture move to Canvas/WebGL

  _initializingRenderer: function () {
    let selPath
    //init texture from _loadedTexturesBefore
    const locLoadedTexturesBefore = this._loadedTexturesBefore,
      locTextures = this._textures
    for (selPath in locLoadedTexturesBefore) {
      const tex2d = locLoadedTexturesBefore[selPath]
      tex2d.handleLoadedTexture()
      locTextures[selPath] = tex2d
    }
    this._loadedTexturesBefore = {}
  },

  /**
   * <p>
   *     Returns a Texture2D object given an PVR filename                                                              <br/>
   *     If the file image was not previously loaded, it will create a new CCTexture2D                                 <br/>
   *     object and it will return it. Otherwise it will return a reference of a previously loaded image              <br/>
   *     note: AddPVRTCImage does not support on HTML5
   * </p>
   * @param {String} filename
   * @return {Texture2D}
   */
  addPVRTCImage: function (filename) {
    log(_LogInfos.textureCache_addPVRTCImage)
  },

  /**
   * <p>
   *     Returns a Texture2D object given an ETC filename                                                               <br/>
   *     If the file image was not previously loaded, it will create a new CCTexture2D                                  <br/>
   *     object and it will return it. Otherwise it will return a reference of a previously loaded image                <br/>
   *    note:addETCImage does not support on HTML5
   * </p>
   * @param {String} filename
   * @return {Texture2D}
   */
  addETCImage: function (filename) {
    log(_LogInfos.textureCache_addETCImage)
  },

  /**
   * Description
   * @return {String}
   */
  description: function () {
    return `<TextureCache | Number of textures = ${this._textures.length}>`
  },

  /**
   * Returns an already created texture. Returns null if the texture doesn't exist.
   * @param {String} textureKeyName
   * @return {Texture2D|Null}
   * @deprecated
   * @example
   * //example
   * const key = textureCache.textureForKey("hello.png");
   */
  textureForKey: function (textureKeyName) {
    log(_LogInfos.textureCache_textureForKey)
    return this.getTextureForKey(textureKeyName)
  },

  /**
   * Returns an already created texture. Returns null if the texture doesn't exist.
   * @param {String} textureKeyName
   * @return {Texture2D|Null}
   * @example
   * //example
   * const key = textureCache.getTextureForKey("hello.png");
   */
  getTextureForKey: function (textureKeyName) {
    return this._textures[textureKeyName] || this._textures[loader._getAliase(textureKeyName)]
  },

  /**
   * @param {Image} texture
   * @return {String|Null}
   * @example
   * //example
   * const key = textureCache.getKeyByTexture(texture);
   */
  getKeyByTexture: function (texture) {
    for (const key in this._textures) {
      if (this._textures[key] === texture) {
        return key
      }
    }
    return null
  },

  _generalTextureKey: function (id) {
    return `_textureKey_${id}`
  },

  /**
   * @param {Image} texture
   * @return {Array}
   * @example
   * //example
   * const cacheTextureForColor = textureCache.getTextureColors(texture);
   */
  getTextureColors: function (texture) {
    const image = texture._htmlElementObj
    let key = this.getKeyByTexture(image)
    if (!key) {
      if (image instanceof HTMLImageElement) key = image.src
      else key = this._generalTextureKey(texture.__instanceId)
    }

    if (!this._textureColorsCache[key]) this._textureColorsCache[key] = texture._generateTextureCacheForColor()
    return this._textureColorsCache[key]
  },

  /**
   * <p>Returns a Texture2D object given an PVR filename<br />
   * If the file image was not previously loaded, it will create a new Texture2D<br />
   *  object and it will return it. Otherwise it will return a reference of a previously loaded image </p>
   * @param {String} path
   * @return {Texture2D}
   */
  addPVRImage: function (path) {
    log(_LogInfos.textureCache_addPVRImage)
  },

  /**
   * <p>Purges the dictionary of loaded textures. <br />
   * Call this method if you receive the "Memory Warning"  <br />
   * In the short term: it will free some resources preventing your app from being killed  <br />
   * In the medium term: it will allocate more resources <br />
   * In the long term: it will be the same</p>
   * @example
   * //example
   * textureCache.removeAllTextures();
   */
  removeAllTextures: function () {
    const locTextures = this._textures
    for (const selKey in locTextures) {
      if (locTextures[selKey]) locTextures[selKey].releaseTexture()
    }
    this._textures = {}
  },

  /**
   * Deletes a texture from the cache given a texture
   * @param {Image} texture
   * @example
   * //example
   * textureCache.removeTexture(texture);
   */
  removeTexture: function (texture) {
    if (!texture) return

    const locTextures = this._textures
    for (const selKey in locTextures) {
      if (locTextures[selKey] === texture) {
        locTextures[selKey].releaseTexture()
        delete locTextures[selKey]
      }
    }
  },

  /**
   * Deletes a texture from the cache given a its key name
   * @param {String} textureKeyName
   * @example
   * //example
   * textureCache.removeTexture("hello.png");
   */
  removeTextureForKey: function (textureKeyName) {
    if (textureKeyName == null) return
    const tex = this._textures[textureKeyName]
    if (tex) {
      tex.releaseTexture()
      delete this._textures[textureKeyName]
    }
  },

  //addImage move to Canvas/WebGL

  /**
   *  Cache the image data
   * @param {String} path
   * @param {Image|HTMLImageElement|HTMLCanvasElement} texture
   */
  cacheImage: function (path, texture) {
    if (texture instanceof Texture2D) {
      this._textures[path] = texture
      return
    }
    const texture2d = new Texture2D()
    texture2d.initWithElement(texture)
    texture2d.handleLoadedTexture()
    this._textures[path] = texture2d
  },

  /**
   * <p>Returns a Texture2D object given an UIImage image<br />
   * If the image was not previously loaded, it will create a new Texture2D object and it will return it.<br />
   * Otherwise it will return a reference of a previously loaded image<br />
   * The "key" parameter will be used as the "key" for the cache.<br />
   * If "key" is null, then a new texture will be created each time.</p>
   * @param {HTMLImageElement|HTMLCanvasElement} image
   * @param {String} key
   * @return {Texture2D}
   */
  addUIImage: function (image, key) {
    assert(image, _LogInfos.textureCache_addUIImage_2)

    if (key) {
      if (this._textures[key]) return this._textures[key]
    }

    // prevents overloading the autorelease pool
    const texture = new Texture2D()
    texture.initWithImage(image)
    if (key != null) this._textures[key] = texture
    else log(_LogInfos.textureCache_addUIImage)
    return texture
  },

  /**
   * <p>Output to log the current contents of this TextureCache <br />
   * This will attempt to calculate the size of each texture, and the total texture memory in use. </p>
   */
  dumpCachedTextureInfo: function () {
    let count = 0
    let totalBytes = 0
    const locTextures = this._textures

    for (const key in locTextures) {
      const selTexture = locTextures[key]
      count++
      if (selTexture.getHtmlElementObj() instanceof HTMLImageElement)
        log(
          _LogInfos.textureCache_dumpCachedTextureInfo,
          key,
          selTexture.getHtmlElementObj().src,
          selTexture.getPixelsWide(),
          selTexture.getPixelsHigh(),
        )
      else {
        log(_LogInfos.textureCache_dumpCachedTextureInfo_2, key, selTexture.getPixelsWide(), selTexture.getPixelsHigh())
      }
      totalBytes += selTexture.getPixelsWide() * selTexture.getPixelsHigh() * 4
    }

    const locTextureColorsCache = this._textureColorsCache
    for (const key in locTextureColorsCache) {
      const selCanvasColorsArr = locTextureColorsCache[key]
      for (const selCanvasKey in selCanvasColorsArr) {
        const selCanvas = selCanvasColorsArr[selCanvasKey]
        count++
        log(_LogInfos.textureCache_dumpCachedTextureInfo_2, key, selCanvas.width, selCanvas.height)
        totalBytes += selCanvas.width * selCanvas.height * 4
      }
    }
    log(_LogInfos.textureCache_dumpCachedTextureInfo_3, count, totalBytes / 1024, (totalBytes / (1024.0 * 1024.0)).toFixed(2))
  },

  _clear: function () {
    this._textures = {}
    this._textureColorsCache = {}
    this._textureKeySeq = 0 | (Math.random() * 1000)
    this._loadedTexturesBefore = {}
  },

  handleLoadedTexture: function (url, img) {
    let locTexs = this._textures,
      tex
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore
    }
    tex = locTexs[url]
    if (!tex) {
      tex = locTexs[url] = new Texture2D()
      tex.url = url
    }
    tex.initWithElement(img)
    const ext = path.extname(url)
    if (ext === '.png') {
      tex.handleLoadedTexture(true)
    } else {
      tex.handleLoadedTexture()
    }
    return tex
  },

  /**
   * <p>Returns a Texture2D object given an file image <br />
   * If the file image was not previously loaded, it will create a new Texture2D <br />
   *  object and it will return it. It will use the filename as a key.<br />
   * Otherwise it will return a reference of a previously loaded image. <br />
   * Supported image extensions: .png, .jpg, .gif</p>
   * @param {String} url
   * @param {Function} cb
   * @param {Object} target
   * @return {Texture2D}
   * @example
   * //example
   * textureCache.addImage("hello.png");
   */
  addImage: function (url, cb?, target?) {
    assert(url, _LogInfos.Texture2D_addImage_2)

    let locTexs = this._textures
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore
    }
    let tex = locTexs[url] || locTexs[loader._getAliase(url)]
    if (tex) {
      if (tex.isLoaded()) {
        cb && cb.call(target, tex)
        return tex
      } else {
        tex.addEventListener(
          'load',
          function () {
            cb && cb.call(target, tex)
          },
          target,
        )
        return tex
      }
    }

    tex = locTexs[url] = new Texture2D()
    tex.url = url
    const basePath = loader.resPath
    loader.loadImg(path.join(basePath || '', url), function (err, img) {
      if (err) return cb && cb.call(target, err)

      const texResult = textureCache.handleLoadedTexture(url, img)
      cb && cb.call(target, texResult)
    })

    return tex
  },

  addImageAsync: function (url, cb, target) {
    return this.addImage(url, cb, target)
  },
}
