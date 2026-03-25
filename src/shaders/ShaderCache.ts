import {
    ATTRIBUTE_NAME_COLOR,
    ATTRIBUTE_NAME_POSITION,
    ATTRIBUTE_NAME_TEX_COORD,
    SHADER_POSITION_COLOR,
    SHADER_POSITION_LENGTHTEXTURECOLOR,
    SHADER_POSITION_TEXTURE,
    SHADER_POSITION_TEXTURE_UCOLOR,
    SHADER_POSITION_TEXTUREA8COLOR,
    SHADER_POSITION_TEXTURECOLOR,
    SHADER_POSITION_TEXTURECOLORALPHATEST,
    SHADER_POSITION_UCOLOR,
    SHADER_SPRITE_POSITION_COLOR,
    SHADER_SPRITE_POSITION_TEXTURECOLOR,
    SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY,
    SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST,
    VERTEX_ATTRIB_COLOR,
    VERTEX_ATTRIB_POSITION,
    VERTEX_ATTRIB_TEX_COORDS,
} from '../core/platform/Macro'
import { log } from '../helper/Debugger'
import { GLProgram } from './GLProgram'
import {
    SHADER_POSITION_COLOR_FRAG,
    SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG,
    SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT,
    SHADER_POSITION_COLOR_VERT,
    SHADER_POSITION_TEXTURE_A8COLOR_FRAG,
    SHADER_POSITION_TEXTURE_A8COLOR_VERT,
    SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG,
    SHADER_POSITION_TEXTURE_COLOR_FRAG,
    SHADER_POSITION_TEXTURE_COLOR_VERT,
    SHADER_POSITION_TEXTURE_FRAG,
    SHADER_POSITION_TEXTURE_UCOLOR_FRAG,
    SHADER_POSITION_TEXTURE_UCOLOR_VERT,
    SHADER_POSITION_TEXTURE_VERT,
    SHADER_POSITION_UCOLOR_FRAG,
    SHADER_POSITION_UCOLOR_VERT,
    SHADER_SPRITE_POSITION_COLOR_VERT,
    SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG,
    SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT,
} from './Shaders'

