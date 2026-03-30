import { log } from '../helper/Debugger'
import { getXMLHttpRequest, loader } from '../helper/loader'
import { path } from '../helper/path'
import { Audio } from './Audio'

const polyfill = window.__audioSupport
let SWA = polyfill.WEB_AUDIO
const SWB = polyfill.ONLY_ONE

const support = []

const audio = document.createElement('audio')
if (audio.canPlayType) {
  if (audio.canPlayType('audio/ogg; codecs="vorbis"')) {
    support.push('.ogg')
  }
  if (audio.canPlayType('audio/mpeg')) support.push('.mp3')
  if (audio.canPlayType('audio/wav; codecs="1"')) support.push('.wav')
  if (audio.canPlayType('audio/mp4')) support.push('.mp4')
  if (audio.canPlayType('audio/x-m4a')) support.push('.m4a')
}
let context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)()
try {
  if (SWA) {
    Audio._context = context
    // check context integrity
    if (!context['createBufferSource'] || !context['createGain'] || !context['destination'] || !context['decodeAudioData']) {
      throw 'context is incomplete'
    }
    if (polyfill.DELAY_CREATE_CTX)
      setTimeout(function () {
        context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)()
        Audio._context = context
      }, 0)
  }
} catch (error) {
  SWA = false
  log('browser don t support web audio')
}

const audioLoader = {
  cache: {},

  useWebAudio: true,

  loadBuffer: function (url: string, cb: (error: string | null, buffer?) => void) {
    if (!SWA) return // WebAudio Buffer

    const request = getXMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    // Our asynchronous callback
    request.onload = function () {
      if (request._timeoutId >= 0) {
        clearTimeout(request._timeoutId)
      }
      context['decodeAudioData'](
        request.response,
        function (buffer) {
          //success
          cb(null, buffer)
          //audio.setBuffer(buffer);
        },
        function () {
          //error
          cb(`decode error - ${url}`)
        },
      )
    }

    request.onerror = function () {
      cb(`request error - ${url}`)
    }
    if (request.ontimeout === undefined) {
      request._timeoutId = setTimeout(function () {
        request.ontimeout(undefined)
      }, request.timeout)
    }
    request.ontimeout = function () {
      cb(`request timeout - ${url}`)
    }

    request.send()
  },

  load: function (realUrl: string, url: string, res, cb: (error: string | null, buffer?) => void) {
    if (support.length === 0) return cb('can not support audio!')

    let audio = loader.getRes(url)
    if (audio) return cb(null, audio)

    if (loader.audioPath) realUrl = path.join(loader.audioPath, realUrl)

    const extname = path.extname(realUrl)

    const typeList = [extname]
    for (let i = 0; i < support.length; i++) {
      if (extname !== support[i]) {
        typeList.push(support[i])
      }
    }

    audio = new Audio(realUrl)
    loader.cache[url] = audio
    this.loadAudioFromExtList(realUrl, typeList, audio, cb)
    return audio
  },

  loadAudioFromExtList: function (realUrl: string, typeList, audio, cb) {
    if (typeList.length === 0) {
      let ERRSTR = 'can not found the resource of audio! Last match url is : '
      ERRSTR += realUrl.replace(/\.(.*)?$/, '(')
      support.forEach(function (ext) {
        ERRSTR += `${ext}|`
      })
      ERRSTR = ERRSTR.replace(/\|$/, ')')
      return cb({ status: 520, errorMessage: ERRSTR }, null)
    }

    if (SWA && this.useWebAudio) {
      this.loadBuffer(realUrl, function (error, buffer) {
        if (error) log(error)

        if (buffer) audio.setBuffer(buffer)

        cb(null, audio)
      })
      return
    }

    const num = polyfill.ONE_SOURCE ? 1 : typeList.length

    // 加载统一使用dom
    const dom = document.createElement('audio')
    for (let i = 0; i < num; i++) {
      const source = document.createElement('source')
      source.src = path.changeExtname(realUrl, typeList[i])
      dom.appendChild(source)
    }

    audio.setElement(dom)

    const timer = setTimeout(function () {
      if (dom.readyState === 0) {
        failure()
      } else {
        success()
      }
    }, 8000)

    const success = function () {
      dom.removeEventListener('canplaythrough', success, false)
      dom.removeEventListener('error', failure, false)
      dom.removeEventListener('emptied', success, false)
      if (polyfill.USE_LOADER_EVENT) dom.removeEventListener(polyfill.USE_LOADER_EVENT, success, false)
      clearTimeout(timer)
      cb(null, audio)
    }
    const failure = function () {
      log(`load audio failure - ${realUrl}`)
      success()
    }
    dom.addEventListener('canplaythrough', success, false)
    dom.addEventListener('error', failure, false)
    if (polyfill.USE_LOADER_EVENT) dom.addEventListener(polyfill.USE_LOADER_EVENT, success, false)
  },
}
loader.register(['mp3', 'ogg', 'wav', 'mp4', 'm4a'], audioLoader)

