import { _renderType } from "../../.."
import { isFunction } from "../../../helper/checkType"
import { _LogInfos, assert, log } from "../../../helper/Debugger"
import { Node } from "../base-nodes/Node"
import { p, rect, size } from "../cocoa/Geometry"
import { BLEND_DST, BLEND_SRC, game, pointPointsToPixels, rectPointsToPixels, sizePointsToPixels } from "../platform/Macro"
import { animationCache } from "./AnimationCache"
import { SpriteFrame } from "./SpriteFrame"
import { spriteFrameCache } from "./SpriteFrameCache"
export class Sprite extends Node {
  dirty: boolean = false;
  atlasIndex: number = 0;
  textureAtlas: any = null;
  _batchNode: any = null;
  _recursiveDirty: any = null;
  _hasChildren: any = null;
  _shouldBeHidden: boolean = false;
  _transformToBatch: any = null;
  _texture: any = null;
  _rect: any = null;
  _rectRotated: boolean = false;
  _offsetPosition: any = null;
  _unflippedOffsetPositionFromCenter: any = null;
  _opacityModifyRGB: boolean = false;
  _flippedX: boolean = false;
  _flippedY: boolean = false;
  _textureLoaded: boolean = false;
  _className: string = "Sprite";
  _blendFunc: any = { src: BLEND_SRC, dst: BLEND_DST };
  _loader: any = null;

  constructor(fileName?: any, rectArg?: any, rotated?: any) {
    super();
    this.setAnchorPoint(0.5, 0.5);
    this._loader = new Sprite.LoadManager();
    this._shouldBeHidden = false;
    this._offsetPosition = p(0, 0);
    this._unflippedOffsetPositionFromCenter = p(0, 0);
    this._rect = rect(0, 0, 0, 0);
    this._softInit(fileName, rectArg, rotated);
  }

  textureLoaded() {
    return this._textureLoaded;
  }

  addLoadedEventListener(callback: any, target: any) {
    this.addEventListener("load", callback, target);
  }

  isDirty() {
    return this.dirty;
  }

  setDirty(bDirty: boolean) {
    this.dirty = bDirty;
  }

  isTextureRectRotated() {
    return this._rectRotated;
  }

  getAtlasIndex() {
    return this.atlasIndex;
  }

  setAtlasIndex(atlasIndex: number) {
    this.atlasIndex = atlasIndex;
  }

  getTextureRect() {
    return rect(this._rect);
  }

  getTextureAtlas() {
    return this.textureAtlas;
  }

  setTextureAtlas(textureAtlas: any) {
    this.textureAtlas = textureAtlas;
  }

  getOffsetPosition() {
    return p(this._offsetPosition);
  }

  _getOffsetX() {
    return this._offsetPosition.x;
  }

  _getOffsetY() {
    return this._offsetPosition.y;
  }

  getBlendFunc() {
    return this._blendFunc;
  }

  initWithSpriteFrame(spriteFrame: any) {
    assert(spriteFrame, _LogInfos.Sprite_initWithSpriteFrame);
    return this.setSpriteFrame(spriteFrame);
  }

  initWithSpriteFrameName(spriteFrameName: string) {
    assert(spriteFrameName, _LogInfos.Sprite_initWithSpriteFrameName);
    const frame = spriteFrameCache.getSpriteFrame(spriteFrameName);
    assert(frame, spriteFrameName + _LogInfos.Sprite_initWithSpriteFrameName1);
    return this.initWithSpriteFrame(frame);
  }

  useBatchNode(batchNode: any) {
    // legacy no-op placeholder
  }

  setVertexRect(r: any) {
    const locRect = this._rect;
    locRect.x = r.x;
    locRect.y = r.y;
    locRect.width = r.width;
    locRect.height = r.height;
    this._renderCmd.setDirtyFlag((Node as any)._dirtyFlags.transformDirty);
  }

  setFlippedX(flippedX: boolean) {
    if (this._flippedX !== flippedX) {
      this._flippedX = flippedX;
      this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
      this.setNodeDirty();
    }
  }

  setFlippedY(flippedY: boolean) {
    if (this._flippedY !== flippedY) {
      this._flippedY = flippedY;
      this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
      this.setNodeDirty();
    }
  }

  isFlippedX() {
    return this._flippedX;
  }

  isFlippedY() {
    return this._flippedY;
  }

  setOpacityModifyRGB(modify: boolean) {
    if (this._opacityModifyRGB !== modify) {
      this._opacityModifyRGB = modify;
      this._renderCmd._setColorDirty();
    }
  }

  isOpacityModifyRGB() {
    return this._opacityModifyRGB;
  }

  setDisplayFrameWithAnimationName(animationName: string, frameIndex: number) {
    assert(animationName, _LogInfos.Sprite_setDisplayFrameWithAnimationName_3);
    const cache = animationCache.getAnimation(animationName);
    if (!cache) {
      log(_LogInfos.Sprite_setDisplayFrameWithAnimationName);
      return;
    }
    const animFrame = cache.getFrames()[frameIndex];
    if (!animFrame) {
      log(_LogInfos.Sprite_setDisplayFrameWithAnimationName_2);
      return;
    }
    this.setSpriteFrame(animFrame.getSpriteFrame());
  }

