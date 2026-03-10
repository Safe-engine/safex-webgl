import { FiniteTimeAction } from './FiniteTimeAction'

/**
 * Instant actions are immediate actions. They don't have a duration like.
 * the CCIntervalAction actions.
 * @class
 * @extends FiniteTimeAction
 */
export class ActionInstant extends FiniteTimeAction {
  constructor() {
    super()
  }

  /**
   * return true if the action has finished.
   */
  isDone(): boolean {
    return true
  }

  /**
   * called every frame with it's delta time.
   * DON'T override unless you know what you are doing.
   */
  step(dt: number) {
    this.update(1)
  }

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   */
  update(dt: number) {
    // nothing
  }

  /**
   * returns a reversed action.
   */
  reverse(): ActionInstant {
    return this.clone()
  }

  /**
   * to copy object with deep copy.
   * returns a clone of action.
   */
  clone(): ActionInstant {
    return new ActionInstant()
  }
}

/**
 * Show the node.
 */
export class Show extends ActionInstant {
  constructor() {
    super()
  }

  update(dt: number) {
    this.target.visible = true
  }

  reverse(): Hide {
    return new Hide()
  }

  clone(): Show {
    return new Show()
  }
}

/**
 * Show the Node.
 * @function
 * @return {Show}
 * @example
 * // example
 * var showAction = show();
 */
export const show = function () {
  return new Show()
}

/**
 * Show the Node. Please use show instead.
 * @static
 * @deprecated since v3.0 <br /> Please use show instead.
 * @return {Show}
 */
Show.create = show

/**
 * Hide the node.
 */
export class Hide extends ActionInstant {
  constructor() {
    super()
  }

  update(dt: number) {
    this.target.visible = false
  }

  reverse(): Show {
    return new Show()
  }

  clone(): Hide {
    return new Hide()
  }
}

/**
 * Hide the node.
 * @function
 * @return {Hide}
 * @example
 * // example
 * var hideAction = hide();
 */
export const hide = function () {
  return new Hide()
}

/**
 * Hide the node. Please use hide instead.
 * @static
 * @deprecated since v3.0 <br /> Please use hide instead.
 * @return {Hide}
 * @example
 * // example
 * var hideAction = hide();
 */
Hide.create = hide

/**
 * Toggles the visibility of a node.
 */
export class ToggleVisibility extends ActionInstant {
  constructor() {
    super()
  }

  update(dt: number) {
    this.target.visible = !this.target.visible
  }

  reverse(): ToggleVisibility {
    return new ToggleVisibility()
  }

  clone(): ToggleVisibility {
    return new ToggleVisibility()
  }
}

/**
 * Toggles the visibility of a node.
 * @function
 * @return {ToggleVisibility}
 * @example
 * // example
 * var toggleVisibilityAction = toggleVisibility();
 */
export const toggleVisibility = function () {
  return new ToggleVisibility()
}

/**
 * Toggles the visibility of a node. Please use toggleVisibility instead.
 * @static
 * @deprecated since v3.0 <br /> Please use toggleVisibility instead.
 * @return {ToggleVisibility}
 */
ToggleVisibility.create = toggleVisibility

/**
 * Delete self in the next frame.
 * @class
 * @extends ActionInstant
 * @param {Boolean} [isNeedCleanUp=true]
 *
 * @example
 * // example
 * var removeSelfAction = new RemoveSelf(false);
 */
export class RemoveSelf extends ActionInstant {
  _isNeedCleanUp = true

  constructor(isNeedCleanUp = true) {
    super()
    this._isNeedCleanUp = isNeedCleanUp
  }

  update(dt: number) {
    this.target.removeFromParent(this._isNeedCleanUp)
  }

  init(isNeedCleanUp: boolean): boolean {
    this._isNeedCleanUp = isNeedCleanUp
    return true
  }

  reverse(): RemoveSelf {
    return new RemoveSelf(this._isNeedCleanUp)
  }

  clone(): RemoveSelf {
    return new RemoveSelf(this._isNeedCleanUp)
  }
}

/**
 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
 *
 * @function
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {RemoveSelf}
 *
 * @example
 * // example
 * var removeSelfAction = removeSelf();
 */
export const removeSelf = function (isNeedCleanUp?: boolean) {
  return new RemoveSelf(isNeedCleanUp)
}

/**
 * Please use removeSelf instead.
 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
 *
 * @static
 * @deprecated since v3.0 <br /> Please use removeSelf instead.
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {RemoveSelf}
 */
RemoveSelf.create = removeSelf

/**
 * Flips the sprite horizontally.
 */
export class FlipX extends ActionInstant {
  _flippedX = false

  constructor(flip = false) {
    super()
    this._flippedX = false
    flip !== undefined && this.initWithFlipX(flip)
  }

  initWithFlipX(flip: boolean): boolean {
    this._flippedX = flip
    return true
  }

  update(dt: number) {
    this.target.flippedX = this._flippedX
  }

  reverse(): FlipX {
    return new FlipX(!this._flippedX)
  }

  clone(): FlipX {
    const action = new FlipX()
    action.initWithFlipX(this._flippedX)
    return action
  }
}

/**
 * Create a FlipX action to flip or unflip the target.
 *
 * @function
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @return {FlipX}
 * @example
 * var flipXAction = flipX(true);
 */
