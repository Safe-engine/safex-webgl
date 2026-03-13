import { log } from '../helper/Debugger'
import { GLProgram } from './GLProgram'
import { glBindTexture2DN } from './GLStateCache'

export const types = {
  GL_FLOAT: 0,
  GL_INT: 1,
  GL_FLOAT_VEC2: 2,
  GL_FLOAT_VEC3: 3,
  GL_FLOAT_VEC4: 4,
  GL_FLOAT_MAT4: 5,
  GL_CALLBACK: 6,
  GL_TEXTURE: 7,
}

export class UniformValue {
  _uniform: any
  _glprogram: GLProgram
  _value: any
  _type = -1
  _textureId?: any

  constructor(uniform: any, glprogram: GLProgram) {
    this._uniform = uniform
    this._glprogram = glprogram
    this._value = null
  }

  setFloat(value: number) {
    this._value = value
    this._type = types.GL_FLOAT
  }

  setInt(value: number) {
    this._value = value
    this._type = types.GL_INT
  }

  setVec2(v1: number, v2: number) {
    this._value = [v1, v2]
    this._type = types.GL_FLOAT_VEC2
  }

  setVec2v(value: number[]) {
    this._value = value.slice(0)
    this._type = types.GL_FLOAT_VEC2
  }

  setVec3(v1: number, v2: number, v3: number) {
    this._value = [v1, v2, v3]
    this._type = types.GL_FLOAT_VEC3
  }

  setVec3v(value: number[]) {
    this._value = value.slice(0)
    this._type = types.GL_FLOAT_VEC3
  }

  setVec4(v1: number, v2: number, v3: number, v4: number) {
    this._value = [v1, v2, v3, v4]
    this._type = types.GL_FLOAT_VEC4
  }

  setVec4v(value: number[]) {
    this._value = value.slice(0)
    this._type = types.GL_FLOAT_VEC4
  }

  setMat4(value: number[]) {
    this._value = value.slice(0)
    this._type = types.GL_FLOAT_MAT4
  }

  setCallback(fn: (glprogram: any, uniform: any) => void) {
    this._value = fn
    this._type = types.GL_CALLBACK
  }

  setTexture(textureId: any, textureUnit: number) {
    this._value = textureUnit
    this._textureId = textureId
    this._type = types.GL_TEXTURE
  }

  apply() {
    switch (this._type) {
      case types.GL_INT:
        this._glprogram.setUniformLocationWith1i(this._uniform._location, this._value)
        break
      case types.GL_FLOAT:
        this._glprogram.setUniformLocationWith1f(this._uniform._location, this._value)
        break
      case types.GL_FLOAT_VEC2:
        this._glprogram.setUniformLocationWith2fv(this._uniform._location, this._value)
        break
      case types.GL_FLOAT_VEC3:
        this._glprogram.setUniformLocationWith3fv(this._uniform._location, this._value)
        break
      case types.GL_FLOAT_VEC4:
        this._glprogram.setUniformLocationWith4fv(this._uniform._location, this._value)
        break
      case types.GL_FLOAT_MAT4:
        this._glprogram.setUniformLocationWithMatrix4fv(this._uniform._location, this._value)
        break
      case types.GL_CALLBACK:
        this._value(this._glprogram, this._uniform)
        break
      case types.GL_TEXTURE:
        this._glprogram.setUniformLocationWith1i(this._uniform._location, this._value)
        glBindTexture2DN(this._value, this._textureId)
        break
      default:
    }
  }
}

export class GLProgramState {
  _glprogram: GLProgram
  _uniforms: Record<string, UniformValue>
  _boundTextureUnits: Record<string, number>
  _textureUnitIndex = 1 // Start at 1, as CC_Texture0 is bound to 0

  constructor(glprogram: GLProgram) {
    this._glprogram = glprogram
    this._uniforms = {}
    this._boundTextureUnits = {}

    const activeUniforms = glprogram._glContext.getProgramParameter(glprogram._programObj, glprogram._glContext.ACTIVE_UNIFORMS)

    for (let i = 0; i < activeUniforms; i += 1) {
      const uniform: any = glprogram._glContext.getActiveUniform(glprogram._programObj, i)
      if (uniform.name.indexOf('CC_') !== 0) {
        uniform._location = glprogram._glContext.getUniformLocation(glprogram._programObj, uniform.name)
        uniform._location._name = uniform.name
        const uniformValue = new UniformValue(uniform, glprogram)
        this._uniforms[uniform.name] = uniformValue
      }
    }
  }

  apply(modelView?: any) {
    this._glprogram.use()
    if (modelView) {
      this._glprogram._setUniformForMVPMatrixWithMat4(modelView)
    }

    for (const name in this._uniforms) {
      this._uniforms[name].apply()
    }
  }

  setGLProgram(glprogram: any) {
    this._glprogram = glprogram
  }

  getGLProgram() {
    return this._glprogram
  }

  getUniformCount() {
    return Object.keys(this._uniforms).length
  }

  getUniformValue(uniform: string) {
    return this._uniforms[uniform]
  }

  setUniformInt(uniform: string, value: number) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setInt(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformFloat(uniform: string, value: number) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setFloat(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec2(uniform: string, v1: number, v2: number) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec2(v1, v2)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec2v(uniform: string, value: number[]) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec2v(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec3(uniform: string, v1: number, v2: number, v3: number) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec3(v1, v2, v3)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec3v(uniform: string, value: number[]) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec3v(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec4(uniform: string, v1: number, v2: number, v3: number, v4: number) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec4(v1, v2, v3, v4)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformVec4v(uniform: string, value: number[]) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setVec4v(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformMat4(uniform: string, value: number[]) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setMat4(value)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformCallback(uniform: string, callback: (glprogram: any, uniform: any) => void) {
    const v = this.getUniformValue(uniform)
    if (v) {
      v.setCallback(callback)
    } else {
      log(`cocos2d: warning: Uniform not found: ${uniform}`)
    }
  }

  setUniformTexture(uniform: string, texture: any) {
    const uniformValue = this.getUniformValue(uniform)
    if (uniformValue) {
      const textureUnit = this._boundTextureUnits[uniform]
      if (textureUnit) {
        uniformValue.setTexture(texture, textureUnit)
      } else {
        uniformValue.setTexture(texture, this._textureUnitIndex)
        this._boundTextureUnits[uniform] = this._textureUnitIndex++
      }
    }
  }

  static _cache: Record<string, GLProgramState> = {}

  static getOrCreateWithGLProgram(glprogram: any) {
    let programState = GLProgramState._cache[glprogram.__instanceId]
    if (!programState) {
      programState = new GLProgramState(glprogram)
      GLProgramState._cache[glprogram.__instanceId] = programState
    }

    return programState
  }
}
