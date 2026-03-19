import { _renderContext, director, Game, game, Node } from '..'
import {
  getMat4MultiplyValue,
  KM_GL_MODELVIEW,
  KM_GL_PROJECTION,
  kmGLGetMatrix,
  kmMat4Multiply,
  Matrix4,
  modelview_matrix_stack,
  projection_matrix_stack,
} from '../core/kazmath'
import {
  checkGLErrorDebug,
  UNIFORM_COSTIME_S,
  UNIFORM_MVMATRIX_S,
  UNIFORM_MVPMATRIX_S,
  UNIFORM_PMATRIX_S,
  UNIFORM_RANDOM01_S,
  UNIFORM_SAMPLER_S,
  UNIFORM_SINTIME_S,
  UNIFORM_TIME_S,
} from '../core/platform/Macro'
import { log } from '../helper/Debugger'
import { loader } from '../helper/loader'
import { glDeleteProgram, glUseProgram } from './GLStateCache'

export class GLProgram {
  declare _glContext: WebGLRenderingContext
  declare _programObj: WebGLProgram
  declare _vertShader: WebGLShader
  declare _fragShader: WebGLShader
  declare _uniforms: any
  declare _hashForUniforms: any
  declare __instanceId: any
  _usesTime = false
  _projectionUpdated = -1

  static _highpSupported: boolean | null = null

  constructor(vShaderFileName?: string, fShaderFileName?: string, glContext?: WebGLRenderingContext) {
    this._uniforms = {}
    this._hashForUniforms = {}
    this._glContext = glContext || _renderContext

    vShaderFileName && fShaderFileName && this.init(vShaderFileName, fShaderFileName)
  }

  // Uniform cache
  _updateUniform(name: string, matrix?: Float32Array | Int32Array | number, ...rest: number[]): boolean {
    if (!name) return false

    let updated = false
    const element = this._hashForUniforms[name]
    let args
    if (Array.isArray(matrix)) {
      args = matrix
    } else {
      args = [matrix, ...rest]
    }

    if (!element || element.length !== args.length) {
      this._hashForUniforms[name] = [].concat(args)
      updated = true
    } else {
      for (let i = 0; i < args.length; i += 1) {
        // Array and Typed Array inner values could be changed, so we must update them
        if (args[i] !== element[i] || typeof args[i] === 'object') {
          element[i] = args[i]
          updated = true
        }
      }
    }

    return updated
  }

  _description(): string {
    return `<CCGLProgram = ${this.toString()} | Program = ${this._programObj.toString()}, VertexShader = ${this._vertShader.toString()}, FragmentShader = ${this._fragShader.toString()}>`
  }

  _compileShader(shader: any, type: any, source: string): boolean {
    if (!source || !shader) return false

    const preStr = GLProgram._isHighpSupported() ? 'precision highp float;\n' : 'precision mediump float;\n'
    source =
      `${preStr}uniform mat4 CC_PMatrix;         \n` +
      'uniform mat4 CC_MVMatrix;        \n' +
      'uniform mat4 CC_MVPMatrix;       \n' +
      'uniform vec4 CC_Time;            \n' +
      'uniform vec4 CC_SinTime;         \n' +
      'uniform vec4 CC_CosTime;         \n' +
      'uniform vec4 CC_Random01;        \n' +
      'uniform sampler2D CC_Texture0;   \n' +
      `//CC INCLUDES END                \n${source}`

    this._glContext.shaderSource(shader, source)
    this._glContext.compileShader(shader)
    const status = this._glContext.getShaderParameter(shader, this._glContext.COMPILE_STATUS)

    if (!status) {
      log(`cocos2d: ERROR: Failed to compile shader:\n${this._glContext.getShaderSource(shader)}`)
      if (type === this._glContext.VERTEX_SHADER) log(`cocos2d: \n${this.vertexShaderLog()}`)
      else log(`cocos2d: \n${this.fragmentShaderLog()}`)
    }
    return status === true
  }

  /**
   * destroy program
   */
  destroyProgram() {
    this._vertShader = null
    this._fragShader = null
    this._uniforms = null
    this._hashForUniforms = null

    this._glContext.deleteProgram(this._programObj)
  }

