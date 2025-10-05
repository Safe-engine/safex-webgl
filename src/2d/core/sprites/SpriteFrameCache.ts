import { isString } from "../../../helper/checkType";
import { _LogInfos, assert, log } from "../../../helper/Debugger";
import { _renderType } from "../../../helper/engine";
import { loader } from "../../../helper/loader";
import { path } from "../../../helper/path";
import { Texture2D } from "../../textures/Texture2D";
import { textureCache } from "../../textures/TextureCache";
import { p, rect, size } from "../cocoa/Geometry";
import { game } from "../platform/Macro";
import { Sprite } from "./Sprite";
import { SpriteFrame } from "./SpriteFrame";

/**
 * <p>
 * spriteFrameCache is a singleton that handles the loading of the sprite frames. It saves in a cache the sprite frames.<br/>
 * <br/>
 * example<br/>
 * // add SpriteFrames to spriteFrameCache With File<br/>
 * spriteFrameCache.addSpriteFrames(s_grossiniPlist);<br/>
 * </p>
 * @class
 * @name spriteFrameCache
 */
export const spriteFrameCache = {
  _CCNS_REG1: /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
  _CCNS_REG2: /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,

  _spriteFrames: {},
  _spriteFramesAliases: {},
  _frameConfigCache: {},

  _rectFromString: function (content) {
    var result = this._CCNS_REG2.exec(content);
    if (!result) return rect(0, 0, 0, 0);
    return rect(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));
  },

  _pointFromString: function (content) {
    var result = this._CCNS_REG1.exec(content);
    if (!result) return p(0, 0);
    return p(parseFloat(result[1]), parseFloat(result[2]));
  },

  _sizeFromString: function (content) {
    var result = this._CCNS_REG1.exec(content);
    if (!result) return size(0, 0);
    return size(parseFloat(result[1]), parseFloat(result[2]));
  },

  _getFrameConfig: function (url) {
    var dict = loader.getRes(url);

    assert(dict, _LogInfos.spriteFrameCache__getFrameConfig_2, url);

    loader.release(url);//release it in loader
    if (dict._inited) {
      this._frameConfigCache[url] = dict;
      return dict;
    }
    this._frameConfigCache[url] = this._parseFrameConfig(dict);
    return this._frameConfigCache[url];
  },

  _getFrameConfigByJsonObject: function (url, jsonObject) {
    assert(jsonObject, _LogInfos.spriteFrameCache__getFrameConfig_2, url);
    this._frameConfigCache[url] = this._parseFrameConfig(jsonObject);
    return this._frameConfigCache[url];
  },

  _parseFrameConfig: function (dict) {
    var tempFrames = dict["frames"], tempMeta = dict["metadata"] || dict["meta"];
    var frames = {}, meta = {};
    var format = 0;
    if (tempMeta) {//init meta
      var tmpFormat = tempMeta["format"];
      format = (tmpFormat.length <= 1) ? parseInt(tmpFormat) : tmpFormat;
      meta.image = tempMeta["textureFileName"] || tempMeta["textureFileName"] || tempMeta["image"];
    }
    for (var key in tempFrames) {
      var frameDict = tempFrames[key];
      if (!frameDict) continue;
      var tempFrame = {};

      if (format == 0) {
        tempFrame.rect = rect(frameDict["x"], frameDict["y"], frameDict["width"], frameDict["height"]);
        tempFrame.rotated = false;
        tempFrame.offset = p(frameDict["offsetX"], frameDict["offsetY"]);
        var ow = frameDict["originalWidth"];
        var oh = frameDict["originalHeight"];
        // check ow/oh
        if (!ow || !oh) {
          log(_LogInfos.spriteFrameCache__getFrameConfig);
        }
        // Math.abs ow/oh
        ow = Math.abs(ow);
        oh = Math.abs(oh);
        tempFrame.size = size(ow, oh);
      } else if (format == 1 || format == 2) {
        tempFrame.rect = this._rectFromString(frameDict["frame"]);
        tempFrame.rotated = frameDict["rotated"] || false;
        tempFrame.offset = this._pointFromString(frameDict["offset"]);
        tempFrame.size = this._sizeFromString(frameDict["sourceSize"]);
      } else if (format == 3) {
        // get values
        var spriteSize = this._sizeFromString(frameDict["spriteSize"]);
        var textureRect = this._rectFromString(frameDict["textureRect"]);
        if (spriteSize) {
          textureRect = rect(textureRect.x, textureRect.y, spriteSize.width, spriteSize.height);
        }
        tempFrame.rect = textureRect;
        tempFrame.rotated = frameDict["textureRotated"] || false; // == "true";
        tempFrame.offset = this._pointFromString(frameDict["spriteOffset"]);
        tempFrame.size = this._sizeFromString(frameDict["spriteSourceSize"]);
        tempFrame.aliases = frameDict["aliases"];
      } else {
        var tmpFrame = frameDict["frame"], tmpSourceSize = frameDict["sourceSize"];
        key = frameDict["filename"] || key;
        tempFrame.rect = rect(tmpFrame["x"], tmpFrame["y"], tmpFrame["w"], tmpFrame["h"]);
        tempFrame.rotated = frameDict["rotated"] || false;
        tempFrame.offset = p(0, 0);
        tempFrame.size = size(tmpSourceSize["w"], tmpSourceSize["h"]);
      }
      frames[key] = tempFrame;
    }
    return { _inited: true, frames: frames, meta: meta };
  },

  // Adds multiple Sprite Frames from a json object. it uses for local web view app.
  _addSpriteFramesByObject: function (url, jsonObject, texture) {
    assert(url, _LogInfos.spriteFrameCache_addSpriteFrames_2);
    if (!jsonObject || !jsonObject["frames"])
      return;

    var frameConfig = this._frameConfigCache[url] || this._getFrameConfigByJsonObject(url, jsonObject);
    //this._checkConflict(frameConfig);                             //TODO
    this._createSpriteFrames(url, frameConfig, texture);
  },

  _createSpriteFrames: function (url, frameConfig, texture) {
    var frames = frameConfig.frames, meta = frameConfig.meta;
    if (!texture) {
      var texturePath = path.changeBasename(url, meta.image || ".png");
      texture = textureCache.addImage(texturePath);
    } else if (texture instanceof Texture2D) {
      //do nothing
    } else if (isString(texture)) {//string
      texture = textureCache.addImage(texture);
    } else {
      assert(0, _LogInfos.spriteFrameCache_addSpriteFrames_3);
    }

    //create sprite frames
    var spAliases = this._spriteFramesAliases, spriteFrames = this._spriteFrames;
    for (var key in frames) {
      var frame = frames[key];
      var spriteFrame = spriteFrames[key];
      if (!spriteFrame) {
        spriteFrame = new SpriteFrame(texture, rect(frame.rect), frame.rotated, frame.offset, frame.size);
        var aliases = frame.aliases;
        if (aliases) {//set aliases
          for (var i = 0, li = aliases.length; i < li; i++) {
            var alias = aliases[i];
            if (spAliases[alias])
              log(_LogInfos.spriteFrameCache_addSpriteFrames, alias);
            spAliases[alias] = key;
          }
        }

        if (_renderType === game.RENDER_TYPE_CANVAS && spriteFrame.isRotated()) {
          //clip to canvas
          var locTexture = spriteFrame.getTexture();
          if (locTexture.isLoaded()) {
            var tempElement = spriteFrame.getTexture().getHtmlElementObj();
            tempElement = Sprite.CanvasRenderCmd._cutRotateImageToCanvas(tempElement, spriteFrame.getRectInPixels());
            var tempTexture = new Texture2D();
            tempTexture.initWithElement(tempElement);
            tempTexture.handleLoadedTexture();
            spriteFrame.setTexture(tempTexture);
            spriteFrame.setRotated(false);

            var rect = spriteFrame._rect;
            spriteFrame.setRect(rect(0, 0, rect.width, rect.height));
          }
        }
        spriteFrames[key] = spriteFrame;
      }
    }
  },

  /**
   * <p>
   *   Adds multiple Sprite Frames from a plist or json file.<br/>
   *   A texture will be loaded automatically. The texture name will composed by replacing the .plist or .json suffix with .png<br/>
   *   If you want to use another texture, you should use the addSpriteFrames:texture parameter.<br/>
   * </p>
   * @param {String} url file path
   * @param {HTMLImageElement|Texture2D|string} [texture]
   * @example
   * // add SpriteFrames to SpriteFrameCache With File
   * spriteFrameCache.addSpriteFrames(s_grossiniPlist);
   * spriteFrameCache.addSpriteFrames(s_grossiniJson);
   */
  addSpriteFrames: function (url, texture) {
    assert(url, _LogInfos.spriteFrameCache_addSpriteFrames_2);

    //Is it a SpriteFrame plist?
    var dict = this._frameConfigCache[url] || loader.getRes(url);
    if (!dict || !dict["frames"])
      return;

    var frameConfig = this._frameConfigCache[url] || this._getFrameConfig(url);
    //this._checkConflict(frameConfig);                             //TODO
    this._createSpriteFrames(url, frameConfig, texture);
  },

  // Function to check if frames to add exists already, if so there may be name conflit that must be solved
  _checkConflict: function (dictionary) {
    var framesDict = dictionary["frames"];

    for (var key in framesDict) {
      if (this._spriteFrames[key]) {
        log(_LogInfos.spriteFrameCache__checkConflict, key);
      }
    }
  },

  /**
   * <p>
   *  Adds an sprite frame with a given name.<br/>
   *  If the name already exists, then the contents of the old name will be replaced with the new one.
   * </p>
   * @param {SpriteFrame} frame
   * @param {String} frameName
   */
  addSpriteFrame: function (frame, frameName) {
    this._spriteFrames[frameName] = frame;
  },

  /**
   * <p>
   *   Purges the dictionary of loaded sprite frames.<br/>
   *   Call this method if you receive the "Memory Warning".<br/>
   *   In the short term: it will free some resources preventing your app from being killed.<br/>
   *   In the medium term: it will allocate more resources.<br/>
   *   In the long term: it will be the same.<br/>
   * </p>
   */
  removeSpriteFrames: function () {
    this._spriteFrames = {};
    this._spriteFramesAliases = {};
  },

  /**
   * Deletes an sprite frame from the sprite frame cache.
   * @param {String} name
   */
  removeSpriteFrameByName: function (name) {
    // explicit nil handling
    if (!name) {
      return;
    }

    // Is this an alias ?
    if (this._spriteFramesAliases[name]) {
      delete (this._spriteFramesAliases[name]);
    }
    if (this._spriteFrames[name]) {
      delete (this._spriteFrames[name]);
    }
    // XXX. Since we don't know the .plist file that originated the frame, we must remove all .plist from the cache
  },

  /**
   * <p>
   *     Removes multiple Sprite Frames from a plist file.<br/>
   *     Sprite Frames stored in this file will be removed.<br/>
   *     It is convinient to call this method when a specific texture needs to be removed.<br/>
   * </p>
   * @param {String} url Plist filename
   */
  removeSpriteFramesFromFile: function (url) {
    var self = this, spriteFrames = self._spriteFrames,
      aliases = self._spriteFramesAliases, cfg = self._frameConfigCache[url];
    if (!cfg) return;
    var frames = cfg.frames;
    for (var key in frames) {
      if (spriteFrames[key]) {
        delete (spriteFrames[key]);
        for (var alias in aliases) {//remove alias
          if (aliases[alias] === key) delete aliases[alias];
        }
      }
    }
  },

  /**
   * <p>
   *    Removes all Sprite Frames associated with the specified textures.<br/>
   *    It is convenient to call this method when a specific texture needs to be removed.
   * </p>
   * @param {HTMLImageElement|HTMLCanvasElement|Texture2D} texture
   */
  removeSpriteFramesFromTexture: function (texture) {
    var self = this, spriteFrames = self._spriteFrames, aliases = self._spriteFramesAliases;
    for (var key in spriteFrames) {
      var frame = spriteFrames[key];
      if (frame && (frame.getTexture() === texture)) {
        delete (spriteFrames[key]);
        for (var alias in aliases) {//remove alias
          if (aliases[alias] === key) delete aliases[alias];
        }
      }
    }
  },

  /**
   * <p>
   *   Returns an Sprite Frame that was previously added.<br/>
   *   If the name is not found it will return nil.<br/>
   *   You should retain the returned copy if you are going to use it.<br/>
   * </p>
   * @param {String} name name of SpriteFrame
   * @return {SpriteFrame}
   * @example
   * //get a SpriteFrame by name
   * var frame = spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
   */
  getSpriteFrame: function (name) {
    var self = this, frame = self._spriteFrames[name];
    if (!frame) {
      // try alias dictionary
      var key = self._spriteFramesAliases[name];
      if (key) {
        frame = self._spriteFrames[key.toString()];
        if (!frame) delete self._spriteFramesAliases[name];
      }
    }
    return frame;
  },

  _clear: function () {
    this._spriteFrames = {};
    this._spriteFramesAliases = {};
    this._frameConfigCache = {};
  }
};
