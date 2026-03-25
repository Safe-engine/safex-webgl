import { game } from '..'
import { ENGINE_VERSION } from '../core/platform/Config'

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

function _afterEngineLoaded() {
  // if (_initDebugSetting)
  //   _initDebugSetting(config[game.CONFIG_KEY.debugMode]);
  _engineLoaded = true
  console.log(ENGINE_VERSION)
  if (_engineLoadedCallback) _engineLoadedCallback()
}

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
  _afterEngineLoaded()
  _engineInitCalled = true
}
