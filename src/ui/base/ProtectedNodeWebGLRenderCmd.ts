import { NodeWebGLRenderCmd } from '../../core/base-nodes/NodeWebGLRenderCmd'
import { ProtectedNodeRenderCmd } from './ProtectedNodeRenderCmd'

export const ProtectedNodeWebGLRenderCmd = function (renderable) {
  this._rootCtor(renderable)
}
export function inject(srcPrototype, destPrototype) {
  for (const key in srcPrototype) destPrototype[key] = srcPrototype[key]
}
const proto = (ProtectedNodeWebGLRenderCmd.prototype = Object.create(NodeWebGLRenderCmd.prototype))
inject(ProtectedNodeRenderCmd, proto)
proto.constructor = ProtectedNodeWebGLRenderCmd
proto._pNodeCmdCtor = ProtectedNodeWebGLRenderCmd

proto.transform = function (parentCmd, recursive) {
  this.originTransform(parentCmd, recursive)

  let i, len
  const locChildren = this._node._protectedChildren
  if (recursive && locChildren && locChildren.length !== 0) {
    for (i = 0, len = locChildren.length; i < len; i++) {
      locChildren[i]._renderCmd.transform(this, recursive)
    }
  }
}

proto.pNodeTransform = proto.transform
