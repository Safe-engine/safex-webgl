import { _renderContext, renderer } from '..'
import { CustomRenderCmd } from '../core/base-nodes/CustomRenderCmd'
import { Node } from '../core/base-nodes/Node'
import { NodeWebGLRenderCmd } from '../core/base-nodes/NodeWebGLRenderCmd'
import { SHADER_POSITION_TEXTURECOLORALPHATEST, UNIFORM_ALPHA_TEST_VALUE_S, UNIFORM_MVMATRIX_S } from '../core/platform'
import { log } from '../helper/Debugger'
import { glUseProgram } from '../shaders/GLStateCache'
import { shaderCache } from '../shaders/ShaderCache'

export let stencilBits = -1

function setProgram(node, program) {
  node.shaderProgram = program

  const children = node.children
  if (!children) return

  for (let i = 0; i < children.length; i++) setProgram(children[i], program)
}

export const ClippingNodeWebGLRenderCmd = function (renderable) {
  this._rootCtor(renderable)
  this._needDraw = false

  this._beforeVisitCmd = new CustomRenderCmd(this, this._onBeforeVisit)
  this._afterDrawStencilCmd = new CustomRenderCmd(this, this._onAfterDrawStencil)
  this._afterVisitCmd = new CustomRenderCmd(this, this._onAfterVisit)

  this._currentStencilEnabled = null
  this._mask_layer_le = null
}

const proto = (ClippingNodeWebGLRenderCmd.prototype = Object.create(NodeWebGLRenderCmd.prototype))
proto.constructor = ClippingNodeWebGLRenderCmd

ClippingNodeWebGLRenderCmd._init_once = null
ClippingNodeWebGLRenderCmd._visit_once = null
ClippingNodeWebGLRenderCmd._layer = -1

proto.initStencilBits = function () {
  // get (only once) the number of bits of the stencil buffer
  ClippingNodeWebGLRenderCmd._init_once = true
  if (ClippingNodeWebGLRenderCmd._init_once) {
    stencilBits = _renderContext.getParameter(_renderContext.STENCIL_BITS)
    if (stencilBits <= 0) log('Stencil buffer is not enabled.')
    ClippingNodeWebGLRenderCmd._init_once = false
  }
}

proto.transform = function (parentCmd, recursive) {
  const node = this._node
  this.originTransform(parentCmd, recursive)
  if (node._stencil) {
    node._stencil._renderCmd.transform(this, true)
    node._stencil._dirtyFlag &= ~Node._dirtyFlags.transformDirty
  }
}

proto.clippingVisit = function (parentCmd) {
  const node = this._node
  parentCmd = parentCmd || this.getParentRenderCmd()
  this.visit(parentCmd)

  // if stencil buffer disabled
  if (stencilBits < 1) {
    // draw everything, as if there were no stencil
    node._visitChildren()
    return
  }

  if (!node._stencil || !node._stencil.visible) {
    if (node.inverted) node._visitChildren() // draw everything
    return
  }

  if (ClippingNodeWebGLRenderCmd._layer + 1 === stencilBits) {
    ClippingNodeWebGLRenderCmd._visit_once = true
    if (ClippingNodeWebGLRenderCmd._visit_once) {
      log(
        `Nesting more than ${
          stencilBits
        }stencils is not supported. Everything will be drawn without stencil for this node and its children.`,
      )
      ClippingNodeWebGLRenderCmd._visit_once = false
    }
    // draw everything, as if there were no stencil
    node._visitChildren()
    return
  }

  renderer.pushRenderCommand(this._beforeVisitCmd)

  // node._stencil._stackMatrix = node._stackMatrix;
  node._stencil.visit(node)

  renderer.pushRenderCommand(this._afterDrawStencilCmd)

  // draw (according to the stencil test func) this node and its children
  const locChildren = node._children
  if (locChildren && locChildren.length > 0) {
    const childLen = locChildren.length
    node.sortAllChildren()
    // draw children zOrder < 0
    for (let i = 0; i < childLen; i++) {
      locChildren[i].visit(node)
    }
  }

  renderer.pushRenderCommand(this._afterVisitCmd)

  this._dirtyFlag = 0
}

proto.setStencil = function (stencil) {
  const node = this._node
  if (node._stencil) node._stencil._parent = null
  node._stencil = stencil
  if (node._stencil) node._stencil._parent = node
}

proto.resetProgramByStencil = function () {
  const node = this._node
  if (node._stencil) {
    const program = node._originStencilProgram
    setProgram(node._stencil, program)
  }
}

proto._onBeforeVisit = function (ctx) {
  const gl = ctx || _renderContext,
    node = this._node
  ClippingNodeWebGLRenderCmd._layer++

  // mask of the current layer (ie: for layer 3: 00000100)
  const mask_layer = 0x1 << ClippingNodeWebGLRenderCmd._layer
  // mask of all layers less than the current (ie: for layer 3: 00000011)
  const mask_layer_l = mask_layer - 1
  // mask of all layers less than or equal to the current (ie: for layer 3: 00000111)
  //var mask_layer_le = mask_layer | mask_layer_l;
  this._mask_layer_le = mask_layer | mask_layer_l
  // manually save the stencil state
  this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST)

  gl.clear(gl.DEPTH_BUFFER_BIT)
  // enable stencil use
  gl.enable(gl.STENCIL_TEST)

  gl.depthMask(false)

  gl.stencilFunc(gl.NEVER, mask_layer, mask_layer)
  gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP)

  gl.stencilMask(mask_layer)
  gl.clear(gl.STENCIL_BUFFER_BIT)

  if (node.alphaThreshold < 1) {
    //TODO desktop
    const program = shaderCache.programForKey(SHADER_POSITION_TEXTURECOLORALPHATEST)
    // set our alphaThreshold
    glUseProgram(program.getProgram())
    program.setUniformLocationWith1f(UNIFORM_ALPHA_TEST_VALUE_S, node.alphaThreshold)
    program.setUniformLocationWithMatrix4fv(UNIFORM_MVMATRIX_S, renderer.mat4Identity.mat)
    setProgram(node._stencil, program)
  }
}

proto._onAfterDrawStencil = function (ctx) {
  const gl = ctx || _renderContext
  gl.depthMask(true)
  gl.stencilFunc(!this._node.inverted ? gl.EQUAL : gl.NOTEQUAL, this._mask_layer_le, this._mask_layer_le)
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
}

proto._onAfterVisit = function (ctx) {
  const gl = ctx || _renderContext

  ClippingNodeWebGLRenderCmd._layer--

  if (this._currentStencilEnabled) {
    const mask_layer = 0x1 << ClippingNodeWebGLRenderCmd._layer
    const mask_layer_l = mask_layer - 1
    const mask_layer_le = mask_layer | mask_layer_l

    gl.stencilMask(mask_layer)
    gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le)
  } else {
    gl.disable(gl.STENCIL_TEST)
  }
}