export const shaderCache = /** @lends shaderCache# */ {
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_TEXTURECOLOR: 0,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_TEXTURECOLOR_ALPHATEST: 1,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_COLOR: 2,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_TEXTURE: 3,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_TEXTURE_UCOLOR: 4,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_TEXTURE_A8COLOR: 5,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_UCOLOR: 6,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_POSITION_LENGTH_TEXTURECOLOR: 7,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_SPRITE_POSITION_TEXTURECOLOR: 8,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_SPRITE_POSITION_TEXTURECOLOR_ALPHATEST: 9,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_SPRITE_POSITION_COLOR: 10,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_SPRITE_POSITION_TEXTURECOLOR_GRAY: 11,
  /**
   * @public
   * @constant
   * @type {Number}
   */
  TYPE_MAX: 11,

  _keyMap: [
    SHADER_POSITION_TEXTURECOLOR,
    SHADER_POSITION_TEXTURECOLORALPHATEST,
    SHADER_POSITION_COLOR,
    SHADER_POSITION_TEXTURE,
    SHADER_POSITION_TEXTURE_UCOLOR,
    SHADER_POSITION_TEXTUREA8COLOR,
    SHADER_POSITION_UCOLOR,
    SHADER_POSITION_LENGTHTEXTURECOLOR,
    SHADER_SPRITE_POSITION_TEXTURECOLOR,
    SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST,
    SHADER_SPRITE_POSITION_COLOR,
    SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY,
  ],

  _programs: {},

  _init: function () {
    this.loadDefaultShaders()
    return true
  },

  _loadDefaultShader: function (program: GLProgram, type: string) {
    switch (type) {
      case SHADER_POSITION_TEXTURECOLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_TEXTURE_COLOR_VERT, SHADER_POSITION_TEXTURE_COLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_SPRITE_POSITION_TEXTURECOLOR:
        program.initWithVertexShaderByteArray(SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, SHADER_POSITION_TEXTURE_COLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY:
        program.initWithVertexShaderByteArray(SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_POSITION_TEXTURECOLORALPHATEST:
        program.initWithVertexShaderByteArray(SHADER_POSITION_TEXTURE_COLOR_VERT, SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST:
        program.initWithVertexShaderByteArray(SHADER_SPRITE_POSITION_TEXTURE_COLOR_VERT, SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_POSITION_COLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_COLOR_VERT, SHADER_POSITION_COLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        break
      case SHADER_SPRITE_POSITION_COLOR:
        program.initWithVertexShaderByteArray(SHADER_SPRITE_POSITION_COLOR_VERT, SHADER_POSITION_COLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        break
      case SHADER_POSITION_TEXTURE:
        program.initWithVertexShaderByteArray(SHADER_POSITION_TEXTURE_VERT, SHADER_POSITION_TEXTURE_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_POSITION_TEXTURE_UCOLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_TEXTURE_UCOLOR_VERT, SHADER_POSITION_TEXTURE_UCOLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_POSITION_TEXTUREA8COLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_TEXTURE_A8COLOR_VERT, SHADER_POSITION_TEXTURE_A8COLOR_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        break
      case SHADER_POSITION_UCOLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_UCOLOR_VERT, SHADER_POSITION_UCOLOR_FRAG)
        program.addAttribute('aVertex', VERTEX_ATTRIB_POSITION)
        break
      case SHADER_POSITION_LENGTHTEXTURECOLOR:
        program.initWithVertexShaderByteArray(SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT, SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG)
        program.addAttribute(ATTRIBUTE_NAME_POSITION, VERTEX_ATTRIB_POSITION)
        program.addAttribute(ATTRIBUTE_NAME_TEX_COORD, VERTEX_ATTRIB_TEX_COORDS)
        program.addAttribute(ATTRIBUTE_NAME_COLOR, VERTEX_ATTRIB_COLOR)
        break
      default:
        log('safex: shaderCache._loadDefaultShader, error shader type')
        return
    }

    program.link()
    program.updateUniforms()

    // checkGLErrorDebug()
  },

  /**
   * loads the default shaders
   */
  loadDefaultShaders: function () {
    for (let i = 0; i < this.TYPE_MAX; ++i) {
      const key = this._keyMap[i]
      this.programForKey(key)
    }
  },

  /**
   * reload the default shaders
   */
  reloadDefaultShaders: function () {
    // reset all programs and reload them

    // Position Texture Color shader
    let program = this.programForKey(SHADER_POSITION_TEXTURECOLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_TEXTURECOLOR)

    // Sprite Position Texture Color shader
    program = this.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_SPRITE_POSITION_TEXTURECOLOR)

    // Position Texture Color alpha test
    program = this.programForKey(SHADER_POSITION_TEXTURECOLORALPHATEST)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_TEXTURECOLORALPHATEST)

    // Sprite Position Texture Color alpha shader
    program = this.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST)
    program.reset()
    this._loadDefaultShader(program, SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST)

    //
    // Position, Color shader
    //
    program = this.programForKey(SHADER_POSITION_COLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_COLOR)

    //
    // Position Texture shader
    //
    program = this.programForKey(SHADER_POSITION_TEXTURE)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_TEXTURE)

    //Position Texture Gray shader
    program = this.programForKey(SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG)
    program.reset()
    this._loadDefaultShader(program, SHADER_SPRITE_POSITION_TEXTURE_COLOR_GRAY_FRAG)

    //
    // Position, Texture attribs, 1 Color as uniform shader
    //
    program = this.programForKey(SHADER_POSITION_TEXTURE_UCOLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_TEXTURE_UCOLOR)

    //
    // Position Texture A8 Color shader
    //
    program = this.programForKey(SHADER_POSITION_TEXTUREA8COLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_TEXTUREA8COLOR)

    //
    // Position and 1 color passed as a uniform (to similate glColor4ub )
    //
    program = this.programForKey(SHADER_POSITION_UCOLOR)
    program.reset()
    this._loadDefaultShader(program, SHADER_POSITION_UCOLOR)
  },

  /**
   * returns a GL program for a given key
   * @param {String} key
   */
  programForKey: function (key: string) {
    if (!this._programs[key]) {
      const program = new GLProgram()
      this._loadDefaultShader(program, key)
      this._programs[key] = program
    }

    return this._programs[key] as GLProgram
  },

  /**
   * returns a GL program for a shader name
   * @param {String} shaderName
   * @return {GLProgram}
   */
  getProgram: function (shaderName) {
    return this.programForKey(shaderName)
  },

  /**
   * adds a CCGLProgram to the cache for a given name
   * @param {GLProgram} program
   * @param {String} key
   */
  addProgram: function (program, key) {
    this._programs[key] = program
  },
}
