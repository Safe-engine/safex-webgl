import { _renderContext, renderer } from '..'
import { Node } from '../core/base-nodes/Node'
import { Color } from '../core/platform/Color'
import { Sprite } from '../core/sprites/Sprite'
import { log } from '../helper/Debugger'
import { Texture2D } from '../textures/TexturesWebGL'
import { RenderTextureWebGLRenderCmd } from './RenderTextureWebGLRenderCmd'

/**
 * enum for jpg
 * @constant
 * @type Number
 */
export const IMAGE_FORMAT_JPEG = 0
/**
 * enum for png
 * @constant
 * @type Number
 */
export const IMAGE_FORMAT_PNG = 1
/**
 * enum for raw
 * @constant
 * @type Number
 */
export const IMAGE_FORMAT_RAWDATA = 9

/**
 * @param {Number} x
 * @return {Number}
 * Constructor
 */
export const NextPOT = function (x) {
  x = x - 1
  x = x | (x >> 1)
  x = x | (x >> 2)
  x = x | (x >> 4)
  x = x | (x >> 8)
  x = x | (x >> 16)
  return x + 1
}

/**
 * RenderTexture is a generic rendering target. To render things into it,<br/>
 * simply construct a render target, call begin on it, call visit on any cocos<br/>
 * scenes or objects to render them, and call end. For convenience, render texture<br/>
 * adds a sprite as it's display child with the results, so you can simply add<br/>
 * the render texture to your scene and treat it like any other CocosNode.<br/>
 * There are also functions for saving the render texture to disk in PNG or JPG format.
 * @class
 * @extends Node
 *
 * @property {Sprite}    sprite          - The sprite.
 * @property {Sprite}    clearFlags      - Code for "auto" update.
 * @property {Number}       clearDepthVal   - Clear depth value.
 * @property {Boolean}      autoDraw        - Indicate auto draw mode activate or not.
 * @property {Number}       clearStencilVal - Clear stencil value.
 * @property {Color}     clearColorVal   - Clear color value, valid only when "autoDraw" is true.
 */
/**
 * RenderTexture is a generic rendering target. To render things into it,<br/>
 * simply construct a render target, call begin on it, call visit on any cocos<br/>
 * scenes or objects to render them, and call end. For convenience, render texture<br/>
 * adds a sprite as it's display child with the results, so you can simply add<br/>
 * the render texture to your scene and treat it like any other CocosNode.<br/>
 * There are also functions for saving the render texture to disk in PNG or JPG format.
 * @class
 * @extends Node
 *
 * @property {Sprite}    sprite          - The sprite.
 * @property {Sprite}    clearFlags      - Code for "auto" update.
 * @property {Number}       clearDepthVal   - Clear depth value.
 * @property {Boolean}      autoDraw        - Indicate auto draw mode activate or not.
 * @property {Number}       clearStencilVal - Clear stencil value.
 * @property {Color}     clearColorVal   - Clear color value, valid only when "autoDraw" is true.
 */
export class RenderTexture extends Node {
  sprite: Sprite | null = null
  //
  // <p>Code for "auto" update<br/>
  // Valid flags: GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT.<br/>
  // They can be OR'ed. Valid when "autoDraw is YES.</p>
  // @public
  //
  clearFlags = 0

  clearDepthVal = 0
  autoDraw = false

  _texture: Texture2D | null = null
  _pixelFormat = 0

  clearStencilVal = 0
  _clearColor: Color | null = null

  _className = 'RenderTexture'
  declare _renderCmd: any

