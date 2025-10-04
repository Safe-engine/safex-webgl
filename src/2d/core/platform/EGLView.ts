/**
 * @ignore
 */
declare var cc: any;
declare var gl: any;
cc.Touches = [];
cc.TouchesIntergerDict = {};

cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";

var __BrowserGetter = {
  init: function (_view) {
    this.html = document.documentElement;
  },
  availWidth: function (frame) {
    if (!frame || frame === this.html)
      return window.innerWidth;
    else
      return frame.clientWidth;
  },
  availHeight: function (frame) {
    if (!frame || frame === this.html)
      return window.innerHeight;
    else
      return frame.clientHeight;
  },
  meta: {
    "width": "device-width"
  },
  adaptationType: cc.sys.browserType
};

if (window.navigator.userAgent.indexOf("OS 8_1_") > -1) //this mistake like MIUI, so use of MIUI treatment method
  __BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_MIUI;

if (cc.sys.os === cc.sys.OS_IOS) // All browsers are WebView
  __BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_SAFARI;

switch (__BrowserGetter.adaptationType) {
  case cc.sys.BROWSER_TYPE_SAFARI:
    __BrowserGetter.meta["minimal-ui"] = "true";
    break;
  case cc.sys.BROWSER_TYPE_CHROME:
    Object.defineProperty(__BrowserGetter, "target-densitydpi", {
      get: function () {
        return cc.view._targetDensityDPI;
      }
    });
    break;
  case cc.sys.BROWSER_TYPE_MIUI:
    __BrowserGetter.init = function (view) {
      if (view.__resizeWithBrowserSize) return;
      var resize = function () {
        view.setDesignResolutionSize(
          view._designResolutionSize.width,
          view._designResolutionSize.height,
          view._resolutionPolicy
        );
        window.removeEventListener("resize", resize, false);
      };
      window.addEventListener("resize", resize, false);
    };
    break;
}

var _scissorRect = null;

/**
 * cc.view is the singleton object which represents the game window.<br/>
 * It's main task include: <br/>
 *  - Apply the design resolution policy<br/>
 *  - Provide interaction with the window, like resize event on web, retina display support, etc...<br/>
 *  - Manage the game view port which can be different with the window<br/>
 *  - Manage the content scale and translation<br/>
 * <br/>
 * Since the cc.view is a singleton, you don't need to call any constructor or create functions,<br/>
 * the standard way to use it is by calling:<br/>
 *  - cc.view.methodName(); <br/>
 * @class
 * @name cc.view
 * @extend cc.Class
 */
export class EGLView {
  // fields
  _delegate = null;
  // Size of parent node that contains cc.container and cc._canvas
  _frameSize = null;
  // resolution size, it is the size appropriate for the app resources.
  _designResolutionSize = null;
  _originalDesignResolutionSize = null;
  // Viewport is the container's rect related to content's coordinates in pixel
  _viewPortRect = null;
  // The visible rect in content's coordinate in point
  _visibleRect = null;
  _retinaEnabled = false;
  _autoFullScreen = false;
  // The device's pixel ratio (for retina displays)
  _devicePixelRatio = 1;
  // the view name
  _viewName = "";
  // Custom callback for resize event
  _resizeCallback = null;

  _orientationChanging = true;
  _resizing = false;

  _scaleX = 1;
  _originalScaleX = 1;
  _scaleY = 1;
  _originalScaleY = 1;

  _isRotated = false;
  _orientation = 3;

  _resolutionPolicy = null;
  _rpExactFit = null;
  _rpShowAll = null;
  _rpNoBorder = null;
  _rpFixedHeight = null;
  _rpFixedWidth = null;
  _initialized = false;

  _contentTranslateLeftTop = null;

  // Parent node that contains cc.container and cc._canvas
  _frame = null;
  _frameZoomFactor = 1.0;
  __resizeWithBrowserSize = false;
  _isAdjustViewPort = true;
  _targetDensityDPI = null;

