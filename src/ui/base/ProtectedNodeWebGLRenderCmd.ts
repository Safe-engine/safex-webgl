

(function () {
    if (!cc.Node.WebGLRenderCmd)
        return;
    cc.ProtectedNode.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
    };

    var proto = cc.ProtectedNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cc.inject(cc.ProtectedNode.RenderCmd, proto);
    proto.constructor = cc.ProtectedNode.WebGLRenderCmd;
    proto._pNodeCmdCtor = cc.ProtectedNode.WebGLRenderCmd;

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);

        var i, len,
            locChildren = this._node._protectedChildren;
        if (recursive && locChildren && locChildren.length !== 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                locChildren[i]._renderCmd.transform(this, recursive);
            }
        }
    };

    proto.pNodeTransform = proto.transform;
})();
