import { Sprite } from './Sprite'

export function defineGetterSetter(proto, prop, getter, setter?, getterName?, setterName?) {
  if (proto.__defineGetter__) {
    getter && proto.__defineGetter__(prop, getter)
    setter && proto.__defineSetter__(prop, setter)
  } else if (Object.defineProperty) {
    const desc: any = { enumerable: false, configurable: true }
    getter && (desc.get = getter)
    setter && (desc.set = setter)
    Object.defineProperty(proto, prop, desc)
  } else {
    throw new Error('browser does not support getters')
  }

  if (!getterName && !setterName) {
    // Lookup getter/setter function
    const hasGetter = getter != null,
      hasSetter = setter != undefined,
      props = Object.getOwnPropertyNames(proto)
    for (let i = 0; i < props.length; i++) {
      const name = props[i]

      if (
        (proto.__lookupGetter__ ? proto.__lookupGetter__(name) : Object.getOwnPropertyDescriptor(proto, name)) ||
        typeof proto[name] !== 'function'
      )
        continue

      const func = proto[name]
      if (hasGetter && func === getter) {
        getterName = name
        if (!hasSetter || setterName) break
      }
      if (hasSetter && func === setter) {
        setterName = name
        if (!hasGetter || getterName) break
      }
    }
  }

  // Found getter/setter
  const ctor = proto.constructor
  if (getterName) {
    if (!ctor.__getters__) {
      ctor.__getters__ = {}
    }
    ctor.__getters__[getterName] = prop
  }
  if (setterName) {
    if (!ctor.__setters__) {
      ctor.__setters__ = {}
    }
    ctor.__setters__[setterName] = prop
  }
}

export const PrototypeSprite = function () {
  const _p = Sprite.prototype

  // Override properties
  defineGetterSetter(_p, 'opacityModifyRGB', _p.isOpacityModifyRGB, _p.setOpacityModifyRGB)
  defineGetterSetter(_p, 'opacity', _p.getOpacity, _p.setOpacity)
  defineGetterSetter(_p, 'color', _p.getColor, _p.setColor)

  // Extended properties
  /** @expose */
  _p.dirty
  /** @expose */
  // _p.flippedX;
  defineGetterSetter(_p, 'flippedX', _p.isFlippedX, _p.setFlippedX)
  /** @expose */
  // _p.flippedY;
  defineGetterSetter(_p, 'flippedY', _p.isFlippedY, _p.setFlippedY)
  /** @expose */
  // _p.offsetX;
  defineGetterSetter(_p, 'offsetX', _p._getOffsetX)
  /** @expose */
  // _p.offsetY;
  defineGetterSetter(_p, 'offsetY', _p._getOffsetY)
  /** @expose */
  _p.atlasIndex
  /** @expose */
  _p.texture
  defineGetterSetter(_p, 'texture', _p.getTexture, _p.setTexture)
  /** @expose */
  // _p.textureRectRotated;
  defineGetterSetter(_p, 'textureRectRotated', _p.isTextureRectRotated)
  /** @expose */
  _p.textureAtlas
  /** @expose */
  // _p.batchNode;
  defineGetterSetter(_p, 'batchNode', _p.getBatchNode, _p.setBatchNode)
  /** @expose */
  // _p.quad;
  defineGetterSetter(_p, 'quad', _p.getQuad)
}
