import { isString } from '../../helper/checkType'
import { _LogInfos, assert, log } from '../../helper/Debugger'
import { defineGetterSetter } from '../../helper/getset'
import { Texture2D, textureCache } from '../../textures'
import { Node } from '../base-nodes/Node'
import { BLEND_DST, BLEND_SRC, BlendFunc } from '../platform'
import { Sprite } from './Sprite'

export class SpriteBatchNode extends Node {
  _blendFunc: any = null
  // all descendants: chlidren, gran children, etc...
  _texture: any = null
  _className = 'SpriteBatchNode'

  constructor(fileImage?: any) {
    super()
    this._blendFunc = new BlendFunc(BLEND_SRC, BLEND_DST)

    let texture2D
    if (isString(fileImage)) {
      texture2D = textureCache.getTextureForKey(fileImage)
      if (!texture2D) texture2D = textureCache.addImage(fileImage)
    } else if (fileImage instanceof Texture2D) {
      texture2D = fileImage
    }

    if (texture2D) {
      this.initWithTexture(texture2D)
    }
  }

  /**
   * <p>
   *    Same as addChild
   * </p>
   * @param {Sprite} child
   * @param {Number} z zOrder
   * @param {Number} aTag
   * @return {SpriteBatchNode}
   * @deprecated since v3.12
   */
  addSpriteWithoutQuad(child: any, z?: any, aTag?: any) {
    this.addChild(child, z, aTag)
    return this
  }

  // property
  /**
   * Return null, no texture atlas is used any more
   * @return {TextureAtlas}
   * @deprecated since v3.12
   */
  getTextureAtlas() {
    return null
  }

  /**
   * TextureAtlas of SpriteBatchNode setter
   * @param {TextureAtlas} textureAtlas
   * @deprecated since v3.12
   */
  // setTextureAtlas(textureAtlas: any) { }

  /**
   * Return Descendants of SpriteBatchNode
   * @return {Array}
   * @deprecated since v3.12
   */
  getDescendants() {
    return this._children
  }

  /**
   * <p>
   *    Initializes a SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
   *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
   *    The file will be loaded using the TextureMgr.<br/>
   *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
   * </p>
   * @param {String} fileImage
   * @param {Number} capacity
   * @return {Boolean}
   */
  initWithFile(fileImage: any, capacity?: any) {
    let texture2D = textureCache.getTextureForKey(fileImage)
    if (!texture2D) texture2D = textureCache.addImage(fileImage)
    return this.initWithTexture(texture2D, capacity)
  }

  /**
   * <p>
   *    initializes a SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
   *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
   *    The file will be loaded using the TextureMgr.<br/>
   *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
   * </p>
   * @param {String} fileImage
   * @param {Number} capacity
   * @return {Boolean}
   */
  init(fileImage?: any, capacity?: any) {
    let texture2D = textureCache.getTextureForKey(fileImage)
    if (!texture2D) texture2D = textureCache.addImage(fileImage)
    return this.initWithTexture(texture2D, capacity)
  }

  /**
   * Do nothing
   * @deprecated since v3.12
   */
  // increaseAtlasCapacity() { }

  /**
   * Removes a child given a certain index. It will also cleanup the running actions depending on the cleanup parameter.
   * @warning Removing a child from a SpriteBatchNode is very slow
   * @param {Number} index
   * @param {Boolean} doCleanup
   */
  removeChildAtIndex(index: any, doCleanup?: any) {
    this.removeChild(this._children[index], doCleanup)
  }

  /**
   * Do nothing
   * @param {Sprite} pobParent
   * @param {Number} index
   * @return {Number}
   * @deprecated since v3.12
   */
  rebuildIndexInOrder(pobParent: any, index: any) {
    return index
  }

  /**
   * Returns highest atlas index in child
   * @param {Sprite} sprite
   * @return {Number}
   * @deprecated since v3.12
   */
  highestAtlasIndexInChild(sprite: any): any {
    const children = sprite.children
    if (!children || children.length === 0) return sprite.zIndex
    else return this.highestAtlasIndexInChild(children[children.length - 1])
  }

  /**
   * Returns lowest atlas index in child
   * @param {Sprite} sprite
   * @return {Number}
   * @deprecated since v3.12
   */
  lowestAtlasIndexInChild(sprite: any): any {
    const children = sprite.children
    if (!children || children.length === 0) return sprite.zIndex
    else return this.lowestAtlasIndexInChild(children[children.length - 1])
  }

  /**
   * Returns index for child
   * @param {Sprite} sprite
   * @return {Number}
   * @deprecated since v3.12
   */
  atlasIndexForChild(sprite: any) {
    return sprite.zIndex
  }

  /**
   * Sprites use this to start sortChildren, don't call this manually
   * @param {Boolean} reorder
   * @deprecated since v3.12
   */
  reorderBatch(reorder: any) {
    this._reorderChildDirty = reorder
  }

  /**
   * Sets the source and destination blending function for the texture
   * @param {Number | BlendFunc} src
   * @param {Number} dst
   */
  setBlendFunc(src: any, dst?: any) {
    if (dst === undefined) this._blendFunc = src
    else this._blendFunc = { src: src, dst: dst }
  }

