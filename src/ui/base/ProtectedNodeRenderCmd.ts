import { Color, Node } from './../..'

export const ProtectedNodeRenderCmd = {
  _updateDisplayColor: function (parentColor) {
    const node = this._node
    const locDispColor = this._displayedColor,
      locRealColor = node._realColor
    let i, len, selChildren, item
    if (this._cascadeColorEnabledDirty && !node._cascadeColorEnabled) {
      locDispColor.r = locRealColor.r
      locDispColor.g = locRealColor.g
      locDispColor.b = locRealColor.b
      const whiteColor = new Color(255, 255, 255, 255)
      selChildren = node._children
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) item._renderCmd._updateDisplayColor(whiteColor)
      }
      this._cascadeColorEnabledDirty = false
    } else {
      if (parentColor === undefined) {
        const locParent = node._parent
        if (locParent && locParent._cascadeColorEnabled) parentColor = locParent.getDisplayedColor()
        else parentColor = Color.WHITE
      }
      locDispColor.r = 0 | ((locRealColor.r * parentColor.r) / 255.0)
      locDispColor.g = 0 | ((locRealColor.g * parentColor.g) / 255.0)
      locDispColor.b = 0 | ((locRealColor.b * parentColor.b) / 255.0)
      if (node._cascadeColorEnabled) {
        selChildren = node._children
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i]
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayColor(locDispColor)
            item._renderCmd._updateColor()
          }
        }
      }
      selChildren = node._protectedChildren
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) {
          item._renderCmd._updateDisplayColor(locDispColor)
          item._renderCmd._updateColor()
        }
      }
    }
    this._dirtyFlag = (this._dirtyFlag & Node._dirtyFlags.colorDirty) ^ this._dirtyFlag
  },

  _updateDisplayOpacity: function (parentOpacity) {
    const node = this._node
    let i, len, selChildren, item
    if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
      this._displayedOpacity = node._realOpacity
      selChildren = node._children
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) item._renderCmd._updateDisplayOpacity(255)
      }
      this._cascadeOpacityEnabledDirty = false
    } else {
      if (parentOpacity === undefined) {
        const locParent = node._parent
        parentOpacity = 255
        if (locParent && locParent._cascadeOpacityEnabled) parentOpacity = locParent.getDisplayedOpacity()
      }
      this._displayedOpacity = (node._realOpacity * parentOpacity) / 255.0
      if (node._cascadeOpacityEnabled) {
        selChildren = node._children
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i]
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayOpacity(this._displayedOpacity)
            item._renderCmd._updateColor()
          }
        }
      }
      selChildren = node._protectedChildren
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i]
        if (item && item._renderCmd) {
          item._renderCmd._updateDisplayOpacity(this._displayedOpacity)
          item._renderCmd._updateColor()
        }
      }
    }
    this._dirtyFlag = (this._dirtyFlag & Node._dirtyFlags.opacityDirty) ^ this._dirtyFlag
  },

  _changeProtectedChild: function (child) {
    const cmd = child._renderCmd
    let dirty = cmd._dirtyFlag
    const flags = Node._dirtyFlags

    if (this._dirtyFlag & flags.colorDirty) dirty |= flags.colorDirty

    if (this._dirtyFlag & flags.opacityDirty) dirty |= flags.opacityDirty

    const colorDirty = dirty & flags.colorDirty,
      opacityDirty = dirty & flags.opacityDirty

    if (colorDirty) cmd._updateDisplayColor(this._displayedColor)
    if (opacityDirty) cmd._updateDisplayOpacity(this._displayedOpacity)
    if (colorDirty || opacityDirty) cmd._updateColor()
  },
}
