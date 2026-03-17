import { Node, winSize } from '../..'
import { LayerWebGLRenderCmd } from './LayerWebGLRenderCmd'

export const Layer = Node.extend(
  /** @lends Layer# */ {
    _className: 'Layer',

    /**
     * <p>Constructor of Layer, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor: function () {
      Node.prototype.ctor.call(this)
      this._ignoreAnchorPointForPosition = true
      this.setAnchorPoint(0.5, 0.5)
      this.setContentSize(winSize)
      this._cascadeColorEnabled = false
      this._cascadeOpacityEnabled = false
    },

    /**
     * Sets the layer to cache all of children to a bake sprite, and draw itself by bake sprite. recommend using it in UI.<br/>
     * This is useful only in html5 engine
     * @function
     * @see Layer#unbake
     */
    bake: function () {
      this._renderCmd.bake()
    },

    /**
     * Cancel the layer to cache all of children to a bake sprite.<br/>
     * This is useful only in html5 engine
     * @function
     * @see Layer#bake
     */
    unbake: function () {
      this._renderCmd.unbake()
    },

    /**
     * Determines if the layer is baked.
     * @function
     * @returns {boolean}
     * @see Layer#bake and Layer#unbake
     */
    isBaked: function () {
      return this._renderCmd._isBaked
    },

    visit: function (parent) {
      const cmd = this._renderCmd,
        parentCmd = parent ? parent._renderCmd : null

      // quick return if not visible
      if (!this._visible) {
        cmd._propagateFlagsDown(parentCmd)
        return
      }

      const renderer = renderer
      cmd.visit(parentCmd)

      if (cmd._isBaked) {
        renderer.pushRenderCommand(cmd)
        cmd._bakeSprite.visit(this)
      } else {
        let i
        const children = this._children
        const len = children.length
        let child
        if (len > 0) {
          if (this._reorderChildDirty) {
            this.sortAllChildren()
          }
          // draw children zOrder < 0
          for (i = 0; i < len; i++) {
            child = children[i]
            if (child._localZOrder < 0) {
              child.visit(this)
            } else {
              break
            }
          }

          renderer.pushRenderCommand(cmd)
          for (; i < len; i++) {
            children[i].visit(this)
          }
        } else {
          renderer.pushRenderCommand(cmd)
        }
      }
      cmd._dirtyFlag = 0
    },

    addChild: function (child, localZOrder, tag) {
      Node.prototype.addChild.call(this, child, localZOrder, tag)
      this._renderCmd._bakeForAddChild(child)
    },

    _createRenderCmd: function () {
      return new LayerWebGLRenderCmd(this)
    },
  },
)
