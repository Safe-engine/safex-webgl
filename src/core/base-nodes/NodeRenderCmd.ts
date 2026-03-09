import { renderer } from '../..'
import { affineTransformConcatIn, affineTransformInvertOut } from '../cocoa/AffineTransform'
import { p } from '../cocoa/Geometry'
import { color, Color } from '../platform/Color'
import { Node } from './Node'

const ONE_DEGREE = Math.PI / 180
const dirtyFlags = {
  transformDirty: 1 << 0,
  visibleDirty: 1 << 1,
  colorDirty: 1 << 2,
  opacityDirty: 1 << 3,
  cacheDirty: 1 << 4,
  orderDirty: 1 << 5,
  textDirty: 1 << 6,
  gradientDirty: 1 << 7,
  textureDirty: 1 << 8,
  contentDirty: 1 << 9,
  COUNT: 10,
  all: (1 << 10) - 1,
}

function transformChildTree(root) {
  let index = 1
  let children, child, curr, parentCmd, i, len
  let stack = Node._performStacks[Node._performing]
  if (!stack) {
    stack = []
    Node._performStacks.push(stack)
  }
  stack.length = 0
  Node._performing++
  stack[0] = root
  while (index) {
    index--
    curr = stack[index]
    // Avoid memory leak
    stack[index] = null
    if (!curr) continue
    children = curr._children
    if (children && children.length > 0) {
      parentCmd = curr._renderCmd
      for (i = 0, len = children.length; i < len; ++i) {
        child = children[i]
        stack[index] = child
        index++
        child._renderCmd.transform(parentCmd)
      }
    }
    const pChildren = curr._protectedChildren
    if (pChildren && pChildren.length > 0) {
      parentCmd = curr._renderCmd
      for (i = 0, len = pChildren.length; i < len; ++i) {
        child = pChildren[i]
        stack[index] = child
        index++
        child._renderCmd.transform(parentCmd)
      }
    }
  }
  Node._performing--
}

class NodeRenderCmd {
  _node: Node
  _anchorPointInPoints: { x: number; y: number }
  _displayedColor: any

  _needDraw = false
  _dirtyFlag = 1
  _curLevel = -1

  _displayedOpacity = 255
  _cascadeColorEnabledDirty = false
  _cascadeOpacityEnabledDirty = false

  _transform: any = null
  _worldTransform: any = null
  _inverse: any = null

  _updateCurrentRegions?: () => void
  // _notifyRegionStatus?: (status: any) => void
  _cacheDirty?: boolean

  constructor(renderable: Node) {
    this._node = renderable
    this._anchorPointInPoints = { x: 0, y: 0 }
    this._displayedColor = color(255, 255, 255, 255)
  }

  needDraw(): boolean {
    return this._needDraw
  }

  getAnchorPointInPoints(): any {
    return p(this._anchorPointInPoints)
  }

