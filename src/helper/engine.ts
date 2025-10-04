import type { game } from "..";

let _tmpCanvas1 = document.createElement("canvas"),
  _tmpCanvas2 = document.createElement("canvas");

export const create3DContext = function (canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch (e) {
    }
    if (context) {
      break;
    }
  }
  return context;
};

_tmpCanvas1 = null;
_tmpCanvas2 = null;

var _config = null,
  //cache for js and module that has added into jsList to be loaded.
  _jsAddedCache = {},
  _engineInitCalled = false,
  _engineLoadedCallback = null;

_engineLoaded = false;

function _determineRenderType(config) {
  var CONFIG_KEY = game.CONFIG_KEY,
    userRenderMode = parseInt(config[CONFIG_KEY.renderMode]) || 0;

  // Adjust RenderType
  if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0)
    config[CONFIG_KEY.renderMode] = 0;

  // Determine RenderType
  _renderType = game.RENDER_TYPE_CANVAS;
  _supportRender = false;

  if (userRenderMode === 0) {
    if (sys.capabilities["opengl"]) {
      _renderType = game.RENDER_TYPE_WEBGL;
      _supportRender = true;
    }
    else if (sys.capabilities["canvas"]) {
      _renderType = game.RENDER_TYPE_CANVAS;
      _supportRender = true;
    }
  }
  else if (userRenderMode === 1 && sys.capabilities["canvas"]) {
    _renderType = game.RENDER_TYPE_CANVAS;
    _supportRender = true;
  }
  else if (userRenderMode === 2 && sys.capabilities["opengl"]) {
    _renderType = game.RENDER_TYPE_WEBGL;
    _supportRender = true;
  }
}

function _getJsListOfModule(moduleMap, moduleName, dir) {
  if (_jsAddedCache[moduleName]) return null;
  dir = dir || "";
  var jsList = [];
  var tempList = moduleMap[moduleName];
  if (!tempList) throw new Error("can not find module [" + moduleName + "]");
  var ccPath = path;
  for (var i = 0, li = tempList.length; i < li; i++) {
    var item = tempList[i];
    if (_jsAddedCache[item]) continue;
    var extname = ccPath.extname(item);
    if (!extname) {
      var arr = _getJsListOfModule(moduleMap, item, dir);
      if (arr) jsList = jsList.concat(arr);
    } else if (extname.toLowerCase() === ".js") jsList.push(ccPath.join(dir, item));
    _jsAddedCache[item] = 1;
  }
  return jsList;
}

function _afterEngineLoaded(config) {
  if (_initDebugSetting)
    _initDebugSetting(config[game.CONFIG_KEY.debugMode]);
  _engineLoaded = true;
  console.log(ENGINE_VERSION);
  if (_engineLoadedCallback) _engineLoadedCallback();
}

function _load(config) {
  var self = this;
  var CONFIG_KEY = game.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = loader;

  if (Class) {
    // Single file loaded
    _afterEngineLoaded(config);
  } else {
    // Load cocos modules
    var ccModulesPath = path.join(engineDir, "moduleConfig.json");
    loader.loadJson(ccModulesPath, function (err, modulesJson) {
      if (err) throw new Error(err);
      var modules = config["modules"] || [];
      var moduleMap = modulesJson["module"];
      var jsList = [];
      if (sys.capabilities["opengl"] && modules.indexOf("base4webgl") < 0) modules.splice(0, 0, "base4webgl");
      else if (modules.indexOf("core") < 0) modules.splice(0, 0, "core");
      for (var i = 0, li = modules.length; i < li; i++) {
        var arr = _getJsListOfModule(moduleMap, modules[i], engineDir);
        if (arr) jsList = jsList.concat(arr);
      }
      loader.loadJsWithImg(jsList, function (err) {
        if (err) throw err;
        _afterEngineLoaded(config);
      });
    });
  }
}

function _windowLoaded() {
  this.removeEventListener('load', _windowLoaded, false);
  _load(game.config);
}

export const initEngine = function (config, cb) {
  if (_engineInitCalled) {
    var previousCallback = _engineLoadedCallback;
    _engineLoadedCallback = function () {
      previousCallback && previousCallback();
      cb && cb();
    }
    return;
  }

  _engineLoadedCallback = cb;

  // Config uninitialized and given, initialize with it
  if (!game.config && config) {
    game.config = config;
  }
  // No config given and no config set before, load it
  else if (!game.config) {
    game._loadConfig();
  }
  config = game.config;

  _determineRenderType(config);

  document.body ? _load(config) : _addEventListener(window, 'load', _windowLoaded, false);
  _engineInitCalled = true;
};

