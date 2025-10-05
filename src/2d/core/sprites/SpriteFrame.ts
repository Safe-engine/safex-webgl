// @ts-nocheck
import { rect } from "../cocoa/Geometry";
import { EventHelper } from "../event-manager/EventHelper";

/**
 * <p>
// @ts-nocheck
import { rect } from "../cocoa/Geometry";
import { EventHelper } from "../event-manager/EventHelper";

/**
 * SpriteFrame represents a frame (rect within a texture).
 * This file preserves legacy static helpers (create, createWithTexture)
 * and re-attaches EventHelper methods to the prototype for runtime compatibility.
 */
export class SpriteFrame extends EventHelper {
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

  textureLoaded() {
    return this._textureLoaded;
  }

  addLoadedEventListener(callback: any, target: any) {
    // legacy alias
    this.addEventListener("load", callback, target);
  }

  getRectInPixels() {
    const loc = this._rectInPixels;
    return rect(loc.x, loc.y, loc.width, loc.height);
  }

  setRectInPixels(rectInPixels: any) {
    if (!this._rectInPixels) this._rectInPixels = rect(0, 0, 0, 0);
    this._rectInPixels.x = rectInPixels.x;
    this._rectInPixels.y = rectInPixels.y;
    this._rectInPixels.width = rectInPixels.width;
    this._rectInPixels.height = rectInPixels.height;
    this._rect = rectPixelsToPoints(rectInPixels);
  }

  isRotated() {
    return this._rotated;
  }

  setRotated(bRotated: any) {
    this._rotated = bRotated;
  }

  getRect() {
    const r = this._rect;
    return rect(r.x, r.y, r.width, r.height);
  }

  setRect(r: any) {
    if (!this._rect) this._rect = rect(0, 0, 0, 0);
    this._rect.x = r.x;
    this._rect.y = r.y;
    this._rect.width = r.width;
    this._rect.height = r.height;
    this._rectInPixels = rectPointsToPixels(this._rect);
  }

  getOffsetInPixels() {
    return p(this._offsetInPixels);
  }

  setOffsetInPixels(offsetInPixels: any) {
    this._offsetInPixels.x = offsetInPixels.x;
    this._offsetInPixels.y = offsetInPixels.y;
    _pointPixelsToPointsOut(this._offsetInPixels, this._offset);
  }

  getOriginalSizeInPixels() {
    return size(this._originalSizeInPixels);
  }

  setOriginalSizeInPixels(sizeInPixels: any) {
    this._originalSizeInPixels.width = sizeInPixels.width;
    this._originalSizeInPixels.height = sizeInPixels.height;
  }

  getOriginalSize() {
    return size(this._originalSize);
  }

  setOriginalSize(sizeInPixels: any) {
    this._originalSize.width = sizeInPixels.width;
    this._originalSize.height = sizeInPixels.height;
  }

  getTexture() {
    if (this._texture) return this._texture;
    if (this._textureFilename !== "") {
      const locTexture = textureCache.addImage(this._textureFilename);
      if (locTexture) this._textureLoaded = locTexture.isLoaded();
      return locTexture;
    }
    return null;
  }

  setTexture(texture: any) {
    if (this._texture !== texture) {
      const locLoaded = texture.isLoaded();
      this._textureLoaded = locLoaded;
      this._texture = texture;
      if (!locLoaded) {
        texture.addEventListener("load", function (sender: any) {
          this._textureLoaded = true;
          if (this._rotated && _renderType === game.RENDER_TYPE_CANVAS) {
            let tempElement = sender.getHtmlElementObj();
            tempElement = Sprite.CanvasRenderCmd._cutRotateImageToCanvas(tempElement, this.getRect());
            const tempTexture = new Texture2D();
            tempTexture.initWithElement(tempElement);
            tempTexture.handleLoadedTexture();
            this.setTexture(tempTexture);

            const rectVal = this.getRect();
            this.setRect(rect(0, 0, rectVal.width, rectVal.height));
          }
          const locRect = this._rect;
          if (locRect.width === 0 && locRect.height === 0) {
            const w = sender.width, h = sender.height;
            this._rect.width = w;
            this._rect.height = h;
            this._rectInPixels = rectPointsToPixels(this._rect);
            this._originalSizeInPixels.width = this._rectInPixels.width;
            this._originalSizeInPixels.height = this._rectInPixels.height;
            this._originalSize.width = w;
            this._originalSize.height = h;
          }
          // dispatch 'load' event
          this.dispatchEvent("load");
        }, this);
      }
    }
  }

  getOffset() {
    return p(this._offset);
  }

  setOffset(offsets: any) {
    this._offset.x = offsets.x;
    this._offset.y = offsets.y;
  }

  clone() {
    const frame = new SpriteFrame();
    frame.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
    frame.setTexture(this._texture);
    return frame;
  }

  copyWithZone() {
    const copy = new SpriteFrame();
    copy.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
    copy.setTexture(this._texture);
    return copy;
  }

  copy() {
    return this.copyWithZone();
  }

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
      let _x, _y;
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

    this._originalSizeInPixels.height = originalSize.height;
