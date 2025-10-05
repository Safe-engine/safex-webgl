
_tmp.WebGLTextureCache = function () {
  var _p = textureCache;

  _p.handleLoadedTexture = function (url, img) {
    var locTexs = this._textures, tex, ext;
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore;
    }
    tex = locTexs[url];
    if (!tex) {
      tex = locTexs[url] = new Texture2D();
      tex.url = url;
    }
    tex.initWithElement(img);
    ext = path.extname(url);
    if (ext === ".png") {
      tex.handleLoadedTexture(true);
    }
    else {
      tex.handleLoadedTexture();
    }
    return tex;
  };

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
  _p.addImage = function (url, cb, target) {
    assert(url, _LogInfos.Texture2D_addImage_2);

    var locTexs = this._textures;
    //remove judge(webgl)
    if (!game._rendererInitialized) {
      locTexs = this._loadedTexturesBefore;
    }
    var tex = locTexs[url] || locTexs[loader._getAliase(url)];
    if (tex) {
      if (tex.isLoaded()) {
        cb && cb.call(target, tex);
        return tex;
      }
      else {
        tex.addEventListener("load", function () {
          cb && cb.call(target, tex);
        }, target);
        return tex;
      }
    }

    tex = locTexs[url] = new Texture2D();
    tex.url = url;
    var basePath = loader.getBasePath ? loader.getBasePath() : loader.resPath;
    loader.loadImg(path.join(basePath || "", url), function (err, img) {
      if (err)
        return cb && cb.call(target, err);

      var texResult = textureCache.handleLoadedTexture(url, img);
      cb && cb.call(target, texResult);
    });

    return tex;
  };

  _p.addImageAsync = _p.addImage;
  _p = null;
};
