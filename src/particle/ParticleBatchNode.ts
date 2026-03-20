import { game, renderer } from '..'
import { BLEND_DST, BLEND_SRC, BlendFunc, Node, ONE_MINUS_SRC_ALPHA, SRC_ALPHA } from '../core'
import { isString } from '../helper/checkType'
import { log } from '../helper/Debugger'
import { _renderType } from '../helper/engine'
import { defineGetterSetter } from '../helper/getset'
import { Texture2D, textureCache } from '../textures'
import { TextureAtlas } from '../textures/TextureAtlas'
import { ParticleBatchNodeWebGLRenderCmd } from './ParticleBatchNodeWebGLRenderCmd'

export const PARTICLE_DEFAULT_CAPACITY = 500

/**
 * <p>
 *    ParticleBatchNode is like a batch node: if it contains children, it will draw them in 1 single OpenGL call  <br/>
 *    (often known as "batch draw").  </br>
 *
 *    A ParticleBatchNode can reference one and only one texture (one image file, one texture atlas).<br/>
 *    Only the ParticleSystems that are contained in that texture can be added to the SpriteBatchNode.<br/>
 *    All ParticleSystems added to a SpriteBatchNode are drawn in one OpenGL ES draw call.<br/>
 *    If the ParticleSystems are not added to a ParticleBatchNode then an OpenGL ES draw call will be needed for each one, which is less efficient.</br>
 *
 *    Limitations:<br/>
 *    - At the moment only ParticleSystem is supported<br/>
 *    - All systems need to be drawn with the same parameters, blend function, aliasing, texture<br/>
 *
 *    Most efficient usage<br/>
 *    - Initialize the ParticleBatchNode with the texture and enough capacity for all the particle systems<br/>
 *    - Initialize all particle systems and add them as child to the batch node<br/>
 * </p>
 * @class
 * @extends ParticleSystem
 * @param {String|Texture2D} fileImage
 * @param {Number} capacity
 *
 * @property {Texture2D|HTMLImageElement|HTMLCanvasElement}  texture         - The used texture
 * @property {TextureAtlas}                                  textureAtlas    - The texture atlas used for drawing the quads
 *
 * @example
 * 1.
 * //Create a ParticleBatchNode with image path  and capacity
 * var particleBatchNode = new ParticleBatchNode("res/grossini_dance.png",30);
 *
 * 2.
 * //Create a ParticleBatchNode with a texture and capacity
 * var texture = TextureCache.getInstance().addImage("res/grossini_dance.png");
 * var particleBatchNode = new ParticleBatchNode(texture, 30);
 */
export class ParticleBatchNode extends Node {
  textureAtlas: TextureAtlas = null
  //the blend function used for drawing the quads
  _blendFunc: BlendFunc = null
  _className = 'ParticleBatchNode'
  declare _renderCmd: ParticleBatchNodeWebGLRenderCmd

  /**
   * initializes the particle system with the name of a file on disk (for a list of supported formats look at the Texture2D class), a capacity of particles
   * Constructor of ParticleBatchNode
   * @param {String|Texture2D} fileImage
   * @param {Number} capacity
   * @example
   * 1.
   * //Create a ParticleBatchNode with image path  and capacity
   * var particleBatchNode = new ParticleBatchNode("res/grossini_dance.png",30);
   *
   * 2.
   * //Create a ParticleBatchNode with a texture and capacity
   * var texture = TextureCache.getInstance().addImage("res/grossini_dance.png");
   * var particleBatchNode = new ParticleBatchNode(texture, 30);
   */
  constructor(fileImage?: any, capacity?: any) {
    super()
    this._blendFunc = { src: BLEND_SRC, dst: BLEND_DST }
    if (isString(fileImage)) {
      this.init(fileImage, capacity)
    } else if (fileImage instanceof Texture2D) {
      this.initWithTexture(fileImage, capacity)
    }
  }

  _createRenderCmd() {
    if (_renderType === game.RENDER_TYPE_CANVAS) return new (ParticleBatchNode as any).CanvasRenderCmd(this)
    else return new (ParticleBatchNode as any).WebGLRenderCmd(this)
  }

