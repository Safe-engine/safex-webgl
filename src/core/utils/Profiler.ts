import { container, director } from '../..'
import { global } from '../../helper/global'
import { Director } from '../Director'
import { eventManager } from '../event-manager/EventManager'
import { DIRECTOR_FPS_INTERVAL, DIRECTOR_STATS_POSITION } from '../platform/Config'

export const profiler = (function () {
  let _showFPS = false
  let _inited = false
  let _frames = 0,
    _frameRate = 0,
    _lastSPF = 0,
    _accumDt = 0
  let _afterVisitListener = null
  const _FPSLabel = document.createElement('div')
  const _SPFLabel = document.createElement('div')
  const _drawsLabel = document.createElement('div')
  const _fps = document.createElement('div')

  const LEVEL_DET_FACTOR = 0.6
  let _levelDetCycle = 10
  const LEVELS = [0, 10, 20, 30]
  const _fpsCount = [0, 0, 0, 0]
  let _currLevel = 3,
    _analyseCount = 0,
    _totalFPS = 0

  _fps.id = 'fps'
  _fps.style.position = 'absolute'
  _fps.style.padding = '3px'
  _fps.style.textAlign = 'left'
  _fps.style.backgroundColor = 'rgb(0, 0, 34)'
  _fps.style.bottom = `${DIRECTOR_STATS_POSITION.y}0px`
  _fps.style.left = `${DIRECTOR_STATS_POSITION.x}px`
  _fps.style.width = '45px'
  _fps.style.height = '80px'

  const labels = [_drawsLabel, _SPFLabel, _FPSLabel]
  for (let i = 0; i < 3; ++i) {
    const style = labels[i].style
    style.color = 'rgb(0, 255, 255)'
    style.font = 'bold 12px Helvetica, Arial'
    style.lineHeight = '20px'
    style.width = '100%'
    _fps.appendChild(labels[i])
  }

  const analyseFPS = function (fps) {
    const lastId = LEVELS.length - 1
    let i = lastId
    let ratio
    // let average = 0
    _analyseCount++
    _totalFPS += fps

    for (; i >= 0; i--) {
      if (fps >= LEVELS[i]) {
        _fpsCount[i]++
        break
      }
    }

    if (_analyseCount >= _levelDetCycle) {
      const average = _totalFPS / _levelDetCycle
      for (i = lastId; i > 0; i--) {
        ratio = _fpsCount[i] / _levelDetCycle
        // Determined level
        if (ratio >= LEVEL_DET_FACTOR && average >= LEVELS[i]) {
          // Level changed
          if (i != _currLevel) {
            _currLevel = i
            profiler.onFrameRateChange && profiler.onFrameRateChange(average.toFixed(2))
          }
          break
        }
        // If no level determined, that means the framerate is not stable
      }

      // _changeCount = 0;
      _analyseCount = 0
      _totalFPS = 0
      for (i = lastId; i > 0; i--) {
        _fpsCount[i] = 0
      }
    }
  }

  const afterVisit = function () {
    _lastSPF = director.getSecondsPerFrame()
    _frames++
    _accumDt += director.getDeltaTime()

    if (_accumDt > DIRECTOR_FPS_INTERVAL) {
      _frameRate = _frames / _accumDt
      _frames = 0
      _accumDt = 0

      if (profiler.onFrameRateChange) {
        analyseFPS(_frameRate)
      }

      if (_showFPS) {
        const mode = '\n webgl'
        _SPFLabel.innerHTML = _lastSPF.toFixed(3)
        _FPSLabel.innerHTML = _frameRate.toFixed(1).toString() + mode
        _drawsLabel.innerHTML = (0 | global.g_NumberOfDraws).toString()
      }
    }
  }

  const profiler = {
    onFrameRateChange: null,

    getSecondsPerFrame: function () {
      return _lastSPF
    },
    getFrameRate: function () {
      return _frameRate
    },

    setProfileDuration: function (duration) {
      if (!isNaN(duration) && duration > 0) {
        _levelDetCycle = duration / DIRECTOR_FPS_INTERVAL
      }
    },

    resumeProfiling: function () {
      eventManager.addListener(_afterVisitListener, 1)
    },

    stopProfiling: function () {
      eventManager.removeListener(_afterVisitListener)
    },

    isShowingStats: function () {
      return _showFPS
    },

    showStats: function () {
      if (!_inited) {
        this.init()
      }

      if (_fps.parentElement === null) {
        container.appendChild(_fps)
      }
      _showFPS = true
    },

    hideStats: function () {
      _showFPS = false
      if (_fps.parentElement === container) {
        container.removeChild(_fps)
      }
    },

    init: function () {
      if (!_inited) {
        _afterVisitListener = eventManager.addCustomListener(Director.EVENT_AFTER_VISIT, afterVisit)
        _inited = true
      }
    },
  }

  return profiler
})()
