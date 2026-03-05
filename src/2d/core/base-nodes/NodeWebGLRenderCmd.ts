import { GLProgramState } from "../../shaders/GLProgramState";
import { NodeRenderCmd } from "./NodeRenderCmd";

export class NodeWebGLRenderCmd extends NodeRenderCmd {
  _glProgramState: any = null;
  _rootCtor: typeof NodeWebGLRenderCmd;

  constructor(renderable: any) {
    super(renderable);
    this._glProgramState = null;
    this._rootCtor = NodeWebGLRenderCmd;
  }

  _updateColor(): void {
  }

  setShaderProgram(shaderProgram: any): void {
    this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
  }

  getShaderProgram(): any {
    return this._glProgramState ? this._glProgramState.getGLProgram() : null;
  }

  getGLProgramState(): any {
    return this._glProgramState;
  }

  setGLProgramState(glProgramState: any): void {
    this._glProgramState = glProgramState;
  }
}

// Use a property getter/setter for backwards compatability, and
// to ease the transition from using glPrograms directly, to
// using glProgramStates.
Object.defineProperty(NodeWebGLRenderCmd.prototype, '_shaderProgram', {
  set: function (value) { this.setShaderProgram(value); },
  get: function () { return this.getShaderProgram(); }
});
