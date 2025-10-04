
/**
 * Audio support in the browser
 *
 * MULTI_CHANNEL        : Multiple audio while playing - If it doesn't, you can only play background music
 * WEB_AUDIO            : Support for WebAudio - Support W3C WebAudio standards, all of the audio can be played
 * AUTOPLAY             : Supports auto-play audio - if Don‘t support it, On a touch detecting background music canvas, and then replay
 * REPLAY_AFTER_TOUCH   : The first music will fail, must be replay after touchstart
 * USE_EMPTIED_EVENT    : Whether to use the emptied event to replace load callback
 * DELAY_CREATE_CTX     : delay created the context object - only webAudio
 * NEED_MANUAL_LOOP     : loop attribute failure, need to perform loop manually
 *
 * May be modifications for a few browser version
 */
(function () {

  var DEBUG = false;

  var sys = cc.sys;
  var version = sys.browserVersion;

  // check if browser supports Web Audio
  // check Web Audio's context
  var supportWebAudio = !!(window.AudioContext || window.webkitAudioContext || window.mozAudioContext);

  var support = { ONLY_ONE: false, WEB_AUDIO: supportWebAudio, DELAY_CREATE_CTX: false, ONE_SOURCE: false };

  if (sys.browserType === sys.BROWSER_TYPE_FIREFOX) {
    support.DELAY_CREATE_CTX = true;
    support.USE_LOADER_EVENT = 'canplay';
  }

  if (sys.os === sys.OS_IOS) {
    support.USE_LOADER_EVENT = 'loadedmetadata';
  }

  if (sys.os === sys.OS_ANDROID) {
    if (sys.browserType === sys.BROWSER_TYPE_UC) {
      support.ONE_SOURCE = true;
    }
  }

  window.__audioSupport = support;

  if (DEBUG) {
    setTimeout(function () {
      cc.log("browse type: " + sys.browserType);
      cc.log("browse version: " + version);
      cc.log("MULTI_CHANNEL: " + window.__audioSupport.MULTI_CHANNEL);
      cc.log("WEB_AUDIO: " + window.__audioSupport.WEB_AUDIO);
      cc.log("AUTOPLAY: " + window.__audioSupport.AUTOPLAY);
    }, 0);
  }

})();

/**
 * Encapsulate DOM and webAudio
 */
cc.Audio = cc.Class.extend({
  interruptPlay: false,
  src: null,
  _element: null,
  _AUDIO_TYPE: "AUDIO",

  ctor: function (url) {
    this.src = url;
  },

  setBuffer: function (buffer) {
    this._AUDIO_TYPE = "WEBAUDIO";
    this._element = new cc.Audio.WebAudio(buffer);
  },

  setElement: function (element) {
    this._AUDIO_TYPE = "AUDIO";
    this._element = element;

    // Prevent partial browser from playing after the end does not reset the paused tag
    // Will cause the player to judge the status of the error
    element.addEventListener('ended', function () {
      if (!element.loop) {
        element.paused = true;
      }
    });
  },

  play: function (offset, loop) {
    if (!this._element) {
      this.interruptPlay = false;
      return;
    }
    this._element.loop = loop;
    this._element.play();
    if (this._AUDIO_TYPE === 'AUDIO' && this._element.paused) {
      this.stop();
      cc.Audio.touchPlayList.push({ loop: loop, offset: offset, audio: this._element });
    }

    if (cc.Audio.bindTouch === false) {
      cc.Audio.bindTouch = true;
      // Listen to the touchstart body event and play the audio when necessary.
      cc.game.canvas.addEventListener('touchstart', cc.Audio.touchStart);
    }
  },

  getPlaying: function () {
    if (!this._element) return true;
    return !this._element.paused;
  },

  stop: function () {
    if (!this._element) {
      this.interruptPlay = true;
      return;
    }
    this._element.pause();
    try {
      this._element.currentTime = 0;
    } catch (err) {
    }
  },

  pause: function () {
    if (!this._element) {
      this.interruptPlay = true;
      return;
    }
    this._element.pause();
  },

  resume: function () {
    if (!this._element) {
      this.interruptPlay = false;
      return;
    }
    this._element.play();
  },

  setVolume: function (volume) {
    if (!this._element) return;
    this._element.volume = volume;
  },

  getVolume: function () {
    if (!this._element) return;
    return this._element.volume;
  },

  cloneNode: function () {
    var audio = new cc.Audio(this.src);
    if (this._AUDIO_TYPE === "AUDIO") {
      var elem = document.createElement("audio");
      var sources = elem.getElementsByTagName('source');
      for (var i = 0; i < sources.length; i++) {
        elem.appendChild(sources[i]);
      }
      elem.src = this.src;
      audio.setElement(elem);
    } else {
      audio.setBuffer(this._element.buffer);
    }
    return audio;
  }
});

