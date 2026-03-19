import { textureCache } from '../../textures'
import { arrayVerifyType } from '../platform/Macro'
import { SpriteFrame } from './SpriteFrame'

/**
 * A single frame within an animation.  Wraps a {@link SpriteFrame} along
 * with per-frame timing and optionally user-defined metadata.
 */
export class AnimationFrame {
  declare _spriteFrame: SpriteFrame
  _delayPerUnit = 0
  declare _userInfo: any

  constructor(spriteFrame?: SpriteFrame, delayUnits?: number, userInfo?: any) {
    this._spriteFrame = spriteFrame || null
    this._delayPerUnit = delayUnits || 0
    this._userInfo = userInfo || null
  }

  /**
   * Create a new animation frame and copy all contents into it
   */
  clone(): AnimationFrame {
    const frame = new AnimationFrame()
    // using non-null assertion since spriteFrame was set in constructor
    frame.initWithSpriteFrame(this._spriteFrame!.clone(), this._delayPerUnit, this._userInfo)
    return frame
  }

  /**
   * Alias for {@link clone} to match original API
   */
  copyWithZone(pZone?: any): AnimationFrame {
    return this.clone()
  }

  /**
   * Alias for {@link copyWithZone}
   */
  copy(pZone?: any): AnimationFrame {
    return this.copyWithZone(pZone)
  }

  /**
   * initializes the animation frame with a spriteframe, number of delay units and a notification user info
   */
  initWithSpriteFrame(spriteFrame: SpriteFrame, delayUnits: number, userInfo: any): boolean {
    this._spriteFrame = spriteFrame
    this._delayPerUnit = delayUnits
    this._userInfo = userInfo
    return true
  }

  /**
   * Returns sprite frame to be used
   */
  getSpriteFrame(): SpriteFrame | null {
    return this._spriteFrame
  }

  /**
   * Sets sprite frame to be used
   */
  setSpriteFrame(spriteFrame: SpriteFrame) {
    this._spriteFrame = spriteFrame
  }

  /**
   * Returns how many units of time the frame takes getter
   */
  getDelayUnits(): number {
    return this._delayPerUnit
  }

  /**
   * Sets how many units of time the frame takes setter
   */
  setDelayUnits(delayUnits: number) {
    this._delayPerUnit = delayUnits
  }

  /**
   * Returns the user custom information
   */
  getUserInfo(): any | null {
    return this._userInfo
  }

  /**
   * Sets the user custom information
   */
  setUserInfo(userInfo: any) {
    this._userInfo = userInfo
  }
}

/**
 * <p>
 *     A Animation object is used to perform animations on the Sprite objects.<br/>
 *     <br/>
 *      The Animation object contains SpriteFrame objects, and a possible delay between the frames. <br/>
 *      You can animate a Animation object by using the Animate action.
 * </p>
 */
export class Animation {
  _frames: AnimationFrame[] = []
  _loops = 0
  _restoreOriginalFrame = false
  _duration = 0
  _delayPerUnit = 0
  _totalDelayUnits = 0

  constructor(frames?: any[], delay?: number, loops?: number) {
    this._frames = []
    if (frames === undefined) {
      this.initWithSpriteFrames(null, 0)
    } else {
      const frame0 = frames[0]
      if (frame0) {
        if (frame0 instanceof SpriteFrame) {
          this.initWithSpriteFrames(frames as SpriteFrame[], delay, loops)
        } else if (frame0 instanceof AnimationFrame) {
          this.initWithAnimationFrames(frames as AnimationFrame[], delay, loops)
        }
      }
    }
  }

  // attributes

  /**
   * Returns the array of animation frames
   */
  getFrames(): AnimationFrame[] {
    return this._frames
  }

  /**
   * Sets array of animation frames
   */
  setFrames(frames: AnimationFrame[]) {
    this._frames = frames
  }

  /**
   * Adds a frame to a Animation, the frame will be added with one "delay unit".
   */
  addSpriteFrame(frame: SpriteFrame) {
    const animFrame = new AnimationFrame()
    animFrame.initWithSpriteFrame(frame, 1, null)
    this._frames.push(animFrame)
    // update duration
    this._totalDelayUnits++
  }

