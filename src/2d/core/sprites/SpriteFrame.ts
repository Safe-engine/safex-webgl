// @ts-nocheck
import { rect } from "../cocoa/Geometry"
import { EventHelper } from "../event-manager/EventHelper";

/**
 * <p>
 *    A SpriteFrame has:<br/>
 *      - texture: A Texture2D that will be used by the Sprite<br/>
 *      - rectangle: A rectangle of the texture<br/>
 *    <br/>
// @ts-nocheck
import { rect } from "../cocoa/Geometry";
import { EventHelper } from "../event-manager/EventHelper";

/**
 * A SpriteFrame has:
 *  - texture: A Texture2D that will be used by the Sprite
 *  - rectangle: A rectangle of the texture
 *
 * Please use constructor to initialize a SpriteFrame. This file keeps legacy
 * helpers for runtime compatibility.
 */
export class SpriteFrame {
  _offset: any;
  _originalSize: any;
  _rectInPixels: any;
  _rotated: any;
  _rect: any;
  _offsetInPixels: any;
  _originalSizeInPixels: any;
  _texture: any;
  _textureFilename: string;
  _textureLoaded: boolean;

  constructor(filename?: any, rectArg?: any, rotated?: any, offset?: any, originalSize?: any) {
    this._offset = p(0, 0);
    this._offsetInPixels = p(0, 0);
    this._originalSize = size(0, 0);
    this._rotated = false;
    this._originalSizeInPixels = size(0, 0);
    this._textureFilename = "";
    this._texture = null;
    this._textureLoaded = false;

    if (filename !== undefined && rectArg !== undefined) {
      if (rotated === undefined || offset === undefined || originalSize === undefined) {
        this.initWithTexture(filename, rectArg);
      } else {
        this.initWithTexture(filename, rectArg, rotated, offset, originalSize);
      }
    }
  }

  // Returns whether the texture have been loaded
  textureLoaded() {
    return this._textureLoaded;
  }

  // Add a event listener for texture loaded event. kept for legacy
  addLoadedEventListener(callback: any, target: any) {
    this.addEventListener("load", callback, target);
  }

  // Gets the rect of the frame in the texture
  getRectInPixels() {
    const locRectInPixels = this._rectInPixels;
    return rect(locRectInPixels.x, locRectInPixels.y, locRectInPixels.width, locRectInPixels.height);
  }

  // Sets the rect of the frame in the texture
  setRectInPixels(rectInPixels: any) {
    if (!this._rectInPixels) {
      this._rectInPixels = rect(0, 0, 0, 0);
    }
    this._rectInPixels.x = rectInPixels.x;
    this._rectInPixels.y = rectInPixels.y;
    this._rectInPixels.width = rectInPixels.width;
    this._rectInPixels.height = rectInPixels.height;
    this._rect = rectPixelsToPoints(rectInPixels);
  }

  // Returns whether the sprite frame is rotated in the texture.
  isRotated() {
    return this._rotated;
  }

  // Set whether the sprite frame is rotated in the texture.
  setRotated(bRotated: any) {
    this._rotated = bRotated;
  }

  // Returns the rect of the sprite frame in the texture
  getRect() {
    const locRect = this._rect;
    return rect(locRect.x, locRect.y, locRect.width, locRect.height);
  }

  // Sets the rect of the sprite frame in the texture
  setRect(r: any) {
    if (!this._rect) {
      this._rect = rect(0, 0, 0, 0);
    }
    this._rect.x = r.x;
    this._rect.y = r.y;
    this._rect.width = r.width;
    this._rect.height = r.height;
    this._rectInPixels = rectPointsToPixels(this._rect);
  }

  // Returns the offset of the sprite frame in the texture in pixel
  getOffsetInPixels() {
    return p(this._offsetInPixels);
  }

  // Sets the offset of the sprite frame in the texture in pixel
  setOffsetInPixels(offsetInPixels: any) {
    this._offsetInPixels.x = offsetInPixels.x;
    this._offsetInPixels.y = offsetInPixels.y;
    _pointPixelsToPointsOut(this._offsetInPixels, this._offset);
  }

