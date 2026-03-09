import { _LogInfos, assert, log } from '../../helper/Debugger'
import { loader } from '../../helper/loader'
import { path } from '../../helper/path'
import { REPEAT_FOREVER } from '../platform/Macro'
import { spriteFrameCache } from './SpriteFrameCache'

export const animationCache = {
  _animations: {},

  /**
   * Adds a Animation with a name.
   * @param {Animation} animation
   * @param {String} name
   */
  addAnimation: function (animation, name) {
    this._animations[name] = animation
  },

  /**
   * Deletes a Animation from the cache.
   * @param {String} name
   */
  removeAnimation: function (name) {
    if (!name) {
      return
    }
    if (this._animations[name]) {
      delete this._animations[name]
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
    if (this._animations[name]) return this._animations[name]
    return null
  },

  _addAnimationsWithDictionary: function (dictionary, plist) {
    const animations = dictionary['animations']
    if (!animations) {
      log(_LogInfos.animationCache__addAnimationsWithDictionary)
      return
    }

    let version = 1
    const properties = dictionary['properties']
    if (properties) {
      version = properties['format'] != null ? parseInt(properties['format']) : version
      const spritesheets = properties['spritesheets']
      for (let i = 0; i < spritesheets.length; i++) {
        spriteFrameCache.addSpriteFrames(path.changeBasename(plist, spritesheets[i]))
      }
    }

    switch (version) {
      case 1:
        this._parseVersion1(animations)
        break
      case 2:
        this._parseVersion2(animations)
        break
      default:
        log(_LogInfos.animationCache__addAnimationsWithDictionary_2)
        break
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
    assert(plist, _LogInfos.animationCache_addAnimations_2)

    const dict = loader.getRes(plist)

    if (!dict) {
      log(_LogInfos.animationCache_addAnimations)
      return
    }

    this._addAnimationsWithDictionary(dict, plist)
  },

  _parseVersion1: function (animations) {
    const frameCache = spriteFrameCache

    for (const key in animations) {
      const animationDict = animations[key]
      const frameNames = animationDict['frames']
      const delay = parseFloat(animationDict['delay']) || 0
      // let animation = null
      if (!frameNames) {
        log(_LogInfos.animationCache__parseVersion1, key)
        continue
      }

      const frames = []
      for (let i = 0; i < frameNames.length; i++) {
        const spriteFrame = frameCache.getSpriteFrame(frameNames[i])
        if (!spriteFrame) {
          log(_LogInfos.animationCache__parseVersion1_2, key, frameNames[i])
          continue
        }
        const animFrame = new AnimationFrame()
        animFrame.initWithSpriteFrame(spriteFrame, 1, null)
        frames.push(animFrame)
      }

      if (frames.length === 0) {
        log(_LogInfos.animationCache__parseVersion1_3, key)
        continue
      } else if (frames.length !== frameNames.length) {
        log(_LogInfos.animationCache__parseVersion1_4, key)
      }
      const animation = new Animation(frames, delay, 1)
      animationCache.addAnimation(animation, key)
    }
  },

  _parseVersion2: function (animations) {
    const frameCache = spriteFrameCache

    for (const key in animations) {
      const animationDict = animations[key]

      const isLoop = animationDict['loop']
      const loopsTemp = parseInt(animationDict['loops'])
      const loops = isLoop ? REPEAT_FOREVER : isNaN(loopsTemp) ? 1 : loopsTemp
      const restoreOriginalFrame = animationDict['restoreOriginalFrame'] && animationDict['restoreOriginalFrame'] == true ? true : false
      const frameArray = animationDict['frames']

      if (!frameArray) {
        log(_LogInfos.animationCache__parseVersion2, key)
        continue
      }

      //Array of AnimationFrames
      const arr = []
      for (let i = 0; i < frameArray.length; i++) {
        const entry = frameArray[i]
        const spriteFrameName = entry['spriteframe']
        const spriteFrame = frameCache.getSpriteFrame(spriteFrameName)
        if (!spriteFrame) {
          log(_LogInfos.animationCache__parseVersion2_2, key, spriteFrameName)
          continue
        }

        const delayUnits = parseFloat(entry['delayUnits']) || 0
        const userInfo = entry['notification']
        const animFrame = new AnimationFrame()
        animFrame.initWithSpriteFrame(spriteFrame, delayUnits, userInfo)
        arr.push(animFrame)
      }

      const delayPerUnit = parseFloat(animationDict['delayPerUnit']) || 0
      const animation = new Animation()
      animation.initWithAnimationFrames(arr, delayPerUnit, loops)
      animation.setRestoreOriginalFrame(restoreOriginalFrame)
      animationCache.addAnimation(animation, key)
    }
  },

  _clear: function () {
    this._animations = {}
  },
}
