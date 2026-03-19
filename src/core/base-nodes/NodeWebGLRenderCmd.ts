import { GLProgram, GLProgramState } from '../../shaders'
import type { Node } from './Node'
import { NodeRenderCmd } from './NodeRenderCmd'

export class NodeWebGLRenderCmd extends NodeRenderCmd {
  declare _glProgramState: GLProgramState
  declare _stackMatrix
  // declare _rootCtor: typeof NodeWebGLRenderCmd
  declare _node: Node

  constructor(renderable: Node) {
    super(renderable)
    this._glProgramState = null
    // this._rootCtor = NodeWebGLRenderCmd
  }

  _updateColor() {}

  setShaderProgram(shaderProgram: GLProgram) {
    this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram)
  }

  getShaderProgram(): GLProgram {
    return this._glProgramState ? this._glProgramState.getGLProgram() : null
  }

  getGLProgramState() {
    return this._glProgramState
  }

  setGLProgramState(glProgramState: GLProgramState) {
    this._glProgramState = glProgramState
  }

  get _shaderProgram() {
    return this.getShaderProgram()
  }

  set _shaderProgram(value) {
    this.setShaderProgram(value)
  }
}
