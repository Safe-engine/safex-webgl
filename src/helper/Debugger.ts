/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

import { isObject } from "./checkType";
import { formatStr } from "./string";

export const _LogInfos = {
  ActionManager_addAction: "ActionManager.addAction(): action must be non-null",
  ActionManager_removeAction: "cocos2d: removeAction: Target not found",
  ActionManager_removeActionByTag: "ActionManager.removeActionByTag(): an invalid tag",
  ActionManager_removeActionByTag_2: "ActionManager.removeActionByTag(): target must be non-null",
  ActionManager_getActionByTag: "ActionManager.getActionByTag(): an invalid tag",
  ActionManager_getActionByTag_2: "cocos2d : getActionByTag(tag = %s): Action not found",

  configuration_dumpInfo: "cocos2d: **** WARNING **** CC_ENABLE_PROFILERS is defined. Disable it when you finish profiling (from ccConfig.js)",
  configuration_loadConfigFile: "Expected 'data' dict, but not found. Config file: %s",
  configuration_loadConfigFile_2: "Please load the resource first : %s",

  Director_resume: "cocos2d: Director: Error in gettimeofday",
  Director_setProjection: "cocos2d: Director: unrecognized projection",
  Director_popToSceneStackLevel: "cocos2d: Director: unrecognized projection",
  Director_popToSceneStackLevel_2: "cocos2d: Director: Error in gettimeofday",
  Director_popScene: "running scene should not null",
  Director_pushScene: "the scene should not null",

  arrayVerifyType: "element type is wrong!",

  Scheduler_scheduleCallbackForTarget: "CCSheduler#scheduleCallback. Callback already scheduled. Updating interval from:%s to %s",
  Scheduler_scheduleCallbackForTarget_2: "scheduler.scheduleCallbackForTarget(): callback_fn should be non-null.",
  Scheduler_scheduleCallbackForTarget_3: "scheduler.scheduleCallbackForTarget(): target should be non-null.",
  Scheduler_pauseTarget: "Scheduler.pauseTarget():target should be non-null",
  Scheduler_resumeTarget: "Scheduler.resumeTarget():target should be non-null",
  Scheduler_isTargetPaused: "Scheduler.isTargetPaused():target should be non-null",

  Node_getZOrder: "getZOrder is deprecated. Please use getLocalZOrder instead.",
  Node_setZOrder: "setZOrder is deprecated. Please use setLocalZOrder instead.",
  Node_getRotation: "RotationX != RotationY. Don't know which one to return",
  Node_getScale: "ScaleX != ScaleY. Don't know which one to return",
  Node_addChild: "An Node can't be added as a child of itself.",
  Node_addChild_2: "child already added. It can't be added again",
  Node_addChild_3: "child must be non-null",
  Node_removeFromParentAndCleanup: "removeFromParentAndCleanup is deprecated. Use removeFromParent instead",
  Node_boundingBox: "boundingBox is deprecated. Use getBoundingBox instead",
  Node_removeChildByTag: "argument tag is an invalid tag",
  Node_removeChildByTag_2: "cocos2d: removeChildByTag(tag = %s): child not found!",
  Node_removeAllChildrenWithCleanup: "removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead",
  Node_stopActionByTag: "Node.stopActionBy(): argument tag an invalid tag",
  Node_getActionByTag: "Node.getActionByTag(): argument tag is an invalid tag",
  Node_resumeSchedulerAndActions: "resumeSchedulerAndActions is deprecated, please use resume instead.",
  Node_pauseSchedulerAndActions: "pauseSchedulerAndActions is deprecated, please use pause instead.",
  Node__arrayMakeObjectsPerformSelector: "Unknown callback function",
  Node_reorderChild: "Node.reorderChild(): child must be non-null",
  Node_reorderChild_2: "Node.reorderChild(): this child is not in children list",
  Node_runAction: "Node.runAction(): action must be non-null",
  Node_schedule: "callback function must be non-null",
  Node_schedule_2: "interval must be positive",
  Node_initWithTexture: "cocos2d: Could not initialize AtlasNode. Invalid Texture.",

  AtlasNode_updateAtlasValues: "AtlasNode.updateAtlasValues(): Shall be overridden in subclasses",
  AtlasNode_initWithTileFile: "",
  AtlasNode__initWithTexture: "cocos2d: Could not initialize AtlasNode. Invalid Texture.",

  _EventListenerKeyboard_checkAvailable: "_EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",
  _EventListenerTouchOneByOne_checkAvailable: "_EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!",
  _EventListenerTouchAllAtOnce_checkAvailable: "_EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!",
  _EventListenerAcceleration_checkAvailable: "_EventListenerAcceleration.checkAvailable(): _onAccelerationEvent must be non-nil",

  EventListener_create: "Invalid parameter.",

  __getListenerID: "Don't call this method if the event is for touch.",

  eventManager__forceAddEventListener: "Invalid scene graph priority!",
  eventManager_addListener: "0 priority is forbidden for fixed priority since it's used for scene graph based priority.",
  eventManager_removeListeners: "Invalid listener type!",
  eventManager_setPriority: "Can't set fixed priority with scene graph based listener.",
  eventManager_addListener_2: "Invalid parameters.",
  eventManager_addListener_3: "listener must be a EventListener object when adding a fixed priority listener",
  eventManager_addListener_4: "The listener has been registered, please don't register it again.",

  LayerMultiplex_initWithLayers: "parameters should not be ending with null in Javascript",
  LayerMultiplex_switchTo: "Invalid index in MultiplexLayer switchTo message",
  LayerMultiplex_switchToAndReleaseMe: "Invalid index in MultiplexLayer switchTo message",
  LayerMultiplex_addLayer: "Layer.addLayer(): layer should be non-null",

  EGLView_setDesignResolutionSize: "Resolution not valid",
  EGLView_setDesignResolutionSize_2: "should set resolutionPolicy",

  inputManager_handleTouchesBegin: "The touches is more than MAX_TOUCHES, nUnusedIndex = %s",

  swap: "swap is being modified from original macro, please check usage",
  checkGLErrorDebug: "WebGL error %s",

  animationCache__addAnimationsWithDictionary: "cocos2d: AnimationCache: No animations were found in provided dictionary.",
  animationCache__addAnimationsWithDictionary_2: "AnimationCache. Invalid animation format",
  animationCache_addAnimations: "AnimationCache.addAnimations(): File could not be found",
  animationCache__parseVersion1: "cocos2d: AnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
  animationCache__parseVersion1_2: "cocos2d: AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the SpriteFrameCache. This frame will not be added to the animation.",
  animationCache__parseVersion1_3: "cocos2d: AnimationCache: None of the frames for animation '%s' were found in the SpriteFrameCache. Animation is not being added to the Animation Cache.",
  animationCache__parseVersion1_4: "cocos2d: AnimationCache: An animation in your dictionary refers to a frame which is not in the SpriteFrameCache. Some or all of the frames for the animation '%s' may be missing.",
  animationCache__parseVersion2: "cocos2d: CCAnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
  animationCache__parseVersion2_2: "cocos2d: AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the SpriteFrameCache. This frame will not be added to the animation.",
  animationCache_addAnimations_2: "AnimationCache.addAnimations(): Invalid texture file name",

  Sprite_ignoreAnchorPointForPosition: "Sprite.ignoreAnchorPointForPosition(): it is invalid in Sprite when using SpriteBatchNode",
  Sprite_setDisplayFrameWithAnimationName: "Sprite.setDisplayFrameWithAnimationName(): Frame not found",
  Sprite_setDisplayFrameWithAnimationName_2: "Sprite.setDisplayFrameWithAnimationName(): Invalid frame index",
  Sprite_setDisplayFrame: "setDisplayFrame is deprecated, please use setSpriteFrame instead.",
  Sprite__updateBlendFunc: "Sprite._updateBlendFunc(): _updateBlendFunc doesn't work when the sprite is rendered using a CCSpriteBatchNode",
  Sprite_initWithSpriteFrame: "Sprite.initWithSpriteFrame(): spriteFrame should be non-null",
  Sprite_initWithSpriteFrameName: "Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null",
  Sprite_initWithSpriteFrameName1: " is null, please check.",
  Sprite_initWithFile: "Sprite.initWithFile(): filename should be non-null",
  Sprite_setDisplayFrameWithAnimationName_3: "Sprite.setDisplayFrameWithAnimationName(): animationName must be non-null",
  Sprite_addChild: "Sprite.addChild(): Sprite only supports Sprites as children when using SpriteBatchNode",
  Sprite_addChild_2: "Sprite.addChild(): Sprite only supports a sprite using same texture as children when using SpriteBatchNode",
  Sprite_addChild_3: "Sprite.addChild(): child should be non-null",
  Sprite_setTexture: "Sprite.texture setter: Batched sprites should use the same texture as the batchnode",
  Sprite_updateQuadFromSprite: "SpriteBatchNode.updateQuadFromSprite(): SpriteBatchNode only supports Sprites as children",
  Sprite_insertQuadFromSprite: "SpriteBatchNode.insertQuadFromSprite(): SpriteBatchNode only supports Sprites as children",
  Sprite_addChild_4: "SpriteBatchNode.addChild(): SpriteBatchNode only supports Sprites as children",
  Sprite_addChild_5: "SpriteBatchNode.addChild(): Sprite is not using the same texture",
  Sprite_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
  Sprite_setSpriteFrame: "Invalid spriteFrameName",
  Sprite_setTexture_2: "Invalid argument: Sprite.texture setter expects a CCTexture2D.",
  Sprite_updateQuadFromSprite_2: "SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
  Sprite_insertQuadFromSprite_2: "SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",

  SpriteBatchNode_addSpriteWithoutQuad: "SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports Sprites as children",
  SpriteBatchNode_increaseAtlasCapacity: "cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from %s to %s.",
  SpriteBatchNode_increaseAtlasCapacity_2: "cocos2d: WARNING: Not enough memory to resize the atlas",
  SpriteBatchNode_reorderChild: "SpriteBatchNode.addChild(): Child doesn't belong to Sprite",
  SpriteBatchNode_removeChild: "SpriteBatchNode.addChild(): sprite batch node should contain the child",
  SpriteBatchNode_addSpriteWithoutQuad_2: "SpriteBatchNode.addQuadFromSprite(): child should be non-null",
  SpriteBatchNode_reorderChild_2: "SpriteBatchNode.addChild(): child should be non-null",

  spriteFrameCache__getFrameConfig: "cocos2d: WARNING: originalWidth/Height not found on the SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist",
  spriteFrameCache_addSpriteFrames: "cocos2d: WARNING: an alias with name %s already exists",
  spriteFrameCache__checkConflict: "cocos2d: WARNING: Sprite frame: %s has already been added by another source, please fix name conflit",
  spriteFrameCache_getSpriteFrame: "cocos2d: SpriteFrameCahce: Frame %s not found",
  spriteFrameCache__getFrameConfig_2: "Please load the resource first : %s",
  spriteFrameCache_addSpriteFrames_2: "SpriteFrameCache.addSpriteFrames(): plist should be non-null",
  spriteFrameCache_addSpriteFrames_3: "Argument must be non-nil",

  CCSpriteBatchNode_updateQuadFromSprite: "SpriteBatchNode.updateQuadFromSprite(): SpriteBatchNode only supports Sprites as children",
  CCSpriteBatchNode_insertQuadFromSprite: "SpriteBatchNode.insertQuadFromSprite(): SpriteBatchNode only supports Sprites as children",
  CCSpriteBatchNode_addChild: "SpriteBatchNode.addChild(): SpriteBatchNode only supports Sprites as children",
  CCSpriteBatchNode_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
  CCSpriteBatchNode_addChild_2: "Sprite.addChild(): child should be non-null",
  CCSpriteBatchNode_setSpriteFrame: "Invalid spriteFrameName",
  CCSpriteBatchNode_setTexture: "Invalid argument: Sprite texture setter expects a CCTexture2D.",
  CCSpriteBatchNode_updateQuadFromSprite_2: "SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
  CCSpriteBatchNode_insertQuadFromSprite_2: "SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
  CCSpriteBatchNode_addChild_3: "SpriteBatchNode.addChild(): child should be non-null",

  TextureAtlas_initWithFile: "cocos2d: Could not open file: %s",
  TextureAtlas_insertQuad: "TextureAtlas.insertQuad(): invalid totalQuads",
  TextureAtlas_initWithTexture: "TextureAtlas.initWithTexture():texture should be non-null",
  TextureAtlas_updateQuad: "TextureAtlas.updateQuad(): quad should be non-null",
  TextureAtlas_updateQuad_2: "TextureAtlas.updateQuad(): Invalid index",
  TextureAtlas_insertQuad_2: "TextureAtlas.insertQuad(): Invalid index",
  TextureAtlas_insertQuads: "TextureAtlas.insertQuad(): Invalid index + amount",
  TextureAtlas_insertQuadFromIndex: "TextureAtlas.insertQuadFromIndex(): Invalid newIndex",
  TextureAtlas_insertQuadFromIndex_2: "TextureAtlas.insertQuadFromIndex(): Invalid fromIndex",
  TextureAtlas_removeQuadAtIndex: "TextureAtlas.removeQuadAtIndex(): Invalid index",
  TextureAtlas_removeQuadsAtIndex: "TextureAtlas.removeQuadsAtIndex(): index + amount out of bounds",
  TextureAtlas_moveQuadsFromIndex: "TextureAtlas.moveQuadsFromIndex(): move is out of bounds",
  TextureAtlas_moveQuadsFromIndex_2: "TextureAtlas.moveQuadsFromIndex(): Invalid newIndex",
  TextureAtlas_moveQuadsFromIndex_3: "TextureAtlas.moveQuadsFromIndex(): Invalid oldIndex",

  textureCache_addPVRTCImage: "TextureCache:addPVRTCImage does not support on HTML5",
  textureCache_addETCImage: "TextureCache:addPVRTCImage does not support on HTML5",
  textureCache_textureForKey: "textureForKey is deprecated. Please use getTextureForKey instead.",
  textureCache_addPVRImage: "addPVRImage does not support on HTML5",
  textureCache_addUIImage: "cocos2d: Couldn't add UIImage in TextureCache",
  textureCache_dumpCachedTextureInfo: "cocos2d: '%s' id=%s %s x %s",
  textureCache_dumpCachedTextureInfo_2: "cocos2d: '%s' id= HTMLCanvasElement %s x %s",
  textureCache_dumpCachedTextureInfo_3: "cocos2d: TextureCache dumpDebugInfo: %s textures, HTMLCanvasElement for %s KB (%s MB)",
  textureCache_addUIImage_2: "Texture.addUIImage(): image should be non-null",

  Texture2D_initWithETCFile: "initWithETCFile does not support on HTML5",
  Texture2D_initWithPVRFile: "initWithPVRFile does not support on HTML5",
  Texture2D_initWithPVRTCData: "initWithPVRTCData does not support on HTML5",
  Texture2D_addImage: "Texture.addImage(): path should be non-null",
  Texture2D_initWithImage: "cocos2d: Texture2D. Can't create Texture. UIImage is nil",
  Texture2D_initWithImage_2: "cocos2d: WARNING: Image (%s x %s) is bigger than the supported %s x %s",
  Texture2D_initWithString: "initWithString isn't supported on cocos2d-html5",
  Texture2D_initWithETCFile_2: "initWithETCFile does not support on HTML5",
  Texture2D_initWithPVRFile_2: "initWithPVRFile does not support on HTML5",
  Texture2D_initWithPVRTCData_2: "initWithPVRTCData does not support on HTML5",
  Texture2D_bitsPerPixelForFormat: "bitsPerPixelForFormat: %s, cannot give useful result, it's a illegal pixel format",
  Texture2D__initPremultipliedATextureWithImage: "cocos2d: Texture2D: Using RGB565 texture since image has no alpha",
  Texture2D_addImage_2: "Texture.addImage(): path should be non-null",
  Texture2D_initWithData: "NSInternalInconsistencyException",

  MissingFile: "Missing file: %s",
  radiansToDegress: "radiansToDegress() should be called radiansToDegrees()",
  RectWidth: "Rect width exceeds maximum margin: %s",
  RectHeight: "Rect height exceeds maximum margin: %s",

  EventListenerKeyboard_checkAvailable: "_EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",

  EventManager__updateListeners: "If program goes here, there should be event in dispatch.",
  EventManager__updateListeners_2: "_inDispatch should be 1 here."
};

