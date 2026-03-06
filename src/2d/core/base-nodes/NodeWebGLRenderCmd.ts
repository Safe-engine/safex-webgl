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

  get _shaderProgram() {
    return this.getShaderProgram();
  }

  set _shaderProgram(value) {
    this.setShaderProgram(value);
  }
}