export const flipX = function (flip?: boolean) {
  return new FlipX(flip)
}

/**
 * Plese use flipX instead.
 * Create a FlipX action to flip or unflip the target
 *
 * @static
 * @deprecated since v3.0 <br /> Plese use flipX instead.
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @return {FlipX}
 */
FlipX.create = flipX

/**
 * Flips the sprite vertically
 * @class
 * @extends ActionInstant
 * @param {Boolean} flip
 * @example
 * var flipYAction = new FlipY(true);
 */
export class FlipY extends ActionInstant {
  _flippedY = false

  constructor(flip = false) {
    super()
    this._flippedY = false
    flip !== undefined && this.initWithFlipY(flip)
  }

  initWithFlipY(flip: boolean): boolean {
    this._flippedY = flip
    return true
  }

  update(dt: number) {
    this.target.flippedY = this._flippedY
  }

  reverse(): FlipY {
    return new FlipY(!this._flippedY)
  }

  clone(): FlipY {
    const action = new FlipY()
    action.initWithFlipY(this._flippedY)
    return action
  }
}

/**
 * Create a FlipY action to flip or unflip the target.
 *
 * @function
 * @param {Boolean} flip
 * @return {FlipY}
 * @example
 * var flipYAction = flipY(true);
 */
export const flipY = function (flip?: boolean) {
  return new FlipY(flip)
}

/**
 * Please use flipY instead
 * Create a FlipY action to flip or unflip the target
 *
 * @static
 * @deprecated since v3.0 <br /> Please use flipY instead.
 * @param {Boolean} flip
 * @return {FlipY}
 */
FlipY.create = flipY

/**
 * Places the node in a certain position
 * @class
 * @extends ActionInstant
 * @param {Point|Number} pos
 * @param {Number} [y]
 * @example
 * var placeAction = new Place(p(200, 200));
 * var placeAction = new Place(200, 200);
 */
export class Place extends ActionInstant {
  _x = 0
  _y = 0

  constructor(pos?: any, y?: number) {
    super()
    this._x = 0
    this._y = 0

    if (pos !== undefined) {
      if (pos.x !== undefined) {
        y = pos.y
        pos = pos.x
      }
      this.initWithPosition(pos, y as number)
    }
  }

  initWithPosition(x: number, y: number): boolean {
    this._x = x
    this._y = y
    return true
  }

  update(dt: number) {
    this.target.setPosition(this._x, this._y)
  }

  clone(): Place {
    const action = new Place()
    action.initWithPosition(this._x, this._y)
    return action
  }
}

/**
 * Creates a Place action with a position.
 * @function
 * @param {Point|Number} pos
 * @param {Number} [y]
 * @return {Place}
 * @example
 * // example
 * var placeAction = place(p(200, 200));
 * var placeAction = place(200, 200);
 */
export const place = function (pos?: any, y?: number) {
  return new Place(pos, y)
}

/**
 * Please use place instead.
 * Creates a Place action with a position.
 * @static
 * @deprecated since v3.0 <br /> Please use place instead.
 * @param {Point|Number} pos
 * @param {Number} [y]
 * @return {Place}
 */
Place.create = place

/**
 * Calls a 'callback'.
 * @class
 * @extends ActionInstant
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @example
 * // example
 * // CallFunc without data
 * var finish = new CallFunc(this.removeSprite, this);
 *
 * // CallFunc with data
 * var finish = new CallFunc(this.removeFromParentAndCleanup, this,  true);
 */
export class CallFunc extends ActionInstant {
  _selectorTarget: any = null
  _function: (...args: any) => void | null = null
  _data: any = null

  constructor(selector?: (...args: any) => void, selectorTarget?: any, data?: any) {
    super()
    if (selector || selectorTarget || data !== undefined) {
      this.initWithFunction(selector!, selectorTarget, data)
    }
  }

  initWithFunction(selector: (...args: any) => void, selectorTarget?: any, data?: any): boolean {
    if (selector) {
      this._function = selector
    }
    if (selectorTarget) {
      this._selectorTarget = selectorTarget
    }
    if (data !== undefined) {
      this._data = data
    }
    return true
  }

  execute() {
    if (this._function) {
      this._function.call(this._selectorTarget, this.target, this._data)
    }
  }

  update(dt: number) {
    this.execute()
  }

  getTargetCallback() {
    return this._selectorTarget
  }

  setTargetCallback(sel: any) {
    if (sel !== this._selectorTarget) {
      if (this._selectorTarget) this._selectorTarget = null
      this._selectorTarget = sel
    }
  }

  clone(): CallFunc {
    const action = new CallFunc()
    action.initWithFunction(this._function!, this._selectorTarget, this._data)
    return action
  }
}

/**
 * Creates the action with the callback
 * @function
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @return {CallFunc}
 * @example
 * // example
 * // CallFunc without data
 * var finish = callFunc(this.removeSprite, this);
 *
 * // CallFunc with data
 * var finish = callFunc(this.removeFromParentAndCleanup, this._grossini,  true);
 */
export const callFunc = function (selector?: (...args: any) => void, selectorTarget?: any, data?: any) {
  return new CallFunc(selector, selectorTarget, data)
}
