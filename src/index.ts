import { Size } from './2d/core/cocoa/Geometry'
import { Director } from './2d/core/Director'
import { DrawingPrimitiveWebGL } from './2d/core/DrawingPrimitivesWebGL'
import { EventCustom } from './2d/core/event-manager/EventCustom'
import { EventHelper } from './2d/core/event-manager/EventHelper'
import { eventManager } from './2d/core/event-manager/EventManager'
import { EGLView } from './2d/core/platform/EGLView'
import { inputManager } from './2d/core/platform/InputManager'
import './2d/core/platform/Loaders'
import { $ } from './2d/core/platform/miniFramework'
import { rendererWebGL } from './2d/core/renderer/RendererWebGL'
import { textureCache } from './2d/textures/TextureCache'
import { PrototypeTexture2D } from './2d/textures/TexturesPropertyDefine'
import { isUndefined } from './helper/checkType'
import { log } from './helper/Debugger'
import { _engineLoaded, _renderType, _supportRender, create3DContext, initEngine } from './helper/engine'
import { _tmp, global } from './helper/global'
import { loader } from './helper/loader'
import { path } from './helper/path'

export let director: Director
export let renderer: typeof rendererWebGL
export let _drawingUtil: any
export let _renderContext: WebGLRenderingContext = null
let glExt: any = {}
export let view: EGLView
export let winSize: Size
export let container: HTMLElement | null = null

PrototypeTexture2D()
export class Game extends EventHelper {
  DEBUG_MODE_NONE = 0
  DEBUG_MODE_INFO = 1
  DEBUG_MODE_WARN = 2
  DEBUG_MODE_ERROR = 3
  DEBUG_MODE_INFO_FOR_WEB_PAGE = 4
  DEBUG_MODE_WARN_FOR_WEB_PAGE = 5
  DEBUG_MODE_ERROR_FOR_WEB_PAGE = 6

  EVENT_HIDE = 'game_on_hide'
  EVENT_SHOW = 'game_on_show'
  EVENT_RESIZE = 'game_on_resize'
  static readonly EVENT_RENDERER_INITD = 'renderer_inited'

  RENDER_TYPE_CANVAS = 0
  RENDER_TYPE_WEBGL = 1
  RENDER_TYPE_OPENGL = 2

  _eventHide: EventCustom | null = null
  _eventShow: EventCustom | null = null

  static readonly CONFIG_KEY = {
    width: 'width',
    height: 'height',
    engineDir: 'engineDir',
    modules: 'modules',
    debugMode: 'debugMode',
    exposeClassName: 'exposeClassName',
    showFPS: 'showFPS',
    frameRate: 'frameRate',
    id: 'id',
    renderMode: 'renderMode',
    // jsList: 'jsList',
    registerSystemEvent: 'registerSystemEvent',
  }

  _paused = true
  _configLoaded = false
  _prepareCalled = false
  _prepared = false
  _rendererInitialized = false

  _renderContext: WebGLRenderingContext = null

  _intervalId: number | null = null

  _lastTime: Date | null = null
  _frameTime: number | null = null

  frame: HTMLElement | null = null
  container: HTMLElement | null = null
  canvas: HTMLCanvasElement | null = null

  config: any = null

  onStart: (() => void) | null = null
  onStop: (() => void) | null = null

  setFrameRate(frameRate: number) {
    this.config[Game.CONFIG_KEY.frameRate] = frameRate
    if (this._intervalId) {
      window.cancelAnimationFrame(this._intervalId)
    }
    this._intervalId = 0
    this._paused = true
    this._setAnimFrame()
    this._runMainLoop()
  }

  step() {
    director.mainLoop()
  }

  pause() {
    if (this._paused) return
    this._paused = true
    if (this._intervalId) {
      window.cancelAnimationFrame(this._intervalId)
    }
    this._intervalId = 0
  }

  resume() {
    if (!this._paused) return
    this._paused = false
    this._runMainLoop()
  }

  isPaused() {
    return this._paused
  }

