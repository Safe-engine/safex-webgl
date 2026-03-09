import { ONE, ONE_MINUS_SRC_ALPHA, SRC_ALPHA, ZERO } from './Macro'

/**
 * Blend Function used for textures
 * @Class BlendFunc
 * @Constructor
 * @param {Number} src1 source blend function
 * @param {Number} dst1 destination blend function
 */
export class BlendFunc {
  src: number
  dst: number

  constructor(src1: number, dst1: number) {
    this.src = src1
    this.dst = dst1
  }

  static _disable(): BlendFunc {
    return new BlendFunc(ONE, ZERO)
  }

  static _alphaPremultiplied(): BlendFunc {
    return new BlendFunc(ONE, ONE_MINUS_SRC_ALPHA)
  }

  static _alphaNonPremultiplied(): BlendFunc {
    return new BlendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)
  }

  static _additive(): BlendFunc {
    return new BlendFunc(SRC_ALPHA, ONE)
  }

  /** @expose */
  static get DISABLE(): BlendFunc {
    return BlendFunc._disable()
  }

  /** @expose */
  static get ALPHA_PREMULTIPLIED(): BlendFunc {
    return BlendFunc._alphaPremultiplied()
  }

  /** @expose */
  static get ALPHA_NON_PREMULTIPLIED(): BlendFunc {
    return BlendFunc._alphaNonPremultiplied()
  }

  /** @expose */
  static get ADDITIVE(): BlendFunc {
    return BlendFunc._additive()
  }
}

/**
 * @function
 * @returns {BlendFunc}
 */
export function blendFuncDisable(): BlendFunc {
  return new BlendFunc(ONE, ZERO)
}
