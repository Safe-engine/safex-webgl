import { isObject } from '../../helper/checkType'

export class Margin {
  left = 0
  top = 0
  right = 0
  bottom = 0

  /**
   * Constructor of Margin.
   * @param {Number|Margin} margin a margin or left
   * @param {Number} [top]
   * @param {Number} [right]
   * @param {Number} [bottom]
   */
  constructor(margin?, top?, right?, bottom?) {
    if (margin !== undefined && top === undefined) {
      this.left = margin.left
      this.top = margin.top
      this.right = margin.right
      this.bottom = margin.bottom
    }
    if (bottom !== undefined) {
      this.left = margin
      this.top = top
      this.right = right
      this.bottom = bottom
    }
  }

  /**
   * Sets boundary of margin
   * @param {Number} l left
   * @param {Number} t top
   * @param {Number} r right
   * @param {Number} b bottom
   */
  setMargin(l, t, r, b) {
    this.left = l
    this.top = t
    this.right = r
    this.bottom = b
  }

  /**
   * Checks target whether equals itself.
   * @param {Margin} target
   * @returns {boolean}
   */
  equals(target) {
    return this.left === target.left && this.top === target.top && this.right === target.right && this.bottom === target.bottom
  }
}

/**
 * Gets a zero margin object
 * @function
 * @returns {Margin}
 */
export const MarginZero = () => new Margin(0, 0, 0, 0)

/**
 * Layout parameter contains a margin and layout parameter type. It uses for LayoutManager.
 * @class
 * @extends Class
 */
export class LayoutParameter {
  _margin = null
  _layoutParameterType = null

  /**
   * The constructor of LayoutParameter.
   * @function
   */
  constructor() {
    this._margin = new Margin()
    this._layoutParameterType = LayoutParameter.NONE
  }

  /**
   * Sets Margin to LayoutParameter.
   * @param {Margin} margin
   */
  setMargin(margin, t, r, b) {
    if (isObject(margin)) {
      this._margin.left = margin.left
      this._margin.top = margin.top
      this._margin.right = margin.right
      this._margin.bottom = margin.bottom
    } else {
      this._margin.left = margin
      this._margin.top = t
      this._margin.right = r
      this._margin.bottom = b
    }
  }

  /**
   * Gets Margin of LayoutParameter.
   * @returns {Margin}
   */
  getMargin() {
    return this._margin
  }

  /**
   * Gets LayoutParameterType of LayoutParameter.
   * @returns {Number}
   */
  getLayoutType() {
    return this._layoutParameterType
  }

  /**
   * Clones a LayoutParameter object from itself.
   * @returns {LayoutParameter}
   */
  clone() {
    const parameter = this._createCloneInstance()
    parameter._copyProperties(this)
    return parameter
  }

  /**
   * create clone instance.
   * @returns {LayoutParameter}
   */
  _createCloneInstance() {
    return new LayoutParameter()
  }

  /**
   * copy properties from model.
   * @param {LayoutParameter} model
   */
  _copyProperties(model) {
    this._margin.bottom = model._margin.bottom
    this._margin.left = model._margin.left
    this._margin.right = model._margin.right
    this._margin.top = model._margin.top
  }

  // Constants
  //layout parameter type
  /**
   * The none of LayoutParameter's type.
   * @constant
   * @type {number}
   */
  static NONE = 0
  /**
   * The linear of LayoutParameter's type.
   * @constant
   * @type {number}
   */
  static LINEAR = 1
  /**
   * The relative of LayoutParameter's type.
   * @constant
   * @type {number}
   */
  static RELATIVE = 2
}

/**
 * The linear of Layout parameter. its parameter type is LayoutParameter.LINEAR.
 * @class
 * @extends LayoutParameter
 */
export class LinearLayoutParameter extends LayoutParameter {
  _linearGravity = null

  /**
   * The constructor of LinearLayoutParameter.
   * @function
   */
  constructor() {
    super()
    this._linearGravity = LinearLayoutParameter.NONE
    this._layoutParameterType = LayoutParameter.LINEAR
  }

  /**
   * Sets LinearGravity to LayoutParameter.
   * @param {Number} gravity
   */
  setGravity(gravity) {
    this._linearGravity = gravity
  }

  /**
   * Gets LinearGravity of LayoutParameter.
   * @returns {Number}
   */
  getGravity() {
    return this._linearGravity
  }

  _createCloneInstance() {
    return new LinearLayoutParameter()
  }

  _copyProperties(model) {
    super._copyProperties(model)
    if (model instanceof LinearLayoutParameter) this.setGravity(model._linearGravity)
  }