  /**
   * Constructor of cc.EGLView
   */
  constructor() {
    var _t = this, d = document, _strategyer = cc.ContainerStrategy, _strategy = cc.ContentStrategy;

    __BrowserGetter.init(this);

    _t._frame = (cc.container.parentNode === d.body) ? d.documentElement : cc.container.parentNode;
    _t._frameSize = cc.size(0, 0);
    _t._initFrameSize();

    var w = cc._canvas.width, h = cc._canvas.height;
    _t._designResolutionSize = cc.size(w, h);
    _t._originalDesignResolutionSize = cc.size(w, h);
    _t._viewPortRect = cc.rect(0, 0, w, h);
    _t._visibleRect = cc.rect(0, 0, w, h);
    _t._contentTranslateLeftTop = { left: 0, top: 0 };
    _t._viewName = "Cocos2dHTML5";

    var sys = cc.sys;
    cc.visibleRect && cc.visibleRect.init(_t._visibleRect);

    // Setup system default resolution policies
    _t._rpExactFit = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.EXACT_FIT);
    _t._rpShowAll = new cc.ResolutionPolicy(_strategyer.PROPORTION_TO_FRAME, _strategy.SHOW_ALL);
    _t._rpNoBorder = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.NO_BORDER);
    _t._rpFixedHeight = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_HEIGHT);
    _t._rpFixedWidth = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_WIDTH);

    _t._targetDensityDPI = cc.DENSITYDPI_HIGH;

    if (sys.isMobile) {
      window.addEventListener('orientationchange', this._orientationChange);
    } else {
      this._orientationChanging = false;
    }
  }

  // Resize helper functions
  _resizeEvent() {
    var view;
    if (this.setDesignResolutionSize) {
      view = this;
    } else {
      view = cc.view;
    }
    if (view._orientationChanging) {
      return;
    }

    // Check frame size changed or not
    var prevFrameW = view._frameSize.width, prevFrameH = view._frameSize.height, prevRotated = view._isRotated;
    if (cc.sys.isMobile) {
      var containerStyle = cc.game.container.style,
        margin = containerStyle.margin;
      containerStyle.margin = '0';
      containerStyle.display = 'none';
      view._initFrameSize();
      containerStyle.margin = margin;
      containerStyle.display = 'block';
    }
    else {
      view._initFrameSize();
    }
    if (view._isRotated === prevRotated && view._frameSize.width === prevFrameW && view._frameSize.height === prevFrameH)
      return;

    // Frame size changed, do resize works
    var width = view._originalDesignResolutionSize.width;
    var height = view._originalDesignResolutionSize.height;
    view._resizing = true;
    if (width > 0) {
      view.setDesignResolutionSize(width, height, view._resolutionPolicy);
    }
    view._resizing = false;

    cc.eventManager.dispatchCustomEvent('canvas-resize');
    if (view._resizeCallback) {
      view._resizeCallback.call();
    }
  }

  _orientationChange() {
    cc.view._orientationChanging = true;
    if (cc.sys.isMobile) {
      cc.game.container.style.display = "none";
    }
    setTimeout(function () {
      cc.view._orientationChanging = false;
      cc.view._resizeEvent();
    }, 300);
  }

  /**
   * <p>
   * Sets view's target-densitydpi for android mobile browser. it can be set to:           <br/>
   *   1. cc.DENSITYDPI_DEVICE, value is "device-dpi"                                      <br/>
   *   2. cc.DENSITYDPI_HIGH, value is "high-dpi"  (default value)                         <br/>
   *   3. cc.DENSITYDPI_MEDIUM, value is "medium-dpi" (browser's default value)            <br/>
   *   4. cc.DENSITYDPI_LOW, value is "low-dpi"                                            <br/>
   *   5. Custom value, e.g: "480"                                                         <br/>
   * </p>
   * @param {String} densityDPI
   */
  setTargetDensityDPI(densityDPI) {
    this._targetDensityDPI = densityDPI;
    this._adjustViewportMeta();
  }

  /**
   * Returns the current target-densitydpi value of cc.view.
   * @returns {String}
   */
  getTargetDensityDPI() {
    return this._targetDensityDPI;
  }

  /**
   * Sets whether resize canvas automatically when browser's size changed.<br/>
   * Useful only on web.
   * @param {Boolean} enabled Whether enable automatic resize with browser's resize event
   */
  resizeWithBrowserSize(enabled) {
    if (enabled) {
      //enable
      if (!this.__resizeWithBrowserSize) {
        this.__resizeWithBrowserSize = true;
        window.addEventListener('resize', this._resizeEvent);
      }
    } else {
      //disable
      if (this.__resizeWithBrowserSize) {
        this.__resizeWithBrowserSize = false;
        window.removeEventListener('resize', this._resizeEvent);
      }
    }
  }

  /**
   * Sets the callback function for cc.view's resize action,<br/>
   * this callback will be invoked before applying resolution policy, <br/>
   * so you can do any additional modifications within the callback.<br/>
   * Useful only on web.
   * @param {Function|null} callback The callback function
   */
  setResizeCallback(callback) {
    if (typeof callback === 'function' || callback == null) {
      this._resizeCallback = callback;
    }
  }

  /**
   * Sets the orientation of the game, it can be landscape, portrait or auto.
   * When set it to landscape or portrait, and screen w/h ratio doesn't fit,
   * cc.view will automatically rotate the game canvas using CSS.
   * Note that this function doesn't have any effect in native,
   * in native, you need to set the application orientation in native project settings
   * @param {Number} orientation - Possible values: cc.ORIENTATION_LANDSCAPE | cc.ORIENTATION_PORTRAIT | cc.ORIENTATION_AUTO
   */
  setOrientation(orientation) {
    orientation = orientation & cc.ORIENTATION_AUTO;
    if (orientation && this._orientation !== orientation) {
      this._orientation = orientation;
      if (this._resolutionPolicy) {
        var designWidth = this._originalDesignResolutionSize.width;
        var designHeight = this._originalDesignResolutionSize.height;
        this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
      }
    }
  }

  setDocumentPixelWidth(width) {
    // Set viewport's width
    this._setViewportMeta({ "width": width }, true);

    // Set body width to the exact pixel resolution
    document.documentElement.style.width = width + 'px';
    document.body.style.width = "100%";

    // Reset the resolution size and policy
    this.setDesignResolutionSize(this._designResolutionSize.width, this._designResolutionSize.height, this._resolutionPolicy);
  }

  _initFrameSize() {
    var locFrameSize = this._frameSize;
    var w = __BrowserGetter.availWidth(this._frame);
    var h = __BrowserGetter.availHeight(this._frame);
    var isLandscape = w >= h;

    if (!cc.sys.isMobile ||
      (isLandscape && this._orientation & cc.ORIENTATION_LANDSCAPE) ||
      (!isLandscape && this._orientation & cc.ORIENTATION_PORTRAIT)) {
      locFrameSize.width = w;
      locFrameSize.height = h;
      cc.container.style['-webkit-transform'] = 'rotate(0deg)';
      cc.container.style.transform = 'rotate(0deg)';
      this._isRotated = false;
    }
    else {
      locFrameSize.width = h;
      locFrameSize.height = w;
      cc.container.style['-webkit-transform'] = 'rotate(90deg)';
      cc.container.style.transform = 'rotate(90deg)';
      cc.container.style['-webkit-transform-origin'] = '0px 0px 0px';
      cc.container.style.transformOrigin = '0px 0px 0px';
      this._isRotated = true;
    }
  }

  // hack
  _adjustSizeKeepCanvasSize() {
    var designWidth = this._originalDesignResolutionSize.width;
    var designHeight = this._originalDesignResolutionSize.height;
    if (designWidth > 0)
      this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
  }

  _setViewportMeta(metas, overwrite) {
    var vp = document.getElementById("cocosMetaElement");
    if (vp && overwrite) {
      document.head.removeChild(vp);
    }

  var elems = document.getElementsByName("viewport"),
      currentVP = elems ? elems[0] as HTMLMetaElement : null,
      content, key, pattern;

    content = currentVP ? (currentVP as HTMLMetaElement).content : "";
    vp = vp || document.createElement("meta") as HTMLMetaElement;
    (vp as HTMLMetaElement).id = "cocosMetaElement";
    (vp as HTMLMetaElement).name = "viewport";
    (vp as HTMLMetaElement).content = "";

    for (key in metas) {
      if (content.indexOf(key) == -1) {
        content += "," + key + "=" + metas[key];
      }
      else if (overwrite) {
        pattern = new RegExp(key + "\s*=\s*[^,]+");
        content.replace(pattern, key + "=" + metas[key]);
      }
    }
    if (/^,/.test(content))
      content = content.substr(1);

    (vp as HTMLMetaElement).content = content;
    // For adopting certain android devices which don't support second viewport
    if (currentVP)
      (currentVP as HTMLMetaElement).content = content;

    document.head.appendChild(vp);
  }

  _adjustViewportMeta() {
    if (this._isAdjustViewPort) {
      this._setViewportMeta(__BrowserGetter.meta, false);
      // Only adjust viewport once
      this._isAdjustViewPort = false;
    }
  }

  // RenderTexture hacker
  _setScaleXYForRenderTexture() {
    //hack for RenderTexture on canvas mode when adapting multiple resolution resources
    var scaleFactor = cc.contentScaleFactor();
    this._scaleX = scaleFactor;
    this._scaleY = scaleFactor;
  }

  // Other helper functions
  _resetScale() {
    this._scaleX = this._originalScaleX;
    this._scaleY = this._originalScaleY;
  }

  // Useless, just make sure the compatibility temporarily, should be removed
  _adjustSizeToBrowser() {
  }

  initialize() {
    this._initialized = true;
  }

  /**
   * Sets whether the engine modify the "viewport" meta in your web page.<br/>
   * It's enabled by default, we strongly suggest you not to disable it.<br/>
   * And even when it's enabled, you can still set your own "viewport" meta, it won't be overridden<br/>
   * Only useful on web
   * @param {Boolean} enabled Enable automatic modification to "viewport" meta
   */
  adjustViewPort(enabled) {
    this._isAdjustViewPort = enabled;
  }

  /**
   * Retina support is enabled by default for Apple device but disabled for other devices,<br/>
   * it takes effect only when you called setDesignResolutionPolicy<br/>
   * Only useful on web
   * @param {Boolean} enabled  Enable or disable retina display
   */
  enableRetina(enabled) {
    this._retinaEnabled = !!enabled;
  }

  /**
   * Check whether retina display is enabled.<br/>
   * Only useful on web
   * @return {Boolean}
   */
  isRetinaEnabled() {
    return this._retinaEnabled;
  }

  /**
   * If enabled, the application will try automatically to enter full screen mode on mobile devices<br/>
   * You can pass true as parameter to enable it and disable it by passing false.<br/>
   * Only useful on web
   * @param {Boolean} enabled  Enable or disable auto full screen on mobile devices
   */
  enableAutoFullScreen(enabled) {
    if (enabled && enabled !== this._autoFullScreen && cc.sys.isMobile && this._frame === document.documentElement) {
      // Automatically full screen when user touches on mobile version
      this._autoFullScreen = true;
      cc.screen.autoFullScreen(this._frame);
    }
    else {
      this._autoFullScreen = false;
    }
  }

  /**
   * Check whether auto full screen is enabled.<br/>
   * Only useful on web
   * @return {Boolean} Auto full screen enabled or not
   */
  isAutoFullScreenEnabled() {
    return this._autoFullScreen;
  }

  /**
   * Get whether render system is ready(no matter opengl or canvas),<br/>
   * this name is for the compatibility with cocos2d-x, subclass must implement this method.
   * @return {Boolean}
   */
  isOpenGLReady() {
    return (cc.game.canvas && cc._renderContext);
  }

  /*
   * Set zoom factor for frame. This method is for debugging big resolution (e.g.new ipad) app on desktop.
   * @param {Number} zoomFactor
   */
  setFrameZoomFactor(zoomFactor) {
    this._frameZoomFactor = zoomFactor;
    this.centerWindow();
    cc.director.setProjection(cc.director.getProjection());
  }

  /**
   * Exchanges the front and back buffers, subclass must implement this method.
   */
  swapBuffers() {
  }

  /**
   * Open or close IME keyboard , subclass must implement this method.
   * @param {Boolean} isOpen
   */
  setIMEKeyboardState(_isOpen) {
    // parameter intentionally unused in web implementation
  }

  // minimal helper to match original API surface
  centerWindow() {
    // no-op in browser build; kept for compatibility
  }

  /**
   * Sets the resolution translate on EGLView
   * @param {Number} offsetLeft
   * @param {Number} offsetTop
   */
  setContentTranslateLeftTop(offsetLeft, offsetTop) {
    this._contentTranslateLeftTop = { left: offsetLeft, top: offsetTop };
  }

  /**
   * Returns the resolution translate on EGLView
   * @return {cc.Size|Object}
   */
  getContentTranslateLeftTop() {
    return this._contentTranslateLeftTop;
  }

  /**
   * Returns the canvas size of the view.<br/>
   * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
   * On web, it returns the size of the canvas element.
   * @return {cc.Size}
   */
  getCanvasSize() {
    return cc.size(cc._canvas.width, cc._canvas.height);
  }

  /**
   * Returns the frame size of the view.<br/>
   * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
   * On web, it returns the size of the canvas's outer DOM element.
   * @return {cc.Size}
   */
  getFrameSize() {
    return cc.size(this._frameSize.width, this._frameSize.height);
  }

  /**
   * On native, it sets the frame size of view.<br/>
   * On web, it sets the size of the canvas's outer DOM element.
   * @param {Number} width
   * @param {Number} height
   */
  setFrameSize(width, height) {
    this._frameSize.width = width;
    this._frameSize.height = height;
    this._frame.style.width = width + "px";
    this._frame.style.height = height + "px";
    this._resizeEvent();
    cc.director.setProjection(cc.director.getProjection());
  }

  /**
   * Returns the visible area size of the view port.
   * @return {cc.Size}
   */
  getVisibleSize() {
    return cc.size(this._visibleRect.width, this._visibleRect.height);
  }

  /**
   * Returns the visible area size of the view port.
   * @return {cc.Size}
   */
  getVisibleSizeInPixel() {
    return cc.size(this._visibleRect.width * this._scaleX,
      this._visibleRect.height * this._scaleY);
  }

  /**
   * Returns the visible origin of the view port.
   * @return {cc.Point}
   */
  getVisibleOrigin() {
    return cc.p(this._visibleRect.x, this._visibleRect.y);
  }

  /**
   * Returns the visible origin of the view port.
   * @return {cc.Point}
   */
  getVisibleOriginInPixel() {
    return cc.p(this._visibleRect.x * this._scaleX,
      this._visibleRect.y * this._scaleY);
  }

  /**
   * Returns whether developer can set content's scale factor.
   * @return {Boolean}
   */
  canSetContentScaleFactor() {
    return true;
  }

  /**
   * Returns the current resolution policy
   * @see cc.ResolutionPolicy
   * @return {cc.ResolutionPolicy}
   */
  getResolutionPolicy() {
    return this._resolutionPolicy;
  }

  /**
   * Sets the current resolution policy
   * @see cc.ResolutionPolicy
   * @param {cc.ResolutionPolicy|Number} resolutionPolicy
   */
  setResolutionPolicy(resolutionPolicy) {
    var _t = this;
    if (resolutionPolicy instanceof cc.ResolutionPolicy) {
      _t._resolutionPolicy = resolutionPolicy;
    }
    // Ensure compatibility with JSB
    else {
      var _locPolicy = cc.ResolutionPolicy;
      if (resolutionPolicy === _locPolicy.EXACT_FIT)
        _t._resolutionPolicy = _t._rpExactFit;
      if (resolutionPolicy === _locPolicy.SHOW_ALL)
        _t._resolutionPolicy = _t._rpShowAll;
      if (resolutionPolicy === _locPolicy.NO_BORDER)
        _t._resolutionPolicy = _t._rpNoBorder;
      if (resolutionPolicy === _locPolicy.FIXED_HEIGHT)
        _t._resolutionPolicy = _t._rpFixedHeight;
      if (resolutionPolicy === _locPolicy.FIXED_WIDTH)
        _t._resolutionPolicy = _t._rpFixedWidth;
    }
  }

  /**
   * Sets the resolution policy with designed view size in points.<br/>
   * The resolution policy include: <br/>
   * [1] ResolutionExactFit       Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.<br/>
   * [2] ResolutionNoBorder       Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.<br/>
   * [3] ResolutionShowAll        Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.<br/>
   * [4] ResolutionFixedHeight    Scale the content's height to screen's height and proportionally scale its width<br/>
   * [5] ResolutionFixedWidth     Scale the content's width to screen's width and proportionally scale its height<br/>
   * [cc.ResolutionPolicy]        [Web only feature] Custom resolution policy, constructed by cc.ResolutionPolicy<br/>
   * @param {Number} width Design resolution width.
   * @param {Number} height Design resolution height.
   * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
   */
  setDesignResolutionSize(width, height, resolutionPolicy) {
    // Defensive code
    if (!(width > 0 || height > 0)) {
      cc.log(cc._LogInfos.EGLView_setDesignResolutionSize);
      return;
    }

    this.setResolutionPolicy(resolutionPolicy);
    var policy = this._resolutionPolicy;
    if (policy) {
      policy.preApply(this);
    }

    // Reinit frame size
    if (cc.sys.isMobile)
      this._adjustViewportMeta();

    // If resizing, then frame size is already initialized, this logic should be improved
    if (!this._resizing)
      this._initFrameSize();

    if (!policy) {
      cc.log(cc._LogInfos.EGLView_setDesignResolutionSize_2);
      return;
    }

    this._originalDesignResolutionSize.width = this._designResolutionSize.width = width;
    this._originalDesignResolutionSize.height = this._designResolutionSize.height = height;

    var result = policy.apply(this, this._designResolutionSize);

    if (result.scale && result.scale.length === 2) {
      this._scaleX = result.scale[0];
      this._scaleY = result.scale[1];
    }

    if (result.viewport) {
      var vp = this._viewPortRect,
        vb = this._visibleRect,
        rv = result.viewport;

      vp.x = rv.x;
      vp.y = rv.y;
      vp.width = rv.width;
      vp.height = rv.height;

      vb.x = -vp.x / this._scaleX;
      vb.y = -vp.y / this._scaleY;
      vb.width = cc._canvas.width / this._scaleX;
      vb.height = cc._canvas.height / this._scaleY;
      cc._renderContext.setOffset && cc._renderContext.setOffset(vp.x, -vp.y);
    }

    // reset director's member variables to fit visible rect
    var director = cc.director;
    director._winSizeInPoints.width = this._designResolutionSize.width;
    director._winSizeInPoints.height = this._designResolutionSize.height;
    policy.postApply(this);
    cc.winSize.width = director._winSizeInPoints.width;
    cc.winSize.height = director._winSizeInPoints.height;

    if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
      // reset director's member variables to fit visible rect
      director.setGLDefaultValues();
    }
    else if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
      cc.renderer._allNeedDraw = true;
    }

    this._originalScaleX = this._scaleX;
    this._originalScaleY = this._scaleY;
    cc.visibleRect && cc.visibleRect.init(this._visibleRect);
  }

  /**
   * Returns the designed size for the view.
   * Default resolution size is the same as 'getFrameSize'.
   * @return {cc.Size}
   */
  getDesignResolutionSize() {
    return cc.size(this._designResolutionSize.width, this._designResolutionSize.height);
  }

  /**
   * Sets the document body to desired pixel resolution and fit the game content to it.
   * This function is very useful for adaptation in mobile browsers.
   * In some HD android devices, the resolution is very high, but its browser performance may not be very good.
   * In this case, enabling retina display is very costy and not suggested, and if retina is disabled, the image may be blurry.
   * But this API can be helpful to set a desired pixel resolution which is in between.
   * This API will do the following:
   *     1. Set viewport's width to the desired width in pixel
   *     2. Set body width to the exact pixel resolution
   *     3. The resolution policy will be reset with designed view size in points.
   * @param {Number} width Design resolution width.
   * @param {Number} height Design resolution height.
   * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
   */
  setRealPixelResolution(width, height, resolutionPolicy) {
    // Set viewport's width
    this._setViewportMeta({ "width": width }, true);

    // Set body width to the exact pixel resolution
    document.documentElement.style.width = width + "px";
    document.body.style.width = width + "px";
    document.body.style.left = "0px";
    document.body.style.top = "0px";

    // Reset the resolution size and policy
    this.setDesignResolutionSize(width, height, resolutionPolicy);
  }

  /**
   * Sets view port rectangle with points.
   * @param {Number} x
   * @param {Number} y
   * @param {Number} w width
   * @param {Number} h height
   */
  setViewPortInPoints(x, y, w, h) {
    var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
    cc._renderContext.viewport((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
      (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
      (w * locScaleX * locFrameZoomFactor),
      (h * locScaleY * locFrameZoomFactor));
  }

  /**
   * Sets Scissor rectangle with points.
   * @param {Number} x
   * @param {Number} y
   * @param {Number} w
   * @param {Number} h
   */
  setScissorInPoints(x, y, w, h) {
    var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
    var sx = Math.ceil(x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor);
    var sy = Math.ceil(y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor);
    var sw = Math.ceil(w * locScaleX * locFrameZoomFactor);
    var sh = Math.ceil(h * locScaleY * locFrameZoomFactor);

    if (!_scissorRect) {
      var boxArr = gl.getParameter(gl.SCISSOR_BOX);
      _scissorRect = cc.rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
    }

    if (_scissorRect.x != sx || _scissorRect.y != sy || _scissorRect.width != sw || _scissorRect.height != sh) {
      _scissorRect.x = sx;
      _scissorRect.y = sy;
      _scissorRect.width = sw;
      _scissorRect.height = sh;
      cc._renderContext.scissor(sx, sy, sw, sh);
    }
  }

  /**
   * Returns whether GL_SCISSOR_TEST is enable
   * @return {Boolean}
   */
  isScissorEnabled() {
    return cc._renderContext.isEnabled(gl.SCISSOR_TEST);
  }

  /**
   * Returns the current scissor rectangle
   * @return {cc.Rect}
   */
  getScissorRect() {
    if (!_scissorRect) {
      var boxArr = gl.getParameter(gl.SCISSOR_BOX);
      _scissorRect = cc.rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
    }
    var scaleXFactor = 1 / this._scaleX;
    var scaleYFactor = 1 / this._scaleY;
    return cc.rect(
      (_scissorRect.x - this._viewPortRect.x) * scaleXFactor,
      (_scissorRect.y - this._viewPortRect.y) * scaleYFactor,
      _scissorRect.width * scaleXFactor,
      _scissorRect.height * scaleYFactor
    );
  }

  /**
   * Sets the name of the view
   * @param {String} viewName
   */
  setViewName(viewName) {
    if (viewName != null && viewName.length > 0) {
      this._viewName = viewName;
    }
  }

  /**
   * Returns the name of the view
   * @return {String}
   */
  getViewName() {
    return this._viewName;
  }

  /**
   * Returns the view port rectangle.
   * @return {cc.Rect}
   */
  getViewPortRect() {
    return this._viewPortRect;
  }

  /**
   * Returns scale factor of the horizontal direction (X axis).
   * @return {Number}
   */
  getScaleX() {
    return this._scaleX;
  }

  /**
   * Returns scale factor of the vertical direction (Y axis).
   * @return {Number}
   */
  getScaleY() {
    return this._scaleY;
  }

  /**
   * Returns device pixel ratio for retina display.
   * @return {Number}
   */
  getDevicePixelRatio() {
    return this._devicePixelRatio;
  }

  /**
   * Returns the real location in view for a translation based on a related position
   * @param {Number} tx The X axis translation
   * @param {Number} ty The Y axis translation
   * @param {Object} relatedPos The related position object including "left", "top", "width", "height" informations
   * @return {cc.Point}
   */
  convertToLocationInView(tx, ty, relatedPos) {
    var x = this._devicePixelRatio * (tx - relatedPos.left);
    var y = this._devicePixelRatio * (relatedPos.top + relatedPos.height - ty);
    return this._isRotated ? { x: this._viewPortRect.width - y, y: x } : { x: x, y: y };
  }

  _convertMouseToLocationInView(point, relatedPos) {
    var viewport = this._viewPortRect, _t = this;
    point.x = ((_t._devicePixelRatio * (point.x - relatedPos.left)) - viewport.x) / _t._scaleX;
    point.y = (_t._devicePixelRatio * (relatedPos.top + relatedPos.height - point.y) - viewport.y) / _t._scaleY;
  }

  _convertPointWithScale(point) {
    var viewport = this._viewPortRect;
    point.x = (point.x - viewport.x) / this._scaleX;
    point.y = (point.y - viewport.y) / this._scaleY;
  }

  _convertTouchesWithScale(touches) {
    var viewport = this._viewPortRect, scaleX = this._scaleX, scaleY = this._scaleY,
      selTouch, selPoint, selPrePoint;
    for (var i = 0; i < touches.length; i++) {
      selTouch = touches[i];
      selPoint = selTouch._point;
      selPrePoint = selTouch._prevPoint;

      selPoint.x = (selPoint.x - viewport.x) / scaleX;
      selPoint.y = (selPoint.y - viewport.y) / scaleY;
      selPrePoint.x = (selPrePoint.x - viewport.x) / scaleX;
      selPrePoint.y = (selPrePoint.y - viewport.y) / scaleY;
    }
  }
  static _getInstance() {
    if (!this._instance) {
      this._instance = this._instance || new cc.EGLView();
      this._instance.initialize();
    }
    return this._instance;
  }
  static _instance = null;
}
