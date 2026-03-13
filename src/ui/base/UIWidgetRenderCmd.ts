import { renderer } from '../..'
import { ProtectedNodeWebGLRenderCmd } from './ProtectedNodeWebGLRenderCmd'
import type { Widget } from './UIWidget'

export class WidgetWebGLRenderCmd extends ProtectedNodeWebGLRenderCmd {
  declare _node: Widget
  constructor(renderable) {
    super(renderable)
    this._needDraw = false
  }

  visit(parentCmd) {
    const node = this._node

    parentCmd = parentCmd || this.getParentRenderCmd()
    if (parentCmd) this._curLevel = parentCmd._curLevel + 1

    if (isNaN(node._customZ)) {
      node._vertexZ = renderer.assignedZ
      renderer.assignedZ += renderer.assignedZStep
    }

    node._adaptRenderers()
    this._syncStatus(parentCmd)
  }

  transform(parentCmd, recursive) {
    if (!this._transform) {
      this._transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
      this._worldTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    }

    const node = this._node
    if (node._visible && node._running) {
      node._adaptRenderers()

      const widgetParent = node.getWidgetParent()
      if (widgetParent) {
        const parentSize = widgetParent.getContentSize()
        if (parentSize.width !== 0 && parentSize.height !== 0) {
          node._position.x = parentSize.width * node._positionPercent.x
          node._position.y = parentSize.height * node._positionPercent.y
        }
      }
      this.pNodeTransform(parentCmd, recursive)
    }
  }

  // const proto = (WidgetWebGLRenderCmd.prototype = Object.create(ProtectedNodeWebGLRenderCmd.prototype))
  // constructor = WidgetWebGLRenderCmd
}

// widgetTransform = transform
