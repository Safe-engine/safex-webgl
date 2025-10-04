

(function (polyfill) {

  var SWA = polyfill.WEB_AUDIO, SWB = polyfill.ONLY_ONE;

  var support = [];

  (function () {
    var audio = document.createElement("audio");
    if (audio.canPlayType) {
      var ogg = audio.canPlayType('audio/ogg; codecs="vorbis"');
      if (ogg && ogg !== "") support.push(".ogg");
      var mp3 = audio.canPlayType("audio/mpeg");
      if (mp3 && mp3 !== "") support.push(".mp3");
      var wav = audio.canPlayType('audio/wav; codecs="1"');
      if (wav && wav !== "") support.push(".wav");
      var mp4 = audio.canPlayType("audio/mp4");
      if (mp4 && mp4 !== "") support.push(".mp4");
      var m4a = audio.canPlayType("audio/x-m4a");
      if (m4a && m4a !== "") support.push(".m4a");
    }
  })();
  try {
    if (SWA) {
      var context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
      cc.Audio._context = context;
      // check context integrity
      if (
        !context["createBufferSource"] ||
        !context["createGain"] ||
        !context["destination"] ||
        !context["decodeAudioData"]
      ) {
        throw 'context is incomplete';
      }
      if (polyfill.DELAY_CREATE_CTX)
        setTimeout(function () {
          context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
          cc.Audio._context = context;
        }, 0);
    }
  } catch (error) {
    SWA = false;
    cc.log("browser don't support web audio");
  }

  var loader = {

    cache: {},

    useWebAudio: true,

    loadBuffer: function (url, cb) {
      if (!SWA) return; // WebAudio Buffer

      var request = cc.loader.getXMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      // Our asynchronous callback
      request.onload = function () {
        if (request._timeoutId >= 0) {
          clearTimeout(request._timeoutId);
        }
        context["decodeAudioData"](request.response, function (buffer) {
          //success
          cb(null, buffer);
          //audio.setBuffer(buffer);
        }, function () {
          //error
          cb('decode error - ' + url);
        });
      };

      request.onerror = function () {
        cb('request error - ' + url);
      };
      if (request.ontimeout === undefined) {
        request._timeoutId = setTimeout(function () {
          request.ontimeout();
        }, request.timeout);
      }
      request.ontimeout = function () {
        cb('request timeout - ' + url);
      };

      request.send();
    },

    load: function (realUrl, url, res, cb) {

      if (support.length === 0)
        return cb("can not support audio!");

      var audio = cc.loader.getRes(url);
      if (audio)
        return cb(null, audio);

      if (cc.loader.audioPath)
        realUrl = cc.path.join(cc.loader.audioPath, realUrl);

      var extname = cc.path.extname(realUrl);

      var typeList = [extname];
      for (var i = 0; i < support.length; i++) {
        if (extname !== support[i]) {
          typeList.push(support[i]);
        }
      }

      audio = new cc.Audio(realUrl);
      cc.loader.cache[url] = audio;
      this.loadAudioFromExtList(realUrl, typeList, audio, cb);
      return audio;
    },

    loadAudioFromExtList: function (realUrl, typeList, audio, cb) {
      if (typeList.length === 0) {
        var ERRSTR = "can not found the resource of audio! Last match url is : ";
        ERRSTR += realUrl.replace(/\.(.*)?$/, "(");
        support.forEach(function (ext) {
          ERRSTR += ext + "|";
        });
        ERRSTR = ERRSTR.replace(/\|$/, ")");
        return cb({ status: 520, errorMessage: ERRSTR }, null);
      }

      if (SWA && this.useWebAudio) {
        this.loadBuffer(realUrl, function (error, buffer) {
          if (error)
            cc.log(error);

          if (buffer)
            audio.setBuffer(buffer);

          cb(null, audio);
        });
        return;
      }

      var num = polyfill.ONE_SOURCE ? 1 : typeList.length;

      // 加载统一使用dom
      var dom = document.createElement('audio');
      for (var i = 0; i < num; i++) {
        var source = document.createElement('source');
        source.src = cc.path.changeExtname(realUrl, typeList[i]);
        dom.appendChild(source);
      }

      audio.setElement(dom);

      var timer = setTimeout(function () {
        if (dom.readyState === 0) {
          failure();
        } else {
          success();
        }
      }, 8000);

      var success = function () {
        dom.removeEventListener("canplaythrough", success, false);
        dom.removeEventListener("error", failure, false);
        dom.removeEventListener("emptied", success, false);
        if (polyfill.USE_LOADER_EVENT)
          dom.removeEventListener(polyfill.USE_LOADER_EVENT, success, false);
        clearTimeout(timer);
        cb(null, audio);
      };
      var failure = function () {
        cc.log('load audio failure - ' + realUrl);
        success();
      };
      dom.addEventListener("canplaythrough", success, false);
      dom.addEventListener("error", failure, false);
      if (polyfill.USE_LOADER_EVENT)
        dom.addEventListener(polyfill.USE_LOADER_EVENT, success, false);
    }
  };
  cc.loader.register(["mp3", "ogg", "wav", "mp4", "m4a"], loader);

  /**
   * cc.audioEngine is the singleton object, it provide simple audio APIs.
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
      return false;
    },

    /**
     * Play music.
     * @param {String} url The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     * @example
     * //example
     * cc.audioEngine.playMusic(path, false);
     */
    playMusic: function (url, loop) {
      var bgMusic = this._currMusic;
      if (bgMusic && bgMusic.getPlaying()) {
        bgMusic.stop();
      }
      var musicVolume = this._musicVolume;
      var audio = cc.loader.getRes(url);
      if (!audio) {
        cc.loader.load(url, function () {
          if (!audio.getPlaying() && !audio.interruptPlay) {
            audio.setVolume(musicVolume);
            audio.play(0, loop || false);
          }
        });
        audio = cc.loader.getRes(url);
      }
      audio.setVolume(musicVolume);
      audio.play(0, loop || false);

      this._currMusic = audio;
    },

    /**
     * Stop playing music.
     * @param {Boolean} [releaseData] If release the music data or not.As default value is false.
     * @example
     * //example
     * cc.audioEngine.stopMusic();
     */
    stopMusic: function (releaseData) {
      var audio = this._currMusic;
      if (audio) {
        var list = cc.Audio.touchPlayList;
        for (var i = list.length - 1; i >= 0; --i) {
          if (this[i] && this[i].audio === audio._element)
            list.splice(i, 1);
        }

        audio.stop();
        this._currMusic = null;
        if (releaseData)
          cc.loader.release(audio.src);
      }
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.audioEngine.pauseMusic();
     */
    pauseMusic: function () {
      var audio = this._currMusic;
      if (audio)
        audio.pause();
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.audioEngine.resumeMusic();
     */
    resumeMusic: function () {
      var audio = this._currMusic;
      if (audio)
        audio.resume();
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.audioEngine.rewindMusic();
     */
    rewindMusic: function () {
      var audio = this._currMusic;
      if (audio) {
        audio.stop();
        audio.play();
      }
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.audioEngine.getMusicVolume();
     */
    getMusicVolume: function () {
      return this._musicVolume;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.audioEngine.setMusicVolume(0.5);
     */
    setMusicVolume: function (volume) {
      volume = volume - 0;
      if (isNaN(volume)) volume = 1;
      if (volume > 1) volume = 1;
      if (volume < 0) volume = 0;

      this._musicVolume = volume;
      var audio = this._currMusic;
      if (audio) {
        audio.setVolume(volume);
      }
    },

    /**
     * Whether the music is playing.
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.audioEngine.isMusicPlaying()) {
     *      cc.log("music is playing");
     *  }
     *  else {
     *      cc.log("music is not playing");
     *  }
     */
    isMusicPlaying: function () {
      var audio = this._currMusic;
      if (audio) {
        return audio.getPlaying();
      } else {
        return false;
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
     * var soundId = cc.audioEngine.playEffect(path);
     */
    playEffect: function (url, loop) {

      if (SWB && this._currMusic && this._currMusic.getPlaying()) {
        cc.log('Browser is only allowed to play one audio');
        return null;
      }

      var effectList = this._audioPool[url];
      if (!effectList) {
        effectList = this._audioPool[url] = [];
      }

      for (var i = 0; i < effectList.length; i++) {
        if (!effectList[i].getPlaying()) {
          break;
        }
      }

      if (!SWA && i > this._maxAudioInstance) {
        var first = effectList.shift();
        first.stop();
        effectList.push(first);
        i = effectList.length - 1;
        // cc.log("Error: %s greater than %d", url, this._maxAudioInstance);
      }

      var audio;
      if (effectList[i]) {
        audio = effectList[i];
        audio.setVolume(this._effectVolume);
        audio.play(0, loop || false);
        return audio;
      }

      audio = cc.loader.getRes(url);

      if (audio && SWA && audio._AUDIO_TYPE === 'AUDIO') {
        cc.loader.release(url);
        audio = null;
      }

      if (audio) {

        if (SWA && audio._AUDIO_TYPE === 'AUDIO') {
          loader.loadBuffer(url, function (error, buffer) {
            audio.setBuffer(buffer);
            audio.setVolume(cc.audioEngine._effectVolume);
            if (!audio.getPlaying())
              audio.play(0, loop || false);
          });
        } else {
          audio = audio.cloneNode();
          audio.setVolume(this._effectVolume);
          audio.play(0, loop || false);
          effectList.push(audio);
          return audio;
        }

      }

      var cache = loader.useWebAudio;
      loader.useWebAudio = true;
      cc.loader.load(url, function (audio) {
        audio = cc.loader.getRes(url);
        audio = audio.cloneNode();
        audio.setVolume(cc.audioEngine._effectVolume);
        audio.play(0, loop || false);
        effectList.push(audio);
      });
      loader.useWebAudio = cache;

      return audio;
    },

    /**
     * Set the volume of sound effects.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.audioEngine.setEffectsVolume(0.5);
     */
    setEffectsVolume: function (volume) {
      volume = volume - 0;
      if (isNaN(volume)) volume = 1;
      if (volume > 1) volume = 1;
      if (volume < 0) volume = 0;

      this._effectVolume = volume;
      var audioPool = this._audioPool;
      for (var p in audioPool) {
        var audioList = audioPool[p];
        if (Array.isArray(audioList))
          for (var i = 0; i < audioList.length; i++) {
            audioList[i].setVolume(volume);
          }
      }
    },

    /**
     * The volume of the effects max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var effectVolume = cc.audioEngine.getEffectsVolume();
     */
    getEffectsVolume: function () {
      return this._effectVolume;
    },

    /**
     * Pause playing sound effect.
     * @param {Number} audio The return value of function playEffect.
     * @example
     * //example
     * cc.audioEngine.pauseEffect(audioID);
     */
    pauseEffect: function (audio) {
      if (audio) {
        audio.pause();
      }
    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.audioEngine.pauseAllEffects();
     */
    pauseAllEffects: function () {
      var ap = this._audioPool;
      for (var p in ap) {
        var list = ap[p];
        for (var i = 0; i < ap[p].length; i++) {
          if (list[i].getPlaying()) {
            list[i].pause();
          }
        }
      }
    },

    /**
     * Resume playing sound effect.
     * @param {Number} audio The return value of function playEffect.
     * @audioID
     * //example
     * cc.audioEngine.resumeEffect(audioID);
     */
    resumeEffect: function (audio) {
      if (audio)
        audio.resume();
    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.audioEngine.resumeAllEffects();
     */
    resumeAllEffects: function () {
      var ap = this._audioPool;
      for (var p in ap) {
        var list = ap[p];
        for (var i = 0; i < ap[p].length; i++) {
          list[i].resume();
        }
      }
    },

    /**
     * Stop playing sound effect.
     * @param {Number} audio The return value of function playEffect.
     * @example
     * //example
     * cc.audioEngine.stopEffect(audioID);
     */
    stopEffect: function (audio) {
      if (audio) {
        audio.stop();
      }
    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.audioEngine.stopAllEffects();
     */
    stopAllEffects: function () {
      var ap = this._audioPool;
      for (var p in ap) {
        var list = ap[p];
        for (var i = 0; i < list.length; i++) {
          list[i].stop();
        }
        list.length = 0;
      }
      ap.length = 0;
    },

    /**
     * Unload the preloaded effect from internal buffer
     * @param {String} url
     * @example
     * //example
     * cc.audioEngine.unloadEffect(EFFECT_FILE);
     */
    unloadEffect: function (url) {
      if (!url) {
        return;
      }

      cc.loader.release(url);
      var pool = this._audioPool[url];
      if (pool) {
        for (var i = 0; i < pool.length; i++) {
          pool[i].stop();
        }
        pool.length = 0;
      }
      delete this._audioPool[url];
    },

    /**
     * End music and effects.
     */
    end: function () {
      this.stopMusic();
      this.stopAllEffects();
    },

    _pauseCache: [],
    _pausePlaying: function () {
      var bgMusic = this._currMusic;
      if (bgMusic && bgMusic.getPlaying()) {
        bgMusic.pause();
        this._pauseCache.push(bgMusic);
      }
      var ap = this._audioPool;
      for (var p in ap) {
        var list = ap[p];
        for (var i = 0; i < ap[p].length; i++) {
          if (list[i].getPlaying()) {
            list[i].pause();
            this._pauseCache.push(list[i]);
          }
        }
      }
    },

    _resumePlaying: function () {
      var list = this._pauseCache;
      for (var i = 0; i < list.length; i++) {
        list[i].resume();
      }
      list.length = 0;
    }
  };

})(window.__audioSupport);