  // Returns the original size of the trimmed image
  getOriginalSizeInPixels() {
    return size(this._originalSizeInPixels);
  }

  // Sets the original size of the trimmed image
  setOriginalSizeInPixels(sizeInPixels: any) {
    this._originalSizeInPixels.width = sizeInPixels.width;
    this._originalSizeInPixels.height = sizeInPixels.height;
  }

  // Returns the original size of the trimmed image
  getOriginalSize() {
    return size(this._originalSize);
  }

  // Sets the original size of the trimmed image
  setOriginalSize(sizeInPixels: any) {
    this._originalSize.width = sizeInPixels.width;
    this._originalSize.height = sizeInPixels.height;
  }

  // Returns the texture of the frame
  getTexture() {
    if (this._texture) return this._texture;
    if (this._textureFilename !== "") {
      const locTexture = textureCache.addImage(this._textureFilename);
      if (locTexture) this._textureLoaded = locTexture.isLoaded();
      return locTexture;
    }
    return null;
  }

  // Sets the texture of the frame, the texture is retained automatically
  setTexture(texture: any) {
    if (this._texture !== texture) {
      const locLoaded = texture.isLoaded();
      this._textureLoaded = locLoaded;
      this._texture = texture;
      if (!locLoaded) {
        texture.addEventListener("load", function (sender: any) {
          this._textureLoaded = true;
          if (this._rotated && _renderType === game.RENDER_TYPE_CANVAS) {
            var tempElement = sender.getHtmlElementObj();
            tempElement = Sprite.CanvasRenderCmd._cutRotateImageToCanvas(tempElement, this.getRect());
            var tempTexture = new Texture2D();
            tempTexture.initWithElement(tempElement);
            tempTexture.handleLoadedTexture();
            this.setTexture(tempTexture);

            var rectVal = this.getRect();
            this.setRect(rect(0, 0, rectVal.width, rectVal.height));
          }
          var locRect = this._rect;
          if (locRect.width === 0 && locRect.height === 0) {
            var w = sender.width, h = sender.height;
            this._rect.width = w;
            this._rect.height = h;
            this._rectInPixels = rectPointsToPixels(this._rect);
            this._originalSizeInPixels.width = this._rectInPixels.width;
            this._originalSizeInPixels.height = this._rectInPixels.height;
            this._originalSize.width = w;
            this._originalSize.height = h;
          }
          //dispatch 'load' event of SpriteFrame
          this.dispatchEvent("load");
        }, this);
      }
    }
  }

  // Returns the offset of the frame in the texture
  getOffset() {
    return p(this._offset);
  }

  // Sets the offset of the frame in the texture
  setOffset(offsets: any) {
    this._offset.x = offsets.x;
    this._offset.y = offsets.y;
  }

  // Clone the sprite frame
  clone() {
    const frame = new SpriteFrame();
    frame.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
    frame.setTexture(this._texture);
    return frame;
  }

  // Copy the sprite frame
  copyWithZone() {
    const copy = new SpriteFrame();
    copy.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
    copy.setTexture(this._texture);
    return copy;
  }

  // Copy the sprite frame
  copy() {
    return this.copyWithZone();
  }

  // Initializes SpriteFrame with Texture, rect, rotated, offset and originalSize in pixels.
  // Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
  initWithTexture(texture: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    let rectLocal = rectArg;
    if (arguments.length === 2) rectLocal = rectPointsToPixels(rectLocal);

    offset = offset || p(0, 0);
    originalSize = originalSize || rectLocal;
    rotated = rotated || false;

    if (typeof texture === "string") {
      this._texture = null;
      this._textureFilename = texture;
    } else if (texture instanceof Texture2D) {
      this.setTexture(texture);
    }

    texture = this.getTexture();

    this._rectInPixels = rectLocal;
    this._rect = rectPixelsToPoints(rectLocal);

    if (texture && texture.url && texture.isLoaded()) {
      var _x, _y;
      if (rotated) {
        _x = rectLocal.x + rectLocal.height;
        _y = rectLocal.y + rectLocal.width;
      } else {
        _x = rectLocal.x + rectLocal.width;
        _y = rectLocal.y + rectLocal.height;
      }
      if (_x > texture.getPixelsWide()) {
        error(_LogInfos.RectWidth, texture.url);
      }
      if (_y > texture.getPixelsHigh()) {
        error(_LogInfos.RectHeight, texture.url);
      }
    }

    this._offsetInPixels.x = offset.x;
    this._offsetInPixels.y = offset.y;
    _pointPixelsToPointsOut(offset, this._offset);
    this._originalSizeInPixels.width = originalSize.width;
    this._originalSizeInPixels.height = originalSize.height;
    _sizePixelsToPointsOut(originalSize, this._originalSize);
    this._rotated = rotated;
    return true;
  }

