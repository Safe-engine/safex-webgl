import { game } from '../..'
import { log } from '../../helper/Debugger'
import { sys } from '../../helper/sys'

const DEBUG = false
const version = sys.browserVersion

// check if browser supports Web Audio
// check Web Audio's context
const supportWebAudio = !!(window.AudioContext || window.webkitAudioContext || window.mozAudioContext)

const support: any = { ONLY_ONE: false, WEB_AUDIO: supportWebAudio, DELAY_CREATE_CTX: false, ONE_SOURCE: false }

if (sys.browserType === sys.BROWSER_TYPE_FIREFOX) {
  support.DELAY_CREATE_CTX = true
  support.USE_LOADER_EVENT = 'canplay'
}

if (sys.os === sys.OS_IOS) {
  support.USE_LOADER_EVENT = 'loadedmetadata'
}

if (sys.os === sys.OS_ANDROID) {
  if (sys.browserType === sys.BROWSER_TYPE_UC) {
    support.ONE_SOURCE = true
  }
}

window.__audioSupport = support

if (DEBUG) {
  setTimeout(function () {
    log(`browse type: ${sys.browserType}`)
    log(`browse version: ${version}`)
    log(`MULTI_CHANNEL: ${window.__audioSupport.MULTI_CHANNEL}`)
    log(`WEB_AUDIO: ${window.__audioSupport.WEB_AUDIO}`)
    log(`AUTOPLAY: ${window.__audioSupport.AUTOPLAY}`)
  }, 0)
}

/**
 * Encapsulate DOM and webAudio
 */
export class Audio {
  interruptPlay = false
  src = null
  _element = null
  _AUDIO_TYPE = 'AUDIO'

  constructor(url: any) {
    this.src = url
  }

  setBuffer(buffer: any) {
    this._AUDIO_TYPE = 'WEBAUDIO'
    this._element = new Audio.WebAudio(buffer)
  }

  setElement(element: any) {
    this._AUDIO_TYPE = 'AUDIO'
    this._element = element

    // Prevent partial browser from playing after the end does not reset the paused tag
    // Will cause the player to judge the status of the error
    element.addEventListener('ended', function () {
      if (!element.loop) {
        element.paused = true
      }
    })
  }

  play(offset: any, loop: any) {
    if (!this._element) {
      this.interruptPlay = false
      return
    }
    this._element.loop = loop
    this._element.play()
    if (this._AUDIO_TYPE === 'AUDIO' && this._element.paused) {
      this.stop()
      Audio.touchPlayList.push({ loop: loop, offset: offset, audio: this._element })
    }

    if (Audio.bindTouch === false) {
      Audio.bindTouch = true
      // Listen to the touchstart body event and play the audio when necessary.
      game.canvas.addEventListener('touchstart', Audio.touchStart)
    }
  }

  getPlaying() {
    if (!this._element) return true
    return !this._element.paused
  }

  stop() {
    if (!this._element) {
      this.interruptPlay = true
      return
    }
    this._element.pause()
    // try {
    this._element.currentTime = 0
    // } catch {}
  }

  pause() {
    if (!this._element) {
      this.interruptPlay = true
      return
    }
    this._element.pause()
  }

  resume() {
    if (!this._element) {
      this.interruptPlay = false
      return
    }
    this._element.play()
  }

  setVolume(volume: any) {
    if (!this._element) return
    this._element.volume = volume
  }

  getVolume() {
    if (!this._element) return
    return this._element.volume
  }

  cloneNode() {
    const audio = new Audio(this.src)
    if (this._AUDIO_TYPE === 'AUDIO') {
      const elem = document.createElement('audio')
      const sources = elem.getElementsByTagName('source')
      for (let i = 0; i < sources.length; i++) {
        elem.appendChild(sources[i])
      }
      elem.src = this.src
      audio.setElement(elem)
    } else {
      audio.setBuffer(this._element.buffer)
    }
    return audio
  }

  static touchPlayList = [
    //{ offset: 0, audio: audio }
  ]

  static bindTouch = false
  static _context: any
  static touchStart = function () {
    const list = Audio.touchPlayList
    let item
    while ((item = list.pop())) {
      item.audio.loop = !!item.loop
      item.audio.play(item.offset)
    }
  }

  static WebAudio = class {
    buffer: any
    context: any
    _volume: any
    _loop = false
    _startTime = -1
    _currentSource = null
    playedLength = 0
    _currextTimer = null

    constructor(buffer: any) {
      this.buffer = buffer
      this.context = Audio._context

      const volume = this.context['createGain']()
      volume['gain'].value = 1
      volume['connect'](this.context['destination'])
      this._volume = volume

      this._loop = false

      // The time stamp on the audio time axis when the recording begins to play.
      this._startTime = -1
      // Record the currently playing Source
      this._currentSource = null
      // Record the time has been played
      this.playedLength = 0

      this._currextTimer = null
    }

    get paused() {
      // If the current audio is a loop, then paused is false
      if (this._currentSource && this._currentSource.loop) return false

      // StartTime does not have value, as the default -1, it does not begin to play
      if (this._startTime === -1) return true

      // currentTime - startTime > durationTime
      return this.context.currentTime - this._startTime > this.buffer.duration
    }
    set paused(bool: any) {}

    get loop() {
      return this._loop
    }
    set loop(bool: any) {
      this._loop = bool
    }

    get volume() {
      return this._volume['gain'].value
    }
    set volume(num: any) {
      this._volume['gain'].value = num
    }

    get currentTime() {
      return this.playedLength
    }
    set currentTime(num: any) {
      this.playedLength = num
    }

    play(offset: any) {
      // If repeat play, you need to stop before an audio
      if (this._currentSource && !this.paused) {
        this._currentSource.stop(0)
        this.playedLength = 0
      }

      const audio = this.context['createBufferSource']()
      audio.buffer = this.buffer
      audio['connect'](this._volume)
      audio.loop = this._loop

      this._startTime = this.context.currentTime
      offset = offset || this.playedLength

      const duration = this.buffer.duration
      if (!this._loop) {
        if (audio.start) audio.start(0, offset, duration - offset)
        else if (audio['notoGrainOn']) audio['noteGrainOn'](0, offset, duration - offset)
        else audio['noteOn'](0, offset, duration - offset)
      } else {
        if (audio.start) audio.start(0)
        else if (audio['notoGrainOn']) audio['noteGrainOn'](0)
        else audio['noteOn'](0)
      }

      this._currentSource = audio

      // If the current audio context time stamp is 0
      // There may be a need to touch events before you can actually start playing audio
      // So here to add a timer to determine whether the real start playing audio, if not, then the incoming touchPlay queue
      if (this.context.currentTime === 0) {
        clearTimeout(this._currextTimer)
        this._currextTimer = setTimeout(() => {
          if (this.context.currentTime === 0) {
            Audio.touchPlayList.push({
              offset: offset,
              audio: this,
            })
          }
        }, 10)
      }
    }

    pause() {
      // Record the time the current has been played
      this.playedLength = this.context.currentTime - this._startTime
      //If the duration of playedLendth exceeds the audio, you should take the remainder
      this.playedLength %= this.buffer.duration
      const audio = this._currentSource
      this._currentSource = null
      this._startTime = -1
      if (audio) audio.stop(0)
    }
  }
}