  restart() {
    director.popToSceneStackLevel(0)
    if (this.onStart) {
      this.onStart()
    }
  }

  end() {
    close()
  }

  prepare(cb?: () => void) {
    // console.log("game prepare", this._configLoaded, this._prepared, this._prepareCalled, _engineLoaded)
    if (!this._configLoaded) {
      this._loadConfig(() => {
        this.prepare(cb)
      })
      return
    }

    if (this._prepared) {
      if (cb) cb()
      return
    }

    if (this._prepareCalled) {
      return
    }

    if (_engineLoaded) {
      this._prepareCalled = true

      this._initRenderer(this.config[Game.CONFIG_KEY.width], this.config[Game.CONFIG_KEY.height])

      view = EGLView.getInstance()
      director = Director._getInstance()
      if (director.setOpenGLView) {
        director.setOpenGLView(view)
      }
      winSize = director.getWinSize()

      this._initEvents()

      this._setAnimFrame()
      this._runMainLoop()

      // const jsList = this.config[Game.CONFIG_KEY.jsList]
      // if (jsList) {
      //   loader.loadJsWithImg(jsList, (err: any) => {
      //     if (err) throw new Error(err)
      //     this._prepared = true
      //     if (cb) cb()
      //   })
      // } else {
      // }
      if (cb) cb()

      return
    }

    initEngine(this.config, () => {
      this.prepare(cb)
    })
  }

  run(config?: any, onStart?: () => void) {
    // console.log("game run", config, onStart)
    if (typeof config === 'function') {
      this.onStart = config
    } else {
      if (config) {
        if (typeof config === 'string') {
          if (!this.config) this._loadConfig()
          this.config[Game.CONFIG_KEY.id] = config
        } else {
          this.config = config
        }
      }
      if (typeof onStart === 'function') {
        this.onStart = onStart
      }
    }

    this.prepare(this.onStart && this.onStart.bind(this))
  }

  _setAnimFrame() {
    this._lastTime = new Date()
    const frameRate = this.config[Game.CONFIG_KEY.frameRate]
    this._frameTime = 1000 / frameRate
    if (frameRate !== 60 && frameRate !== 30) {
      window.requestAnimFrame = this._stTime.bind(this)
      window.cancelAnimationFrame = this._ctTime.bind(this)
    } else {
      window.requestAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        this._stTime.bind(this)
      window.cancelAnimationFrame =
        window.cancelAnimationFrame ||
        window.cancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        this._ctTime.bind(this)
    }
  }

  _stTime(callback: FrameRequestCallback): number {
    const currTime = new Date().getTime()
    const timeToCall = Math.max(0, (this._frameTime || 0) - (currTime - (this._lastTime?.getTime() || 0)))
    const id = window.setTimeout(() => {
      callback(Date.now())
    }, timeToCall)
    this._lastTime = new Date(currTime + timeToCall)
    return id
  }

  _ctTime(id: number) {
    window.clearTimeout(id)
  }

  _runMainLoop() {
    const config = this.config
    const CONFIG_KEY = Game.CONFIG_KEY
    let skip = true
    const frameRate = config[CONFIG_KEY.frameRate]

    director.setDisplayStats(config[CONFIG_KEY.showFPS])

    const callback = () => {
      if (!this._paused) {
        if (frameRate === 30) {
          if ((skip = !skip)) {
            this._intervalId = window.requestAnimFrame(callback)
            return
          }
        }

        director.mainLoop()
        this._intervalId = window.requestAnimFrame(callback)
      }
    }

    this._intervalId = window.requestAnimFrame(callback)
    this._paused = false
  }

  _loadConfig(cb?: () => void) {
    const config = this.config || document.ccConfig
    if (config) {
      this._initConfig(config)
      cb && cb()
    } else {
      const cocos_script = document.getElementsByTagName('script')
      let i = 0
      for (; i < cocos_script.length; i++) {
        const _t = cocos_script[i].getAttribute('cocos')
        if (_t === '' || _t) {
          break
        }
      }

      const loaded = (err: any, txt: string) => {
        const data = JSON.parse(txt)
        this._initConfig(data)
        cb && cb()
      }

      if (i < cocos_script.length) {
        let _src = cocos_script[i].src
        if (_src) {
          const _resPath = /(.*)\//.exec(_src)![0]
          loader.resPath = _resPath
          _src = path.join(_resPath, 'project.json')
        }
        loader.loadTxt(_src, loaded)
      } else {
        loader.loadTxt('project.json', loaded)
      }
    }
  }

