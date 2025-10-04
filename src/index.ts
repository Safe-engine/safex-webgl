import { Director } from "./2d/core/Director";
import { DrawingPrimitiveWebGL } from "./2d/core/DrawingPrimitivesWebGL";
import { isUndefined } from "./helper/checkType";
import { log } from "./helper/Debugger";
import { global } from "./helper/global";
import type { loader } from "./helper/loader";


export let director: Director;
export let renderer: any;
let rendererWebGL: any;
let rendererCanvas: any;
let _drawingUtil: any;
let _canvas: HTMLCanvasElement | null = null;
let _renderContext: any = null;
let _renderType = 0;
let _supportRender = true;
let webglContext: WebGLRenderingContext | null = null;
let glExt: any = {};
export let view: any;
export let winSize: any;
let container: HTMLElement | null = null;
let _gameDiv: HTMLElement | null = null;
let _engineLoaded = false;
/**
 * An object to boot the game.
 * @class
 * @name game
 *
 */
export const game = {
  /**
   * Debug mode: No debugging. {@static}
   * @const {Number}
   * @static
   */
  DEBUG_MODE_NONE: 0,
  /**
   * Debug mode: Info, warning, error to console.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_INFO: 1,
  /**
   * Debug mode: Warning, error to console.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_WARN: 2,
  /**
   * Debug mode: Error to console.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_ERROR: 3,
  /**
   * Debug mode: Info, warning, error to web page.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
  /**
   * Debug mode: Warning, error to web page.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
  /**
   * Debug mode: Error to web page.
   * @const {Number}
   * @static
   */
  DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,

  /**
   * Event that is fired when the game is hidden.
   * @constant {String}
   */
  EVENT_HIDE: "game_on_hide",
  /**
   * Event that is fired when the game is shown.
   * @constant {String}
   */
  EVENT_SHOW: "game_on_show",
  /**
   * Event that is fired when the game is resized.
   * @constant {String}
   */
  EVENT_RESIZE: "game_on_resize",
  /**
   * Event that is fired when the renderer is done being initialized.
   * @constant {String}
   */
  EVENT_RENDERER_INITED: "renderer_inited",

  /** @constant {Number} */
  RENDER_TYPE_CANVAS: 0,
  /** @constant {Number} */
  RENDER_TYPE_WEBGL: 1,
  /** @constant {Number} */
  RENDER_TYPE_OPENGL: 2,

  _eventHide: null,
  _eventShow: null,

  /**
   * Keys found in project.json.
   *
   * @constant
   * @type {Object}
   *
   * @prop {String} engineDir         - In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir".
   * @prop {String} modules           - Defines which modules you will need in your game, it's useful only on web
   * @prop {String} debugMode         - Debug mode, see DEBUG_MODE_XXX constant definitions.
   * @prop {String} exposeClassName   - Expose class name to chrome debug tools
   * @prop {String} showFPS           - Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.
   * @prop {String} frameRate         - Sets the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.
   * @prop {String} id                - Sets the id of your canvas element on the web page, it's useful only on web.
   * @prop {String} renderMode        - Sets the renderer type, only useful on web, 0: Automatic, 1: Canvas, 2: WebGL
   * @prop {String} jsList            - Sets the list of js files in your game.
   */
  CONFIG_KEY: {
    width: "width",
    height: "height",
    engineDir: "engineDir",
    modules: "modules",
    debugMode: "debugMode",
    exposeClassName: "exposeClassName",
    showFPS: "showFPS",
    frameRate: "frameRate",
    id: "id",
    renderMode: "renderMode",
    jsList: "jsList"
  },

  // states
  _paused: true,//whether the game is paused
  _configLoaded: false,//whether config loaded
  _prepareCalled: false,//whether the prepare function has been called
  _prepared: false,//whether the engine has prepared
  _rendererInitialized: false,

  _renderContext: null,

  _intervalId: null,//interval target of main

  _lastTime: null,
  _frameTime: null,

  /**
   * The outer frame of the game canvas, parent of container
   * @type {Object}
   */
  frame: null,
  /**
   * The container of game canvas, equals to container
   * @type {Object}
   */
  container: null,
  /**
   * The canvas of the game, equals to _canvas
   * @type {Object}
   */
  canvas: null,

  /**
   * Config of game
   * @type {Object}
   */
  config: null,

  /**
   * Callback when the scripts of engine have been load.
   * @type {Function|null}
   */
  onStart: null,

  /**
   * Callback when game exits.
   * @type {Function|null}
   */
  onStop: null,

  //@Public Methods

  //  @Game play control
  /**
   * Set frameRate of game.
   * @param frameRate
   */
  setFrameRate: function (frameRate) {
    var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
    config[CONFIG_KEY.frameRate] = frameRate;
    if (self._intervalId)
      window.cancelAnimationFrame(self._intervalId);
    self._intervalId = 0;
    self._paused = true;
    self._setAnimFrame();
    self._runMainLoop();
  },

  /**
   * Run the game frame by frame.
   */
  step: function () {
    director.mainLoop();
  },

  /**
   * Pause the game.
   */
  pause: function () {
    if (this._paused) return;
    this._paused = true;
    // Pause audio engine
    // if (audioEngine) {
    //   audioEngine._pausePlaying();
    // }
    // Pause main loop
    if (this._intervalId)
      window.cancelAnimationFrame(this._intervalId);
    this._intervalId = 0;
  },

  /**
   * Resume the game from pause.
   */
  resume: function () {
    if (!this._paused) return;
    this._paused = false;
    // Resume audio engine
    // if (audioEngine) {
    //   audioEngine._resumePlaying();
    // }
    // Resume main loop
    this._runMainLoop();
  },

  /**
   * Check whether the game is paused.
   */
  isPaused: function () {
    return this._paused;
  },

  /**
   * Restart game.
   */
  restart: function () {
    director.popToSceneStackLevel(0);
    // Clean up audio
    // audioEngine && audioEngine.end();

    game.onStart();
  },

  /**
   * End game, it will close the game window
   */
  end: function () {
    close();
  },

  //  @Game loading
  /**
   * Prepare game.
   * @param cb
   */
  prepare: function (cb) {
    var self = this,
      config = self.config,
      CONFIG_KEY = self.CONFIG_KEY;

    // Config loaded
    if (!this._configLoaded) {
      this._loadConfig(function () {
        self.prepare(cb);
      });
      return;
    }

    // Already prepared
    if (this._prepared) {
      if (cb) cb();
      return;
    }
    // Prepare called, but not done yet
    if (this._prepareCalled) {
      return;
    }
    // Prepare never called and engine ready
    if (_engineLoaded) {
      this._prepareCalled = true;

      this._initRenderer(config[CONFIG_KEY.width], config[CONFIG_KEY.height]);

      /**
       * view is the shared view object.
       * @type {EGLView}
       * @name view
       * @memberof cc
       */
      view = EGLView._getInstance();

      /**
       * @type {Director}
       * @name director
       * @memberof cc
       */
      director = Director._getInstance();
      if (director.setOpenGLView)
        director.setOpenGLView(view);
      /**
       * winSize is the alias object for the size of the current game window.
       * @type {Size}
       * @name winSize
       * @memberof cc
       */
      winSize = director.getWinSize();

      this._initEvents();

      this._setAnimFrame();
      this._runMainLoop();

      // Load game scripts
      var jsList = config[CONFIG_KEY.jsList];
      if (jsList) {
        loader.loadJsWithImg(jsList, function (err) {
          if (err) throw new Error(err);
          self._prepared = true;
          if (cb) cb();
        });
      }
      else {
        if (cb) cb();
      }

      return;
    }

    // Engine not loaded yet
    initEngine(this.config, function () {
      self.prepare(cb);
    });
  },

  /**
   * Run game with configuration object and onStart function.
   * @param {Object|Function} [config] Pass configuration object or onStart function
   * @param {onStart} [onStart] onStart function to be executed after game initialized
   */
  run: function (config, onStart) {
    if (typeof config === 'function') {
      game.onStart = config;
    }
    else {
      if (config) {
        if (typeof config === 'string') {
          if (!game.config) this._loadConfig();
          game.config[game.CONFIG_KEY.id] = config;
        } else {
          game.config = config;
        }
      }
      if (typeof onStart === 'function') {
        game.onStart = onStart;
      }
    }

    this.prepare(game.onStart && game.onStart.bind(game));
  },

  //@Private Methods

  //  @Time ticker section
  _setAnimFrame: function () {
    this._lastTime = new Date();
    var frameRate = game.config[game.CONFIG_KEY.frameRate];
    this._frameTime = 1000 / frameRate;
    if (frameRate !== 60 && frameRate !== 30) {
      window.requestAnimFrame = this._stTime;
      window.cancelAnimationFrame = this._ctTime;
    }
    else {
      window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        this._stTime;
      window.cancelAnimationFrame = window.cancelAnimationFrame ||
        window.cancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        this._ctTime;
    }
  },
  _stTime: function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, game._frameTime - (currTime - game._lastTime));
    var id = window.setTimeout(function () { callback(); },
      timeToCall);
    game._lastTime = currTime + timeToCall;
    return id;
  },
  _ctTime: function (id) {
    window.clearTimeout(id);
  },
  //Run game.
  _runMainLoop: function () {
    var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
      director = director,
      skip = true, frameRate = config[CONFIG_KEY.frameRate];

    director.setDisplayStats(config[CONFIG_KEY.showFPS]);

    callback = function () {
      if (!self._paused) {
        if (frameRate === 30) {
          if (skip = !skip) {
            self._intervalId = window.requestAnimFrame(callback);
            return;
          }
        }

        director.mainLoop();
        self._intervalId = window.requestAnimFrame(callback);
      }
    };

    self._intervalId = window.requestAnimFrame(callback);
    self._paused = false;
  },

  //  @Game loading section
  _loadConfig: function (cb) {
    // Load config
    var config = this.config || document["ccConfig"];
    // Already loaded or Load from document.ccConfig
    if (config) {
      this._initConfig(config);
      cb && cb();
    }
    // Load from project.json
    else {
      var cocos_script = document.getElementsByTagName('script');
      for (var i = 0; i < cocos_script.length; i++) {
        var _t = cocos_script[i].getAttribute('cocos');
        if (_t === '' || _t) {
          break;
        }
      }
      var self = this;
      var loaded = function (err, txt) {
        var data = JSON.parse(txt);
        self._initConfig(data);
        cb && cb();
      };
      var _src, txt, _resPath;
      if (i < cocos_script.length) {
        _src = cocos_script[i].src;
        if (_src) {
          _resPath = /(.*)\//.exec(_src)[0];
          loader.resPath = _resPath;
          _src = path.join(_resPath, 'project.json');
        }
        loader.loadTxt(_src, loaded);
      }
      if (!txt) {
        loader.loadTxt("project.json", loaded);
      }
    }
  },

  _initConfig: function (config) {
    var CONFIG_KEY = this.CONFIG_KEY,
      modules = config[CONFIG_KEY.modules];

    // Configs adjustment
    config[CONFIG_KEY.showFPS] = typeof config[CONFIG_KEY.showFPS] === 'undefined' ? true : config[CONFIG_KEY.showFPS];
    config[CONFIG_KEY.engineDir] = config[CONFIG_KEY.engineDir] || "frameworks/cocos2d-html5";
    if (config[CONFIG_KEY.debugMode] == null)
      config[CONFIG_KEY.debugMode] = 0;
    config[CONFIG_KEY.exposeClassName] = !!config[CONFIG_KEY.exposeClassName];
    config[CONFIG_KEY.frameRate] = config[CONFIG_KEY.frameRate] || 60;
    if (config[CONFIG_KEY.renderMode] == null)
      config[CONFIG_KEY.renderMode] = 0;
    if (config[CONFIG_KEY.registerSystemEvent] == null)
      config[CONFIG_KEY.registerSystemEvent] = true;

    // Modules adjustment
    if (modules && modules.indexOf("core") < 0) modules.splice(0, 0, "core");
    modules && (config[CONFIG_KEY.modules] = modules);
    this.config = config;
    this._configLoaded = true;
  },

  _initRenderer: function (width, height) {
    // Avoid setup to be called twice.
    if (this._rendererInitialized) return;

    if (!_supportRender) {
      throw new Error("The renderer doesn't support the renderMode " + this.config[this.CONFIG_KEY.renderMode]);
    }

    var el = this.config[game.CONFIG_KEY.id],
      win = window,
      element = $(el) || $('#' + el),
      localCanvas, localContainer, localConStyle;

    if (element.tagName === "CANVAS") {
      width = width || element.width;
      height = height || element.height;

      //it is already a canvas, we wrap it around with a div
      this.canvas = _canvas = localCanvas = element;
      this.container = container = localContainer = document.createElement("DIV");
      if (localCanvas.parentNode)
        localCanvas.parentNode.insertBefore(localContainer, localCanvas);
    } else {
      //we must make a new canvas and place into this element
      if (element.tagName !== "DIV") {
        log("Warning: target element is not a DIV or CANVAS");
      }
      width = width || element.clientWidth;
      height = height || element.clientHeight;
      this.canvas = _canvas = localCanvas = $(document.createElement("CANVAS"));
      this.container = container = localContainer = document.createElement("DIV");
      element.appendChild(localContainer);
    }
    localContainer.setAttribute('id', 'Cocos2dGameContainer');
    localContainer.appendChild(localCanvas);
    this.frame = (localContainer.parentNode === document.body) ? document.documentElement : localContainer.parentNode;

    localCanvas.addClass("gameCanvas");
    localCanvas.setAttribute("width", width || 480);
    localCanvas.setAttribute("height", height || 320);
    localCanvas.setAttribute("tabindex", 99);

    if (_renderType === game.RENDER_TYPE_WEBGL) {
      this._renderContext = _renderContext = webglContext
        = create3DContext(localCanvas, {
          'stencil': true,
          'alpha': false
        });
    }
    // WebGL context created successfully
    if (this._renderContext) {
      renderer = rendererWebGL;
      win.gl = this._renderContext; // global variable declared in CCMacro.js
      renderer.init();
      _drawingUtil = new DrawingPrimitiveWebGL(this._renderContext);
      textureCache._initializingRenderer();
      glExt = {};
      glExt.instanced_arrays = win.gl.getExtension("ANGLE_instanced_arrays");
      glExt.element_uint = win.gl.getExtension("OES_element_index_uint");
    } else {
      _renderType = game.RENDER_TYPE_CANVAS;
      renderer = rendererCanvas;
      this._renderContext = _renderContext = new CanvasContextWrapper(localCanvas.getContext("2d"));
      _drawingUtil = DrawingPrimitiveCanvas ? new DrawingPrimitiveCanvas(this._renderContext) : null;
    }

    _gameDiv = localContainer;
    game.canvas.oncontextmenu = function () {
      if (!global._isContextMenuEnable) return false;
    };

    this.dispatchEvent(this.EVENT_RENDERER_INITED, true);

    this._rendererInitialized = true;
  },

  _initEvents: function () {
    var win = window, hidden;

    this._eventHide = this._eventHide || new EventCustom(this.EVENT_HIDE);
    this._eventHide.setUserData(this);
    this._eventShow = this._eventShow || new EventCustom(this.EVENT_SHOW);
    this._eventShow.setUserData(this);

    // register system events
    if (this.config[this.CONFIG_KEY.registerSystemEvent])
      inputManager.registerSystemEvent(this.canvas);

    if (!isUndefined(document.hidden)) {
      hidden = "hidden";
    } else if (!isUndefined(document.mozHidden)) {
      hidden = "mozHidden";
    } else if (!isUndefined(document.msHidden)) {
      hidden = "msHidden";
    } else if (!isUndefined(document.webkitHidden)) {
      hidden = "webkitHidden";
    }

    var changeList = [
      "visibilitychange",
      "mozvisibilitychange",
      "msvisibilitychange",
      "webkitvisibilitychange",
      "qbrowserVisibilityChange"
    ];
    var onHidden = function () {
      if (eventManager && game._eventHide)
        eventManager.dispatchEvent(game._eventHide);
    };
    var onShow = function () {
      if (eventManager && game._eventShow)
        eventManager.dispatchEvent(game._eventShow);
    };

    if (hidden) {
      for (var i = 0; i < changeList.length; i++) {
        document.addEventListener(changeList[i], function (event) {
          var visible = document[hidden];
          // QQ App
          visible = visible || event["hidden"];
          if (visible) onHidden();
          else onShow();
        }, false);
      }
    } else {
      win.addEventListener("blur", onHidden, false);
      win.addEventListener("focus", onShow, false);
    }

    if (navigator.userAgent.indexOf("MicroMessenger") > -1) {
      win.onfocus = function () { onShow() };
    }

    if ("onpageshow" in window && "onpagehide" in window) {
      win.addEventListener("pagehide", onHidden, false);
      win.addEventListener("pageshow", onShow, false);
    }

    eventManager.addCustomListener(game.EVENT_HIDE, function () {
      game.pause();
    });
    eventManager.addCustomListener(game.EVENT_SHOW, function () {
      game.resume();
    });
  }
};