  /**
   * Adds a frame with an image filename. Internally it will create a SpriteFrame and it will add it. The frame will be added with one "delay unit".
   */
  addSpriteFrameWithFile(fileName: string) {
    const texture = textureCache.addImage(fileName)
    const rect: any = { x: 0, y: 0, width: 0, height: 0 }
    rect.width = texture.width
    rect.height = texture.height
    const frame = new SpriteFrame(texture, rect)
    this.addSpriteFrame(frame)
  }

  /**
   * Adds a frame with a texture and a rect. Internally it will create a SpriteFrame and it will add it. The frame will be added with one "delay unit".
   */
  addSpriteFrameWithTexture(texture: any, rect: any) {
    const pFrame = new SpriteFrame(texture, rect)
    this.addSpriteFrame(pFrame)
  }

  /**
   * Initializes a Animation with AnimationFrame, do not call this method yourself, please pass parameters to constructor to initialize.
   */
  initWithAnimationFrames(arrayOfAnimationFrames: AnimationFrame[], delayPerUnit: number, loops?: number): boolean {
    arrayVerifyType(arrayOfAnimationFrames, AnimationFrame)

    this._delayPerUnit = delayPerUnit
    this._loops = loops === undefined ? 1 : loops
    this._totalDelayUnits = 0

    const locFrames = this._frames
    locFrames.length = 0
    for (let i = 0; i < arrayOfAnimationFrames.length; i++) {
      const animFrame = arrayOfAnimationFrames[i]
      locFrames.push(animFrame)
      this._totalDelayUnits += animFrame.getDelayUnits()
    }

    return true
  }

  /**
   * Clone the current animation
   */
  clone(): Animation {
    const animation = new Animation()
    animation.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops)
    animation.setRestoreOriginalFrame(this._restoreOriginalFrame)
    return animation
  }

  /**
   * Clone the current animation
   */
  copyWithZone(pZone?: any): Animation {
    const pCopy = new Animation()
    pCopy.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops)
    pCopy.setRestoreOriginalFrame(this._restoreOriginalFrame)
    return pCopy
  }

  _copyFrames(): AnimationFrame[] {
    const copyFrames: AnimationFrame[] = []
    for (let i = 0; i < this._frames.length; i++) copyFrames.push(this._frames[i].clone())
    return copyFrames
  }

  /**
   * Clone the current animation
   */
  copy(pZone?: any): Animation {
    return this.copyWithZone(null)
  }

  /**
   * Returns how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
   */
  getLoops(): number {
    return this._loops
  }

  /**
   * Sets how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
   */
  setLoops(value: number) {
    this._loops = value
  }

  /**
   * Sets whether or not it shall restore the original frame when the animation finishes
   */
  setRestoreOriginalFrame(restOrigFrame: boolean) {
    this._restoreOriginalFrame = restOrigFrame
  }

  /**
   * Returns whether or not it shall restore the original frame when the animation finishes
   */
  getRestoreOriginalFrame(): boolean {
    return this._restoreOriginalFrame
  }

  /**
   * Returns duration in seconds of the whole animation. It is the result of totalDelayUnits * delayPerUnit
   */
  getDuration(): number {
    return this._totalDelayUnits * this._delayPerUnit
  }

  /**
   * Returns delay in seconds of the "delay unit"
   */
  getDelayPerUnit(): number {
    return this._delayPerUnit
  }

  /**
   * Sets delay in seconds of the "delay unit"
   */
  setDelayPerUnit(delayPerUnit: number) {
    this._delayPerUnit = delayPerUnit
  }

  /**
   * Returns total delay units of the Animation.
   */
  getTotalDelayUnits(): number {
    return this._totalDelayUnits
  }

  /**
   * Initializes a Animation with frames and a delay between frames, do not call this method yourself, please pass parameters to constructor to initialize.
   */
  initWithSpriteFrames(frames: SpriteFrame[] | null, delay: number, loops?: number): boolean {
    arrayVerifyType(frames, SpriteFrame)
    this._loops = loops === undefined ? 1 : loops
    this._delayPerUnit = delay || 0
    this._totalDelayUnits = 0

    const locFrames = this._frames
    locFrames.length = 0
    if (frames) {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i]
        const animFrame = new AnimationFrame()
        animFrame.initWithSpriteFrame(frame, 1, null)
        locFrames.push(animFrame)
      }
      this._totalDelayUnits += frames.length
    }
    return true
  }

  /**
   * JSB retain/release compatibility helpers (no‑ops in JS environment)
   */
  retain() {}
  release() {}
}
