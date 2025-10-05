import { _renderContext } from "../..";
import { ENABLE_GL_STATE_CACHE, TEXTURE_ATLAS_USE_VAO } from "../core/platform/Config";

export let _currentProjectionMatrix = -1;
let MAX_ACTIVETEXTURE;
let _currentShaderProgram;
let _currentBoundTexture;
let _blendingSource;
let _blendingDest;
let _GLServerState;
let _uVAO;

if (ENABLE_GL_STATE_CACHE) {
    MAX_ACTIVETEXTURE = 16;

    _currentShaderProgram = -1;
    _currentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    _blendingSource = -1;
    _blendingDest = -1;
    _GLServerState = 0;
    if(TEXTURE_ATLAS_USE_VAO)
        _uVAO = 0;
}

// GL State Cache functions

/**
 * Invalidates the GL state cache.<br/>
 * If CC_ENABLE_GL_STATE_CACHE it will reset the GL state cache.
 * @function
 */
export const glInvalidateStateCache = function () {
    kmGLFreeAll();
    _currentProjectionMatrix = -1;
    if (ENABLE_GL_STATE_CACHE) {
        _currentShaderProgram = -1;
        for (var i = 0; i < MAX_ACTIVETEXTURE; i++) {
            _currentBoundTexture[i] = -1;
        }
        _blendingSource = -1;
        _blendingDest = -1;
        _GLServerState = 0;
    }
};

/**
 * Uses the GL program in case program is different than the current one.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glUseProgram() directly.
 * @function
 * @param {WebGLProgram} program
 */
export const glUseProgram = ENABLE_GL_STATE_CACHE ? function (program) {
    if (program !== _currentShaderProgram) {
        _currentShaderProgram = program;
        _renderContext.useProgram(program);
    }
} : function (program) {
    _renderContext.useProgram(program);
};

/**
 * Deletes the GL program. If it is the one that is being used, it invalidates it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glDeleteProgram() directly.
 * @function
 * @param {WebGLProgram} program
 */
export const glDeleteProgram = function (program) {
    if (ENABLE_GL_STATE_CACHE) {
        if (program === _currentShaderProgram)
            _currentShaderProgram = -1;
    }
    gl.deleteProgram(program);
};

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export const setBlending = function (sfactor, dfactor) {
    var ctx = _renderContext;
    if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
        ctx.disable(ctx.BLEND);
    } else {
        ctx.enable(ctx.BLEND);
        _renderContext.blendFunc(sfactor,dfactor);
        //TODO need fix for WebGL
        //ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
    }
};

/**
 * Uses a blending function in case it not already used.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glBlendFunc() directly.
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export const glBlendFunc = ENABLE_GL_STATE_CACHE ? function (sfactor, dfactor) {
    if ((sfactor !== _blendingSource) || (dfactor !== _blendingDest)) {
        _blendingSource = sfactor;
        _blendingDest = dfactor;
        setBlending(sfactor, dfactor);
    }
} : setBlending;

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
export const  glBlendFuncForParticle = function(sfactor, dfactor) {
    if ((sfactor !== _blendingSource) || (dfactor !== _blendingDest)) {
        _blendingSource = sfactor;
        _blendingDest = dfactor;
        var ctx = _renderContext;
        if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
            ctx.disable(ctx.BLEND);
        } else {
            ctx.enable(ctx.BLEND);
            //TODO need fix for WebGL
            ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
        }
    }
};

/**
 * Resets the blending mode back to the cached state in case you used glBlendFuncSeparate() or glBlendEquation().<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will just set the default blending mode using GL_FUNC_ADD.
 * @function
 */
export const glBlendResetToCache = function () {
    var ctx = _renderContext;
    ctx.blendEquation(ctx.FUNC_ADD);
    if (ENABLE_GL_STATE_CACHE)
        setBlending(_blendingSource, _blendingDest);
    else
        setBlending(ctx.BLEND_SRC, ctx.BLEND_DST);
};

/**
 * sets the projection matrix as dirty
 * @function
 */
export const setProjectionMatrixDirty = function () {
    _currentProjectionMatrix = -1;
};

/**
 * If the texture is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {Texture2D} textureId
 */
export const glBindTexture2D = function (textureId) {
    glBindTexture2DN(0, textureId);
};

/**
 * If the texture is not already bound to a given unit, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.
 * @function
 * @param {Number} textureUnit
 * @param {Texture2D} textureId
 */
export const glBindTexture2DN = ENABLE_GL_STATE_CACHE ? function (textureUnit, textureId) {
    if (_currentBoundTexture[textureUnit] === textureId)
        return;
    _currentBoundTexture[textureUnit] = textureId;

    var ctx = _renderContext;
    ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
    if(textureId)
        ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
    else
        ctx.bindTexture(ctx.TEXTURE_2D, null);
} : function (textureUnit, textureId) {
    var ctx = _renderContext;
    ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
    if(textureId)
        ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
    else
        ctx.bindTexture(ctx.TEXTURE_2D, null);
};

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached. <br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {WebGLTexture} textureId
 */
export const glDeleteTexture = function (textureId) {
    glDeleteTextureN(0, textureId);
};

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached for the given texture unit.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.
 * @function
 * @param {Number} textureUnit
 * @param {WebGLTexture} textureId
 */
export const glDeleteTextureN = function (textureUnit, textureId) {
    if (ENABLE_GL_STATE_CACHE) {
        if (textureId === _currentBoundTexture[ textureUnit ])
            _currentBoundTexture[ textureUnit ] = -1;
    }
    _renderContext.deleteTexture(textureId._webTextureObj);
};

/**
 * If the vertex array is not already bound, it binds it.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindVertexArray() directly.
 * @function
 * @param {Number} vaoId
 */
export const glBindVAO = function (vaoId) {
    if (!TEXTURE_ATLAS_USE_VAO)
        return;

    if (ENABLE_GL_STATE_CACHE) {
        if (_uVAO !== vaoId) {
            _uVAO = vaoId;
            //TODO need fixed
            //glBindVertexArray(vaoId);
        }
    } else {
        //glBindVertexArray(vaoId);
    }
};

/**
 * It will enable / disable the server side GL states.<br/>
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glEnable() directly.
 * @function
 * @param {Number} flags
 */
export const glEnable = function (flags) {
    if (ENABLE_GL_STATE_CACHE) {
        /*var enabled;

         */
        /* GL_BLEND */
        /*
         if ((enabled = (flags & GL_BLEND)) != (_GLServerState & GL_BLEND)) {
         if (enabled) {
         _renderContext.enable(_renderContext.BLEND);
         _GLServerState |= GL_BLEND;
         } else {
         _renderContext.disable(_renderContext.BLEND);
         _GLServerState &= ~GL_BLEND;
         }
         }*/
    } else {
        /*if ((flags & GL_BLEND))
         _renderContext.enable(_renderContext.BLEND);
         else
         _renderContext.disable(_renderContext.BLEND);*/
    }
};