  getDisplayedColor(): any {
    const tmpColor = this._displayedColor
    return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a)
  }

  getDisplayedOpacity(): number {
    return this._displayedOpacity
  }

  setCascadeColorEnabledDirty(): void {
    this._cascadeColorEnabledDirty = true
    this.setDirtyFlag(Node._dirtyFlags.colorDirty)
  }

  setCascadeOpacityEnabledDirty(): void {
    this._cascadeOpacityEnabledDirty = true
    this.setDirtyFlag(Node._dirtyFlags.opacityDirty)
  }

  getParentToNodeTransform(): any {
    if (!this._inverse) {
      this._inverse = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    }
    if (this._dirtyFlag & Node._dirtyFlags.transformDirty) {
      affineTransformInvertOut(this.getNodeToParentTransform(), this._inverse)
    }
    return this._inverse
  }

  detachFromParent(): void {}

  _updateAnchorPointInPoint(): void {
    const locAPP = this._anchorPointInPoints,
      locSize = this._node._contentSize,
      locAnchorPoint = this._node._anchorPoint
    locAPP.x = locSize.width * locAnchorPoint.x
    locAPP.y = locSize.height * locAnchorPoint.y
    this.setDirtyFlag(Node._dirtyFlags.transformDirty)
  }

  setDirtyFlag(dirtyFlag: number): void {
    if (this._dirtyFlag === 0 && dirtyFlag !== 0) renderer.pushDirtyNode(this)
    this._dirtyFlag |= dirtyFlag
  }

  getParentRenderCmd(): any {
    if (this._node && this._node._parent && this._node._parent._renderCmd) return this._node._parent._renderCmd
    return null
  }

  transform(parentCmd?: any, recursive?: boolean): void {
    if (!this._transform) {
      this._transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
      this._worldTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    }

    const node = this._node,
      pt = parentCmd ? parentCmd._worldTransform : null,
      t = this._transform,
      wt = this._worldTransform //get the world transform

    if (node._usingNormalizedPosition && node._parent) {
      const conSize = node._parent._contentSize
      node._position.x = node._normalizedPosition.x * conSize.width
      node._position.y = node._normalizedPosition.y * conSize.height
      node._normalizedPositionDirty = false
    }

    const hasRotation = node._rotationX || node._rotationY
    const hasSkew = node._skewX || node._skewY
    const sx = node._scaleX,
      sy = node._scaleY
    const appX = this._anchorPointInPoints.x,
      appY = this._anchorPointInPoints.y
    let a = 1,
      b = 0,
      c = 0,
      d = 1
    if (hasRotation || hasSkew) {
      // position
      t.tx = node._position.x
      t.ty = node._position.y

      // rotation
      if (hasRotation) {
        const rotationRadiansX = node._rotationX * ONE_DEGREE
        c = Math.sin(rotationRadiansX)
        d = Math.cos(rotationRadiansX)
        if (node._rotationY === node._rotationX) {
          a = d
          b = -c
        } else {
          const rotationRadiansY = node._rotationY * ONE_DEGREE
          a = Math.cos(rotationRadiansY)
          b = -Math.sin(rotationRadiansY)
        }
      }

      // scale
      t.a = a *= sx
      t.b = b *= sx
      t.c = c *= sy
      t.d = d *= sy

      // skew
      if (hasSkew) {
        let skx = Math.tan(node._skewX * ONE_DEGREE)
        let sky = Math.tan(node._skewY * ONE_DEGREE)
        if (skx === Infinity) skx = 99999999
        if (sky === Infinity) sky = 99999999
        t.a = a + c * sky
        t.b = b + d * sky
        t.c = c + a * skx
        t.d = d + b * skx
      }

      if (appX || appY) {
        t.tx -= t.a * appX + t.c * appY
        t.ty -= t.b * appX + t.d * appY
        // adjust anchorPoint
        if (node._ignoreAnchorPointForPosition) {
          t.tx += appX
          t.ty += appY
        }
      }

      if (node._additionalTransformDirty) {
        affineTransformConcatIn(t, node._additionalTransform)
      }

      if (pt) {
        // AffineTransformConcat is incorrect at get world transform
        wt.a = t.a * pt.a + t.b * pt.c //a
        wt.b = t.a * pt.b + t.b * pt.d //b
        wt.c = t.c * pt.a + t.d * pt.c //c
        wt.d = t.c * pt.b + t.d * pt.d //d
        wt.tx = pt.a * t.tx + pt.c * t.ty + pt.tx
        wt.ty = pt.d * t.ty + pt.ty + pt.b * t.tx
      } else {
        wt.a = t.a
        wt.b = t.b
        wt.c = t.c
        wt.d = t.d
        wt.tx = t.tx
        wt.ty = t.ty
      }
    } else {
      t.a = sx
      t.b = 0
      t.c = 0
      t.d = sy
      t.tx = node._position.x
      t.ty = node._position.y

      if (appX || appY) {
        t.tx -= t.a * appX
        t.ty -= t.d * appY
        // adjust anchorPoint
        if (node._ignoreAnchorPointForPosition) {
          t.tx += appX
          t.ty += appY
        }
      }

      if (node._additionalTransformDirty) {
        affineTransformConcatIn(t, node._additionalTransform)
      }

      if (pt) {
        wt.a = t.a * pt.a + t.b * pt.c
        wt.b = t.a * pt.b + t.b * pt.d
        wt.c = t.c * pt.a + t.d * pt.c
        wt.d = t.c * pt.b + t.d * pt.d
        wt.tx = t.tx * pt.a + t.ty * pt.c + pt.tx
        wt.ty = t.tx * pt.b + t.ty * pt.d + pt.ty
      } else {
        wt.a = t.a
        wt.b = t.b
        wt.c = t.c
        wt.d = t.d
        wt.tx = t.tx
        wt.ty = t.ty
      }
    }

    if (this._updateCurrentRegions) {
      this._updateCurrentRegions()
      // this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.DirtyDouble)
    }

    if (recursive) {
      transformChildTree(node)
    }

    this._cacheDirty = true
  }

  getNodeToParentTransform(): any {
    if (!this._transform || this._dirtyFlag & Node._dirtyFlags.transformDirty) {
      this.transform()
    }
    return this._transform
  }

  visit(parentCmd: any): void {
    const node = this._node

    parentCmd = parentCmd || this.getParentRenderCmd()
    if (parentCmd) this._curLevel = parentCmd._curLevel + 1

    if (isNaN(node._customZ)) {
      node._vertexZ = renderer.assignedZ
      renderer.assignedZ += renderer.assignedZStep
    }

    this._syncStatus(parentCmd)
  }

  _updateDisplayColor(parentColor?: any): void {
    const node = this._node
    const locDispColor = this._displayedColor,
      locRealColor = node._realColor
    let i, len, selChildren, item
    // this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty)
    if (this._cascadeColorEnabledDirty && !node._cascadeColorEnabled) {
      locDispColor.r = locRealColor.r
      locDispColor.g = locRealColor.g
      locDispColor.b = locRealColor.b
      const whiteColor = new Color(255, 255, 255, 255)
      selChildren = node._children
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) item._renderCmd._updateDisplayColor(whiteColor)
      }
      this._cascadeColorEnabledDirty = false
    } else {
      if (parentColor === undefined) {
        const locParent = node._parent
        if (locParent && locParent._cascadeColorEnabled) parentColor = locParent.getDisplayedColor()
        else parentColor = Color.WHITE
      }
      locDispColor.r = 0 | ((locRealColor.r * parentColor.r) / 255.0)
      locDispColor.g = 0 | ((locRealColor.g * parentColor.g) / 255.0)
      locDispColor.b = 0 | ((locRealColor.b * parentColor.b) / 255.0)
      if (node._cascadeColorEnabled) {
        selChildren = node._children
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i]
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayColor(locDispColor)
            item._renderCmd._updateColor()
          }
        }
      }
    }
    this._dirtyFlag &= ~dirtyFlags.colorDirty
  }

  _updateDisplayOpacity(parentOpacity?: number): void {
    const node = this._node
    let i, len, selChildren, item
    // this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty)
    if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
      this._displayedOpacity = node._realOpacity
      selChildren = node._children
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) item._renderCmd._updateDisplayOpacity(255)
      }
      this._cascadeOpacityEnabledDirty = false
    } else {
      if (parentOpacity === undefined) {
        const locParent = node._parent
        parentOpacity = 255
        if (locParent && locParent._cascadeOpacityEnabled) parentOpacity = locParent.getDisplayedOpacity()
      }
      this._displayedOpacity = (node._realOpacity * parentOpacity) / 255.0
      if (node._cascadeOpacityEnabled) {
        selChildren = node._children
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i]
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayOpacity(this._displayedOpacity)
            item._renderCmd._updateColor()
          }
        }
      }
    }
    this._dirtyFlag &= ~dirtyFlags.opacityDirty
  }

  _syncDisplayColor(parentColor?: any): void {
    const node = this._node,
      locDispColor = this._displayedColor,
      locRealColor = node._realColor
    if (parentColor === undefined) {
      const locParent = node._parent
      if (locParent && locParent._cascadeColorEnabled) parentColor = locParent.getDisplayedColor()
      else parentColor = Color.WHITE
    }
    locDispColor.r = 0 | ((locRealColor.r * parentColor.r) / 255.0)
    locDispColor.g = 0 | ((locRealColor.g * parentColor.g) / 255.0)
    locDispColor.b = 0 | ((locRealColor.b * parentColor.b) / 255.0)
  }

  _syncDisplayOpacity(parentOpacity?: number): void {
    const node = this._node
    if (parentOpacity === undefined) {
      const locParent = node._parent
      parentOpacity = 255
      if (locParent && locParent._cascadeOpacityEnabled) parentOpacity = locParent.getDisplayedOpacity()
    }
    this._displayedOpacity = (node._realOpacity * parentOpacity) / 255.0
  }

  _updateColor(): void {}

  _propagateFlagsDown(parentCmd: any): void {
    let locFlag = this._dirtyFlag
    const parentNode = parentCmd ? parentCmd._node : null

    if (parentNode && parentNode._cascadeColorEnabled && parentCmd._dirtyFlag & dirtyFlags.colorDirty) locFlag |= dirtyFlags.colorDirty

    if (parentNode && parentNode._cascadeOpacityEnabled && parentCmd._dirtyFlag & dirtyFlags.opacityDirty)
      locFlag |= dirtyFlags.opacityDirty

    if (parentCmd && parentCmd._dirtyFlag & dirtyFlags.transformDirty) locFlag |= dirtyFlags.transformDirty

    this._dirtyFlag = locFlag
  }

  updateStatus(): void {
    const locFlag = this._dirtyFlag
    const colorDirty = locFlag & dirtyFlags.colorDirty,
      opacityDirty = locFlag & dirtyFlags.opacityDirty

    if (locFlag & dirtyFlags.contentDirty) {
      // this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty)
      this._dirtyFlag &= ~dirtyFlags.contentDirty
    }

    if (colorDirty) this._updateDisplayColor()

    if (opacityDirty) this._updateDisplayOpacity()

    if (colorDirty || opacityDirty) this._updateColor()

    if (locFlag & dirtyFlags.transformDirty) {
      //update the transform
      this.transform(this.getParentRenderCmd(), true)
      this._dirtyFlag &= ~dirtyFlags.transformDirty
    }

    if (locFlag & dirtyFlags.orderDirty) this._dirtyFlag &= ~dirtyFlags.orderDirty
  }

  _syncStatus(parentCmd: any): void {
    //  In the visit logic does not restore the _dirtyFlag
    //  Because child elements need parent's _dirtyFlag to change himself
    let locFlag = this._dirtyFlag
    const parentNode = parentCmd ? parentCmd._node : null

    //  There is a possibility:
    //    The parent element changed color, child element not change
    //    This will cause the parent element changed color
    //    But while the child element does not enter the circulation
    //    Here will be reset state in last
    //    In order the child elements get the parent state
    if (parentNode && parentNode._cascadeColorEnabled && parentCmd._dirtyFlag & dirtyFlags.colorDirty) locFlag |= dirtyFlags.colorDirty

    if (parentNode && parentNode._cascadeOpacityEnabled && parentCmd._dirtyFlag & dirtyFlags.opacityDirty)
      locFlag |= dirtyFlags.opacityDirty

    if (parentCmd && parentCmd._dirtyFlag & dirtyFlags.transformDirty) locFlag |= dirtyFlags.transformDirty

    this._dirtyFlag = locFlag

    const colorDirty = locFlag & dirtyFlags.colorDirty,
      opacityDirty = locFlag & dirtyFlags.opacityDirty

    if (colorDirty)
      //update the color
      this._syncDisplayColor()

    if (opacityDirty)
      //update the opacity
      this._syncDisplayOpacity()

    if (colorDirty || opacityDirty) this._updateColor()

    if (locFlag & dirtyFlags.transformDirty)
      //update the transform
      this.transform(parentCmd)

    if (locFlag & dirtyFlags.orderDirty) this._dirtyFlag &= ~dirtyFlags.orderDirty
  }

  setShaderProgram(shaderProgram: any): void {
    //do nothing.
  }

  getShaderProgram(): any {
    return null
  }

  getGLProgramState(): any {
    return null
  }

  setGLProgramState(glProgramState: any): void {
    // do nothing
  }
  originTransform(parentCmd?: any, recursive?: boolean): void {
    this.transform(parentCmd, recursive)
  }

  originUpdateStatus(): void {
    this.updateStatus()
  }

  _originSyncStatus(parentCmd: any): void {
    this._syncStatus(parentCmd)
  }
}

// Store original methods for backward compatibility
NodeRenderCmd.prototype.originTransform = NodeRenderCmd.prototype.transform
NodeRenderCmd.prototype.originUpdateStatus = NodeRenderCmd.prototype.updateStatus
NodeRenderCmd.prototype._originSyncStatus = NodeRenderCmd.prototype._syncStatus

export { NodeRenderCmd }
