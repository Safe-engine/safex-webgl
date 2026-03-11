import { _renderContext, renderer } from '../..'
import { Layout } from '../layout/UILayout'

export const ScrollViewWebGLRenderCmd = function (renderable) {
  this._layoutCmdCtor(renderable)
  this._needDraw = true
  this._dirty = false
}

const proto = (ScrollViewWebGLRenderCmd.prototype = Object.create(Layout.WebGLRenderCmd.prototype))
proto.constructor = ScrollViewWebGLRenderCmd

proto.rendering = function (ctx) {
  const currentID = this._node.__instanceId
  const locCmds = renderer._cacheToBufferCmds[currentID]
  let i
  let len
  let checkNode
  let cmd
  const context = ctx || _renderContext
  if (!locCmds) {
    return
  }

  this._node.updateChildren()

  // Reset buffer for rendering
  context.bindBuffer(_renderContext.ARRAY_BUFFER, null)

  for (i = 0, len = locCmds.length; i < len; i++) {
    cmd = locCmds[i]
    checkNode = cmd._node
    if (checkNode && checkNode._parent && checkNode._parent._inViewRect === false) continue

    if (cmd.uploadData) {
      renderer._uploadBufferData(cmd)
    } else {
      if (cmd._batchingSize > 0) {
        renderer._batchRendering()
      }
      cmd.rendering(context)
    }
    renderer._batchRendering()
  }
}