  /**
   * Initializes the GLProgram with a vertex and fragment with string
   * @param {String} vertShaderStr
   * @param {String} fragShaderStr
   * @return {Boolean}
   */
  initWithVertexShaderByteArray(vertShaderStr: string, fragShaderStr: string): boolean {
    const locGL = this._glContext
    this._programObj = locGL.createProgram()
    //checkGLErrorDebug();

    this._vertShader = null
    this._fragShader = null

    if (vertShaderStr) {
      this._vertShader = locGL.createShader(locGL.VERTEX_SHADER)
      if (!this._compileShader(this._vertShader, locGL.VERTEX_SHADER, vertShaderStr)) {
        log('cocos2d: ERROR: Failed to compile vertex shader')
      }
    }

    // Create and compile fragment shader
    if (fragShaderStr) {
      this._fragShader = locGL.createShader(locGL.FRAGMENT_SHADER)
      if (!this._compileShader(this._fragShader, locGL.FRAGMENT_SHADER, fragShaderStr)) {
        log('cocos2d: ERROR: Failed to compile fragment shader')
      }
    }

    if (this._vertShader) locGL.attachShader(this._programObj, this._vertShader)
    checkGLErrorDebug()

    if (this._fragShader) locGL.attachShader(this._programObj, this._fragShader)

    if (Object.keys(this._hashForUniforms).length > 0) this._hashForUniforms = {}

    checkGLErrorDebug()
    return true
  }

  /**
   * Initializes the GLProgram with a vertex and fragment with string
   * @param {String} vertShaderStr
   * @param {String} fragShaderStr
   * @return {Boolean}
   */
  initWithString(vertShaderStr: string, fragShaderStr: string): boolean {
    return this.initWithVertexShaderByteArray(vertShaderStr, fragShaderStr)
  }

  /**
   * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
   * @param {String} vShaderFilename
   * @param {String} fShaderFileName
   * @return {Boolean}
   */
  initWithVertexShaderFilename(vShaderFilename: string, fShaderFileName: string): boolean {
    const vertexSource = loader.getRes(vShaderFilename)
    if (!vertexSource) throw new Error(`Please load the resource firset : ${vShaderFilename}`)
    const fragmentSource = loader.getRes(fShaderFileName)
    if (!fragmentSource) throw new Error(`Please load the resource firset : ${fShaderFileName}`)
    return this.initWithVertexShaderByteArray(vertexSource, fragmentSource)
  }

  /**
   * Initializes the CCGLProgram with a vertex and fragment with contents of filenames
   * @param {String} vShaderFilename
   * @param {String} fShaderFileName
   * @return {Boolean}
   */
  init(vShaderFilename: string, fShaderFileName: string): boolean {
    return this.initWithVertexShaderFilename(vShaderFilename, fShaderFileName)
  }

  /**
   * It will add a new attribute to the shader
   * @param {String} attributeName
   * @param {Number} index
   */
  addAttribute(attributeName: string, index: number) {
    this._glContext.bindAttribLocation(this._programObj, index, attributeName)
  }

  /**
   * links the glProgram
   * @return {Boolean}
   */
  link(): boolean {
    if (!this._programObj) {
      log('GLProgram.link(): Cannot link invalid program')
      return false
    }

    this._glContext.linkProgram(this._programObj)

    if (this._vertShader) this._glContext.deleteShader(this._vertShader)
    if (this._fragShader) this._glContext.deleteShader(this._fragShader)

    this._vertShader = null
    this._fragShader = null

    if (game.config[Game.CONFIG_KEY.debugMode]) {
      const status = this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS)
      if (!status) {
        log(`cocos2d: ERROR: Failed to link program: ${this._glContext.getProgramInfoLog(this._programObj)}`)
        glDeleteProgram(this._programObj)
        this._programObj = null
        return false
      }
    }

