import { game, renderer } from "../..";
import { Sprite, SpriteFrame, spriteFrameCache } from "../../core";
import { Node } from "../../core/base-nodes/Node";
import { p, rect, Rect, size, sizeEqualToSize } from "../../core/cocoa/Geometry";
import { EventHelper } from "../../core/event-manager/EventHelper";
import { BlendFunc } from "../../core/platform/BlendFunc";
import { BLEND_DST, BLEND_SRC, contentScaleFactor, ONE, rectPointsToPixels, SRC_ALPHA } from "../../core/platform/Macro";
import { defineGetterSetter } from "../../core/sprites/SpritesPropertyDefine";
import { error, log } from "../../helper/Debugger";
import { _renderType } from "../../helper/engine";
import { textureCache } from "../../textures";

(function () {

var dataPool = {
    _pool: {},
    _lengths: [],
    put: function (data) {
        var length = data.length;
        if (!this._pool[length]) {
            this._pool[length] = [data];
            this._lengths.push(length);
            this._lengths.sort();
        }
        else {
            this._pool[length].push(data);
        }
    },
    get: function (length) {
        var id;
        for (var i = 0; i < this._lengths.length; i++) {
            if (this._lengths[i] >= length) {
                id = this._lengths[i];
                break;
            }
        }
        if (id) {
            return this._pool[id].pop();
        }
        else {
            return undefined;
        }
    }
};

var FIX_ARTIFACTS_BY_STRECHING_TEXEL = FIX_ARTIFACTS_BY_STRECHING_TEXEL, cornerId = [], webgl;


var simpleQuadGenerator = {
    _rebuildQuads_base: function (sprite, spriteFrame, contentSize, isTrimmedContentSize) {
        //build vertices
        var vertices = sprite._vertices,
            wt = sprite._renderCmd._worldTransform,
            l, b, r, t;
        if (isTrimmedContentSize) {
            l = 0;
            b = 0;
            r = contentSize.width;
            t = contentSize.height;
        } else {
            var originalSize = spriteFrame._originalSize;
            var rect = spriteFrame._rect;
            var offset = spriteFrame._offset;
            var scaleX = contentSize.width / originalSize.width;
            var scaleY = contentSize.height / originalSize.height;
            var trimmLeft = offset.x + (originalSize.width - rect.width) / 2;
            var trimmRight = offset.x - (originalSize.width - rect.width) / 2;
            var trimmedBottom = offset.y + (originalSize.height - rect.height) / 2;
            var trimmedTop = offset.y - (originalSize.height - rect.height) / 2;

            l = trimmLeft * scaleX;
            b = trimmedBottom * scaleY;
            r = contentSize.width + trimmRight * scaleX;
            t = contentSize.height + trimmedTop * scaleY;
        }

        if (vertices.length < 8) {
            dataPool.put(vertices);
            vertices = dataPool.get(8) || new Float32Array(8);
            sprite._vertices = vertices;
        }
        // bl, br, tl, tr
        if (webgl) {
            vertices[0] = l * wt.a + b * wt.c + wt.tx;
            vertices[1] = l * wt.b + b * wt.d + wt.ty;
            vertices[2] = r * wt.a + b * wt.c + wt.tx;
            vertices[3] = r * wt.b + b * wt.d + wt.ty;
            vertices[4] = l * wt.a + t * wt.c + wt.tx;
            vertices[5] = l * wt.b + t * wt.d + wt.ty;
            vertices[6] = r * wt.a + t * wt.c + wt.tx;
            vertices[7] = r * wt.b + t * wt.d + wt.ty;
        }
        else {
            vertices[0] = l;
            vertices[1] = b;
            vertices[2] = r;
            vertices[3] = b;
            vertices[4] = l;
            vertices[5] = t;
            vertices[6] = r;
            vertices[7] = t;
        }

        cornerId[0] = 0;
        cornerId[1] = 2;
        cornerId[2] = 4;
        cornerId[3] = 6;

        //build uvs
        if (sprite._uvsDirty) {
            this._calculateUVs(sprite, spriteFrame);
        }

        sprite._vertCount = 4;
    },

    _calculateUVs: function (sprite, spriteFrame) {
        var uvs = sprite._uvs;
        var atlasWidth = spriteFrame._texture._pixelsWide;
        var atlasHeight = spriteFrame._texture._pixelsHigh;
        var textureRect = spriteFrame._rect;
        textureRect = rectPointsToPixels(textureRect);

        if (uvs.length < 8) {
            dataPool.put(uvs);
            uvs = dataPool.get(8) || new Float32Array(8);
            sprite._uvs = uvs;
        }

        //uv computation should take spritesheet into account.
        var l, b, r, t;
        var texelCorrect = FIX_ARTIFACTS_BY_STRECHING_TEXEL ? 0.5 : 0;

        if (spriteFrame._rotated) {
            l = (textureRect.x + texelCorrect) / atlasWidth;
            b = (textureRect.y + textureRect.width - texelCorrect) / atlasHeight;
            r = (textureRect.x + textureRect.height - texelCorrect) / atlasWidth;
            t = (textureRect.y + texelCorrect) / atlasHeight;
            uvs[0] = l; uvs[1] = t;
            uvs[2] = l; uvs[3] = b;
            uvs[4] = r; uvs[5] = t;
            uvs[6] = r; uvs[7] = b;
        }
        else {
            l = (textureRect.x + texelCorrect) / atlasWidth;
            b = (textureRect.y + textureRect.height - texelCorrect) / atlasHeight;
            r = (textureRect.x + textureRect.width - texelCorrect) / atlasWidth;
            t = (textureRect.y + texelCorrect) / atlasHeight;
            uvs[0] = l; uvs[1] = b;
            uvs[2] = r; uvs[3] = b;
            uvs[4] = l; uvs[5] = t;
            uvs[6] = r; uvs[7] = t;
        }
    }
};

var scale9QuadGenerator = {
    x: new Array(4),
    y: new Array(4),
    _rebuildQuads_base: function (sprite, spriteFrame, contentSize, insetLeft, insetRight, insetTop, insetBottom) {
        //build vertices
        var vertices = sprite._vertices;
        var wt = sprite._renderCmd._worldTransform;
        var leftWidth, centerWidth, rightWidth;
        var topHeight, centerHeight, bottomHeight;
        var rect = spriteFrame._rect;

        leftWidth = insetLeft;
        rightWidth = insetRight;
        centerWidth = rect.width - leftWidth - rightWidth;
        topHeight = insetTop;
        bottomHeight = insetBottom;
        centerHeight = rect.height - topHeight - bottomHeight;

        var preferSize = contentSize;
        var sizableWidth = preferSize.width - leftWidth - rightWidth;
        var sizableHeight = preferSize.height - topHeight - bottomHeight;
        var xScale = preferSize.width / (leftWidth + rightWidth);
        var yScale = preferSize.height / (topHeight + bottomHeight);
        xScale = xScale > 1 ? 1 : xScale;
        yScale = yScale > 1 ? 1 : yScale;
        sizableWidth = sizableWidth < 0 ? 0 : sizableWidth;
        sizableHeight = sizableHeight < 0 ? 0 : sizableHeight;
        var x = this.x;
        var y = this.y;
        x[0] = 0;
        x[1] = leftWidth * xScale;
        x[2] = x[1] + sizableWidth;
        x[3] = preferSize.width;
        y[0] = 0;
        y[1] = bottomHeight * yScale;
        y[2] = y[1] + sizableHeight;
        y[3] = preferSize.height;

        if (vertices.length < 32) {
            dataPool.put(vertices);
            vertices = dataPool.get(32) || new Float32Array(32);
            sprite._vertices = vertices;
        }
        var offset = 0, row, col;
        if (webgl) {
            for (row = 0; row < 4; row++) {
                for (col = 0; col < 4; col++) {
                    vertices[offset] = x[col] * wt.a + y[row] * wt.c + wt.tx;
                    vertices[offset+1] = x[col] * wt.b + y[row] * wt.d + wt.ty;
                    offset += 2;
                }
            }
        }
        else {
            for (row = 0; row < 4; row++) {
                for (col = 0; col < 4; col++) {
                    vertices[offset] = x[col];
                    vertices[offset+1] = y[row];
                    offset += 2;
                }
            }
        }

        cornerId[0] = 0;
        cornerId[1] = 6;
        cornerId[2] = 24;
        cornerId[3] = 30;

        //build uvs
        if (sprite._uvsDirty) {
            this._calculateUVs(sprite, spriteFrame, insetLeft, insetRight, insetTop, insetBottom);
        }
    },

    _calculateUVs: function (sprite, spriteFrame, insetLeft, insetRight, insetTop, insetBottom) {
        var uvs = sprite._uvs;
        var rect = spriteFrame._rect;
        var atlasWidth = spriteFrame._texture._pixelsWide;
        var atlasHeight = spriteFrame._texture._pixelsHigh;

        //caculate texture coordinate
        var leftWidth, centerWidth, rightWidth;
        var topHeight, centerHeight, bottomHeight;
        var textureRect = spriteFrame._rect;
        textureRect = rectPointsToPixels(textureRect);
        rect = rectPointsToPixels(rect);
        var scale = contentScaleFactor();

        leftWidth = insetLeft * scale;
        rightWidth = insetRight * scale;
        centerWidth = rect.width - leftWidth - rightWidth;
        topHeight = insetTop * scale;
        bottomHeight = insetBottom * scale;
        centerHeight = rect.height - topHeight - bottomHeight;

        if (uvs.length < 32) {
            dataPool.put(uvs);
            uvs = dataPool.get(32) || new Float32Array(32);
            sprite._uvs = uvs;
        }

        //uv computation should take spritesheet into account.
        var u = this.x;
        var v = this.y;
        var texelCorrect = FIX_ARTIFACTS_BY_STRECHING_TEXEL ? 0.5 : 0;
        var offset = 0, row, col;

        if (spriteFrame._rotated) {
            u[0] = (textureRect.x + texelCorrect) / atlasWidth;
            u[1] = (bottomHeight + textureRect.x) / atlasWidth;
            u[2] = (bottomHeight + centerHeight + textureRect.x) / atlasWidth;
            u[3] = (textureRect.x + textureRect.height - texelCorrect) / atlasWidth;

            v[3] = (textureRect.y + texelCorrect) / atlasHeight;
            v[2] = (leftWidth + textureRect.y) / atlasHeight;
            v[1] = (leftWidth + centerWidth + textureRect.y) / atlasHeight;
            v[0] = (textureRect.y + textureRect.width - texelCorrect) / atlasHeight;

            for (row = 0; row < 4; row++) {
                for (col = 0; col < 4; col++) {
                    uvs[offset] = u[row];
                    uvs[offset+1] = v[3-col];
                    offset += 2;
                }
            }
        }
        else {
            u[0] = (textureRect.x + texelCorrect) / atlasWidth;
            u[1] = (leftWidth + textureRect.x) / atlasWidth;
            u[2] = (leftWidth + centerWidth + textureRect.x) / atlasWidth;
            u[3] = (textureRect.x + textureRect.width - texelCorrect) / atlasWidth;

            v[3] = (textureRect.y + texelCorrect) / atlasHeight;
            v[2] = (topHeight + textureRect.y) / atlasHeight;
            v[1] = (topHeight + centerHeight + textureRect.y) / atlasHeight;
            v[0] = (textureRect.y + textureRect.height - texelCorrect) / atlasHeight;

            for (row = 0; row < 4; row++) {
                for (col = 0; col < 4; col++) {
                    uvs[offset] = u[col];
                    uvs[offset+1] = v[row];
                    offset += 2;
                }
            }
        }
    }
};

/**
 * <p>
 * A 9-slice sprite for cocos2d UI.                                                                    <br/>
 *                                                                                                     <br/>
 * 9-slice scaling allows you to specify how scaling is applied                                        <br/>
 * to specific areas of a sprite. With 9-slice scaling (3x3 grid),                                     <br/>
 * you can ensure that the sprite does not become distorted when                                       <br/>
 * scaled.                                                                                             <br/>
 * @see http://yannickloriot.com/library/ios/cccontrolextension/Classes/CCScale9Sprite.html            <br/>
 * </p>
 * @class
 * @extends Node
 *
 * @property {Size}  preferredSize   - The preferred size of the 9-slice sprite
 * @property {Rect}  capInsets       - The cap insets of the 9-slice sprite
 * @property {Number}   insetLeft       - The left inset of the 9-slice sprite
 * @property {Number}   insetTop        - The top inset of the 9-slice sprite
 * @property {Number}   insetRight      - The right inset of the 9-slice sprite
 * @property {Number}   insetBottom     - The bottom inset of the 9-slice sprite
 */

export const Scale9Sprite = Node.extend(/** @lends Scale9Sprite# */{
    //resource data, could be async loaded.
    _spriteFrame: null,
    _scale9Image: null,

    //scale 9 data
    _insetLeft: 0,
    _insetRight: 0,
    _insetTop: 0,
    _insetBottom: 0,
    //blend function
    _blendFunc: null,
    //sliced or simple
    _renderingType: 1,
    //bright or not
    _brightState: 0,
    _opacityModifyRGB: false,
    //rendering quads shared by canvas and webgl
    _rawVerts: null,
    _rawUvs: null,
    _vertices: null,
    _uvs: null,
    _vertCount: 0,
    _quadsDirty: true,
    _uvsDirty: true,
    _isTriangle: false,
    _isTrimmedContentSize: false,
    _textureLoaded: false,

    //v3.3
    _flippedX: false,
    _flippedY: false,
    _className: "Scale9Sprite",

    /**
     * Constructor function.
     * @function
     * @param {string|SpriteFrame} file file name of texture or a SpriteFrame
     * @param {Rect} rectOrCapInsets
     * @param {Rect} capInsets
     * @returns {Scale9Sprite}
     */
    ctor: function (file, rectOrCapInsets, capInsets) {
        Node.prototype.ctor.call(this);

        //for async texture load
        this._loader = new Sprite.LoadManager();

        this._renderCmd.setState(this._brightState);
        this._blendFunc = BlendFunc._alphaPremultiplied();
        this.setAnchorPoint(p(0.5, 0.5));
        // Init vertex data for simple
        this._rawVerts = null;
        this._rawUvs = null;
        this._vertices = dataPool.get(8) || new Float32Array(8);
        this._uvs = dataPool.get(8) || new Float32Array(8);

        if (file !== undefined) {
            if (file instanceof SpriteFrame)
                this.initWithSpriteFrame(file, rectOrCapInsets);
            else {
                var frame = spriteFrameCache.getSpriteFrame(file);
                if (frame)
                    this.initWithSpriteFrame(frame, rectOrCapInsets);
                else
                    this.initWithFile(file, rectOrCapInsets, capInsets);
            }
        }


        if (webgl === undefined) {
            webgl = _renderType === game.RENDER_TYPE_WEBGL;
        }
    },

    textureLoaded: function () {
        return this._textureLoaded;
    },

    getCapInsets: function () {
        return rect(this._capInsetsInternal);
    },

    _asyncSetCapInsets: function () {
        this.removeEventListener('load', this._asyncSetCapInsets, this);
        this.setCapInsets(this._cacheCapInsets);
        this._cacheCapInsets = null;
    },

    setCapInsets: function (capInsets) {
        // Asynchronous loading texture requires this data
        // This data does not take effect immediately, so it does not affect the existing texture.
        if (!this.loaded()) {
            this._cacheCapInsets = capInsets;
            this.removeEventListener('load', this._asyncSetCapInsets, this);
            this.addEventListener('load', this._asyncSetCapInsets, this);
            return false;
        }

        this._capInsetsInternal = capInsets;
        this._updateCapInsets(this._spriteFrame._rect, this._capInsetsInternal);
    },

    _updateCapInsets: function (rect, capInsets) {
        if(!capInsets || !rect || _rectEqualToZero(capInsets)) {
            rect = rect || {x:0, y:0, width: this._contentSize.width, height: this._contentSize.height};
            this._capInsetsInternal = rect(rect.width /3,
                                              rect.height /3,
                                              rect.width /3,
                                              rect.height /3);
        } else {
            this._capInsetsInternal = capInsets;
        }

        if(!_rectEqualToZero(rect)) {
            this._insetLeft = this._capInsetsInternal.x;
            this._insetTop = this._capInsetsInternal.y;
            this._insetRight = rect.width - this._insetLeft - this._capInsetsInternal.width;
            this._insetBottom = rect.height - this._insetTop - this._capInsetsInternal.height;
        }
    },


    initWithFile: function (file, rect, capInsets) {
        if (file instanceof Rect) {
            file = arguments[1];
            capInsets = arguments[0];
            rect = rect(0, 0, 0, 0);
        } else {
            rect = rect || rect(0, 0, 0, 0);
            capInsets = capInsets || rect(0, 0, 0, 0);
        }

        if(!file)
            throw new Error("Scale9Sprite.initWithFile(): file should be non-null");

        var texture = textureCache.getTextureForKey(file);
        if (!texture) {
            texture = textureCache.addImage(file);
        }

        var locLoaded = texture.isLoaded();
        this._textureLoaded = locLoaded;
        this._loader.clear();
        if (!locLoaded) {
            this._loader.once(texture, function () {
                this.initWithFile(file, rect, capInsets);
                this.dispatchEvent("load");
            }, this);
            return false;
        }

        //in this function, the texture already make sure is loaded.
        if( _rectEqualToZero(rect)) {
            var textureSize = texture.getContentSize();
            rect = rect(0, 0, textureSize.width, textureSize.height);
        }
        this.setTexture(texture, rect);
        this._updateCapInsets(rect, capInsets);

        return true;
    },

    updateWithBatchNode: function (batchNode, originalRect, rotated, capInsets) {
        if (!batchNode) {
            return false;
        }

        var texture = batchNode.getTexture();
        this._loader.clear();
        if (!texture.isLoaded()) {
            this._loader.once(texture, function () {
                this.updateWithBatchNode(batchNode, originalRect, rotated, capInsets);
                this.dispatchEvent("load");
            }, this);
            return false;
        }

        this.setTexture(texture, originalRect);
        this._updateCapInsets(originalRect, capInsets);

        return true;
    },


    /**
     * Initializes a 9-slice sprite with an sprite frame
     * @param spriteFrameOrSFName The sprite frame object.
     */
    initWithSpriteFrame: function (spriteFrame, capInsets) {
        this.setSpriteFrame(spriteFrame);

        capInsets = capInsets || rect(0, 0, 0, 0);

        this._updateCapInsets(spriteFrame._rect, capInsets);
    },

    initWithSpriteFrameName: function (spriteFrameName, capInsets) {
        if(!spriteFrameName)
            throw new Error("Scale9Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null");
        capInsets = capInsets || rect(0, 0, 0, 0);

        var frame = spriteFrameCache.getSpriteFrame(spriteFrameName);
        if (frame == null) {
            log("Scale9Sprite.initWithSpriteFrameName(): can't find the sprite frame by spriteFrameName");
            return false;
        }
        this.setSpriteFrame(frame);

        capInsets = capInsets || rect(0, 0, 0, 0);

        this._updateCapInsets(frame._rect, capInsets);
    },

    loaded: function () {
        if (this._spriteFrame === null) {
            return false;
        } else {
            return this._spriteFrame.textureLoaded();
        }
    },

    /**
     * Change the texture file of 9 slice sprite
     *
     * @param textureOrTextureFile The name of the texture file.
     */
    setTexture: function (texture, rect) {
        var spriteFrame = new SpriteFrame(texture, rect);
        this.setSpriteFrame(spriteFrame);
    },

    _updateBlendFunc: function () {
        // it's possible to have an untextured sprite
        var blendFunc = this._blendFunc;
        if (!this._spriteFrame || !this._spriteFrame._texture.hasPremultipliedAlpha()) {
            if (blendFunc.src === ONE && blendFunc.dst === BLEND_DST) {
                blendFunc.src = SRC_ALPHA;
            }
            this._opacityModifyRGB = false;
        } else {
            if (blendFunc.src === SRC_ALPHA && blendFunc.dst === BLEND_DST) {
                blendFunc.src = ONE;
            }
            this._opacityModifyRGB = true;
        }
    },

    setOpacityModifyRGB: function (value) {
        if (this._opacityModifyRGB !== value) {
            this._opacityModifyRGB = value;
            this._renderCmd._setColorDirty();
        }
    },

    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    /**
     * Change the sprite frame of 9 slice sprite
     *
     * @param spriteFrameOrSFFileName The name of the texture file.
     */
    setSpriteFrame: function (spriteFrame) {
        if (spriteFrame) {
            this._spriteFrame = spriteFrame;
            this._quadsDirty = true;
            this._uvsDirty = true;
            var self = this;
            var onResourceDataLoaded = function () {
                if (sizeEqualToSize(self._contentSize, size(0, 0))) {
                    self.setContentSize(self._spriteFrame._rect);
                }
                self._textureLoaded = true;
                self._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
                renderer.childrenOrderDirty = true;
            };
            self._textureLoaded = spriteFrame.textureLoaded();
            if (self._textureLoaded) {
                onResourceDataLoaded();
            } else {
                this._loader.clear();
                this._loader.once(spriteFrame, function () {
                    onResourceDataLoaded();
                    this.dispatchEvent("load");
                }, this);
            }
        }
    },

    /**
     * Sets the source blending function.
     *
     * @param blendFunc A structure with source and destination factor to specify pixel arithmetic. e.g. {GL_ONE, GL_ONE}, {GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA}.
     */
    setBlendFunc: function (blendFunc, dst) {
        if (dst === undefined) {
            this._blendFunc.src = blendFunc.src || BLEND_SRC;
            this._blendFunc.dst = blendFunc.dst || BLEND_DST;
        }
        else {
            this._blendFunc.src = blendFunc || BLEND_SRC;
            this._blendFunc.dst = dst || BLEND_DST;
        }
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },

    /**
     * Returns the blending function that is currently being used.
     *
     * @return A BlendFunc structure with source and destination factor which specified pixel arithmetic.
     */
    getBlendFunc: function () {
        return new BlendFunc(this._blendFunc.src, this._blendFunc.dst);
    },

    setPreferredSize: function (preferredSize) {
        if (!preferredSize || sizeEqualToSize(this._contentSize, preferredSize)) return;
        this.setContentSize(preferredSize);
    },

    getPreferredSize: function () {
        return this.getContentSize();
    },

    // overrides
    setContentSize: function (width, height) {
        if (height === undefined) {
            height = width.height;
            width = width.width;
        }
        if (width === this._contentSize.width && height === this._contentSize.height) {
            return;
        }

        Node.prototype.setContentSize.call(this, width, height);
        this._quadsDirty = true;
    },

    getContentSize: function () {
        if(this._renderingType === Scale9Sprite.RenderingType.SIMPLE) {
            if(this._spriteFrame) {
                return this._spriteFrame._originalSize;
            }
            return size(this._contentSize);
        } else {
            return size(this._contentSize);
        }
    },

    _setWidth: function (value) {
        Node.prototype._setWidth.call(this, value);
        this._quadsDirty = true;
    },

    _setHeight: function (value) {
        Node.prototype._setHeight.call(this, value);
        this._quadsDirty = true;
    },

    /**
     * Change the state of 9-slice sprite.
     * @see `State`
     * @param state A enum value in State.
     */
    setState: function (state) {
        this._brightState = state;
        this._renderCmd.setState(state);
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },

    /**
     * Query the current bright state.
     * @return @see `State`
     */
    getState: function () {
        return this._brightState;
    },

    /**
     * change the rendering type, could be simple or slice
     * @return @see `RenderingType`
     */
    setRenderingType: function (type) {
        if (this._renderingType === type) return;

        this._renderingType = type;
        this._quadsDirty = true;
        this._uvsDirty = true;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },
    /**
     * get the rendering type, could be simple or slice
     * @return @see `RenderingType`
     */
    getRenderingType: function () {
        return this._renderingType;
    },
    /**
     * change the left border of 9 slice sprite, it should be specified before trimmed.
     * @param insetLeft left border.
     */
    setInsetLeft: function (insetLeft) {
        this._insetLeft = insetLeft;
        this._quadsDirty = true;
        this._uvsDirty = true;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },
    /**
     * get the left border of 9 slice sprite, the result is specified before trimmed.
     * @return left border.
     */
    getInsetLeft: function () {
        return this._insetLeft;
    },
    /**
     * change the top border of 9 slice sprite, it should be specified before trimmed.
     * @param insetTop top border.
     */
    setInsetTop: function (insetTop) {
        this._insetTop = insetTop;
        this._quadsDirty = true;
        this._uvsDirty = true;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },

    /**
     * get the top border of 9 slice sprite, the result is specified before trimmed.
     * @return top border.
     */
    getInsetTop: function () {
        return this._insetTop;
    },

    /**
     * change the right border of 9 slice sprite, it should be specified before trimmed.
     * @param insetRight right border.
     */
    setInsetRight: function (insetRight) {
        this._insetRight = insetRight;
        this._quadsDirty = true;
        this._uvsDirty = true;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },

    /**
     * get the right border of 9 slice sprite, the result is specified before trimmed.
     * @return right border.
     */
    getInsetRight: function () {
        return this._insetRight;
    },

    /**
     * change the bottom border of 9 slice sprite, it should be specified before trimmed.
     * @param insetBottom bottom border.
     */
    setInsetBottom: function (insetBottom) {
        this._insetBottom = insetBottom;
        this._quadsDirty = true;
        this._uvsDirty = true;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.contentDirty);
    },
    /**
     * get the bottom border of 9 slice sprite, the result is specified before trimmed.
     * @return bottom border.
     */
    getInsetBottom: function () {
        return this._insetBottom;
    },

    _rebuildQuads: function () {
        if (!this._spriteFrame || !this._spriteFrame._textureLoaded) {
            return;
        }

        this._updateBlendFunc();

        this._isTriangle = false;
        switch (this._renderingType) {
          case RenderingType.SIMPLE:
              simpleQuadGenerator._rebuildQuads_base(this, this._spriteFrame, this._contentSize, this._isTrimmedContentSize);
              break;
          case RenderingType.SLICED:
              scale9QuadGenerator._rebuildQuads_base(this, this._spriteFrame, this._contentSize, this._insetLeft, this._insetRight, this._insetTop, this._insetBottom);
              break;
          default:
              this._quadsDirty = false;
              this._uvsDirty = false;
              error('Can not generate quad');
              return;
        }


        this._quadsDirty = false;
        this._uvsDirty = false;
    },

    _createRenderCmd: function () {
        if (_renderType === game.RENDER_TYPE_CANVAS)
            return new Scale9Sprite.CanvasRenderCmd(this);
        else
            return new Scale9Sprite.WebGLRenderCmd(this);
    }
});

var _p = Scale9Sprite.prototype;
EventHelper.prototype.apply(_p);

// Extended properties
/** @expose */
_p.preferredSize;
defineGetterSetter(_p, "preferredSize", _p.getPreferredSize, _p.setPreferredSize);
/** @expose */
_p.capInsets;
defineGetterSetter(_p, "capInsets", _p.getCapInsets, _p.setCapInsets);
/** @expose */
_p.insetLeft;
defineGetterSetter(_p, "insetLeft", _p.getInsetLeft, _p.setInsetLeft);
/** @expose */
_p.insetTop;
defineGetterSetter(_p, "insetTop", _p.getInsetTop, _p.setInsetTop);
/** @expose */
_p.insetRight;
defineGetterSetter(_p, "insetRight", _p.getInsetRight, _p.setInsetRight);
/** @expose */
_p.insetBottom;
defineGetterSetter(_p, "insetBottom", _p.getInsetBottom, _p.setInsetBottom);

_p = null;

/**
 * Creates a 9-slice sprite with a texture file, a delimitation zone and
 * with the specified cap insets.
 * @deprecated since v3.0, please use new Scale9Sprite(file, rect, capInsets) instead.
 * @param {String|SpriteFrame} file file name of texture or a Sprite object
 * @param {Rect} rect the rect of the texture
 * @param {Rect} capInsets the cap insets of Scale9Sprite
 * @returns {Scale9Sprite}
 */
Scale9Sprite.create = function (file, rect, capInsets) {
    return new Scale9Sprite(file, rect, capInsets);
};

/**
 * create a Scale9Sprite with Sprite frame.
 * @deprecated since v3.0, please use "new Scale9Sprite(spriteFrame, capInsets)" instead.
 * @param {SpriteFrame} spriteFrame
 * @param {Rect} capInsets
 * @returns {Scale9Sprite}
 */
Scale9Sprite.createWithSpriteFrame = function (spriteFrame, capInsets) {
    return new Scale9Sprite(spriteFrame, capInsets);
};

/**
 * create a Scale9Sprite with a Sprite frame name
 * @deprecated since v3.0, please use "new Scale9Sprite(spriteFrameName, capInsets)" instead.
 * @param {string} spriteFrameName
 * @param {Rect} capInsets
 * @returns {Scale9Sprite}
 */
Scale9Sprite.createWithSpriteFrameName = function (spriteFrameName, capInsets) {
    return new Scale9Sprite(spriteFrameName, capInsets);
};

/**
 * @ignore
 */
Scale9Sprite.POSITIONS_CENTRE = 0;
Scale9Sprite.POSITIONS_TOP = 1;
Scale9Sprite.POSITIONS_LEFT = 2;
Scale9Sprite.POSITIONS_RIGHT = 3;
Scale9Sprite.POSITIONS_BOTTOM = 4;
Scale9Sprite.POSITIONS_TOPRIGHT = 5;
Scale9Sprite.POSITIONS_TOPLEFT = 6;
Scale9Sprite.POSITIONS_BOTTOMRIGHT = 7;

Scale9Sprite.state = {NORMAL: 0, GRAY: 1};

var RenderingType = Scale9Sprite.RenderingType = {
    /**
     * @property {Number} SIMPLE
     */
    SIMPLE: 0,
    /**
     * @property {Number} SLICED
     */
    SLICED: 1
};
})();
