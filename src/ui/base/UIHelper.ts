import { Sprite } from '../../core'
import { Rect } from '../../core/cocoa/Geometry'
import { textureCache } from '../../textures'
import { LayoutParameter } from '../layout/UILayoutParameter'

/**
 * helper is the singleton object which is the Helper object contains some functions for seek widget
 * @class
 * @name helper
 */
export const helper = {
  /**
   * Finds a widget whose tag equals to param tag from root widget.
   * @param {Widget} root
   * @param {number} tag
   * @returns {Widget}
   */
  seekWidgetByTag: function (root, tag) {
    if (!root) return null
    if (root.getTag() === tag) return root

    const arrayRootChildren = root.getChildren()
    const length = arrayRootChildren.length
    for (let i = 0; i < length; i++) {
      const child = arrayRootChildren[i]
      const res = helper.seekWidgetByTag(child, tag)
      if (res !== null) return res
    }
    return null
  },

  /**
   * Finds a widget whose name equals to param name from root widget.
   * @param {Widget} root
   * @param {String} name
   * @returns {Widget}
   */
  seekWidgetByName: function (root, name) {
    if (!root) return null
    if (root.getName() === name) return root
    const arrayRootChildren = root.getChildren()
    const length = arrayRootChildren.length
    for (let i = 0; i < length; i++) {
      const child = arrayRootChildren[i]
      const res = helper.seekWidgetByName(child, name)
      if (res !== null) return res
    }
    return null
  },

  /**
   * Finds a widget whose name equals to param name from root widget.
   * RelativeLayout will call this method to find the widget witch is needed.
   * @param {Widget} root
   * @param {String} name
   * @returns {Widget}
   */
  seekWidgetByRelativeName: function (root, name) {
    if (!root) return null
    const arrayRootChildren = root.getChildren()
    const length = arrayRootChildren.length
    for (let i = 0; i < length; i++) {
      const child = arrayRootChildren[i]
      const layoutParameter = child.getLayoutParameter(LayoutParameter.RELATIVE)
      if (layoutParameter && layoutParameter.getRelativeName() === name) return child
    }
    return null
  },

  /**
   * Finds a widget whose action tag equals to param name from root widget.
   * @param {Widget} root
   * @param {Number} tag
   * @returns {Widget}
   */
  seekActionWidgetByActionTag: function (root, tag) {
    if (!root) return null
    if (root.getActionTag() === tag) return root
    const arrayRootChildren = root.getChildren()
    for (let i = 0; i < arrayRootChildren.length; i++) {
      const child = arrayRootChildren[i]
      const res = helper.seekActionWidgetByActionTag(child, tag)
      if (res !== null) return res
    }
    return null
  },

  _activeLayout: true,

  changeLayoutSystemActiveState: function (active) {
    this._activeLayout = active
  },

  /**
   * restrict capInsetSize, when the capInsets' width is larger than the textureSize, it will restrict to 0,   <br/>
   * the height goes the same way as width.
   * @param {Rect} capInsets
   * @param {Size} textureSize
   */
  restrictCapInsetRect: function (capInsets, textureSize) {
    let x = capInsets.x,
      y = capInsets.y
    let width = capInsets.width,
      height = capInsets.height

    if (textureSize.width < width) {
      x = 0.0
      width = 0.0
    }
    if (textureSize.height < height) {
      y = 0.0
      height = 0.0
    }
    return Rect(x, y, width, height)
  },

  _createSpriteFromBase64: function (base64String, key) {
    let texture2D = textureCache.getTextureForKey(key)

    if (!texture2D) {
      const image = new Image()
      image.src = base64String
      textureCache.cacheImage(key, image)
      texture2D = textureCache.getTextureForKey(key)
    }

    const sprite = new Sprite(texture2D)

    return sprite
  },
}
