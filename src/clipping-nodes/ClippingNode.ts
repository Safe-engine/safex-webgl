import { Node } from '../core/base-nodes/Node'
import { defineGetterSetter } from '../helper/getset'
import { ClippingNodeWebGLRenderCmd } from './ClippingNodeWebGLRenderCmd'

/**
 * <p>
 *     ClippingNode is a subclass of Node.                                                            <br/>
 *     It draws its content (children) clipped using a stencil.                                               <br/>
 *     The stencil is an other Node that will not be drawn.                                               <br/>
 *     The clipping is done using the alpha part of the stencil (adjusted with an alphaThreshold).
 * </p>
 * @class
 * @extends Node
 * @param {Node} [stencil=null]
 *
 * @property {Number}   alphaThreshold  - Threshold for alpha value.
 * @property {Boolean}  inverted        - Indicate whether in inverted mode.
 * @property {Node}  stencil         - he Node to use as a stencil to do the clipping.
 */
export class ClippingNode extends Node {
  inverted = false
  _alphaThreshold = 0
  _stencil: Node | null = null
  _originStencilProgram: any = null
  declare stencil: Node | null
  declare alphaThreshold: number

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Node} [stencil=null]
   */
  constructor(stencil?: Node | null) {
    super()
    this._stencil = stencil ?? null
    if (this._stencil) {
      this._originStencilProgram = this._stencil.getShaderProgram()
    }
    this.alphaThreshold = 1
    this.inverted = false
    ;(this._renderCmd as any).initStencilBits()
  }

  /**
   * <p>
   *     Event callback that is invoked every time when node enters the 'stage'.                                   <br/>
   *     If the CCNode enters the 'stage' with a transition, this event is called when the transition starts.        <br/>
   *     During onEnter you can't access a "sister/brother" node.                                                    <br/>
   *     If you override onEnter, you must call its parent's onEnter function with this._super().
   * </p>
   * @function
   */
  onEnter() {
    super.onEnter()
    if (this._stencil) this._stencil._performRecursive(Node._stateCallbackType.onEnter)
  }

  /**
   * <p>
   *     Event callback that is invoked when the node enters in the 'stage'.                                                        <br/>
   *     If the node enters the 'stage' with a transition, this event is called when the transition finishes.                       <br/>
   *     If you override onEnterTransitionDidFinish, you shall call its parent's onEnterTransitionDidFinish with this._super()
   * </p>
   * @function
   */
  onEnterTransitionDidFinish() {
    super.onEnterTransitionDidFinish()
    if (this._stencil) this._stencil._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish)
  }

  /**
   * <p>
   *     callback that is called every time the node leaves the 'stage'.  <br/>
   *     If the node leaves the 'stage' with a transition, this callback is called when the transition starts. <br/>
   *     If you override onExitTransitionDidStart, you shall call its parent's onExitTransitionDidStart with this._super()
   * </p>
   * @function
   */
  onExitTransitionDidStart() {
    if (this._stencil) this._stencil._performRecursive(Node._stateCallbackType.onExitTransitionDidStart)
    super.onExitTransitionDidStart()
  }

  /**
   * <p>
   * callback that is called every time the node leaves the 'stage'. <br/>
   * If the node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>
   * During onExit you can't access a sibling node.                                                             <br/>
   * If you override onExit, you shall call its parent's onExit with this._super().
   * </p>
   * @function
   */
  onExit() {
    if (this._stencil) this._stencil._performRecursive(Node._stateCallbackType.onExit)
    super.onExit()
  }

  visit(parent: Node) {
    ;(this._renderCmd as any).clippingVisit(parent?._renderCmd)
  }

  _visitChildren() {
    if (this._reorderChildDirty) {
      this.sortAllChildren()
    }
    const children = this._children
    let child
    for (let i = 0, len = children.length; i < len; i++) {
      child = children[i]
      if (child && child._visible) {
        child.visit(this)
      }
    }
    this._renderCmd._dirtyFlag = 0
  }

  /**
   * <p>
   * The alpha threshold.                                                                                   <br/>
   * The content is drawn only where the stencil have pixel with alpha greater than the alphaThreshold.     <br/>
   * Should be a float between 0 and 1.                                                                     <br/>
   * This default to 1 (so alpha test is disabled).
   * </P>
   * @return {Number}
   */
  getAlphaThreshold() {
    return this._alphaThreshold
  }

  /**
   * set alpha threshold.
   * @param {Number} alphaThreshold
   */
  setAlphaThreshold(alphaThreshold: number) {
    if (alphaThreshold === 1 && alphaThreshold !== this._alphaThreshold) {
      // should reset program used by _stencil
      ;(this._renderCmd as any).resetProgramByStencil()
    }
    this._alphaThreshold = alphaThreshold
  }

  /**
   * <p>
   *     Inverted. If this is set to YES,                                                                 <br/>
   *     the stencil is inverted, so the content is drawn where the stencil is NOT drawn.                 <br/>
   *     This default to NO.
   * </p>
   * @return {Boolean}
   */
  isInverted() {
    return this.inverted
  }

  /**
   * set whether or not invert of stencil
   * @param {Boolean} inverted
   */
  setInverted(inverted: boolean) {
    this.inverted = inverted
  }

  /**
   * The Node to use as a stencil to do the clipping.                                   <br/>
   * The stencil node will be retained. This default to nil.
   * @return {Node}
   */
  getStencil() {
    return this._stencil
  }

  /**
   * Set stencil.
   * @function
   * @param {Node} stencil
   */
  setStencil(stencil: Node | null) {
    if (this._stencil === stencil) return
    if (stencil) this._originStencilProgram = stencil.getShaderProgram()
    ;(this._renderCmd as any).setStencil(stencil)
  }

  _createRenderCmd() {
    return new ClippingNodeWebGLRenderCmd(this)
  }
}

// Set _className on prototype for compatibility
ClippingNode.prototype._className = 'ClippingNode'

// Extended properties
const _p = ClippingNode.prototype
defineGetterSetter(_p, 'stencil', _p.getStencil, _p.setStencil)
defineGetterSetter(_p, 'alphaThreshold', _p.getAlphaThreshold, _p.setAlphaThreshold)
