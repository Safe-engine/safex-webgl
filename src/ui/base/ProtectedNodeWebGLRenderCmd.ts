import { ProtectedNode } from './ProtectedNode';
(function () {
  if (!Node.WebGLRenderCmd) return
  ProtectedNode.WebGLRenderCmd = function (renderable) {
    this._rootCtor(renderable)
  }

  const proto = (ProtectedNode.WebGLRenderCmd.prototype = Object.create(Node.WebGLRenderCmd.prototype))
  inject(ProtectedNode.RenderCmd, proto)
  proto.constructor = ProtectedNode.WebGLRenderCmd
  proto._pNodeCmdCtor = ProtectedNode.WebGLRenderCmd

  proto.transform = function (parentCmd, recursive) {
    this.originTransform(parentCmd, recursive)

    let i,
      len,
      locChildren = this._node._protectedChildren
    if (recursive && locChildren && locChildren.length !== 0) {
      for (i = 0, len = locChildren.length; i < len; i++) {
        locChildren[i]._renderCmd.transform(this, recursive)
      }
    }
  }

  proto.pNodeTransform = proto.transform
})()