  _initConfig(config: any) {
    const CONFIG_KEY = Game.CONFIG_KEY
    const modules = config[CONFIG_KEY.modules]

    config[CONFIG_KEY.showFPS] = typeof config[CONFIG_KEY.showFPS] === 'undefined' ? true : config[CONFIG_KEY.showFPS]
    config[CONFIG_KEY.engineDir] = config[CONFIG_KEY.engineDir] || 'frameworks/cocos2d-html5'
    if (config[CONFIG_KEY.debugMode] == null) {
      config[CONFIG_KEY.debugMode] = 0
    }
    config[CONFIG_KEY.exposeClassName] = !!config[CONFIG_KEY.exposeClassName]
    config[CONFIG_KEY.frameRate] = config[CONFIG_KEY.frameRate] || 60
    if (config[CONFIG_KEY.renderMode] == null) {
      config[CONFIG_KEY.renderMode] = 0
    }
    if (config[CONFIG_KEY.registerSystemEvent] == null) {
      config[CONFIG_KEY.registerSystemEvent] = true
    }

    if (modules && modules.indexOf('core') < 0) {
      modules.splice(0, 0, 'core')
    }
    if (modules) {
      config[CONFIG_KEY.modules] = modules
    }
    this.config = config
    this._configLoaded = true
  }

  _initRenderer(width: number, height: number) {
    if (this._rendererInitialized) return

    if (!_supportRender) {
      throw new Error(`The renderer doesnt support the renderMode ${this.config[Game.CONFIG_KEY.renderMode]}`)
    }

    const el = this.config[Game.CONFIG_KEY.id]
    const element = $(el) || $(`#${el}`)
    let localCanvas: HTMLCanvasElement
    let localContainer: HTMLElement

    if (element.tagName === 'CANVAS') {
      width = width || element.width
      height = height || element.height

      this.canvas = localCanvas = element
      this.container = container = localContainer = document.createElement('DIV')
      if (localCanvas.parentNode) {
        localCanvas.parentNode.insertBefore(localContainer, localCanvas)
      }
    } else {
      if (element.tagName !== 'DIV') {
        log('Warning: target element is not a DIV or CANVAS')
      }
      width = width || element.clientWidth
      height = height || element.clientHeight
      this.canvas = localCanvas = $(document.createElement('CANVAS'))
      this.container = container = localContainer = document.createElement('DIV')
      element.appendChild(localContainer)
    }
    localContainer.setAttribute('id', 'Cocos2dGameContainer')
    localContainer.appendChild(localCanvas)
    this.frame = localContainer.parentNode === document.body ? document.documentElement : (localContainer.parentNode as HTMLElement)

    localCanvas.classList.add('gameCanvas')
    localCanvas.setAttribute('width', (width || 480).toString())
    localCanvas.setAttribute('height', (height || 320).toString())
    localCanvas.setAttribute('tabindex', '99')

    if (_renderType === this.RENDER_TYPE_WEBGL) {
      this._renderContext = _renderContext = create3DContext(localCanvas, {
        stencil: true,
        alpha: false,
      })
    }

    if (this._renderContext) {
      renderer = rendererWebGL
      window.gl = this._renderContext
      renderer.init()
      _drawingUtil = new DrawingPrimitiveWebGL(this._renderContext)
      textureCache._initializingRenderer()
      glExt = {}
      glExt.instanced_arrays = window.gl.getExtension('ANGLE_instanced_arrays')
      glExt.element_uint = window.gl.getExtension('OES_element_index_uint')
    } else {
      // _renderType = this.RENDER_TYPE_CANVAS;
      // renderer = rendererCanvas;
      // this._renderContext = _renderContext = new CanvasContextWrapper(localCanvas.getContext("2d"));
      // _drawingUtil = DrawingPrimitiveCanvas ? new DrawingPrimitiveCanvas(this._renderContext) : null;
    }

    // _gameDiv = localContainer;
    if (this.canvas) {
      this.canvas.oncontextmenu = () => {
        if (!global._isContextMenuEnable) return false
      }
    }

    eventManager.dispatchEvent(new EventCustom(Game.EVENT_RENDERER_INITD))

    this._rendererInitialized = true
  }

