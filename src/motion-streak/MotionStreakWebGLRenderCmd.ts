
cc.MotionStreak.WebGLRenderCmd = function (renderableObject) {
    this._rootCtor(renderableObject);
    this._needDraw = true;
    this._matrix = new cc.math.Matrix4();
    this._matrix.identity();
    this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
};

cc.MotionStreak.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.MotionStreak.WebGLRenderCmd.prototype.constructor = cc.Sprite.WebGLRenderCmd;

cc.MotionStreak.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var node = this._node;
    if (node._nuPoints <= 1)
        return;

    if (node.texture && node.texture.isLoaded()) {
        ctx = ctx || cc._renderContext;

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        this._glProgramState.apply(this._matrix);
        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

        cc.glBindTexture2D(node.texture);

        ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
        ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);

        //position
        ctx.bindBuffer(ctx.ARRAY_BUFFER, node._verticesBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, node._vertices, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0);

        //texcoords
        ctx.bindBuffer(ctx.ARRAY_BUFFER, node._texCoordsBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, node._texCoords, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0);

        //colors
        ctx.bindBuffer(ctx.ARRAY_BUFFER, node._colorPointerBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, node._colorPointer, ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0);

        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, node._nuPoints * 2);
        cc.g_NumberOfDraws++;
    }
};