  // legacy static helpers
  static create(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return new SpriteFrame(filename, rectArg, rotated, offset, originalSize);
  }

  static createWithTexture(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return SpriteFrame.create(filename, rectArg, rotated, offset, originalSize);
  }

  static _frameWithTextureForCanvas(texture: any, rectArg: any, rotated: any, offset: any, originalSize: any) {
    const spriteFrame = new SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rectArg;
    spriteFrame._rect = rectPixelsToPoints(rectArg);
    spriteFrame._offsetInPixels.x = offset.x;
    spriteFrame._offsetInPixels.y = offset.y;
    _pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
    spriteFrame._originalSizeInPixels.width = originalSize.width;
    spriteFrame._originalSizeInPixels.height = originalSize.height;
    _sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
    spriteFrame._rotated = rotated;
    return spriteFrame;
  }
}

EventHelper.apply(SpriteFrame.prototype);
  }

  // legacy static helpers
  static create(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return new SpriteFrame(filename, rectArg, rotated, offset, originalSize);
  }

  static createWithTexture(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return SpriteFrame.create(filename, rectArg, rotated, offset, originalSize);
  }

  static _frameWithTextureForCanvas(texture: any, rectArg: any, rotated: any, offset: any, originalSize: any) {
    const spriteFrame = new SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rectArg;
    spriteFrame._rect = rectPixelsToPoints(rectArg);
    spriteFrame._offsetInPixels.x = offset.x;
    spriteFrame._offsetInPixels.y = offset.y;
    _pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
    spriteFrame._originalSizeInPixels.width = originalSize.width;
    spriteFrame._originalSizeInPixels.height = originalSize.height;
    _sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
    spriteFrame._rotated = rotated;
    return spriteFrame;
  }
}

EventHelper.apply(SpriteFrame.prototype);
   */
  copy() {
    return this.copyWithZone();
  }

  /**
   * Initializes SpriteFrame with Texture, rect, rotated, offset and originalSize in pixels.<br/>
   * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
   * @param {String|Texture2D} texture
   * @param {Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
   * @param {Boolean} [rotated=false]
   * @param {Point} [offset=p(0,0)]
   * @param {Size} [originalSize=rect.size]
   * @return {Boolean}
   */
  initWithTexture(texture: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    let rectLocal = rectArg;
    if (arguments.length === 2) rectLocal = rectPointsToPixels(rectLocal);

    offset = offset || p(0, 0);
    originalSize = originalSize || rectLocal;
    rotated = rotated || false;

    if (typeof texture === "string") {
      this._texture = null;
      this._textureFilename = texture;
    } else if (texture instanceof Texture2D) {
      this.setTexture(texture);
    }

    texture = this.getTexture();

    this._rectInPixels = rectLocal;
    this._rect = rectPixelsToPoints(rectLocal);

    if (texture && texture.url && texture.isLoaded()) {
      var _x, _y;
      if (rotated) {
        _x = rectLocal.x + rectLocal.height;
        _y = rectLocal.y + rectLocal.width;
      } else {
        _x = rectLocal.x + rectLocal.width;
        _y = rectLocal.y + rectLocal.height;
      }
      if (_x > texture.getPixelsWide()) {
        error(_LogInfos.RectWidth, texture.url);
      }
      if (_y > texture.getPixelsHigh()) {
        error(_LogInfos.RectHeight, texture.url);
      }
    }

    this._offsetInPixels.x = offset.x;
    this._offsetInPixels.y = offset.y;
    _pointPixelsToPointsOut(offset, this._offset);
    this._originalSizeInPixels.width = originalSize.width;
    this._originalSizeInPixels.height = originalSize.height;
    _sizePixelsToPointsOut(originalSize, this._originalSize);
    this._rotated = rotated;
    return true;
  }
  // end class methods
  
  static create(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return new SpriteFrame(filename, rectArg, rotated, offset, originalSize);
  }

  static createWithTexture(filename: any, rectArg: any, rotated?: any, offset?: any, originalSize?: any) {
    return SpriteFrame.create(filename, rectArg, rotated, offset, originalSize);
  }

  static _frameWithTextureForCanvas(texture: any, rectArg: any, rotated: any, offset: any, originalSize: any) {
    const spriteFrame = new SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rectArg;
    spriteFrame._rect = rectPixelsToPoints(rectArg);
    spriteFrame._offsetInPixels.x = offset.x;
    spriteFrame._offsetInPixels.y = offset.y;
    _pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
    spriteFrame._originalSizeInPixels.width = originalSize.width;
    spriteFrame._originalSizeInPixels.height = originalSize.height;
    _sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
    spriteFrame._rotated = rotated;
    return spriteFrame;
  }
}

