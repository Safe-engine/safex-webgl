import { Game, game } from '..'
import { ENGINE_VERSION } from '../core/platform/Config'
import { sys } from './sys'

export let _renderType = 0
export let _supportRender = true

export const create3DContext = function (canvas, opt_attribs) {
  const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
  let context: WebGLRenderingContext = null
  for (let ii = 0; ii < names.length; ++ii) {
    // try {
    context = canvas.getContext(names[ii], opt_attribs)
    // } catch (e) {}
    if (context) {
      break
    }
  }
  return context
}

//cache for js and module that has added into jsList to be loaded.
let _engineInitCalled = false
let _engineLoadedCallback = null

export let _engineLoaded = false

function _determineRenderType(config) {
  const CONFIG_KEY = Game.CONFIG_KEY,
    userRenderMode = parseInt(config[CONFIG_KEY.renderMode]) || 0

  // Adjust RenderType
  if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0) config[CONFIG_KEY.renderMode] = 0

  // Determine RenderType
  _renderType = game.RENDER_TYPE_CANVAS
  _supportRender = false

  if (userRenderMode === 0) {
    if (sys.capabilities['opengl']) {
      _renderType = game.RENDER_TYPE_WEBGL
      _supportRender = true
    } else if (sys.capabilities['canvas']) {
      _renderType = game.RENDER_TYPE_CANVAS
      _supportRender = true
    }
  } else if (userRenderMode === 1 && sys.capabilities['canvas']) {
    _renderType = game.RENDER_TYPE_CANVAS
    _supportRender = true
  } else if (userRenderMode === 2 && sys.capabilities['opengl']) {
    _renderType = game.RENDER_TYPE_WEBGL
    _supportRender = true
  }
}

function _afterEngineLoaded() {
  // if (_initDebugSetting)
  //   _initDebugSetting(config[game.CONFIG_KEY.debugMode]);
  _engineLoaded = true
  console.log(ENGINE_VERSION)
  if (_engineLoadedCallback) _engineLoadedCallback()
}

function _load(config) {
  if (_engineLoaded) {
    // Single file loaded
    _afterEngineLoaded()
  } else {
    // Load cocos modules
    // var ccModulesPath = path.join(engineDir, "moduleConfig.json");
    // loader.loadJson(ccModulesPath, function (err, modulesJson) {
    // if (err) throw new Error(err);
    const modules = config['modules'] || []
    // var moduleMap = modulesJson["module"];
    const jsList = []
    if (sys.capabilities['opengl'] && modules.indexOf('base4webgl') < 0) modules.splice(0, 0, 'base4webgl')
    else if (modules.indexOf('core') < 0) modules.splice(0, 0, 'core')
    for (let i = 0, li = modules.length; i < li; i++) {
      // var arr = _getJsListOfModule(moduleMap, modules[i], engineDir);
      // if (arr) jsList = jsList.concat(arr);
    }
    // loader.loadJsWithImg(jsList, function (err) {
    //   if (err) throw err
    // })
    _afterEngineLoaded()
    // });
  }
}

// function _windowLoaded() {
//   this.removeEventListener('load', _windowLoaded, false)
//   _load(game.config)
// }

export const initEngine = function (config, cb) {
  // console.log("initEngine", config, _engineInitCalled);
  if (_engineInitCalled) {
    const previousCallback = _engineLoadedCallback
    _engineLoadedCallback = function () {
      previousCallback && previousCallback()
      cb && cb()
    }
    return
  }

  _engineLoadedCallback = cb

  // Config uninitialized and given, initialize with it
  if (!game.config && config) {
    game.config = config
  }
  // No config given and no config set before, load it
  else if (!game.config) {
    game._loadConfig()
  }
  config = game.config

  _determineRenderType(config)

  _load(config)
  // document.body ? _load(config) : _addEventListener(window, 'load', _windowLoaded, false);
  _engineInitCalled = true
}
