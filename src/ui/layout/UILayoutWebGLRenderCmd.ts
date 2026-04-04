import { _renderContext, Node, rectEqualToRect, renderer, view } from '../..'
import { stencilBits } from '../../clipping-nodes/ClippingNodeWebGLRenderCmd'
import { CustomRenderCmd } from '../../core/base-nodes/CustomRenderCmd'
import { current_stack } from '../../core/kazmath/gl/matrix'
import { log } from '../../helper/Debugger'
import { ProtectedNodeWebGLRenderCmd } from '../base/ProtectedNodeWebGLRenderCmd'
import { Layout } from './UILayout'

export class LayoutWebGLRenderCmd extends ProtectedNodeWebGLRenderCmd {
  static _layer = -1
  static _visit_once: boolean | null = null

  _currentStencilEnabled = false
  _scissorOldState = false
  declare _clippingOldRect

  _mask_layer_le = 0

  declare _beforeVisitCmdStencil: CustomRenderCmd
  declare _afterDrawStencilCmd: CustomRenderCmd
  declare _afterVisitCmdStencil: CustomRenderCmd
  declare _beforeVisitCmdScissor: CustomRenderCmd
  declare _afterVisitCmdScissor: CustomRenderCmd
  declare _node: Layout

  constructor(renderable) {
    super(renderable)

    this._needDraw = false
    // this._layoutCmdCtor = LayoutWebGLRenderCmd
  }

  _syncStatus(parentCmd) {
    this._originSyncStatus(parentCmd)

    if (parentCmd && parentCmd._dirtyFlag & Node._dirtyFlags.transformDirty) this._node._clippingRectDirty = true
  }

  _onBeforeVisitStencil(ctx) {
    const gl = ctx || _renderContext

    LayoutWebGLRenderCmd._layer++

    const mask_layer = 0x1 << LayoutWebGLRenderCmd._layer
    const mask_layer_l = mask_layer - 1
    this._mask_layer_le = mask_layer | mask_layer_l

    // manually save the stencil state
    this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST)

    gl.clear(gl.DEPTH_BUFFER_BIT)

    gl.enable(gl.STENCIL_TEST)

    gl.depthMask(false)

    gl.stencilFunc(gl.NEVER, mask_layer, mask_layer)
    gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP)

    gl.stencilMask(mask_layer)
    gl.clear(gl.STENCIL_BUFFER_BIT)
  }

  _onAfterDrawStencil(ctx) {
    const gl = ctx || _renderContext
    gl.depthMask(true)
    gl.stencilFunc(gl.EQUAL, this._mask_layer_le, this._mask_layer_le)
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
  }

  _onAfterVisitStencil(ctx) {
    const gl = ctx || _renderContext

    LayoutWebGLRenderCmd._layer--

    if (this._currentStencilEnabled) {
      const mask_layer = 0x1 << LayoutWebGLRenderCmd._layer
      const mask_layer_l = mask_layer - 1
      const mask_layer_le = mask_layer | mask_layer_l

      gl.stencilMask(mask_layer)
      gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le)
    } else {
      gl.disable(gl.STENCIL_TEST)
    }
  }

  _onBeforeVisitScissor(ctx) {
    this._node._clippingRectDirty = true
    const clippingRect = this._node._getClippingRect()
    const gl = ctx || _renderContext

    this._scissorOldState = gl.isEnabled(gl.SCISSOR_TEST)

    if (!this._scissorOldState) {
      gl.enable(gl.SCISSOR_TEST)
      view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height)
    } else {
      this._clippingOldRect = view.getScissorRect()
      if (!rectEqualToRect(this._clippingOldRect, clippingRect))
        view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height)
    }
  }

  _onAfterVisitScissor(ctx) {
    const gl = ctx || _renderContext
    if (this._scissorOldState) {
      if (!rectEqualToRect(this._clippingOldRect, this._node._clippingRect)) {
        view.setScissorInPoints(this._clippingOldRect.x, this._clippingOldRect.y, this._clippingOldRect.width, this._clippingOldRect.height)
      }
    } else {
      gl.disable(gl.SCISSOR_TEST)
    }
  }

  rebindStencilRendering(stencil) {}

  transform(parentCmd, recursive) {
    const node = this._node
    this.pNodeTransform(parentCmd, recursive)
    if (node._clippingStencil) node._clippingStencil._renderCmd.transform(this, recursive)
  }

  stencilClippingVisit(parentCmd) {
    const node = this._node
    if (!node._clippingStencil || !node._clippingStencil.isVisible()) return

    // all the _stencilBits are in use?
    if (LayoutWebGLRenderCmd._layer + 1 === stencilBits) {
      // warn once
      LayoutWebGLRenderCmd._visit_once = true
      if (LayoutWebGLRenderCmd._visit_once) {
        log(
          `Nesting more than ${stencilBits}stencils is not supported. Everything will be drawn without stencil for this node and its childs.`,
        )
        LayoutWebGLRenderCmd._visit_once = false
      }
      // draw everything, as if there where no stencil
      return
    }

    if (!this._beforeVisitCmdStencil) {
      this._beforeVisitCmdStencil = new CustomRenderCmd(this, this._onBeforeVisitStencil)
      this._afterDrawStencilCmd = new CustomRenderCmd(this, this._onAfterDrawStencil)
      this._afterVisitCmdStencil = new CustomRenderCmd(this, this._onAfterVisitStencil)
    }

    renderer.pushRenderCommand(this._beforeVisitCmdStencil)

    //optimize performance for javascript
    const currentStack = current_stack
    currentStack.stack.push(currentStack.top)
    currentStack.top = this._stackMatrix

    node._clippingStencil.visit(node)

    renderer.pushRenderCommand(this._afterDrawStencilCmd)
  }

  postStencilVisit() {
    renderer.pushRenderCommand(this._afterVisitCmdStencil)
    current_stack.top = current_stack.stack.pop()
  }

  scissorClippingVisit(parentCmd) {
    if (!this._beforeVisitCmdScissor) {
      this._beforeVisitCmdScissor = new CustomRenderCmd(this, this._onBeforeVisitScissor)
      this._afterVisitCmdScissor = new CustomRenderCmd(this, this._onAfterVisitScissor)
    }
    renderer.pushRenderCommand(this._beforeVisitCmdScissor)
  }

  postScissorVisit() {
    renderer.pushRenderCommand(this._afterVisitCmdScissor)
  }
}