  // Constants
  //Linear layout parameter LinearGravity
  /**
   * The none of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static NONE = 0

  /**
   * The left of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static LEFT = 1
  /**
   * The top of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static TOP = 2
  /**
   * The right of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static RIGHT = 3
  /**
   * The bottom of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static BOTTOM = 4
  /**
   * The center vertical of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static CENTER_VERTICAL = 5
  /**
   * The center horizontal of LinearLayoutParameter's linear gravity.
   * @constant
   * @type {number}
   */
  static CENTER_HORIZONTAL = 6
}

/**
 * The relative of layout parameter. Its layout parameter type is LayoutParameter.RELATIVE.
 * @class
 * @extends LayoutParameter
 */
export class RelativeLayoutParameter extends LayoutParameter {
  _relativeAlign = null
  _relativeWidgetName = ''
  _relativeLayoutName = ''
  _put = false

  /**
   * The constructor of RelativeLayoutParameter
   * @function
   */
  constructor() {
    super()
    this._relativeAlign = RelativeLayoutParameter.NONE
    this._relativeWidgetName = ''
    this._relativeLayoutName = ''
    this._put = false
    this._layoutParameterType = LayoutParameter.RELATIVE
  }

  /**
   * Sets RelativeAlign parameter for LayoutParameter.
   * @param {Number} align
   */
  setAlign(align) {
    this._relativeAlign = align
  }

  /**
   * Gets RelativeAlign parameter for LayoutParameter.
   * @returns {Number}
   */
  getAlign() {
    return this._relativeAlign
  }

  /**
   * Sets a key for LayoutParameter. Witch widget named this is relative to.
   * @param {String} name
   */
  setRelativeToWidgetName(name) {
    this._relativeWidgetName = name
  }

  /**
   * Gets the key of LayoutParameter. Witch widget named this is relative to.
   * @returns {string}
   */
  getRelativeToWidgetName() {
    return this._relativeWidgetName
  }

  /**
   * Sets a name in Relative Layout for LayoutParameter.
   * @param {String} name
   */
  setRelativeName(name) {
    this._relativeLayoutName = name
  }

  /**
   * Gets a name in Relative Layout of LayoutParameter.
   * @returns {string}
   */
  getRelativeName() {
    return this._relativeLayoutName
  }

  _createCloneInstance() {
    return new RelativeLayoutParameter()
  }

  _copyProperties(model) {
    super._copyProperties(model)
    if (model instanceof RelativeLayoutParameter) {
      this.setAlign(model._relativeAlign)
      this.setRelativeToWidgetName(model._relativeWidgetName)
      this.setRelativeName(model._relativeLayoutName)
    }
  }

  // Constants
  //Relative layout parameter RelativeAlign
  /**
   * The none of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static NONE = 0
  /**
   * The parent's top left of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_TOP_LEFT = 1
  /**
   * The parent's top center horizontal of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_TOP_CENTER_HORIZONTAL = 2
  /**
   * The parent's top right of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_TOP_RIGHT = 3
  /**
   * The parent's left center vertical of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_LEFT_CENTER_VERTICAL = 4

  /**
   * The center in parent of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static CENTER_IN_PARENT = 5

  /**
   * The parent's right center vertical of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_RIGHT_CENTER_VERTICAL = 6
  /**
   * The parent's left bottom of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_LEFT_BOTTOM = 7
  /**
   * The parent's bottom center horizontal of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_BOTTOM_CENTER_HORIZONTAL = 8
  /**
   * The parent's right bottom of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static PARENT_RIGHT_BOTTOM = 9

  /**
   * The location above left align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_ABOVE_LEFTALIGN = 10
  /**
   * The location above center of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_ABOVE_CENTER = 11
  /**
   * The location above right align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_ABOVE_RIGHTALIGN = 12
  /**
   * The location left of top align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_LEFT_OF_TOPALIGN = 13
  /**
   * The location left of center of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_LEFT_OF_CENTER = 14
  /**
   * The location left of bottom align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_LEFT_OF_BOTTOMALIGN = 15
  /**
   * The location right of top align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_RIGHT_OF_TOPALIGN = 16
  /**
   * The location right of center of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_RIGHT_OF_CENTER = 17
  /**
   * The location right of bottom align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_RIGHT_OF_BOTTOMALIGN = 18
  /**
   * The location below left align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_BELOW_LEFTALIGN = 19
  /**
   * The location below center of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_BELOW_CENTER = 20
  /**
   * The location below right align of RelativeLayoutParameter's relative align.
   * @constant
   * @type {number}
   */
  static LOCATION_BELOW_RIGHTALIGN = 21
}