  _initEvents() {
    this._eventHide = new EventCustom(this.EVENT_HIDE)
    this._eventHide.setUserData(this)
    this._eventShow = new EventCustom(this.EVENT_SHOW)
    this._eventShow.setUserData(this)

    if (this.config[Game.CONFIG_KEY.registerSystemEvent] && this.canvas) {
      inputManager.registerSystemEvent(this.canvas)
    }

    let hidden: string | undefined
    if (!isUndefined(document.hidden)) {
      hidden = 'hidden'
    } else if (!isUndefined(document.mozHidden)) {
      hidden = 'mozHidden'
    } else if (!isUndefined(document.msHidden)) {
      hidden = 'msHidden'
    } else if (!isUndefined(document.webkitHidden)) {
      hidden = 'webkitHidden'
    }

    const changeList = [
      'visibilitychange',
      'mozvisibilitychange',
      'msvisibilitychange',
      'webkitvisibilitychange',
      'qbrowserVisibilityChange',
    ]
    const onHidden = () => {
      if (eventManager && this._eventHide) {
        eventManager.dispatchEvent(this._eventHide)
      }
    }
    const onShow = () => {
      if (eventManager && this._eventShow) {
        eventManager.dispatchEvent(this._eventShow)
      }
    }

    if (hidden) {
      for (let i = 0; i < changeList.length; i++) {
        document.addEventListener(
          changeList[i],
          (event: any) => {
            let visible = (document as any)[hidden!]
            visible = visible || event['hidden']
            if (visible) {
              onHidden()
            } else {
              onShow()
            }
          },
          false,
        )
      }
    } else {
      window.addEventListener('blur', onHidden, false)
      window.addEventListener('focus', onShow, false)
    }

    if (navigator.userAgent.indexOf('MicroMessenger') > -1) {
      window.onfocus = () => {
        onShow()
      }
    }

    if ('onpageshow' in window && 'onpagehide' in window) {
      window.addEventListener('pagehide', onHidden, false)
      window.addEventListener('pageshow', onShow, false)
    }

    eventManager.addCustomListener(this.EVENT_HIDE, () => {
      this.pause()
    })
    eventManager.addCustomListener(this.EVENT_SHOW, () => {
      this.resume()
    })
  }

  dispatchEvent(event: EventCustom) {
    eventManager.dispatchEvent(event)
  }
}

export const game = new Game()
eventManager._internalCustomListenerIDs = [game.EVENT_HIDE, game.EVENT_SHOW]

game.addEventListener(Game.EVENT_RENDERER_INITD, function () {
  _tmp.WebGLTextureCache()
  delete _tmp.WebGLTextureCache
})

// game.addEventListener(Game.EVENT_RENDERER_INITD, function () {
//   if (_renderType === game.RENDER_TYPE_CANVAS) {
//     var proto = {
//     }
//   } else if (_renderType === game.RENDER_TYPE_WEBGL) {
//     assert(isFunction(_tmp.WebGLTexture2D), _LogInfos.MissingFile, "TexturesWebGL.js");
//     _tmp.WebGLTexture2D();
//     delete _tmp.WebGLTexture2D;
//   }
//   // EventHelper.prototype.apply(Texture2D.prototype);
//   assert(isFunction(_tmp.PrototypeTexture2D), _LogInfos.MissingFile, "TexturesPropertyDefine.js");
//   _tmp.PrototypeTexture2D();
//   delete _tmp.PrototypeTexture2D;
// });
