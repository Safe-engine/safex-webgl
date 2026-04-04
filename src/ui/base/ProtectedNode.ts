import { global, renderer } from '../..'
import { Node, NODE_TAG_INVALID } from '../../core/base-nodes/Node'
import { assert, log } from '../../helper/Debugger'
import { ProtectedNodeWebGLRenderCmd } from './ProtectedNodeWebGLRenderCmd'

export class ProtectedNode extends Node {
  declare _protectedChildren: ProtectedNode[]
  declare _reorderProtectedChildDirty: boolean
  declare _renderCmd: ProtectedNodeWebGLRenderCmd

  constructor() {
    super()
    this._protectedChildren = []
    this._reorderProtectedChildDirty = false
  }

  _insertProtectedChild(child, z) {
    this._reorderProtectedChildDirty = true
    this._protectedChildren.push(child)
    child._setLocalZOrder(z)
  }

  visit(parent) {
    const cmd = this._renderCmd
    const parentCmd = parent ? parent._renderCmd : null

    // quick return if not visible
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd)
      return
    }

    const rendererRef = renderer
    let i
    const children = this._children
    const len = children.length
    let child
    let j
    const pChildren = this._protectedChildren
    const pLen = pChildren.length
    let pChild

    cmd.visit(parentCmd)

    // const locGrid = this.grid
    // if (locGrid && locGrid._active) locGrid.beforeDraw()

    if (this._reorderChildDirty) this.sortAllChildren()
    if (this._reorderProtectedChildDirty) this.sortAllProtectedChildren()

    // draw children zOrder < 0
    for (i = 0; i < len; i++) {
      child = children[i]
      if (child._localZOrder < 0) {
        child.visit(this)
      } else {
        break
      }
    }
    for (j = 0; j < pLen; j++) {
      pChild = pChildren[j]
      if (pChild && pChild._localZOrder < 0) {
        cmd._changeProtectedChild(pChild)
        pChild.visit(this)
      } else break
    }

    rendererRef.pushRenderCommand(cmd)

    for (; i < len; i++) {
      children[i].visit(this)
    }
    for (; j < pLen; j++) {
      pChild = pChildren[j]
      if (!pChild) continue
      cmd._changeProtectedChild(pChild)
      pChild.visit(this)
    }

    // if (locGrid && locGrid._active) locGrid.afterDraw(this)

    cmd._dirtyFlag = 0
  }

  /**
   * <p>
   *  Adds a child to the container with z order and tag                                                                         <br/>
   *  If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.     <br/>
   *  </p>
   * @param {Node} child  A child node
   * @param {Number} [localZOrder]  Z order for drawing priority. Please refer to `setLocalZOrder(int)`
   * @param {Number} [tag]  An integer to identify the node easily. Please refer to `setTag(int)`
   */
  addProtectedChild(child, localZOrder?, tag?) {
    assert(child != null, 'child must be non-nil')
    assert(!child.parent, 'child already added. It cant be added again')

    localZOrder = localZOrder || child.getLocalZOrder()
    if (tag) child.setTag(tag)

    this._insertProtectedChild(child, localZOrder)
    child.setParent(this)
    child.setOrderOfArrival(global.s_globalOrderOfArrival)

    if (this._running) {
      child._performRecursive(Node._stateCallbackType.onEnter)
      // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
      if (this._isTransitionFinished) child._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish)
    }
    if (this._cascadeColorEnabled) this._renderCmd.setCascadeColorEnabledDirty()
    if (this._cascadeOpacityEnabled) this._renderCmd.setCascadeOpacityEnabledDirty()
  }

  /**
   * Gets a child from the container with its tag
   * @param {Number} tag An identifier to find the child node.
   * @return {Node} a Node object whose tag equals to the input parameter
   */
  getProtectedChildByTag(tag) {
    assert(tag !== NODE_TAG_INVALID, 'Invalid tag')
    const locChildren = this._protectedChildren
    for (let i = 0, len = locChildren.length; i < len; i++) if (locChildren[i].getTag() === tag) return locChildren[i]
    return null
  }

  /**
   * Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter.
   * @param {Node} child  The child node which will be removed.
   * @param {Boolean} [cleanup=true] true if all running actions and callbacks on the child node will be cleanup, false otherwise.
   */
  removeProtectedChild(child, cleanup?) {
    if (cleanup == null) cleanup = true
    const locChildren = this._protectedChildren
    if (locChildren.length === 0) return
    const idx = locChildren.indexOf(child)
    if (idx > -1) {
      if (this._running) {
        child._performRecursive(Node._stateCallbackType.onExitTransitionDidStart)
        child._performRecursive(Node._stateCallbackType.onExit)
      }

      // If you don't do cleanup, the child's actions will not get removed and the
      // its scheduledSelectors_ dict will not get released!
      if (cleanup) child._performRecursive(Node._stateCallbackType.cleanup)

      // set parent nil at the end
      child.setParent(null)
      locChildren.splice(idx, 1)
    }
  }

  /**
   * Removes a child from the container by tag value.                                    <br/>
   * It will also cleanup all running actions depending on the cleanup parameter
   * @param {Number} tag
   * @param {Boolean} [cleanup=true]
   */
  removeProtectedChildByTag(tag, cleanup?) {
    assert(tag !== NODE_TAG_INVALID, 'Invalid tag')

    if (cleanup == null) cleanup = true

    const child = this.getProtectedChildByTag(tag)

    if (child == null) log('safex: removeChildByTag(tag = %d): child not found!', tag)
    else this.removeProtectedChild(child, cleanup)
  }

  /**
   * Removes all children from the container with a cleanup.
   * @see ProtectedNode#removeAllProtectedChildrenWithCleanup
   */
  removeAllProtectedChildren() {
    this.removeAllProtectedChildrenWithCleanup(true)
  }

  /**
   * Removes all children from the container, and do a cleanup to all running actions depending on the cleanup parameter.
   * @param {Boolean} [cleanup=true] true if all running actions on all children nodes should be cleanup, false otherwise.
   */
  removeAllProtectedChildrenWithCleanup(cleanup?) {
    if (cleanup == null) cleanup = true
    const locChildren = this._protectedChildren
    // not using detachChild improves speed here
    for (let i = 0, len = locChildren.length; i < len; i++) {
      const child = locChildren[i]
      // IMPORTANT:
      //  -1st do onExit
      //  -2nd cleanup
      if (this._running) {
        child._performRecursive(Node._stateCallbackType.onExitTransitionDidStart)
        child._performRecursive(Node._stateCallbackType.onExit)
      }

      if (cleanup) child._performRecursive(Node._stateCallbackType.cleanup)
      // set parent nil at the end
      child.setParent(null)
    }
    locChildren.length = 0
  }

  /**
   * Reorders a child according to a new z value.
   * @param {Node} child An already added child node. It MUST be already added.
   * @param {Number} localZOrder Z order for drawing priority. Please refer to setLocalZOrder(int)
   */
  reorderProtectedChild(child, localZOrder) {
    assert(child != null, 'Child must be non-nil')
    this._reorderProtectedChildDirty = true
    child.setOrderOfArrival(global.s_globalOrderOfArrival++)
    child._setLocalZOrder(localZOrder)
  }

  /**
   * <p>
   *     Sorts the children array once before drawing, instead of every time when a child is added or reordered.       <br/>
   *     This approach can improves the performance massively.                                                         <br/>
   *     @note Don't call this manually unless a child added needs to be removed in the same frame
   * </p>
   */
  sortAllProtectedChildren() {
    if (this._reorderProtectedChildDirty) {
      const _children = this._protectedChildren

      // insertion sort
      let i
      let j
      const len = _children.length
      let tmp
      for (i = 1; i < len; i++) {
        tmp = _children[i]
        j = i - 1

        //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
        while (j >= 0) {
          if (tmp._localZOrder < _children[j]._localZOrder) {
            _children[j + 1] = _children[j]
          } else if (tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder) {
            _children[j + 1] = _children[j]
          } else break
          j--
        }
        _children[j + 1] = tmp
      }

      //don't need to check children recursively, that's done in visit of each child
      this._reorderProtectedChildDirty = false
    }
  }

  _changePosition() {}

  _createRenderCmd() {
    return new ProtectedNodeWebGLRenderCmd(this)
  }
}
