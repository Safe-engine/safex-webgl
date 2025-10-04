import { renderer } from '../../..';
import { director, game, screen, view, visibleRect, winSize } from '../../../globals';
import { log } from '../../../helper/Debugger';
import { sys } from '../../../helper/sys';
import { eventManager } from '../../event-manager/EventManager';
import { ContainerStrategy } from './EGLView/ContainerStrategy';
import { ContentStrategy } from './EGLView/ContentStrategy';
import { ResolutionPolicy } from './EGLView/ResolutionPolicy';

declare var gl: any;

export const Touches: any[] = [];
export const TouchesIntergerDict: any = {};

export const DENSITYDPI_DEVICE = "device-dpi";
export const DENSITYDPI_HIGH = "high-dpi";
export const DENSITYDPI_MEDIUM = "medium-dpi";
export const DENSITYDPI_LOW = "low-dpi";

export const ORIENTATION_LANDSCAPE = 0;
export const ORIENTATION_PORTRAIT = 1;
export const ORIENTATION_AUTO = 2;

const __BrowserGetter = {
  html: null as HTMLElement | null,
  init: function (_view: EGLView) {
    this.html = document.documentElement;
  },
  availWidth: function (frame: HTMLElement | null) {
    if (!frame || frame === this.html)
      return window.innerWidth;
    else
      return frame.clientWidth;
  },
  availHeight: function (frame: HTMLElement | null) {
    if (!frame || frame === this.html)
      return window.innerHeight;
    else
      return frame.clientHeight;
  },
  meta: {
    "width": "device-width"
  } as any,
  adaptationType: sys.browserType
};

if (window.navigator.userAgent.indexOf("OS 8_1_") > -1) //this mistake like MIUI, so use of MIUI treatment method
  __BrowserGetter.adaptationType = sys.BROWSER_TYPE_MIUI;

if (sys.os === sys.OS_IOS) // All browsers are WebView
  __BrowserGetter.adaptationType = sys.BROWSER_TYPE_SAFARI;