cc.Audio.touchPlayList = [
  //{ offset: 0, audio: audio }
];

cc.Audio.bindTouch = false;
cc.Audio.touchStart = function () {
  var list = cc.Audio.touchPlayList;
  var item = null;
  while (item = list.pop()) {
    item.audio.loop = !!item.loop;
    item.audio.play(item.offset);
  }
};

cc.Audio.WebAudio = function (buffer) {
  this.buffer = buffer;
  this.context = cc.Audio._context;

  var volume = this.context['createGain']();
  volume['gain'].value = 1;
  volume['connect'](this.context['destination']);
  this._volume = volume;

  this._loop = false;

  // The time stamp on the audio time axis when the recording begins to play.
  this._startTime = -1;
  // Record the currently playing Source
  this._currentSource = null;
  // Record the time has been played
  this.playedLength = 0;

  this._currextTimer = null;
};

cc.Audio.WebAudio.prototype = {
  constructor: cc.Audio.WebAudio,

  get paused() {
    // If the current audio is a loop, then paused is false
    if (this._currentSource && this._currentSource.loop)
      return false;

    // StartTime does not have value, as the default -1, it does not begin to play
    if (this._startTime === -1)
      return true;

    // currentTime - startTime > durationTime
    return this.context.currentTime - this._startTime > this.buffer.duration;
  },
  set paused(bool) {
  },

  get loop() {
    return this._loop;
  },
  set loop(bool) {
    return this._loop = bool;
  },

  get volume() {
    return this._volume['gain'].value;
  },
  set volume(num) {
    return this._volume['gain'].value = num;
  },

  get currentTime() {
    return this.playedLength;
  },
  set currentTime(num) {
    return this.playedLength = num;
  },

  play: function (offset) {

    // If repeat play, you need to stop before an audio
    if (this._currentSource && !this.paused) {
      this._currentSource.stop(0);
      this.playedLength = 0;
    }

    var audio = this.context["createBufferSource"]();
    audio.buffer = this.buffer;
    audio["connect"](this._volume);
    audio.loop = this._loop;

    this._startTime = this.context.currentTime;
    offset = offset || this.playedLength;

    var duration = this.buffer.duration;
    if (!this._loop) {
      if (audio.start)
        audio.start(0, offset, duration - offset);
      else if (audio["notoGrainOn"])
        audio["noteGrainOn"](0, offset, duration - offset);
      else
        audio["noteOn"](0, offset, duration - offset);
    } else {
      if (audio.start)
        audio.start(0);
      else if (audio["notoGrainOn"])
        audio["noteGrainOn"](0);
      else
        audio["noteOn"](0);
    }

    this._currentSource = audio;

    // If the current audio context time stamp is 0
    // There may be a need to touch events before you can actually start playing audio
    // So here to add a timer to determine whether the real start playing audio, if not, then the incoming touchPlay queue
    if (this.context.currentTime === 0) {
      var self = this;
      clearTimeout(this._currextTimer);
      this._currextTimer = setTimeout(function () {
        if (self.context.currentTime === 0) {
          cc.Audio.touchPlayList.push({
            offset: offset,
            audio: self
          });
        }
      }, 10);
    }
  },
  pause: function () {
    // Record the time the current has been played
    this.playedLength = this.context.currentTime - this._startTime;
    //If the duration of playedLendth exceeds the audio, you should take the remainder
    this.playedLength %= this.buffer.duration;
    var audio = this._currentSource;
    this._currentSource = null;
    this._startTime = -1;
    if (audio)
      audio.stop(0);
  }
};