    return true
  }

  /**
   * it will call glUseProgram()
   */
  use() {
    glUseProgram(this._programObj)
  }

  /**
   * It will create 4 uniforms:
   *  UNIFORM_PMATRIX
   *  UNIFORM_MVMATRIX
   *  UNIFORM_MVPMATRIX
   *  UNIFORM_SAMPLER
   */
  updateUniforms() {
    this._addUniformLocation(UNIFORM_PMATRIX_S)
    this._addUniformLocation(UNIFORM_MVMATRIX_S)
    this._addUniformLocation(UNIFORM_MVPMATRIX_S)
    this._addUniformLocation(UNIFORM_TIME_S)
    this._addUniformLocation(UNIFORM_SINTIME_S)
    this._addUniformLocation(UNIFORM_COSTIME_S)
    this._addUniformLocation(UNIFORM_RANDOM01_S)
    this._addUniformLocation(UNIFORM_SAMPLER_S)
    this._usesTime =
      this._uniforms[UNIFORM_TIME_S] != null || this._uniforms[UNIFORM_SINTIME_S] != null || this._uniforms[UNIFORM_COSTIME_S] != null

    this.use()
    // Since sample most probably won't change, set it to 0 now.
    this.setUniformLocationWith1i(this._uniforms[UNIFORM_SAMPLER_S], 0)
  }

  _addUniformLocation(name: string): any {
    const location: any = this._glContext.getUniformLocation(this._programObj, name)
    if (location) location._name = name
    this._uniforms[name] = location
    return location
  }

  /**
   * calls retrieves the named uniform location for this shader program.
   * @param {String} name
   * @returns {Number}
   */
  getUniformLocationForName(name: string): any {
    if (!name) throw new Error('GLProgram.getUniformLocationForName(): uniform name should be non-null')
    if (!this._programObj)
      throw new Error(
        'GLProgram.getUniformLocationForName(): Invalid operation. Cannot get uniform location when program is not initialized',
      )

    const location = this._uniforms[name] || this._addUniformLocation(name)
    return location
  }

  /**
   * get uniform MVP matrix
   * @returns {WebGLUniformLocation}
   */
  getUniformMVPMatrix(): any {
    return this._uniforms[UNIFORM_MVPMATRIX_S]
  }

  /**
   * get uniform sampler
   * @returns {WebGLUniformLocation}
   */
  getUniformSampler(): any {
    return this._uniforms[UNIFORM_SAMPLER_S]
  }

  /**
   * calls glUniform1i only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} i1
   */
  setUniformLocationWith1i(location: any | string, i1: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location?._name
    if (name) {
      if (this._updateUniform(name, i1)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform1i(location, i1)
      }
    } else {
      this._glContext.uniform1i(location, i1)
    }
  }

  /**
   * calls glUniform2i only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} i1
   * @param {Number} i2
   */
  setUniformLocationWith2i(location: any, i1: number, i2: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, i1, i2)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform2i(location, i1, i2)
      }
    } else {
      this._glContext.uniform2i(location, i1, i2)
    }
  }

  /**
   * calls glUniform3i only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} i1
   * @param {Number} i2
   * @param {Number} i3
   */
  setUniformLocationWith3i(location: any, i1: number, i2: number, i3: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, i1, i2, i3)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform3i(location, i1, i2, i3)
      }
    } else {
      this._glContext.uniform3i(location, i1, i2, i3)
    }
  }

  /**
   * calls glUniform4i only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} i1
   * @param {Number} i2
   * @param {Number} i3
   * @param {Number} i4
   */
  setUniformLocationWith4i(location: any, i1: number, i2: number, i3: number, i4: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, i1, i2, i3, i4)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform4i(location, i1, i2, i3, i4)
      }
    } else {
      this._glContext.uniform4i(location, i1, i2, i3, i4)
    }
  }

  /**
   * calls glUniform2iv
   * @param {WebGLUniformLocation|String} location
   * @param {Int32Array} intArray
   * @param {Number} numberOfArrays
   */
  setUniformLocationWith2iv(location: any, intArray: Int32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, intArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform2iv(location, intArray)
      }
    } else {
      this._glContext.uniform2iv(location, intArray)
    }
  }

  /**
   * calls glUniform3iv
   * @param {WebGLUniformLocation|String} location
   * @param {Int32Array} intArray
   */
  setUniformLocationWith3iv(location: any, intArray: Int32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, intArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform3iv(location, intArray)
      }
    } else {
      this._glContext.uniform3iv(location, intArray)
    }
  }

  /**
   * calls glUniform4iv
   * @param {WebGLUniformLocation|String} location
   * @param {Int32Array} intArray
   */
  setUniformLocationWith4iv(location: any, intArray: Int32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, intArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform4iv(location, intArray)
      }
    } else {
      this._glContext.uniform4iv(location, intArray)
    }
  }

  /**
   * calls glUniform1i only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} i1
   */
  setUniformLocationI32(location: any, i1: number) {
    this.setUniformLocationWith1i(location, i1)
  }

  /**
   * calls glUniform1f only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} f1
   */
  setUniformLocationWith1f(location: any, f1: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, f1)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform1f(location, f1)
      }
    } else {
      this._glContext.uniform1f(location, f1)
    }
  }

  /**
   * calls glUniform2f only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} f1
   * @param {Number} f2
   */
  setUniformLocationWith2f(location: any, f1: number, f2: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, f1, f2)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform2f(location, f1, f2)
      }
    } else {
      this._glContext.uniform2f(location, f1, f2)
    }
  }

  /**
   * calls glUniform3f only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} f1
   * @param {Number} f2
   * @param {Number} f3
   */
  setUniformLocationWith3f(location: any, f1: number, f2: number, f3: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, f1, f2, f3)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform3f(location, f1, f2, f3)
      }
    } else {
      this._glContext.uniform3f(location, f1, f2, f3)
    }
  }

  /**
   * calls glUniform4f only if the values are different than the previous call for this same shader program.
   * @param {WebGLUniformLocation|String} location
   * @param {Number} f1
   * @param {Number} f2
   * @param {Number} f3
   * @param {Number} f4
   */
  setUniformLocationWith4f(location: any, f1: number, f2: number, f3: number, f4: number) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, f1, f2, f3, f4)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform4f(location, f1, f2, f3, f4)
      }
    } else {
      this._glContext.uniform4f(location, f1, f2, f3, f4)
      log('uniform4f', f1, f2, f3, f4)
    }
  }

  /**
   * calls glUniform2fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} floatArray
   */
  setUniformLocationWith2fv(location: any, floatArray: Float32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, floatArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform2fv(location, floatArray)
      }
    } else {
      this._glContext.uniform2fv(location, floatArray)
    }
  }

  /**
   * calls glUniform3fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} floatArray
   */
  setUniformLocationWith3fv(location: any, floatArray: Float32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, floatArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform3fv(location, floatArray)
      }
    } else {
      this._glContext.uniform3fv(location, floatArray)
    }
  }

  /**
   * calls glUniform4fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} floatArray
   */
  setUniformLocationWith4fv(location: any, floatArray: Float32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, floatArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniform4fv(location, floatArray)
      }
    } else {
      this._glContext.uniform4fv(location, floatArray)
      log('uniform4fv', floatArray)
    }
  }

  /**
   * calls glUniformMatrix2fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} matrixArray
   */
  setUniformLocationWithMatrix2fv(location: any, matrixArray: Float32Array) {
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, matrixArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniformMatrix2fv(location, false, matrixArray)
      }
    } else {
      this._glContext.uniformMatrix2fv(location, false, matrixArray)
    }
  }

  /**
   * calls glUniformMatrix3fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} matrixArray
   */
  setUniformLocationWithMatrix3fv(location: any, matrixArray: Float32Array) {
    console.log('setUniformLocationWithMatrix4fv', location, matrixArray)
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, matrixArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniformMatrix3fv(location, false, matrixArray)
      }
    } else {
      this._glContext.uniformMatrix3fv(location, false, matrixArray)
    }
  }

  /**
   * calls glUniformMatrix4fv
   * @param {WebGLUniformLocation|String} location
   * @param {Float32Array} matrixArray
   */
  setUniformLocationWithMatrix4fv(location: any | string, matrixArray: Float32Array, v1?: number) {
    // console.log('setUniformLocationWithMatrix4fv', location, matrixArray)
    const isString = typeof location === 'string'
    const name = isString ? location : location && location._name
    if (name) {
      if (this._updateUniform(name, matrixArray)) {
        if (isString) location = this.getUniformLocationForName(name)
        this._glContext.uniformMatrix4fv(location, false, matrixArray)
      }
    } else {
      this._glContext.uniformMatrix4fv(location, false, matrixArray)
    }
  }

  setUniformLocationF32(...args: any[]) {
    if (args.length < 2) return

    switch (args.length) {
      case 2:
        this.setUniformLocationWith1f(args[0], args[1])
        break
      case 3:
        this.setUniformLocationWith2f(args[0], args[1], args[2])
        break
      case 4:
        this.setUniformLocationWith3f(args[0], args[1], args[2], args[3])
        break
      case 5:
        this.setUniformLocationWith4f(args[0], args[1], args[2], args[3], args[4])
        break
    }
  }

  /**
   * will update the builtin uniforms if they are different than the previous call for this same shader program.
   */
  setUniformsForBuiltins() {
    const matrixP = new Matrix4()
    const matrixMV = new Matrix4()
    const matrixMVP = new Matrix4()

    kmGLGetMatrix(KM_GL_PROJECTION, matrixP)
    kmGLGetMatrix(KM_GL_MODELVIEW, matrixMV)

    kmMat4Multiply(matrixMVP, matrixP, matrixMV)

    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_PMATRIX_S], matrixP.mat, 1)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVMATRIX_S], matrixMV.mat, 1)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVPMATRIX_S], matrixMVP.mat, 1)

    if (this._usesTime) {
      // This doesn't give the most accurate global time value.
      // Cocos2D doesn't store a high precision time value, so this will have to do.
      // Getting Mach time per frame per shader using time could be extremely expensive.
      const time = director.getTotalFrames() * director.getAnimationInterval()

      this.setUniformLocationWith4f(this._uniforms[UNIFORM_TIME_S], time / 10.0, time, time * 2, time * 4)
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_SINTIME_S], time / 8.0, time / 4.0, time / 2.0, Math.sin(time))
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_COSTIME_S], time / 8.0, time / 4.0, time / 2.0, Math.cos(time))
    }

    if (this._uniforms[UNIFORM_RANDOM01_S] !== -1)
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_RANDOM01_S], Math.random(), Math.random(), Math.random(), Math.random())
  }

  _setUniformsForBuiltinsForRenderer(node: Node) {
    if (!node || !node._renderCmd) return

    const matrixP = new Matrix4()
    //var matrixMV = new kmMat4();
    const matrixMVP = new Matrix4()

    kmGLGetMatrix(KM_GL_PROJECTION, matrixP)
    //kmGLGetMatrix(KM_GL_MODELVIEW, node._stackMatrix);

    kmMat4Multiply(matrixMVP, matrixP, node._renderCmd._stackMatrix)

    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_PMATRIX_S], matrixP.mat, 1)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVMATRIX_S], node._renderCmd._stackMatrix.mat, 1)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVPMATRIX_S], matrixMVP.mat, 1)

    if (this._usesTime) {
      // This doesn't give the most accurate global time value.
      // Cocos2D doesn't store a high precision time value, so this will have to do.
      // Getting Mach time per frame per shader using time could be extremely expensive.
      const time = director.getTotalFrames() * director.getAnimationInterval()

      this.setUniformLocationWith4f(this._uniforms[UNIFORM_TIME_S], time / 10.0, time, time * 2, time * 4)
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_SINTIME_S], time / 8.0, time / 4.0, time / 2.0, Math.sin(time))
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_COSTIME_S], time / 8.0, time / 4.0, time / 2.0, Math.cos(time))
    }

    if (this._uniforms[UNIFORM_RANDOM01_S] !== -1)
      this.setUniformLocationWith4f(this._uniforms[UNIFORM_RANDOM01_S], Math.random(), Math.random(), Math.random(), Math.random())
  }

  /**
   * will update the MVP matrix on the MVP uniform if it is different than the previous call for this same shader program.
   */
  setUniformForModelViewProjectionMatrix() {
    this.setUniformLocationWithMatrix4fv(
      this._uniforms[UNIFORM_MVPMATRIX_S],
      getMat4MultiplyValue(projection_matrix_stack.top, modelview_matrix_stack.top),
    )
  }

  setUniformForModelViewProjectionMatrixWithMat4(swapMat4: Matrix4) {
    kmMat4Multiply(swapMat4, projection_matrix_stack.top, modelview_matrix_stack.top)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVPMATRIX_S], swapMat4.mat)
  }

  setUniformForModelViewAndProjectionMatrixWithMat4() {
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVMATRIX_S], modelview_matrix_stack.top.mat)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_PMATRIX_S], projection_matrix_stack.top.mat)
  }

  _setUniformForMVPMatrixWithMat4(modelViewMatrix: Matrix4) {
    if (!modelViewMatrix) throw new Error('modelView matrix is undefined.')
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_MVMATRIX_S], modelViewMatrix.mat)
    this.setUniformLocationWithMatrix4fv(this._uniforms[UNIFORM_PMATRIX_S], projection_matrix_stack.top.mat)
  }

  _updateProjectionUniform() {
    const stack = projection_matrix_stack
    if (stack.lastUpdated !== this._projectionUpdated) {
      this._glContext.uniformMatrix4fv(this._uniforms[UNIFORM_PMATRIX_S], false, stack.top.mat)
      this._projectionUpdated = stack.lastUpdated
    }
  }

  /**
   * returns the vertexShader error log
   * @return {String}
   */
  vertexShaderLog() {
    return this._glContext.getShaderInfoLog(this._vertShader)
  }

  /**
   * returns the vertexShader error log
   * @return {String}
   */
  getVertexShaderLog() {
    return this._glContext.getShaderInfoLog(this._vertShader)
  }

  /**
   * returns the fragmentShader error log
   * @returns {String}
   */
  getFragmentShaderLog() {
    return this._glContext.getShaderInfoLog(this._vertShader)
  }

  /**
   * returns the fragmentShader error log
   * @return {String}
   */
  fragmentShaderLog() {
    return this._glContext.getShaderInfoLog(this._fragShader)
  }

  /**
   * returns the program error log
   * @return {String}
   */
  programLog() {
    return this._glContext.getProgramInfoLog(this._programObj)
  }

  /**
   * returns the program error log
   * @return {String}
   */
  getProgramLog() {
    return this._glContext.getProgramInfoLog(this._programObj)
  }

  /**
   *  reload all shaders, this function is designed for android  <br/>
   *  when opengl context lost, so don't call it.
   */
  reset() {
    this._vertShader = null
    this._fragShader = null
    if (Object.keys(this._uniforms).length > 0) this._uniforms = {}

    // it is already deallocated by android
    //ccGLDeleteProgram(m_uProgram);
    this._glContext.deleteProgram(this._programObj)
    this._programObj = null

    // Purge uniform hash
    if (Object.keys(this._hashForUniforms).length > 0) this._hashForUniforms = {}
  }

  /**
   * get WebGLProgram object
   * @return {WebGLProgram}
   */
  getProgram(): any {
    return this._programObj
  }

  /**
   * Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
   * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
   * This is a hack, and should be removed once JSB fixes the retain/release bug
   */
  retain() {}

  release() {}

  static _isHighpSupported(): boolean {
    const ctx = _renderContext
    if (ctx.getShaderPrecisionFormat && GLProgram._highpSupported == null) {
      const highp = ctx.getShaderPrecisionFormat(ctx.FRAGMENT_SHADER, ctx.HIGH_FLOAT)
      GLProgram._highpSupported = highp.precision !== 0
    }
    return GLProgram._highpSupported
  }
}

/**
 * <p>
 *     Sets the shader program for this node
 *
 *     Since v2.0, each rendering node must set its shader program.
 *     It should be set in initialize phase.
 * </p>
 * @function
 * @param {Node} node
 * @param {GLProgram} program The shader program which fetches from CCShaderCache.
 * @example
 * setGLProgram(node, shaderCache.programForKey(SHADER_POSITION_TEXTURECOLOR));
 */
export function setProgram(node: any, program: GLProgram) {
  node.shaderProgram = program

  const children = node.children
  if (!children) return

  for (let i = 0; i < children.length; i++) setProgram(children[i], program)
}