/**
 * audioEngine is the singleton object, it provide simple audio APIs.
 * @namespace
 */
export const audioEngine = {
  _currMusic: null,
  _musicVolume: 1,

  features: polyfill,

  /**
   * Indicates whether any background music can be played or not.
   * @returns {boolean} <i>true</i> if the background music is playing, otherwise <i>false</i>
   */
  willPlayMusic: function () {
    return false
  },

  /**
   * Play music.
   * @param {String} url The path of the music file without filename extension.
   * @param {Boolean} loop Whether the music loop or not.
   * @example
   * //example
   * audioEngine.playMusic(path, false);
   */
  playMusic: function (url, loop) {
    const bgMusic = this._currMusic
    if (bgMusic && bgMusic.getPlaying()) {
      bgMusic.stop()
    }
    const musicVolume = this._musicVolume
    let audio = loader.getRes(url)
    if (!audio) {
      loader.load(url, function () {
        if (!audio.getPlaying() && !audio.interruptPlay) {
          audio.setVolume(musicVolume)
          audio.play(0, loop || false)
        }
      })
      audio = loader.getRes(url)
    }
    audio.setVolume(musicVolume)
    audio.play(0, loop || false)

    this._currMusic = audio
  },

  /**
   * Stop playing music.
   * @param {Boolean} [releaseData] If release the music data or not.As default value is false.
   * @example
   * //example
   * audioEngine.stopMusic();
   */
  stopMusic: function (releaseData) {
    const audio = this._currMusic
    if (audio) {
      const list = Audio.touchPlayList
      for (let i = list.length - 1; i >= 0; --i) {
        if (this[i] && this[i].audio === audio._element) list.splice(i, 1)
      }

      audio.stop()
      this._currMusic = null
      if (releaseData) loader.release(audio.src)
    }
  },

  /**
   * Pause playing music.
   * @example
   * //example
   * audioEngine.pauseMusic();
   */
  pauseMusic: function () {
    const audio = this._currMusic
    if (audio) audio.pause()
  },

  /**
   * Resume playing music.
   * @example
   * //example
   * audioEngine.resumeMusic();
   */
  resumeMusic: function () {
    const audio = this._currMusic
    if (audio) audio.resume()
  },

  /**
   * Rewind playing music.
   * @example
   * //example
   * audioEngine.rewindMusic();
   */
  rewindMusic: function () {
    const audio = this._currMusic
    if (audio) {
      audio.stop()
      audio.play()
    }
  },

  /**
   * The volume of the music max value is 1.0,the min value is 0.0 .
   * @return {Number}
   * @example
   * //example
   * var volume = audioEngine.getMusicVolume();
   */
  getMusicVolume: function () {
    return this._musicVolume
  },

  /**
   * Set the volume of music.
   * @param {Number} volume Volume must be in 0.0~1.0 .
   * @example
   * //example
   * audioEngine.setMusicVolume(0.5);
   */
  setMusicVolume: function (volume) {
    volume = volume - 0
    if (isNaN(volume)) volume = 1
    if (volume > 1) volume = 1
    if (volume < 0) volume = 0

    this._musicVolume = volume
    const audio = this._currMusic
    if (audio) {
      audio.setVolume(volume)
    }
  },

  /**
   * Whether the music is playing.
   * @return {Boolean} If is playing return true,or return false.
   * @example
   * //example
   *  if (audioEngine.isMusicPlaying()) {
   *      log("music is playing");
   *  }
   *  else {
   *      log("music is not playing");
   *  }
   */
  isMusicPlaying: function () {
    const audio = this._currMusic
    if (audio) {
      return audio.getPlaying()
    } else {
      return false
    }
  },

  _audioPool: {},
  _maxAudioInstance: 10,
  _effectVolume: 1,
  /**
   * Play sound effect.
   * @param {String} url The path of the sound effect with filename extension.
   * @param {Boolean} loop Whether to loop the effect playing, default value is false
   * @return {Number|null} the audio id
   * @example
   * //example
   * var soundId = audioEngine.playEffect(path);
   */
  playEffect: function (url, loop) {
    if (SWB && this._currMusic && this._currMusic.getPlaying()) {
      log('Browser is only allowed to play one audio')
      return null
    }

    let effectList = this._audioPool[url]
    if (!effectList) {
      effectList = this._audioPool[url] = []
    }
    let i
    for (i = 0; i < effectList.length; i++) {
      if (!effectList[i].getPlaying()) {
        break
      }
    }

    if (!SWA && i > this._maxAudioInstance) {
      const first = effectList.shift()
      first.stop()
      effectList.push(first)
      i = effectList.length - 1
      // log("Error: %s greater than %d", url, this._maxAudioInstance);
    }

    let audio
    if (effectList[i]) {
      audio = effectList[i]
      audio.setVolume(this._effectVolume)
      audio.play(0, loop || false)
      return audio
    }

    audio = loader.getRes(url)

    if (audio && SWA && audio._AUDIO_TYPE === 'AUDIO') {
      loader.release(url)
      audio = null
    }

    if (audio) {
      if (SWA && audio._AUDIO_TYPE === 'AUDIO') {
        audioLoader.loadBuffer(url, function (error, buffer) {
          audio.setBuffer(buffer)
          audio.setVolume(audioEngine._effectVolume)
          if (!audio.getPlaying()) audio.play(0, loop || false)
        })
      } else {
        audio = audio.cloneNode()
        audio.setVolume(this._effectVolume)
        audio.play(0, loop || false)
        effectList.push(audio)
        return audio
      }
    }

    const cache = audioLoader.useWebAudio
    audioLoader.useWebAudio = true
    loader.load(url, function (audio) {
      audio = loader.getRes(url)
      audio = audio.cloneNode()
      audio.setVolume(audioEngine._effectVolume)
      audio.play(0, loop || false)
      effectList.push(audio)
    })
    audioLoader.useWebAudio = cache

    return audio
  },

  /**
   * Set the volume of sound effects.
   * @param {Number} volume Volume must be in 0.0~1.0 .
   * @example
   * //example
   * audioEngine.setEffectsVolume(0.5);
   */
  setEffectsVolume: function (volume) {
    volume = volume - 0
    if (isNaN(volume)) volume = 1
    if (volume > 1) volume = 1
    if (volume < 0) volume = 0

    this._effectVolume = volume
    const audioPool = this._audioPool
    for (const p in audioPool) {
      const audioList = audioPool[p]
      if (Array.isArray(audioList))
        for (let i = 0; i < audioList.length; i++) {
          audioList[i].setVolume(volume)
        }
    }
  },

  /**
   * The volume of the effects max value is 1.0,the min value is 0.0 .
   * @return {Number}
   * @example
   * //example
   * var effectVolume = audioEngine.getEffectsVolume();
   */
  getEffectsVolume: function () {
    return this._effectVolume
  },

  /**
   * Pause playing sound effect.
   * @param {Number} audio The return value of function playEffect.
   * @example
   * //example
   * audioEngine.pauseEffect(audioID);
   */
  pauseEffect: function (audio) {
    if (audio) {
      audio.pause()
    }
  },

  /**
   * Pause all playing sound effect.
   * @example
   * //example
   * audioEngine.pauseAllEffects();
   */
  pauseAllEffects: function () {
    const ap = this._audioPool
    for (const p in ap) {
      const list = ap[p]
      for (let i = 0; i < ap[p].length; i++) {
        if (list[i].getPlaying()) {
          list[i].pause()
        }
      }
    }
  },

  /**
   * Resume playing sound effect.
   * @param {Number} audio The return value of function playEffect.
   * @audioID
   * //example
   * audioEngine.resumeEffect(audioID);
   */
  resumeEffect: function (audio) {
    if (audio) audio.resume()
  },

  /**
   * Resume all playing sound effect
   * @example
   * //example
   * audioEngine.resumeAllEffects();
   */
  resumeAllEffects: function () {
    const ap = this._audioPool
    for (const p in ap) {
      const list = ap[p]
      for (let i = 0; i < ap[p].length; i++) {
        list[i].resume()
      }
    }
  },

  /**
   * Stop playing sound effect.
   * @param {Number} audio The return value of function playEffect.
   * @example
   * //example
   * audioEngine.stopEffect(audioID);
   */
  stopEffect: function (audio) {
    if (audio) {
      audio.stop()
    }
  },

  /**
   * Stop all playing sound effects.
   * @example
   * //example
   * audioEngine.stopAllEffects();
   */
  stopAllEffects: function () {
    const ap = this._audioPool
    for (const p in ap) {
      const list = ap[p]
      for (let i = 0; i < list.length; i++) {
        list[i].stop()
      }
      list.length = 0
    }
    ap.length = 0
  },

  /**
   * Unload the preloaded effect from internal buffer
   * @param {String} url
   * @example
   * //example
   * audioEngine.unloadEffect(EFFECT_FILE);
   */
  unloadEffect: function (url) {
    if (!url) {
      return
    }

    loader.release(url)
    const pool = this._audioPool[url]
    if (pool) {
      for (let i = 0; i < pool.length; i++) {
        pool[i].stop()
      }
      pool.length = 0
    }
    delete this._audioPool[url]
  },

  /**
   * End music and effects.
   */
  end: function () {
    this.stopMusic()
    this.stopAllEffects()
  },

  _pauseCache: [],
  _pausePlaying: function () {
    const bgMusic = this._currMusic
    if (bgMusic && bgMusic.getPlaying()) {
      bgMusic.pause()
      this._pauseCache.push(bgMusic)
    }
    const ap = this._audioPool
    for (const p in ap) {
      const list = ap[p]
      for (let i = 0; i < ap[p].length; i++) {
        if (list[i].getPlaying()) {
          list[i].pause()
          this._pauseCache.push(list[i])
        }
      }
    }
  },

  _resumePlaying: function () {
    const list = this._pauseCache
    for (let i = 0; i < list.length; i++) {
      list[i].resume()
    }
    list.length = 0
  },
}