EventHelper.apply(SpriteFrame.prototype);

  offset = offset || p(0, 0);
  originalSize = originalSize || rect;
  rotated = rotated || false;

  if (typeof texture === 'string') {
    this._texture = null;
    this._textureFilename = texture;
  } else if (texture instanceof Texture2D) {
    this.setTexture(texture);
  }

  texture = this.getTexture();

  this._rectInPixels = rect;
  this._rect = rectPixelsToPoints(rect);

  if (texture && texture.url && texture.isLoaded()) {
    var _x, _y;
    if (rotated) {
      _x = rect.x + rect.height;
      _y = rect.y + rect.width;
    } else {
      _x = rect.x + rect.width;
      _y = rect.y + rect.height;
    }
    if (_x > texture.getPixelsWide()) {
      error(_LogInfos.RectWidth, texture.url);
    }
    if (_y > texture.getPixelsHigh()) {
      error(_LogInfos.RectHeight, texture.url);
    }
  }

  this._offsetInPixels.x = offset.x;
  this._offsetInPixels.y = offset.y;
  _pointPixelsToPointsOut(offset, this._offset);
  this._originalSizeInPixels.width = originalSize.width;
  this._originalSizeInPixels.height = originalSize.height;
  _sizePixelsToPointsOut(originalSize, this._originalSize);
  this._rotated = rotated;
  return true;
}
}

EventHelper.prototype.apply(SpriteFrame.prototype);

/**
 * <p>
 *    Create a SpriteFrame with a texture filename, rect, rotated, offset and originalSize in pixels.<br/>
 *    The originalSize is the size in pixels of the frame before being trimmed.
 * </p>
 * @deprecated since v3.0, please use new construction instead
 * @see SpriteFrame
 * @param {String|Texture2D} filename
 * @param {Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
 * @param {Boolean} rotated
 * @param {Point} offset
 * @param {Size} originalSize
 * @return {SpriteFrame}
 */
SpriteFrame.create = function (filename, rect, rotated, offset, originalSize) {
  return new SpriteFrame(filename, rect, rotated, offset, originalSize);
};

/**
 * @deprecated since v3.0, please use new construction instead
 * @see SpriteFrame
 * @function
 */
SpriteFrame.createWithTexture = SpriteFrame.create;

SpriteFrame._frameWithTextureForCanvas = function (texture, rect, rotated, offset, originalSize) {
  var spriteFrame = new SpriteFrame();
  spriteFrame._texture = texture;
  spriteFrame._rectInPixels = rect;
  spriteFrame._rect = rectPixelsToPoints(rect);
  spriteFrame._offsetInPixels.x = offset.x;
  spriteFrame._offsetInPixels.y = offset.y;
  _pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
  spriteFrame._originalSizeInPixels.width = originalSize.width;
  spriteFrame._originalSizeInPixels.height = originalSize.height;
  _sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
  spriteFrame._rotated = rotated;
  return spriteFrame;
};
