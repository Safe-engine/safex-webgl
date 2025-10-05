import { _LogInfos, assert, log } from "../../../helper/Debugger";
import { loader } from "../../../helper/loader";
import { REPEAT_FOREVER } from "../platform/Macro";
import { spriteFrameCache } from "./SpriteFrameCache";

/**
 * <p>
 *     animationCache is a singleton object that manages the Animations.<br/>
 *     It saves in a cache the animations. You should use this class if you want to save your animations in a cache.<br/>
 * <br/>
 * example<br/>
 * animationCache.addAnimation(animation,"animation1");<br/>
 * </p>
 * @class
 * @name animationCache
 */
export const animationCache = {
  _animations: {},

  /**
   * Adds a Animation with a name.
   * @param {Animation} animation
   * @param {String} name
   */
  addAnimation: function (animation, name) {
    this._animations[name] = animation;
  },

  /**
   * Deletes a Animation from the cache.
   * @param {String} name
   */
  removeAnimation: function (name) {
    if (!name) {
      return;
    }
    if (this._animations[name]) {
      delete this._animations[name];
    }
  },

  /**
   * <p>
   *     Returns a Animation that was previously added.<br/>
   *      If the name is not found it will return nil.<br/>
   *      You should retain the returned copy if you are going to use it.</br>
   * </p>
   * @param {String} name
   * @return {Animation}
   */
  getAnimation: function (name) {
    if (this._animations[name])
      return this._animations[name];
    return null;
  },

  _addAnimationsWithDictionary: function (dictionary, plist) {
    var animations = dictionary["animations"];
    if (!animations) {
      log(_LogInfos.animationCache__addAnimationsWithDictionary);
      return;
    }

    var version = 1;
    var properties = dictionary["properties"];
    if (properties) {
      version = (properties["format"] != null) ? parseInt(properties["format"]) : version;
      var spritesheets = properties["spritesheets"];
      var spriteFrameCache = spriteFrameCache;
      var path = path;
      for (var i = 0; i < spritesheets.length; i++) {
        spriteFrameCache.addSpriteFrames(path.changeBasename(plist, spritesheets[i]));
      }
    }

    switch (version) {
      case 1:
        this._parseVersion1(animations);
        break;
      case 2:
        this._parseVersion2(animations);
        break;
      default:
        log(_LogInfos.animationCache__addAnimationsWithDictionary_2);
        break;
    }
  },

  /**
   * <p>
   *    Adds an animations from a plist file.<br/>
   *    Make sure that the frames were previously loaded in the SpriteFrameCache.
   * </p>
   * @param {String} plist
   */
  addAnimations: function (plist) {

    assert(plist, _LogInfos.animationCache_addAnimations_2);

    var dict = loader.getRes(plist);

    if (!dict) {
      log(_LogInfos.animationCache_addAnimations);
      return;
    }

    this._addAnimationsWithDictionary(dict, plist);
  },

  _parseVersion1: function (animations) {
    var frameCache = spriteFrameCache;

    for (var key in animations) {
      var animationDict = animations[key];
      var frameNames = animationDict["frames"];
      var delay = parseFloat(animationDict["delay"]) || 0;
      var animation = null;
      if (!frameNames) {
        log(_LogInfos.animationCache__parseVersion1, key);
        continue;
      }

      var frames = [];
      for (var i = 0; i < frameNames.length; i++) {
        var spriteFrame = frameCache.getSpriteFrame(frameNames[i]);
        if (!spriteFrame) {
          log(_LogInfos.animationCache__parseVersion1_2, key, frameNames[i]);
          continue;
        }
        var animFrame = new AnimationFrame();
        animFrame.initWithSpriteFrame(spriteFrame, 1, null);
        frames.push(animFrame);
      }

      if (frames.length === 0) {
        log(_LogInfos.animationCache__parseVersion1_3, key);
        continue;
      } else if (frames.length !== frameNames.length) {
        log(_LogInfos.animationCache__parseVersion1_4, key);
      }
      animation = new Animation(frames, delay, 1);
      animationCache.addAnimation(animation, key);
    }
  },

  _parseVersion2: function (animations) {
    var frameCache = spriteFrameCache;

    for (var key in animations) {
      var animationDict = animations[key];

      var isLoop = animationDict["loop"];
      var loopsTemp = parseInt(animationDict["loops"]);
      var loops = isLoop ? REPEAT_FOREVER : ((isNaN(loopsTemp)) ? 1 : loopsTemp);
      var restoreOriginalFrame = (animationDict["restoreOriginalFrame"] && animationDict["restoreOriginalFrame"] == true) ? true : false;
      var frameArray = animationDict["frames"];

      if (!frameArray) {
        log(_LogInfos.animationCache__parseVersion2, key);
        continue;
      }

      //Array of AnimationFrames
      var arr = [];
      for (var i = 0; i < frameArray.length; i++) {
        var entry = frameArray[i];
        var spriteFrameName = entry["spriteframe"];
        var spriteFrame = frameCache.getSpriteFrame(spriteFrameName);
        if (!spriteFrame) {
          log(_LogInfos.animationCache__parseVersion2_2, key, spriteFrameName);
          continue;
        }

        var delayUnits = parseFloat(entry["delayUnits"]) || 0;
        var userInfo = entry["notification"];
        var animFrame = new AnimationFrame();
        animFrame.initWithSpriteFrame(spriteFrame, delayUnits, userInfo);
        arr.push(animFrame);
      }

      var delayPerUnit = parseFloat(animationDict["delayPerUnit"]) || 0;
      var animation = new Animation();
      animation.initWithAnimationFrames(arr, delayPerUnit, loops);
      animation.setRestoreOriginalFrame(restoreOriginalFrame);
      animationCache.addAnimation(animation, key);
    }
  },

  _clear: function () {
    this._animations = {};
  }
};