  /**
   * creates a RenderTexture object with width and height in Points and a pixel format, only RGB and RGBA formats are valid
   * Constructor of RenderTexture for Canvas
   * @param {Number} width
   * @param {Number} height
   * @param {IMAGE_FORMAT_JPEG|IMAGE_FORMAT_PNG|IMAGE_FORMAT_RAWDATA} format
   * @param {Number} depthStencilFormat
   * @example
   * // Example
   * var rt = new RenderTexture(width, height, format, depthStencilFormat)
   */
  constructor(width?: number, height?: number, format?: number, depthStencilFormat?: number) {
    super()
    this._cascadeColorEnabled = true
    this._cascadeOpacityEnabled = true
    this._pixelFormat = Texture2D.PIXEL_FORMAT_RGBA8888
    this._clearColor = new Color(0, 0, 0, 255)

    if (width !== undefined && height !== undefined) {
      format = format || Texture2D.PIXEL_FORMAT_RGBA8888
      depthStencilFormat = depthStencilFormat || 0
      this.initWithWidthAndHeight(width, height, format, depthStencilFormat)
    }
    this.setAnchorPoint(0, 0)
  }

  _createRenderCmd() {
    return new RenderTextureWebGLRenderCmd(this)
  }

  visit(parent: any) {
    const cmd = this._renderCmd,
      parentCmd = parent ? parent._renderCmd : null

    // quick return if not visible
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd)
      return
    }
    cmd.visit(parentCmd)
    renderer.pushRenderCommand(cmd)
    this.sprite!.visit(this)
    cmd._dirtyFlag = 0
  }

  /**
   * Clear RenderTexture.
   */
  cleanup() {
    super.onExit()
    this._renderCmd.cleanup()
  }

  /**
   * Gets the sprite
   * @return {Sprite}
   */
  getSprite() {
    return this.sprite
  }

  /**
   * Set the sprite
   * @param {Sprite} sprite
   */
  setSprite(sprite: Sprite | null) {
    this.sprite = sprite
  }

  /**
   * Used for grab part of screen to a texture.
   * @param {Point} rtBegin
   * @param {Rect} fullRect
   * @param {Rect} fullViewport
   */
  setVirtualViewport(rtBegin: any, fullRect: any, fullViewport: any) {
    this._renderCmd.setVirtualViewport(rtBegin, fullRect, fullViewport)
  }

  /**
   * Initializes the instance of RenderTexture
   * @param {Number} width
   * @param {Number} height
   * @param {IMAGE_FORMAT_JPEG|IMAGE_FORMAT_PNG|IMAGE_FORMAT_RAWDATA} [format]
   * @param {Number} [depthStencilFormat]
   * @return {Boolean}
   */
  initWithWidthAndHeight(width: number, height: number, format?: number, depthStencilFormat?: number) {
    return this._renderCmd.initWithWidthAndHeight(width, height, format, depthStencilFormat)
  }

  /**
   * starts grabbing
   */
  begin() {
    renderer._turnToCacheMode(this.__instanceId)
    this._renderCmd.begin()
  }

  /**
   * starts rendering to the texture while clearing the texture first.<br/>
   * This is more efficient then calling -clear first and then -begin
   * @param {Number} r red 0-255
   * @param {Number} g green 0-255
   * @param {Number} b blue 0-255
   * @param {Number} a alpha 0-255 0 is transparent
   * @param {Number} [depthValue=]
   * @param {Number} [stencilValue=]
   */
  beginWithClear(r: number, g: number, b: number, a: number, depthValue?: number, stencilValue?: number) {
    //todo: only for WebGL?
    const gl = _renderContext
    depthValue = depthValue || gl.COLOR_BUFFER_BIT
    stencilValue = stencilValue || gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

    this._beginWithClear(r, g, b, a, depthValue, stencilValue, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
  }

  _beginWithClear(r: number, g: number, b: number, a: number, depthValue: number, stencilValue: number, flags: number) {
    this.begin()
    this._renderCmd._beginWithClear(r, g, b, a, depthValue, stencilValue, flags)
  }

  /**
   * ends grabbing
   */
  end() {
    this._renderCmd.end()
  }

  /**
   * clears the texture with a color
   * @param {Number|Rect} r red 0-255
   * @param {Number} g green 0-255
   * @param {Number} b blue 0-255
   * @param {Number} a alpha 0-255
   */
  clear(r: number, g: number, b: number, a: number) {
    this.beginWithClear(r, g, b, a)
    this.end()
  }

  /**
   * clears the texture with rect.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  clearRect(x: number, y: number, width: number, height: number) {
    this._renderCmd.clearRect(x, y, width, height)
  }

  /**
   * clears the texture with a specified depth value
   * @param {Number} depthValue
   */
  clearDepth(depthValue: number) {
    this._renderCmd.clearDepth(depthValue)
  }

  /**
   * clears the texture with a specified stencil value
   * @param {Number} stencilValue
   */
  clearStencil(stencilValue: number) {
    this._renderCmd.clearStencil(stencilValue)
  }

  /**
   * Valid flags: GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT. They can be OR'ed. Valid when "autoDraw is YES.
   * @return {Number}
   */
  getClearFlags() {
    return this.clearFlags
  }

  /**
   * Set the clearFlags
   * @param {Number} clearFlags
   */
  setClearFlags(clearFlags: number) {
    this.clearFlags = clearFlags
  }

  /**
   * Clear color value. Valid only when "autoDraw" is true.
   * @return {Color}
   */
  getClearColor() {
    return this._clearColor
  }

  /**
   * Set the clear color value. Valid only when "autoDraw" is true.
   * @param {Color} clearColor The clear color
   */
  setClearColor(clearColor: Color) {
    const locClearColor = this._clearColor!
    locClearColor.r = clearColor.r
    locClearColor.g = clearColor.g
    locClearColor.b = clearColor.b
    locClearColor.a = clearColor.a
    this._renderCmd.updateClearColor(clearColor)
  }

  /**
   * Value for clearDepth. Valid only when autoDraw is true.
   * @return {Number}
   */
  getClearDepth() {
    return this.clearDepthVal
  }

  /**
   * Set value for clearDepth. Valid only when autoDraw is true.
   * @param {Number} clearDepth
   */
  setClearDepth(clearDepth: number) {
    this.clearDepthVal = clearDepth
  }

  /**
   * Value for clear Stencil. Valid only when autoDraw is true
   * @return {Number}
   */
  getClearStencil() {
    return this.clearStencilVal
  }

  /**
   * Set value for clear Stencil. Valid only when autoDraw is true
   * @param {Number} clearStencil
   */
  setClearStencil(clearStencil: number) {
    this.clearStencilVal = clearStencil
  }

  /**
   * When enabled, it will render its children into the texture automatically. Disabled by default for compatibility reasons. <br/>
   * Will be enabled in the future.
   * @return {Boolean}
   */
  isAutoDraw() {
    return this.autoDraw
  }

  /**
   * When enabled, it will render its children into the texture automatically. Disabled by default for compatibility reasons. <br/>
   * Will be enabled in the future.
   * @param {Boolean} autoDraw
   */
  setAutoDraw(autoDraw: boolean) {
    this.autoDraw = autoDraw
  }

  //---- some stub functions for jsb
  /**
   * saves the texture into a file using JPEG format. The file will be saved in the Documents folder.
   * Returns YES if the operation is successful.
   * (doesn't support in HTML5)
   * @param {Number} filePath
   * @param {Number} format
   */
  saveToFile(_filePath: number, _format: number) {
    log('saveToFile isnt supported on Cocos2d-Html5')
  }

  /**
   * creates a new CCImage from with the texture's data. Caller is responsible for releasing it by calling delete.
   * @return {*}
   */
  newCCImage(_flipImage: any) {
    log('saveToFile isnt supported on cocos2d-html5')
    return null
  }

  /**
   * Listen "come to background" message, and save render texture. It only has effect on Android.
   * @param {Class} obj
   */
  listenToBackground(_obj: any) {}

  /**
   * Listen "come to foreground" message and restore the frame buffer object. It only has effect on Android.
   * @param {Class} obj
   */
  listenToForeground(_obj: any) {}

  /**
   * Clear color value. Valid only when "autoDraw" is true.
   */
  get clearColorVal() {
    return this.getClearColor()
  }

  set clearColorVal(clearColor: Color) {
    this.setClearColor(clearColor)
  }
}