  /**
   * Returns the blending function used for the texture
   * @return {BlendFunc}
   */
  getBlendFunc() {
    return new BlendFunc(this._blendFunc.src, this._blendFunc.dst)
  }

  /**
   * <p>
   *   Updates a quad at a certain index into the texture atlas. The CCSprite won't be added into the children array.                 <br/>
   *   This method should be called only when you are dealing with very big AtlasSrite and when most of the Sprite won't be updated.<br/>
   *   For example: a tile map (TMXMap) or a label with lots of characters (BitmapFontAtlas)<br/>
   * </p>
   * @function
   * @param {Sprite} sprite
   * @param {Number} index
   */
  updateQuadFromSprite(sprite: any, index?: any) {
    assert(sprite, _LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2)
    if (!(sprite instanceof Sprite)) {
      log(_LogInfos.CCSpriteBatchNode_updateQuadFromSprite)
      return
    }

    //
    // update the quad directly. Don't add the sprite to the scene graph
    //
    sprite.dirty = true
    // UpdateTransform updates the textureAtlas quad
    sprite._renderCmd.transform(this._renderCmd, true)
  }

  /**
   * <p>
   *    Same as addChild(sprite, index)
   * </p>
   * @function
   * @param {Sprite} sprite
   * @param {Number} index
   * @deprecated since v3.12
   */
  insertQuadFromSprite(sprite: any, index: any) {
    this.addChild(sprite, index)
  }

  /**
   * Same as addChild(sprite, index)
   * @param {Sprite} sprite The child sprite
   * @param {Number} index The insert index
   * @deprecated since v3.12
   */
  insertChild(sprite: any, index: any) {
    this.addChild(sprite, index)
  }

  /**
   * Add child at the end
   * @function
   * @param {Sprite} sprite
   */
  appendChild(sprite: any) {
    this.sortAllChildren()
    const lastLocalZOrder = this._children[this._children.length - 1]._localZOrder
    this.addChild(sprite, lastLocalZOrder + 1)
  }

  /**
   * Same as removeChild
   * @function
   * @param {Sprite} sprite
   * @param {Boolean} [cleanup=true]  true if all running actions and callbacks on the child node will be cleanup, false otherwise.
   * @deprecated since v3.12
   */
  removeSpriteFromAtlas(sprite: any, cleanup?: any) {
    this.removeChild(sprite, cleanup)
  }

  /**
   * Set the texture property
   * @function
   * @param {Texture2D} tex
   * @return {Boolean}
   */
  initWithTexture(tex: any, capacity?: any) {
    this.setTexture(tex)
    return true
  }

  // CCTextureProtocol
  /**
   * Returns texture of the sprite batch node
   * @function
   * @return {Texture2D}
   */
  getTexture() {
    return this._texture
  }

  /**
   * Sets the texture of the sprite batch node.
   * @function
   * @param {Texture2D} texture
   */
  setTexture(texture: any) {
    this._texture = texture

    if (texture._textureLoaded) {
      const children = this._children
      const len = children.length
      for (let i = 0; i < len; ++i) {
        ;(children[i] as any).setTexture(texture)
      }
    } else {
      texture.addEventListener(
        'load',
        () => {
          const children = this._children
          const len = children.length
          for (let i = 0; i < len; ++i) {
            ;(children[i] as any).setTexture(texture)
          }
        },
        this,
      )
    }
  }

  setShaderProgram(newShaderProgram: any) {
    this._renderCmd.setShaderProgram(newShaderProgram)
    const children = this._children
    const len = children.length
    for (let i = 0; i < len; ++i) {
      ;(children[i] as any).setShaderProgram(newShaderProgram)
    }
  }

  /**
   * Add child to the sprite batch node (override addChild of Node)
   * @function
   * @override
   * @param {Sprite} child
   * @param {Number} [zOrder]
   * @param {Number} [tag]
   */
  addChild(child: any, zOrder?: any, tag?: any) {
    assert(child !== undefined, _LogInfos.CCSpriteBatchNode_addChild_3)

    if (!this._isValidChild(child)) return

    zOrder = zOrder === undefined ? child.zIndex : zOrder
    tag = tag === undefined ? child.tag : tag
    super.addChild(child, zOrder, tag)

    // Apply shader
    if (this._renderCmd._shaderProgram) {
      child.shaderProgram = this._renderCmd._shaderProgram
    }
  }

  _isValidChild(child: any) {
    if (!(child instanceof Sprite)) {
      log(_LogInfos.Sprite_addChild_4)
      return false
    }
    if (child.getTexture() !== this._texture) {
      log(_LogInfos.Sprite_addChild_5)
      return false
    }
    return true
  }
}

const _p: any = SpriteBatchNode.prototype

// Override properties
defineGetterSetter(_p, 'texture', _p.getTexture, _p.setTexture)
defineGetterSetter(_p, 'shaderProgram', _p.getShaderProgram, _p.setShaderProgram)
