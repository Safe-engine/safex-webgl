
(function () {
    /**
     * cc.ParticleBatchNode's rendering objects of WebGL
     */
    cc.ParticleBatchNode.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
        this._needDraw = true;
        this._matrix = new cc.math.Matrix4();
        this._matrix.identity();
    };

    var proto = cc.ParticleBatchNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ParticleBatchNode.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var _t = this._node;
        if (_t.textureAtlas.totalQuads === 0)
            return;

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        this._glProgramState.apply(this._matrix);
        cc.glBlendFuncForParticle(_t._blendFunc.src, _t._blendFunc.dst);
        _t.textureAtlas.drawQuads();
    };

    proto._initWithTexture = function () {
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    };
})();