//+++++++++++++++++++++++++something about log start++++++++++++++++++++++++++++
const _logToWebPage = function (msg) {
  if (!_canvas)
    return;

  var logList = _logList;
  var doc = document;
  if (!logList) {
    var logDiv = doc.createElement("Div");
    var logDivStyle = logDiv.style;

    logDiv.setAttribute("id", "logInfoDiv");
    _canvas.parentNode.appendChild(logDiv);
    logDiv.setAttribute("width", "200");
    logDiv.setAttribute("height", _canvas.height);
    logDivStyle.zIndex = "99999";
    logDivStyle.position = "absolute";
    logDivStyle.top = "0";
    logDivStyle.left = "0";

    logList = _logList = doc.createElement("textarea");
    var logListStyle = logList.style;

    logList.setAttribute("rows", "20");
    logList.setAttribute("cols", "30");
    logList.setAttribute("disabled", true);
    logDiv.appendChild(logList);
    logListStyle.backgroundColor = "transparent";
    logListStyle.borderBottom = "1px solid #cccccc";
    logListStyle.borderRightWidth = "0px";
    logListStyle.borderLeftWidth = "0px";
    logListStyle.borderTopWidth = "0px";
    logListStyle.borderTopStyle = "none";
    logListStyle.borderRightStyle = "none";
    logListStyle.borderLeftStyle = "none";
    logListStyle.padding = "0px";
    logListStyle.margin = 0;

  }
  logList.value = logList.value + msg + "\r\n";
  logList.scrollTop = logList.scrollHeight;
};

//to make sure the log, warn, error and assert would not throw error before init by debugger mode.
export const _formatString = function (arg) {
  if (isObject(arg)) {
    try {
      return JSON.stringify(arg);
    } catch (err) {
      return "";
    }
  } else
    return arg;
};
/**
 * Init Debug setting.
 * @function
 * @param {Number} mode
 */

//log to web page
const locLog = _logToWebPage;
export const error = function (...args: any[]) {
  locLog("ERROR :  " + formatStr(...args));
};
export const assert = function (cond, msg) {
  if (!cond && msg) {
    for (var i = 2; i < arguments.length; i++)
      msg = msg.replace(/(%s)|(%d)/, _formatString(arguments[i]));
    locLog("Assert: " + msg);
  }
};
export const warn = function (...args: any[]) {
  locLog("WARN :  " + formatStr(...args));
};
export const log = function (...args: any[]) {
  locLog(formatStr(...args));
};