  getBatchNode() {
    return this._batchNode;
  }

  getTexture() {
    return this._texture;
  }

  _softInit(fileName: any, rectArg: any, rotated: any) {
    if (fileName === undefined) this.init();
    else if (typeof fileName === 'string') {
      if (fileName[0] === "#") {
        const frameName = fileName.substr(1, fileName.length - 1);
        const spriteFrame = spriteFrameCache.getSpriteFrame(frameName);
        if (spriteFrame) this.initWithSpriteFrame(spriteFrame);
        else log("%s does not exist", fileName);
      } else {
        this.init(fileName, rectArg);
      }
    } else if (typeof fileName === "object") {
      if (fileName instanceof Texture2D) {
        this.initWithTexture(fileName, rectArg, rotated);
      } else if (fileName instanceof SpriteFrame) {
        this.initWithSpriteFrame(fileName);
      } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
        const texture2d = new Texture2D();
        texture2d.initWithElement(fileName);
        texture2d.handleLoadedTexture();
        this.initWithTexture(texture2d);
      }
    }
  }

  getQuad() {
    return null;
  }

  setBlendFunc(src: any, dst?: any) {
    const locBlendFunc = this._blendFunc;
    if (dst === undefined) {
      locBlendFunc.src = src.src;
      locBlendFunc.dst = src.dst;
    } else {
      locBlendFunc.src = src;
      locBlendFunc.dst = dst;
    }
    this._renderCmd.updateBlendFunc(locBlendFunc);
  }

  init() {
    if (arguments.length > 0) return this.initWithFile(arguments[0], arguments[1]);
    super.init();
    this.dirty = this._recursiveDirty = false;
    this._blendFunc.src = BLEND_SRC;
    this._blendFunc.dst = BLEND_DST;
    (this as any).texture = null;
    this._flippedX = this._flippedY = false;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this._offsetPosition.x = 0;
    this._offsetPosition.y = 0;
    this._hasChildren = false;
    this.setTextureRect(rect(0, 0, 0, 0), false, size(0, 0));
    return true;
  }

  initWithFile(filename: string, rectArg?: any) {
    assert(filename, _LogInfos.Sprite_initWithFile);
    let tex = textureCache.getTextureForKey(filename);
    if (!tex) tex = textureCache.addImage(filename);
    if (!tex.isLoaded()) {
      this._loader.clear();
      this._loader.once(tex, function () {
        (this as any).initWithFile(filename, rectArg);
        this.dispatchEvent("load");
      }, this);
      return false;
    }
    if (!rectArg) {
      const s = tex.getContentSize();
      rectArg = rect(0, 0, s.width, s.height);
    }
    return this.initWithTexture(tex, rectArg);
  }

  initWithTexture(texture: any, rectArg: any, rotated?: any, counterclockwise?: any) {
    assert(arguments.length !== 0, _LogInfos.CCSpriteBatchNode_initWithTexture);
    this._loader.clear();
    this._textureLoaded = texture.isLoaded();
    if (!this._textureLoaded) {
      this._loader.once(texture, function () {
        (this as any).initWithTexture(texture, rectArg, rotated, counterclockwise);
        this.dispatchEvent("load");
      }, this);
      return false;
    }
    rotated = rotated || false;
    texture = this._renderCmd._handleTextureForRotatedTexture(texture, rectArg, rotated, counterclockwise);
    if (!super.init()) return false;
    this._batchNode = null;
    this._recursiveDirty = false;
    this.dirty = false;
    this._opacityModifyRGB = true;
    this._blendFunc.src = BLEND_SRC;
    this._blendFunc.dst = BLEND_DST;
    this._flippedX = this._flippedY = false;
    this._offsetPosition.x = 0;
    this._offsetPosition.y = 0;
    this._hasChildren = false;
    this._rectRotated = rotated;
    if (rectArg) {
      this._rect.x = rectArg.x;
      this._rect.y = rectArg.y;
      this._rect.width = rectArg.width;
      this._rect.height = rectArg.height;
    }
    if (!rectArg) rectArg = rect(0, 0, texture.width, texture.height);
    this._renderCmd._checkTextureBoundary(texture, rectArg, rotated);
    this.setTexture(texture);
    this.setTextureRect(rectArg, rotated);
    this.setBatchNode(null);
    return true;
  }

  setTextureRect(rectArg: any, rotated?: boolean, untrimmedSize?: any, needConvert?: any) {
    this._rectRotated = rotated || false;
    this.setContentSize(untrimmedSize || rectArg);
    this.setVertexRect(rectArg);
    this._renderCmd._setTextureCoords(rectArg, needConvert);
    let relativeOffsetX = this._unflippedOffsetPositionFromCenter.x, relativeOffsetY = this._unflippedOffsetPositionFromCenter.y;
    if (this._flippedX) relativeOffsetX = -relativeOffsetX;
    if (this._flippedY) relativeOffsetY = -relativeOffsetY;
    const locRect = this._rect;
    this._offsetPosition.x = relativeOffsetX + (this._contentSize.width - locRect.width) / 2;
    this._offsetPosition.y = relativeOffsetY + (this._contentSize.height - locRect.height) / 2;
  }

  addChild(child: any, localZOrder?: number, tag?: number) {
    assert(child, _LogInfos.CCSpriteBatchNode_addChild_2);
    if (localZOrder == null) localZOrder = child._localZOrder;
    if (tag == null) tag = child.tag;
    if (this._renderCmd._setBatchNodeForAddChild(child)) {
      super.addChild(child, localZOrder, tag);
      this._hasChildren = true;
    }
  }

  setSpriteFrame(newFrame: any) {
    if (typeof newFrame === 'string') {
      newFrame = spriteFrameCache.getSpriteFrame(newFrame);
      assert(newFrame, _LogInfos.Sprite_setSpriteFrame);
    }
    this._loader.clear();
    this.setNodeDirty();
    const pNewTexture = newFrame.getTexture();
    this._textureLoaded = newFrame.textureLoaded();
    this._loader.clear();
    if (!this._textureLoaded) {
      this._loader.once(pNewTexture, function () {
        (this as any).setSpriteFrame(newFrame);
        this.dispatchEvent("load");
      }, this);
      return false;
    }
    const frameOffset = newFrame.getOffset();
    this._unflippedOffsetPositionFromCenter.x = frameOffset.x;
    this._unflippedOffsetPositionFromCenter.y = frameOffset.y;
    if (pNewTexture !== this._texture) {
      this._renderCmd._setTexture(pNewTexture);
      this.setColor(this._realColor);
    }
    this.setTextureRect(newFrame.getRect(), newFrame.isRotated(), newFrame.getOriginalSize());
  }

  setDisplayFrame(newFrame: any) {
    log(_LogInfos.Sprite_setDisplayFrame);
    this.setSpriteFrame(newFrame);
  }

  isFrameDisplayed(frame: any) {
    return this._renderCmd.isFrameDisplayed(frame);
  }

  displayFrame() {
    return this.getSpriteFrame();
  }

  getSpriteFrame() {
    return new SpriteFrame(this._texture,
      rectPointsToPixels(this._rect),
      this._rectRotated,
      pointPointsToPixels(this._unflippedOffsetPositionFromCenter),
      sizePointsToPixels(this._contentSize));
  }

  setBatchNode(spriteBatchNode: any) {
    // legacy placeholder
  }

  setTexture(texture: any) {
    if (!texture) return this._renderCmd._setTexture(null);
    const isFileName = (typeof texture === 'string');
    if (isFileName) texture = textureCache.addImage(texture);
    this._loader.clear();
    if (!texture._textureLoaded) {
      this._loader.once(texture, function () {
        (this as any).setTexture(texture);
        this.dispatchEvent("load");
      }, this);
      return false;
    }
    this._renderCmd._setTexture(texture);
    if (isFileName) this._changeRectWithTexture(texture);
    this.setColor(this._realColor);
    this._textureLoaded = true;
  }

  _changeRectWithTexture(texture: any) {
    const contentSize = texture._contentSize;
    const r = rect(0, 0, contentSize.width, contentSize.height);
    this.setTextureRect(r);
  }

  _createRenderCmd() {
    if (_renderType === game.RENDER_TYPE_CANVAS) return new (Sprite as any).CanvasRenderCmd(this);
    else return new (Sprite as any).WebGLRenderCmd(this);
  }


  static LoadManager: any;
  static create(fileName?: any, rect?: any, rotated?: any) {
    return new Sprite(fileName, rect, rotated);
  }
  static INDEX_NOT_INITIALIZED: number = -1;
  static createWithSpriteFrameName = Sprite.create;
  static createWithSpriteFrame = Sprite.create;
}

EventHelper.prototype.apply(Sprite.prototype);
assert(isFunction(_tmp.PrototypeSprite), _LogInfos.MissingFile, "SpritesPropertyDefine.js");
_tmp.PrototypeSprite();
delete _tmp.PrototypeSprite;
(function () {
  var manager = Sprite.LoadManager = function () {
    this.list = [];
  };
  manager.prototype.add = function (source, callback, target) {
    if (!source || !source.addEventListener) return;
    source.addEventListener('load', callback, target);
    this.list.push({
      source: source,
      listener: callback,
      target: target
    });
  };
  manager.prototype.once = function (source, callback, target) {
    if (!source || !source.addEventListener) return;
    var tmpCallback = function (event) {
      source.removeEventListener('load', tmpCallback, target);
      callback.call(target, event);
    };
    source.addEventListener('load', tmpCallback, target);
    this.list.push({
      source: source,
      listener: tmpCallback,
      target: target
    });
  };
  manager.prototype.clear = function () {
    while (this.list.length > 0) {
      var item = this.list.pop();
      item.source.removeEventListener('load', item.listener, item.target);
    }
  };
})();