switch (__BrowserGetter.adaptationType) {
  case sys.BROWSER_TYPE_SAFARI:
    __BrowserGetter.meta["minimal-ui"] = "true";
    break;
  case sys.BROWSER_TYPE_CHROME:
    Object.defineProperty(__BrowserGetter, "target-densitydpi", {
      get: function () {
        return view._targetDensityDPI;
      }
    });
    break;
  case sys.BROWSER_TYPE_MIUI:
    __BrowserGetter.init = function (view: EGLView) {
      if (view.__resizeWithBrowserSize) return;
      const resize = function () {
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

let _scissorRect: Rect | null = null;

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
  _delegate: any = null;
  // Size of parent node that contains game.container and game.canvas
  _frameSize: Size ;
  // resolution size, it is the size appropriate for the app resources.
  _designResolutionSize: Size ;
  _originalDesignResolutionSize: Size ;
  // Viewport is the container's rect related to content's coordinates in pixel
  _viewPortRect: Rect ;
  // The visible rect in content's coordinate in point
  _visibleRect: Rect ;
  _retinaEnabled = false;
  _autoFullScreen = false;
  // The device's pixel ratio (for retina displays)
  _devicePixelRatio = 1;
  // the view name
  _viewName = "";
  // Custom callback for resize event
  _resizeCallback: (() => void) | null = null;

  _orientationChanging = true;
  _resizing = false;

  _scaleX = 1;
  _originalScaleX = 1;
  _scaleY = 1;
  _originalScaleY = 1;

  _isRotated = false;
  _orientation = 3;

  _resolutionPolicy: ResolutionPolicy | null = null;
  _rpExactFit: ResolutionPolicy | null = null;
  _rpShowAll: ResolutionPolicy | null = null;
  _rpNoBorder: ResolutionPolicy | null = null;
  _rpFixedHeight: ResolutionPolicy | null = null;
  _rpFixedWidth: ResolutionPolicy | null = null;
  _initialized = false;

  _contentTranslateLeftTop: { left: number, top: number } | null = null;

  // Parent node that contains game.container and game.canvas
  _frame: HTMLElement | null = null;
  _frameZoomFactor = 1.0;
  __resizeWithBrowserSize = false;
  _isAdjustViewPort = true;
  _targetDensityDPI: string | null = null;

  /**
   * Constructor of EGLView
   */
  constructor() {
    const d = document;
    const _strategyer = ContainerStrategy;
    const _strategy = ContentStrategy;

    __BrowserGetter.init(this);

    this._frame = (game.container!.parentNode === d.body) ? d.documentElement : game.container!.parentNode as HTMLElement;
    this._frameSize = size(0, 0);
    this._initFrameSize();

    const w = game.canvas!.width;
    const h = game.canvas!.height;
    this._designResolutionSize = size(w, h);
    this._originalDesignResolutionSize = size(w, h);
    this._viewPortRect = rect(0, 0, w, h);
    this._visibleRect = rect(0, 0, w, h);
    this._contentTranslateLeftTop = { left: 0, top: 0 };
    this._viewName = "Cocos2dHTML5";

    visibleRect && visibleRect.init(this._visibleRect);

    // Setup system default resolution policies
    _t._rpExactFit = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.EXACT_FIT);
    _t._rpShowAll = new ResolutionPolicy(_strategyer.PROPORTION_TO_FRAME, _strategy.SHOW_ALL);
    _t._rpNoBorder = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.NO_BORDER);
    _t._rpFixedHeight = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_HEIGHT);
    _t._rpFixedWidth = new ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_WIDTH);

    this._targetDensityDPI = DENSITYDPI_HIGH;

    if (sys.isMobile) {
      window.addEventListener('orientationchange', this._orientationChange.bind(this));
    } else {
      this._orientationChanging = false;
    }
  }

  // Resize helper functions
  _resizeEvent() {
    let view: EGLView = this;
    if (view._orientationChanging) {
      return;
    }

    // Check frame size changed or not
    const prevFrameW = view._frameSize.width;
    const prevFrameH = view._frameSize.height;
    const prevRotated = view._isRotated;
    if (sys.isMobile) {
      const containerStyle = game.container!.style;
      const margin = containerStyle.margin;
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
    const width = view._originalDesignResolutionSize.width;
    const height = view._originalDesignResolutionSize.height;
    view._resizing = true;
    if (width > 0) {
      view.setDesignResolutionSize(width, height, view._resolutionPolicy);
    }
    view._resizing = false;

    eventManager.dispatchCustomEvent('canvas-resize');
    if (view._resizeCallback) {
      view._resizeCallback.call(view);
    }
  }

  _orientationChange() {
    view._orientationChanging = true;
    if (sys.isMobile) {
      game.container!.style.display = "none";
    }
    setTimeout(function () {
      view._orientationChanging = false;
      view._resizeEvent();
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
  setTargetDensityDPI(densityDPI: string) {
    this._targetDensityDPI = densityDPI;
    this._adjustViewportMeta();
  }

  getTargetDensityDPI(): string | null {
    return this._targetDensityDPI;
  }

  resizeWithBrowserSize(enabled: boolean) {
    if (enabled) {
      //enable
      if (!this.__resizeWithBrowserSize) {
        this.__resizeWithBrowserSize = true;
        window.addEventListener('resize', this._resizeEvent.bind(this));
      }
    } else {
      //disable
      if (this.__resizeWithBrowserSize) {
        this.__resizeWithBrowserSize = false;
        window.removeEventListener('resize', this._resizeEvent.bind(this));
      }
    }
  }

  setResizeCallback(callback: (() => void) | null) {
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
  setOrientation(orientation: number) {
    orientation = orientation & ORIENTATION_AUTO;
    if (orientation && this._orientation !== orientation) {
      this._orientation = orientation;
      if (this._resolutionPolicy) {
        const designWidth = this._originalDesignResolutionSize.width;
        const designHeight = this._originalDesignResolutionSize.height;
        this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
      }
    }
  }

  setDocumentPixelWidth(width: number) {
    // Set viewport's width
    this._setViewportMeta({ "width": width }, true);

    // Set body width to the exact pixel resolution
    document.documentElement.style.width = width + 'px';
    document.body.style.width = "100%";

    // Reset the resolution size and policy
    this.setDesignResolutionSize(this._designResolutionSize.width, this._designResolutionSize.height, this._resolutionPolicy);
  }

  _initFrameSize() {
    const locFrameSize = this._frameSize;
    const w = __BrowserGetter.availWidth(this._frame);
    const h = __BrowserGetter.availHeight(this._frame);
    const isLandscape = w >= h;

    if (!sys.isMobile ||
      (isLandscape && this._orientation & ORIENTATION_LANDSCAPE) ||
      (!isLandscape && this._orientation & ORIENTATION_PORTRAIT)) {
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
    const designWidth = this._originalDesignResolutionSize.width;
    const designHeight = this._originalDesignResolutionSize.height;
    if (designWidth > 0)
      this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
  }

  _setViewportMeta(metas: any, overwrite: boolean) {
    let vp = document.getElementById("cocosMetaElement");
    if (vp && overwrite) {
      document.head.removeChild(vp);
    }

    const elems = document.getElementsByName("viewport");
    const currentVP = elems ? elems[0] as HTMLMetaElement : null;
    let content: string;
    let key: string;
    let pattern: RegExp;

    content = currentVP ? currentVP.content : "";
    vp = vp || document.createElement("meta");
    vp.id = "cocosMetaElement";
    (vp as HTMLMetaElement).name = "viewport";
    (vp as HTMLMetaElement).content = "";

    for (key in metas) {
      if (content.indexOf(key) === -1) {
        content += "," + key + "=" + metas[key];
      }
      else if (overwrite) {
        pattern = new RegExp(key + "\\s*=\\s*[^,]+");
        content = content.replace(pattern, key + "=" + metas[key]);
      }
    }
    if (/^,/.test(content))
      content = content.substr(1);

    (vp as HTMLMetaElement).content = content;
    // For adopting certain android devices which don't support second viewport
    if (currentVP)
      currentVP.content = content;

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
    const scaleFactor = 1; //cc.contentScaleFactor();
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

  adjustViewPort(enabled: boolean) {
    this._isAdjustViewPort = enabled;
  }

  enableRetina(enabled: boolean) {
    this._retinaEnabled = !!enabled;
  }

  isRetinaEnabled(): boolean {
    return this._retinaEnabled;
  }

  /**
   * If enabled, the application will try automatically to enter full screen mode on mobile devices<br/>
   * You can pass true as parameter to enable it and disable it by passing false.<br/>
   * Only useful on web
   * @param {Boolean} enabled  Enable or disable auto full screen on mobile devices
   */
  enableAutoFullScreen(enabled: boolean) {
    if (enabled && enabled !== this._autoFullScreen && sys.isMobile && this._frame === document.documentElement) {
      // Automatically full screen when user touches on mobile version
      this._autoFullScreen = true;
      screen.autoFullScreen(this._frame);
    }
    else {
      this._autoFullScreen = false;
    }
  }

  isAutoFullScreenEnabled(): boolean {
    return this._autoFullScreen;
  }

  isOpenGLReady(): boolean {
    return (game.canvas && game._renderContext);
  }

  setFrameZoomFactor(zoomFactor: number) {
    this._frameZoomFactor = zoomFactor;
    this.centerWindow();
    director.setProjection(director.getProjection());
  }

  /**
   * Exchanges the front and back buffers, subclass must implement this method.
   */
  swapBuffers() {
  }

  setIMEKeyboardState(_isOpen: boolean) {
    // parameter intentionally unused in web implementation
  }

  centerWindow() {
    // no-op in browser build; kept for compatibility
  }

  setContentTranslateLeftTop(offsetLeft: number, offsetTop: number) {
    this._contentTranslateLeftTop = { left: offsetLeft, top: offsetTop };
  }

  getContentTranslateLeftTop(): { left: number, top: number } | null {
    return this._contentTranslateLeftTop;
  }

  /**
   * Returns the canvas size of the view.<br/>
   * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
   * On web, it returns the size of the canvas element.
   * @return {cc.Size}
   */
  getCanvasSize(): Size {
    return size(game.canvas!.width, game.canvas!.height);
  }

  getFrameSize(): Size {
    return size(this._frameSize.width, this._frameSize.height);
  }

  setFrameSize(width: number, height: number) {
    this._frameSize.width = width;
    this._frameSize.height = height;
    this._frame!.style.width = width + "px";
    this._frame!.style.height = height + "px";
    this._resizeEvent();
    director.setProjection(director.getProjection());
  }

  /**
   * Returns the visible area size of the view port.
   * @return {cc.Size}
   */
  getVisibleSize(): Size {
    return size(this._visibleRect.width, this._visibleRect.height);
  }

  getVisibleSizeInPixel(): Size {
    return size(this._visibleRect.width * this._scaleX,
      this._visibleRect.height * this._scaleY);
  }

  getVisibleOrigin(): Vec2 {
    return new Vec2(this._visibleRect.x, this._visibleRect.y);
  }

  getVisibleOriginInPixel(): Vec2 {
    return new Vec2(this._visibleRect.x * this._scaleX,
      this._visibleRect.y * this._scaleY);
  }

  /**
   * Returns whether developer can set content's scale factor.
   * @return {Boolean}
   */
  canSetContentScaleFactor(): boolean {
    return true;
  }

  getResolutionPolicy(): ResolutionPolicy | null {
    return this._resolutionPolicy;
  }

  setResolutionPolicy(resolutionPolicy: ResolutionPolicy | number) {
    if (resolutionPolicy instanceof ResolutionPolicy) {
      this._resolutionPolicy = resolutionPolicy;
    }
    // Ensure compatibility with JSB
    else {
      const _locPolicy = ResolutionPolicy;
      if (resolutionPolicy === _locPolicy.EXACT_FIT)
        this._resolutionPolicy = this._rpExactFit;
      if (resolutionPolicy === _locPolicy.SHOW_ALL)
        this._resolutionPolicy = this._rpShowAll;
      if (resolutionPolicy === _locPolicy.NO_BORDER)
        this._resolutionPolicy = this._rpNoBorder;
      if (resolutionPolicy === _locPolicy.FIXED_HEIGHT)
        this._resolutionPolicy = this._rpFixedHeight;
      if (resolutionPolicy === _locPolicy.FIXED_WIDTH)
        this._resolutionPolicy = this._rpFixedWidth;
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
   * [ResolutionPolicy]        [Web only feature] Custom resolution policy, constructed by ResolutionPolicy<br/>
   * @param {Number} width Design resolution width.
   * @param {Number} height Design resolution height.
   * @param {ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
   */
  setDesignResolutionSize(width: number, height: number, resolutionPolicy: ResolutionPolicy | number) {
    // Defensive code
    if (!(width > 0 || height > 0)) {
      log('EGLView_setDesignResolutionSize');
      return;
    }

    this.setResolutionPolicy(resolutionPolicy);
    const policy = this._resolutionPolicy;
    if (policy) {
      policy.preApply(this);
    }

    // Reinit frame size
    if (sys.isMobile)
      this._adjustViewportMeta();

    // If resizing, then frame size is already initialized, this logic should be improved
    if (!this._resizing)
      this._initFrameSize();

    if (!policy) {
      log('EGLView_setDesignResolutionSize_2');
      return;
    }

    this._originalDesignResolutionSize.width = this._designResolutionSize.width = width;
    this._originalDesignResolutionSize.height = this._designResolutionSize.height = height;

    const result = policy.apply(this, this._designResolutionSize);

    if (result.scale && result.scale.length === 2) {
      this._scaleX = result.scale[0];
      this._scaleY = result.scale[1];
    }

    if (result.viewport) {
      const vp = this._viewPortRect;
      const vb = this._visibleRect;
      const rv = result.viewport;

      vp.x = rv.x;
      vp.y = rv.y;
      vp.width = rv.width;
      vp.height = rv.height;

      vb.x = -vp.x / this._scaleX;
      vb.y = -vp.y / this._scaleY;
      vb.width = cc._canvas!.width / this._scaleX;
      vb.height = cc._canvas!.height / this._scaleY;
      (cc._renderContext as any).setOffset && (cc._renderContext as any).setOffset(vp.x, -vp.y);
    }

    // reset director's member variables to fit visible rect
    director._winSizeInPoints.width = this._designResolutionSize.width;
    director._winSizeInPoints.height = this._designResolutionSize.height;
    policy.postApply(this);
    winSize.width = director._winSizeInPoints.width;
    winSize.height = director._winSizeInPoints.height;

    if (cc._renderType === game.RENDER_TYPE_WEBGL) {
      // reset director's member variables to fit visible rect
      director.setGLDefaultValues();
    }
    else if (cc._renderType === game.RENDER_TYPE_CANVAS) {
      renderer._allNeedDraw = true;
    }

    this._originalScaleX = this._scaleX;
    this._originalScaleY = this._scaleY;
    visibleRect && visibleRect.init(this._visibleRect);
  }

  /**
   * Returns the designed size for the view.
   * Default resolution size is the same as 'getFrameSize'.
   * @return {cc.Size}
   */
  getDesignResolutionSize(): Size {
    return size(this._designResolutionSize.width, this._designResolutionSize.height);
  }

  setRealPixelResolution(width: number, height: number, resolutionPolicy: ResolutionPolicy | number) {
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
  setViewPortInPoints(x: number, y: number, w: number, h: number) {
    const locFrameZoomFactor = this._frameZoomFactor;
    const locScaleX = this._scaleX;
    const locScaleY = this._scaleY;
    (cc._renderContext as any).viewport((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
      (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
      (w * locScaleX * locFrameZoomFactor),
      (h * locScaleY * locFrameZoomFactor));
  }

  setScissorInPoints(x: number, y: number, w: number, h: number) {
    const locFrameZoomFactor = this._frameZoomFactor;
    const locScaleX = this._scaleX;
    const locScaleY = this._scaleY;
    const sx = Math.ceil(x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor);
    const sy = Math.ceil(y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor);
    const sw = Math.ceil(w * locScaleX * locFrameZoomFactor);
    const sh = Math.ceil(h * locScaleY * locFrameZoomFactor);

    if (!_scissorRect) {
      const boxArr = gl.getParameter(gl.SCISSOR_BOX);
      _scissorRect = rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
    }

    if (_scissorRect.x != sx || _scissorRect.y != sy || _scissorRect.width != sw || _scissorRect.height != sh) {
      _scissorRect.x = sx;
      _scissorRect.y = sy;
      _scissorRect.width = sw;
      _scissorRect.height = sh;
      (cc._renderContext as any).scissor(sx, sy, sw, sh);
    }
  }

  /**
   * Returns whether GL_SCISSOR_TEST is enable
   * @return {Boolean}
   */
  isScissorEnabled(): boolean {
    return (cc._renderContext as any).isEnabled(gl.SCISSOR_TEST);
  }

  getScissorRect(): Rect {
    if (!_scissorRect) {
      const boxArr = gl.getParameter(gl.SCISSOR_BOX);
      _scissorRect = rect(boxArr[0], boxArr[1], boxArr[2], boxArr[3]);
    }
    const scaleXFactor = 1 / this._scaleX;
    const scaleYFactor = 1 / this._scaleY;
    return rect(
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
  setViewName(viewName: string) {
    if (viewName != null && viewName.length > 0) {
      this._viewName = viewName;
    }
  }

  getViewName(): string {
    return this._viewName;
  }

  getViewPortRect(): Rect {
    return this._viewPortRect;
  }

  getScaleX(): number {
    return this._scaleX;
  }

  getScaleY(): number {
    return this._scaleY;
  }

  getDevicePixelRatio(): number {
    return this._devicePixelRatio;
  }

  /**
   * Returns the real location in view for a translation based on a related position
   * @param {Number} tx The X axis translation
   * @param {Number} ty The Y axis translation
   * @param {Object} relatedPos The related position object including "left", "top", "width", "height" informations
   * @return {cc.Point}
   */
  convertToLocationInView(tx: number, ty: number, relatedPos: { left: number, top: number, width: number, height: number }): Vec2 {
    const x = this._devicePixelRatio * (tx - relatedPos.left);
    const y = this._devicePixelRatio * (relatedPos.top + relatedPos.height - ty);
    return this._isRotated ? new Vec2(this._viewPortRect.width - y, x) : new Vec2(x, y);
  }

  _convertMouseToLocationInView(point: Vec2, relatedPos: { left: number, top: number, height: number }) {
    const viewport = this._viewPortRect;
    point.x = ((this._devicePixelRatio * (point.x - relatedPos.left)) - viewport.x) / this._scaleX;
    point.y = (this._devicePixelRatio * (relatedPos.top + relatedPos.height - point.y) - viewport.y) / this._scaleY;
  }

  _convertPointWithScale(point: Vec2) {
    const viewport = this._viewPortRect;
    point.x = (point.x - viewport.x) / this._scaleX;
    point.y = (point.y - viewport.y) / this._scaleY;
  }

  _convertTouchesWithScale(touches: any[]) {
    const viewport = this._viewPortRect;
    const scaleX = this._scaleX;
    const scaleY = this._scaleY;
    let selTouch, selPoint, selPrePoint;
    for (let i = 0; i < touches.length; i++) {
      selTouch = touches[i];
      selPoint = selTouch._point;
      selPrePoint = selTouch._prevPoint;

      selPoint.x = (selPoint.x - viewport.x) / scaleX;
      selPoint.y = (selPoint.y - viewport.y) / scaleY;
      selPrePoint.x = (selPrePoint.x - viewport.x) / scaleX;
      selPrePoint.y = (selPrePoint.y - viewport.y) / scaleY;
    }
  }
  private static _instance: EGLView | null = null;
  static getInstance(): EGLView {
    if (!this._instance) {
      this._instance = new EGLView();
      this._instance.initialize();
    }
    return this._instance;
  }
}