  /**
   * initializes the particle system with Texture2D, a capacity of particles
   * @param {Texture2D|HTMLImageElement|HTMLCanvasElement} texture
   * @param {Number} capacity
   * @return {Boolean}
   */
  initWithTexture(texture: any, capacity?: any) {
    this.textureAtlas = new TextureAtlas()
    this.textureAtlas.initWithTexture(texture, capacity)

    // no lazy alloc in this node
    this._children.length = 0

    this._renderCmd._initWithTexture()
    return true
  }

  /**
   * initializes the particle system with the name of a file on disk (for a list of supported formats look at the Texture2D class), a capacity of particles
   * @param {String} fileImage
   * @param {Number} capacity
   * @return {Boolean}
   */
  initWithFile(fileImage: any, capacity?: any) {
    const tex = textureCache.addImage(fileImage)
    return this.initWithTexture(tex, capacity)
  }

  /**
   * initializes the particle system with the name of a file on disk (for a list of supported formats look at the Texture2D class), a capacity of particles
   * @param {String} fileImage
   * @param {Number} capacity
   * @return {Boolean}
   */
  init(fileImage?: any, capacity?: any) {
    const tex = textureCache.addImage(fileImage)
    return this.initWithTexture(tex, capacity)
  }

  visit(parent?: any) {
    const cmd = this._renderCmd,
      parentCmd = parent ? parent._renderCmd : null

    // quick return if not visible
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd)
      return
    }

    cmd.visit(parentCmd)
    renderer.pushRenderCommand(cmd)
    cmd._dirtyFlag = 0
  }

  /**
   * Add a child into the ParticleBatchNode
   * @param {ParticleSystem} child
   * @param {Number} zOrder
   * @param {Number} tag
   */
  addChild(child: any, zOrder?: any, tag?: any) {
    if (!child) throw new Error('ParticleBatchNode.addChild() : child should be non-null')
    if (child.constructor.name !== 'ParticleSystem')
      throw new Error('ParticleBatchNode.addChild() : only supports ParticleSystem as children')
    zOrder = zOrder == null ? child.zIndex : zOrder
    tag = tag == null ? child.tag : tag

    if (child.getTexture() !== this.textureAtlas.texture)
      throw new Error('ParticleSystem.addChild() : the child is not using the same texture id')

    // If this is the 1st children, then copy blending function
    const childBlendFunc = child.getBlendFunc()
    if (this._children.length === 0) this.setBlendFunc(childBlendFunc)
    else {
      if (childBlendFunc.src !== this._blendFunc.src || childBlendFunc.dst !== this._blendFunc.dst) {
        log('ParticleSystem.addChild() : Cant add a ParticleSystem that uses a different blending function')
        return
      }
    }

    //no lazy sorting, so don't call super addChild, call helper instead
    const pos = this._addChildHelper(child, zOrder, tag)

    //get new atlasIndex
    let atlasIndex

    if (pos !== 0 && pos !== null) {
      const p = this._children[pos - 1] as any
      atlasIndex = p.getAtlasIndex() + p.getTotalParticles()
    } else atlasIndex = 0

    this.insertChild(child, atlasIndex)

    // update quad info
    child.setBatchNode(this)
  }

  /**
   * Inserts a child into the ParticleBatchNode
   * @param {ParticleSystem} pSystem
   * @param {Number} index
   */
  insertChild(pSystem: any, index: any) {
    const totalParticles = pSystem.getTotalParticles()
    const locTextureAtlas = this.textureAtlas
    const totalQuads = locTextureAtlas.totalQuads
    pSystem.setAtlasIndex(index)
    if (totalQuads + totalParticles > locTextureAtlas.getCapacity()) {
      this._increaseAtlasCapacityTo(totalQuads + totalParticles)
      // after a realloc empty quads of textureAtlas can be filled with gibberish (realloc doesn't perform calloc), insert empty quads to prevent it
      locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.getCapacity() - totalParticles, totalParticles)
    }

    // make room for quads, not necessary for last child
    if (pSystem.getAtlasIndex() + totalParticles !== totalQuads) locTextureAtlas.moveQuadsFromIndex(index, index + totalParticles)

    // increase totalParticles here for new particles, update method of particlesystem will fill the quads
    locTextureAtlas.increaseTotalQuadsWith(totalParticles)
    this._updateAllAtlasIndexes()
  }

  /**
   * @param {ParticleSystem} child
   * @param {Boolean} cleanup
   */
  removeChild(child: any, cleanup?: any) {
    // explicit nil handling
    if (child == null) return

    if (child.constructor.name !== 'ParticleSystem')
      throw new Error('ParticleBatchNode.removeChild(): only supports ParticleSystem as children')
    if (this._children.indexOf(child) === -1) {
      log('ParticleBatchNode.removeChild(): doesnt contain the sprite. Cant remove it')
      return
    }

    super.removeChild(child, cleanup)

    const locTextureAtlas = this.textureAtlas
    // remove child helper
    locTextureAtlas.removeQuadsAtIndex(child.getAtlasIndex(), child.getTotalParticles())

    // after memmove of data, empty the quads at the end of array
    locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.totalQuads, child.getTotalParticles())

    // paticle could be reused for self rendering
    child.setBatchNode(null)

    this._updateAllAtlasIndexes()
  }

  /**
   * Reorder will be done in this function, no "lazy" reorder to particles
   * @param {ParticleSystem} child
   * @param {Number} zOrder
   */
  reorderChild(child: any, zOrder: any) {
    if (!child) throw new Error('ParticleBatchNode.reorderChild(): child should be non-null')
    if (child.constructor.name !== 'ParticleSystem' && child.constructor.name !== 'QuadParticleSystem')
      throw new Error('ParticleBatchNode.reorderChild(): only supports QuadParticleSystems as children')
    if (this._children.indexOf(child) === -1) {
      log('ParticleBatchNode.reorderChild(): Child doesnt belong to batch')
      return
    }

    // no reordering if only 1 child
    if (this._children.length > 1) {
      const getIndexes = this._getCurrentIndex(child, zOrder)

      if (getIndexes.oldIndex !== getIndexes.newIndex) {
        // reorder m_pChildren.array
        this._children.splice(getIndexes.oldIndex, 1)
        this._children.splice(getIndexes.newIndex, 0, child)

        // save old altasIndex
        const oldAtlasIndex = child.getAtlasIndex()

        // update atlas index
        this._updateAllAtlasIndexes()

        // Find new AtlasIndex
        let newAtlasIndex = 0
        const locChildren = this._children
        for (let i = 0; i < locChildren.length; i++) {
          const pNode = locChildren[i]
          if (pNode === child) {
            newAtlasIndex = child.getAtlasIndex()
            break
          }
        }

        // reorder textureAtlas quads
        this.textureAtlas.moveQuadsFromIndex(oldAtlasIndex, child.getTotalParticles(), newAtlasIndex)

        child.updateWithNoTime()
      }
    }
    child._setLocalZOrder(zOrder)
  }

  /**
   * @param {Number} index
   * @param {Boolean} doCleanup
   */
  removeChildAtIndex(index: any, doCleanup?: any) {
    this.removeChild(this._children[index], doCleanup)
  }

  /**
   * @param {Boolean} [doCleanup=true]
   */
  removeAllChildren(doCleanup?: any) {
    const locChildren = this._children
    for (let i = 0; i < locChildren.length; i++) {
      ;(locChildren[i] as any).setBatchNode(null)
    }
    super.removeAllChildren(doCleanup)
    this.textureAtlas.removeAllQuads()
  }

  /**
   * disables a particle by inserting a 0'd quad into the texture atlas
   * @param {Number} particleIndex
   */
  disableParticle(particleIndex: any) {
    const quad = this.textureAtlas.quads[particleIndex]
    quad.br.vertices.x =
      quad.br.vertices.y =
      quad.tr.vertices.x =
      quad.tr.vertices.y =
      quad.tl.vertices.x =
      quad.tl.vertices.y =
      quad.bl.vertices.x =
      quad.bl.vertices.y =
        0.0
    this.textureAtlas._setDirty(true)
  }

  /**
   * returns the used texture
   * @return {Texture2D}
   */
  getTexture() {
    return this.textureAtlas.texture
  }

  /**
   * sets a new texture. it will be retained
   * @param {Texture2D} texture
   */
  setTexture(texture: any) {
    this.textureAtlas.texture = texture

    // If the new texture has No premultiplied alpha, AND the blendFunc hasn't been changed, then update it
    const locBlendFunc = this._blendFunc
    if (texture && !texture.hasPremultipliedAlpha() && locBlendFunc.src === BLEND_SRC && locBlendFunc.dst === BLEND_DST) {
      locBlendFunc.src = SRC_ALPHA
      locBlendFunc.dst = ONE_MINUS_SRC_ALPHA
    }
  }

  /**
   * set the blending function used for the texture
   * @param {Number|Object} src
   * @param {Number} dst
   */
  setBlendFunc(src: any, dst?: any) {
    if (dst === undefined) {
      this._blendFunc.src = src.src
      this._blendFunc.dst = src.dst
    } else {
      this._blendFunc.src = src
      this._blendFunc.dst = dst
    }
  }

  /**
   * returns the blending function used for the texture
   * @return {BlendFunc}
   */
  getBlendFunc() {
    return new BlendFunc(this._blendFunc.src, this._blendFunc.dst)
  }

  _updateAllAtlasIndexes() {
    let index = 0
    const locChildren = this._children
    for (let i = 0; i < locChildren.length; i++) {
      const child = locChildren[i] as any
      child.setAtlasIndex(index)
      index += child.getTotalParticles()
    }
  }

  _increaseAtlasCapacityTo(quantity: any) {
    log(`cocos2d: ParticleBatchNode: resizing TextureAtlas capacity from [${this.textureAtlas.getCapacity()}] to [${quantity}].`)

    if (!this.textureAtlas.resizeCapacity(quantity)) {
      // serious problems
      log('ParticleBatchNode._increaseAtlasCapacityTo() : WARNING: Not enough memory to resize the atlas')
    }
  }

  _searchNewPositionInChildrenForZ(z: any) {
    const locChildren = this._children
    const count = locChildren.length
    for (let i = 0; i < count; i++) {
      if (locChildren[i].getLocalZOrder() > z) return i
    }
    return count
  }

  _getCurrentIndex(child: any, z: any) {
    let foundCurrentIdx = false
    let foundNewIdx = false

    let newIndex = 0
    let oldIndex = 0

    let minusOne = 0
    const locChildren = this._children
    const count = locChildren.length
    for (let i = 0; i < count; i++) {
      const pNode = locChildren[i]
      // new index
      if (pNode.getLocalZOrder() > z && !foundNewIdx) {
        newIndex = i
        foundNewIdx = true

        if (foundCurrentIdx && foundNewIdx) break
      }
      // current index
      if (child === pNode) {
        oldIndex = i
        foundCurrentIdx = true
        if (!foundNewIdx) minusOne = -1
        if (foundCurrentIdx && foundNewIdx) break
      }
    }
    if (!foundNewIdx) newIndex = count
    newIndex += minusOne
    return { newIndex: newIndex, oldIndex: oldIndex }
  }

  //
  // <p>
  //     don't use lazy sorting, reordering the particle systems quads afterwards would be too complex                                    <br/>
  //     XXX research whether lazy sorting + freeing current quads and calloc a new block with size of capacity would be faster           <br/>
  //     XXX or possibly using vertexZ for reordering, that would be fastest                                                              <br/>
  //     this helper is almost equivalent to CCNode's addChild, but doesn't make use of the lazy sorting                                  <br/>
  // </p>
  // @param {ParticleSystem} child
  // @param {Number} z
  // @param {Number} aTag
  // @return {Number}
  // @private
  //
  _addChildHelper(child: any, z: any, aTag: any) {
    if (!child) throw new Error('ParticleBatchNode._addChildHelper(): child should be non-null')
    if (child.parent) {
      log('ParticleBatchNode._addChildHelper(): child already added. It cant be added again')
      return null
    }

    if (!this._children) this._children = []

    //don't use a lazy insert
    const pos = this._searchNewPositionInChildrenForZ(z)

    this._children.splice(pos, 0, child)
    child.tag = aTag
    child._setLocalZOrder(z)
    child.parent = this
    if (this._running) {
      child._performRecursive(Node._stateCallbackType.onEnter)
      child._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish)
    }
    return pos
  }

  _updateBlendFunc() {
    if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
      this._blendFunc.src = SRC_ALPHA
      this._blendFunc.dst = ONE_MINUS_SRC_ALPHA
    }
  }

  /**
   * return the texture atlas used for drawing the quads
   * @return {TextureAtlas}
   */
  getTextureAtlas() {
    return this.textureAtlas
  }

  /**
   * set the texture atlas used for drawing the quads
   * @param {TextureAtlas} textureAtlas
   */
  setTextureAtlas(textureAtlas: TextureAtlas) {
    this.textureAtlas = textureAtlas
  }
}
const _p: any = ParticleBatchNode.prototype
defineGetterSetter(_p, 'texture', _p.getTexture, _p.setTexture)
