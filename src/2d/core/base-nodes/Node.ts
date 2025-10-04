import { renderer, game } from "../../..";
import { isFunction } from "../../../helper/checkType";
import type { log, _LogInfos, assert } from "../../../helper/Debugger";
import type { p, size, rectUnion } from "../cocoa/Geometry";
import type { eventManager } from "../event-manager/EventManager";
import { pSub, pAdd } from "../support/PointExtension";

export const NODE_TAG_INVALID = -1;
export const s_globalOrderOfArrival = 1;
export class Node {
  _localZOrder: 0,
  _globalZOrder: 0,
  _vertexZ: 0.0,
  _customZ: NaN,
  _rotationX: 0,
  _rotationY: 0.0,
  _scaleX: 1.0,
  _scaleY: 1.0,
  _position: null,
  _normalizedPosition: null,
  _usingNormalizedPosition: false,
  _normalizedPositionDirty: false,
  _skewX: 0.0,
  _skewY: 0.0,
  _children: null,
  _visible: true,
  _anchorPoint: null,
  _contentSize: null,
  _running: false,
  _parent: null,
  _ignoreAnchorPointForPosition: false,
  tag: NODE_TAG_INVALID,
  userData: null,
  userObject: null,
  _reorderChildDirty: false,
  arrivalOrder: 0,
  _actionManager: null,
  _scheduler: null,
  _additionalTransformDirty: false,
  _additionalTransform: null,
  _componentContainer: null,
  _isTransitionFinished: false,
  _className: "Node",
  _showNode: false,
  _name: "",
  _realOpacity: 255,
  _realColor: null,
  _cascadeColorEnabled: false,
  _cascadeOpacityEnabled: false,
  _renderCmd: null,
  ctor: function () {
    var _t = this;
    _t._anchorPoint = p(0, 0);
    _t._contentSize = size(0, 0);
    _t._position = p(0, 0);
    _t._normalizedPosition = p(0, 0);
    _t._children = [];
    var director = director;
    _t._additionalTransform = affineTransformMakeIdentity();
    if (ComponentContainer) {
      _t._componentContainer = new ComponentContainer(_t);
    }
    this._realColor = color(255, 255, 255, 255);
    this._renderCmd = this._createRenderCmd();
  },
  init: function () {
    return true;
  },
  attr: function (attrs) {
    for (var key in attrs) {
      this[key] = attrs[key];
    }
  },
  getSkewX: function () {
    return this._skewX;
  },
  setSkewX: function (newSkewX) {
    this._skewX = newSkewX;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getSkewY: function () {
    return this._skewY;
  },
  setSkewY: function (newSkewY) {
    this._skewY = newSkewY;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  setLocalZOrder: function (localZOrder) {
    if (localZOrder === this._localZOrder)
      return;
    if (this._parent)
      this._parent.reorderChild(this, localZOrder);
    else
      this._localZOrder = localZOrder;
    eventManager._setDirtyForNode(this);
  },
  _setLocalZOrder: function (localZOrder) {
    this._localZOrder = localZOrder;
  },
  getLocalZOrder: function () {
    return this._localZOrder;
  },
  getZOrder: function () {
    log(_LogInfos.Node_getZOrder);
    return this.getLocalZOrder();
  },
  setZOrder: function (z) {
    log(_LogInfos.Node_setZOrder);
    this.setLocalZOrder(z);
  },
  setGlobalZOrder: function (globalZOrder) {
    if (this._globalZOrder !== globalZOrder) {
      this._globalZOrder = globalZOrder;
      eventManager._setDirtyForNode(this);
    }
  },
  getGlobalZOrder: function () {
    return this._globalZOrder;
  },
  getVertexZ: function () {
    return this._vertexZ;
  },
  setVertexZ: function (Var) {
    this._customZ = this._vertexZ = Var;
  },
  getRotation: function () {
    if (this._rotationX !== this._rotationY)
      log(_LogInfos.Node_getRotation);
    return this._rotationX;
  },
  setRotation: function (newRotation) {
    this._rotationX = this._rotationY = newRotation;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getRotationX: function () {
    return this._rotationX;
  },
  setRotationX: function (rotationX) {
    this._rotationX = rotationX;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getRotationY: function () {
    return this._rotationY;
  },
  setRotationY: function (rotationY) {
    this._rotationY = rotationY;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getScale: function () {
    if (this._scaleX !== this._scaleY)
      log(_LogInfos.Node_getScale);
    return this._scaleX;
  },
  setScale: function (scale, scaleY) {
    this._scaleX = scale;
    this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getScaleX: function () {
    return this._scaleX;
  },
  setScaleX: function (newScaleX) {
    this._scaleX = newScaleX;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getScaleY: function () {
    return this._scaleY;
  },
  setScaleY: function (newScaleY) {
    this._scaleY = newScaleY;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  setPosition: function (newPosOrxValue, yValue) {
    var locPosition = this._position;
    if (yValue === undefined) {
      if (locPosition.x === newPosOrxValue.x && locPosition.y === newPosOrxValue.y)
        return;
      locPosition.x = newPosOrxValue.x;
      locPosition.y = newPosOrxValue.y;
    } else {
      if (locPosition.x === newPosOrxValue && locPosition.y === yValue)
        return;
      locPosition.x = newPosOrxValue;
      locPosition.y = yValue;
    }
    this._usingNormalizedPosition = false;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  setNormalizedPosition: function (posOrX, y) {
    var locPosition = this._normalizedPosition;
    if (y === undefined) {
      locPosition.x = posOrX.x;
      locPosition.y = posOrX.y;
    } else {
      locPosition.x = posOrX;
      locPosition.y = y;
    }
    this._normalizedPositionDirty = this._usingNormalizedPosition = true;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getPosition: function () {
    return p(this._position);
  },
  getNormalizedPosition: function () {
    return p(this._normalizedPosition);
  },
  getPositionX: function () {
    return this._position.x;
  },
  setPositionX: function (x) {
    this._position.x = x;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getPositionY: function () {
    return this._position.y;
  },
  setPositionY: function (y) {
    this._position.y = y;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  getChildrenCount: function () {
    return this._children.length;
  },
  getChildren: function () {
    return this._children;
  },
  isVisible: function () {
    return this._visible;
  },
  setVisible: function (visible) {
    if (this._visible !== visible) {
      this._visible = visible;
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
      renderer.childrenOrderDirty = true;
    }
  },
  getAnchorPoint: function () {
    return p(this._anchorPoint);
  },
  setAnchorPoint: function (point, y) {
    var locAnchorPoint = this._anchorPoint;
    if (y === undefined) {
      if ((point.x === locAnchorPoint.x) && (point.y === locAnchorPoint.y))
        return;
      locAnchorPoint.x = point.x;
      locAnchorPoint.y = point.y;
    } else {
      if ((point === locAnchorPoint.x) && (y === locAnchorPoint.y))
        return;
      locAnchorPoint.x = point;
      locAnchorPoint.y = y;
    }
    this._renderCmd._updateAnchorPointInPoint();
  },
  _getAnchorX: function () {
    return this._anchorPoint.x;
  },
  _setAnchorX: function (x) {
    if (this._anchorPoint.x === x) return;
    this._anchorPoint.x = x;
    this._renderCmd._updateAnchorPointInPoint();
  },
  _getAnchorY: function () {
    return this._anchorPoint.y;
  },
  _setAnchorY: function (y) {
    if (this._anchorPoint.y === y) return;
    this._anchorPoint.y = y;
    this._renderCmd._updateAnchorPointInPoint();
  },
  getAnchorPointInPoints: function () {
    return this._renderCmd.getAnchorPointInPoints();
  },
  _getWidth: function () {
    return this._contentSize.width;
  },
  _setWidth: function (width) {
    this._contentSize.width = width;
    this._renderCmd._updateAnchorPointInPoint();
  },
  _getHeight: function () {
    return this._contentSize.height;
  },
  _setHeight: function (height) {
    this._contentSize.height = height;
    this._renderCmd._updateAnchorPointInPoint();
  },
  getContentSize: function () {
    return size(this._contentSize);
  },
  setContentSize: function (size, height) {
    var locContentSize = this._contentSize;
    if (height === undefined) {
      if ((size.width === locContentSize.width) && (size.height === locContentSize.height))
        return;
      locContentSize.width = size.width;
      locContentSize.height = size.height;
    } else {
      if ((size === locContentSize.width) && (height === locContentSize.height))
        return;
      locContentSize.width = size;
      locContentSize.height = height;
    }
    this._renderCmd._updateAnchorPointInPoint();
  },
  isRunning: function () {
    return this._running;
  },
  getParent: function () {
    return this._parent;
  },
  setParent: function (parent) {
    this._parent = parent;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  isIgnoreAnchorPointForPosition: function () {
    return this._ignoreAnchorPointForPosition;
  },
  ignoreAnchorPointForPosition: function (newValue) {
    if (newValue !== this._ignoreAnchorPointForPosition) {
      this._ignoreAnchorPointForPosition = newValue;
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
  },
  getTag: function () {
    return this.tag;
  },
  setTag: function (tag) {
    this.tag = tag;
  },
  setName: function (name) {
    this._name = name;
  },
  getName: function () {
    return this._name;
  },
  getUserData: function () {
    return this.userData;
  },
  setUserData: function (Var) {
    this.userData = Var;
  },
  getUserObject: function () {
    return this.userObject;
  },
  setUserObject: function (newValue) {
    if (this.userObject !== newValue)
      this.userObject = newValue;
  },
  getOrderOfArrival: function () {
    return this.arrivalOrder;
  },
  setOrderOfArrival: function (Var) {
    this.arrivalOrder = Var;
  },
  getActionManager: function () {
    return this._actionManager || director.getActionManager();
  },
  setActionManager: function (actionManager) {
    if (this._actionManager !== actionManager) {
      this.stopAllActions();
      this._actionManager = actionManager;
    }
  },
  getScheduler: function () {
    return this._scheduler || director.getScheduler();
  },
  setScheduler: function (scheduler) {
    if (this._scheduler !== scheduler) {
      this.unscheduleAllCallbacks();
      this._scheduler = scheduler;
    }
  },
  boundingBox: function () {
    log(_LogInfos.Node_boundingBox);
    return this.getBoundingBox();
  },
  getBoundingBox: function () {
    var rect = rect(0, 0, this._contentSize.width, this._contentSize.height);
    return _rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
  },
  cleanup: function () {
    this.stopAllActions();
    this.unscheduleAllCallbacks();
    eventManager.removeListeners(this);
  },
  getChildByTag: function (aTag) {
    var __children = this._children;
    if (__children !== null) {
      for (var i = 0; i < __children.length; i++) {
        var node = __children[i];
        if (node && node.tag === aTag)
          return node;
      }
    }
    return null;
  },
  getChildByName: function (name) {
    if (!name) {
      log("Invalid name");
      return null;
    }
    var locChildren = this._children;
    for (var i = 0, len = locChildren.length; i < len; i++) {
      if (locChildren[i]._name === name)
        return locChildren[i];
    }
    return null;
  },
  addChild: function (child, localZOrder, tag) {
    localZOrder = localZOrder === undefined ? child._localZOrder : localZOrder;
    var name, setTag = false;
    if (tag === undefined) {
      name = child._name;
    } else if (typeof tag === 'string') {
      name = tag;
      tag = undefined;
    } else if (typeof tag === 'number') {
      setTag = true;
      name = "";
    }
    assert(child, _LogInfos.Node_addChild_3);
    assert(child._parent === null, "child already added. It can't be added again");
    this._addChildHelper(child, localZOrder, tag, name, setTag);
  },
  _addChildHelper: function (child, localZOrder, tag, name, setTag) {
    if (!this._children)
      this._children = [];
    this._insertChild(child, localZOrder);
    if (setTag)
      child.setTag(tag);
    else
      child.setName(name);
    child.setParent(this);
    child.setOrderOfArrival(s_globalOrderOfArrival++);
    if (this._running) {
      child._performRecursive(Node._stateCallbackType.onEnter);
      if (this._isTransitionFinished)
        child._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish);
    }
    child._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    if (this._cascadeColorEnabled)
      child._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty);
    if (this._cascadeOpacityEnabled)
      child._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty);
  },
  removeFromParent: function (cleanup) {
    if (this._parent) {
      if (cleanup === undefined)
        cleanup = true;
      this._parent.removeChild(this, cleanup);
    }
  },
  removeFromParentAndCleanup: function (cleanup) {
    log(_LogInfos.Node_removeFromParentAndCleanup);
    this.removeFromParent(cleanup);
  },
  removeChild: function (child, cleanup) {
    if (this._children.length === 0)
      return;
    if (cleanup === undefined)
      cleanup = true;
    if (this._children.indexOf(child) > -1)
      this._detachChild(child, cleanup);
    renderer.childrenOrderDirty = true;
  },
  removeChildByTag: function (tag, cleanup) {
    if (tag === NODE_TAG_INVALID)
      log(_LogInfos.Node_removeChildByTag);
    var child = this.getChildByTag(tag);
    if (!child)
      log(_LogInfos.Node_removeChildByTag_2, tag);
    else
      this.removeChild(child, cleanup);
  },
  removeAllChildrenWithCleanup: function (cleanup) {
    this.removeAllChildren(cleanup);
  },
  removeAllChildren: function (cleanup) {
    var __children = this._children;
    if (__children !== null) {
      if (cleanup === undefined)
        cleanup = true;
      for (var i = 0; i < __children.length; i++) {
        var node = __children[i];
        if (node) {
          if (this._running) {
            node._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
            node._performRecursive(Node._stateCallbackType.onExit);
          }
          if (cleanup)
            node._performRecursive(Node._stateCallbackType.cleanup);
          node.parent = null;
          node._renderCmd.detachFromParent();
        }
      }
      this._children.length = 0;
      renderer.childrenOrderDirty = true;
    }
  },
  _detachChild: function (child, doCleanup) {
    if (this._running) {
      child._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
      child._performRecursive(Node._stateCallbackType.onExit);
    }
    if (doCleanup)
      child._performRecursive(Node._stateCallbackType.cleanup);
    child.parent = null;
    child._renderCmd.detachFromParent();
    arrayRemoveObject(this._children, child);
  },
  _insertChild: function (child, z) {
    renderer.childrenOrderDirty = this._reorderChildDirty = true;
    this._children.push(child);
    child._setLocalZOrder(z);
  },
  setNodeDirty: function () {
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },
  reorderChild: function (child, zOrder) {
    assert(child, _LogInfos.Node_reorderChild);
    if (this._children.indexOf(child) === -1) {
      log(_LogInfos.Node_reorderChild_2);
      return;
    }
    renderer.childrenOrderDirty = this._reorderChildDirty = true;
    child.arrivalOrder = s_globalOrderOfArrival;
    s_globalOrderOfArrival++;
    child._setLocalZOrder(zOrder);
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.orderDirty);
  },
  sortAllChildren: function () {
    if (this._reorderChildDirty) {
      var _children = this._children;
      var len = _children.length, i, j, tmp;
      for (i = 1; i < len; i++) {
        tmp = _children[i];
        j = i - 1;
        while (j >= 0) {
          if (tmp._localZOrder < _children[j]._localZOrder) {
            _children[j + 1] = _children[j];
          } else if (tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder) {
            _children[j + 1] = _children[j];
          } else {
            break;
          }
          j--;
        }
        _children[j + 1] = tmp;
      }
      this._reorderChildDirty = false;
    }
  },
  draw: function (ctx) {
  },
  transformAncestors: function () {
    if (this._parent !== null) {
      this._parent.transformAncestors();
      this._parent.transform();
    }
  },
  onEnter: function () {
    this._isTransitionFinished = false;
    this._running = true;
    this.resume();
  },
  _performRecursive: function (callbackType) {
    var nodeCallbackType = Node._stateCallbackType;
    if (callbackType >= nodeCallbackType.max) {
      return;
    }
    var index = 0;
    var children, child, curr, i, len;
    var stack = Node._performStacks[Node._performing];
    if (!stack) {
      stack = [];
      Node._performStacks.push(stack);
    }
    stack.length = 0;
    Node._performing++;
    curr = stack[0] = this;
    while (curr) {
      children = curr._children;
      if (children && children.length > 0) {
        for (i = 0, len = children.length; i < len; ++i) {
          child = children[i];
          stack.push(child);
        }
      }
      children = curr._protectedChildren;
      if (children && children.length > 0) {
        for (i = 0, len = children.length; i < len; ++i) {
          child = children[i];
          stack.push(child);
        }
      }
      index++;
      curr = stack[index];
    }
    for (i = stack.length - 1; i >= 0; --i) {
      curr = stack[i];
      stack[i] = null;
      if (!curr) continue;
      switch (callbackType) {
        case nodeCallbackType.onEnter:
          curr.onEnter();
          break;
        case nodeCallbackType.onExit:
          curr.onExit();
          break;
        case nodeCallbackType.onEnterTransitionDidFinish:
          curr.onEnterTransitionDidFinish();
          break;
        case nodeCallbackType.cleanup:
          curr.cleanup();
          break;
        case nodeCallbackType.onExitTransitionDidStart:
          curr.onExitTransitionDidStart();
          break;
      }
    }
    Node._performing--;
  },
  onEnterTransitionDidFinish: function () {
    this._isTransitionFinished = true;
  },
  onExitTransitionDidStart: function () {
  },
  onExit: function () {
    this._running = false;
    this.pause();
    this.removeAllComponents();
  },
  runAction: function (action) {
    assert(action, _LogInfos.Node_runAction);
    this.actionManager.addAction(action, this, !this._running);
    return action;
  },
  stopAllActions: function () {
    this.actionManager && this.actionManager.removeAllActionsFromTarget(this);
  },
  stopAction: function (action) {
    this.actionManager.removeAction(action);
  },
  stopActionByTag: function (tag) {
    if (tag === ACTION_TAG_INVALID) {
      log(_LogInfos.Node_stopActionByTag);
      return;
    }
    this.actionManager.removeActionByTag(tag, this);
  },
  getActionByTag: function (tag) {
    if (tag === ACTION_TAG_INVALID) {
      log(_LogInfos.Node_getActionByTag);
      return null;
    }
    return this.actionManager.getActionByTag(tag, this);
  },
  getNumberOfRunningActions: function () {
    return this.actionManager.numberOfRunningActionsInTarget(this);
  },
  scheduleUpdate: function () {
    this.scheduleUpdateWithPriority(0);
  },
  scheduleUpdateWithPriority: function (priority) {
    this.scheduler.scheduleUpdate(this, priority, !this._running);
  },
  unscheduleUpdate: function () {
    this.scheduler.unscheduleUpdate(this);
  },
  schedule: function (callback, interval, repeat, delay, key) {
    var len = arguments.length;
    if (typeof callback === "function") {
      if (len === 1) {
        interval = 0;
        repeat = REPEAT_FOREVER;
        delay = 0;
        key = this.__instanceId;
      } else if (len === 2) {
        if (typeof interval === "number") {
          repeat = REPEAT_FOREVER;
          delay = 0;
          key = this.__instanceId;
        } else {
          key = interval;
          interval = 0;
          repeat = REPEAT_FOREVER;
          delay = 0;
        }
      } else if (len === 3) {
        if (typeof repeat === "string") {
          key = repeat;
          repeat = REPEAT_FOREVER;
        } else {
          key = this.__instanceId;
        }
        delay = 0;
      } else if (len === 4) {
        key = this.__instanceId;
      }
    } else {
      if (len === 1) {
        interval = 0;
        repeat = REPEAT_FOREVER;
        delay = 0;
      } else if (len === 2) {
        repeat = REPEAT_FOREVER;
        delay = 0;
      }
    }
    assert(callback, _LogInfos.Node_schedule);
    assert(interval >= 0, _LogInfos.Node_schedule_2);
    interval = interval || 0;
    repeat = isNaN(repeat) ? REPEAT_FOREVER : repeat;
    delay = delay || 0;
    this.scheduler.schedule(callback, this, interval, repeat, delay, !this._running, key);
  },
  scheduleOnce: function (callback, delay, key) {
    if (key === undefined)
      key = this.__instanceId;
    this.schedule(callback, 0, 0, delay, key);
  },
  unschedule: function (callback_fn) {
    if (!callback_fn)
      return;
    this.scheduler.unschedule(callback_fn, this);
  },
  unscheduleAllCallbacks: function () {
    this.scheduler.unscheduleAllForTarget(this);
  },
  resumeSchedulerAndActions: function () {
    log(_LogInfos.Node_resumeSchedulerAndActions);
    this.resume();
  },
  resume: function () {
    this.scheduler.resumeTarget(this);
    this.actionManager && this.actionManager.resumeTarget(this);
    eventManager.resumeTarget(this);
  },
  pauseSchedulerAndActions: function () {
    log(_LogInfos.Node_pauseSchedulerAndActions);
    this.pause();
  },
  pause: function () {
    this.scheduler.pauseTarget(this);
    this.actionManager && this.actionManager.pauseTarget(this);
    eventManager.pauseTarget(this);
  },
  setAdditionalTransform: function (additionalTransform) {
    if (additionalTransform === undefined)
      return this._additionalTransformDirty = false;
    this._additionalTransform = additionalTransform;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    this._additionalTransformDirty = true;
  },
  getParentToNodeTransform: function () {
    return this._renderCmd.getParentToNodeTransform();
  },
  parentToNodeTransform: function () {
    return this.getParentToNodeTransform();
  },
  getNodeToWorldTransform: function () {
    var t = this.getNodeToParentTransform();
    for (var p = this._parent; p !== null; p = p.parent)
      t = affineTransformConcat(t, p.getNodeToParentTransform());
    return t;
  },
  nodeToWorldTransform: function () {
    return this.getNodeToWorldTransform();
  },
  getWorldToNodeTransform: function () {
    return affineTransformInvert(this.getNodeToWorldTransform());
  },
  worldToNodeTransform: function () {
    return this.getWorldToNodeTransform();
  },
  convertToNodeSpace: function (worldPoint) {
    return pointApplyAffineTransform(worldPoint, this.getWorldToNodeTransform());
  },
  convertToWorldSpace: function (nodePoint) {
    nodePoint = nodePoint || p(0, 0);
    return pointApplyAffineTransform(nodePoint, this.getNodeToWorldTransform());
  },
  convertToNodeSpaceAR: function (worldPoint) {
    return pSub(this.convertToNodeSpace(worldPoint), this._renderCmd.getAnchorPointInPoints());
  },
  convertToWorldSpaceAR: function (nodePoint) {
    nodePoint = nodePoint || p(0, 0);
    var pt = pAdd(nodePoint, this._renderCmd.getAnchorPointInPoints());
    return this.convertToWorldSpace(pt);
  },
  _convertToWindowSpace: function (nodePoint) {
    var worldPoint = this.convertToWorldSpace(nodePoint);
    return director.convertToUI(worldPoint);
  },
  convertTouchToNodeSpace: function (touch) {
    var point = touch.getLocation();
    return this.convertToNodeSpace(point);
  },
  convertTouchToNodeSpaceAR: function (touch) {
    var point = director.convertToGL(touch.getLocation());
    return this.convertToNodeSpaceAR(point);
  },
  update: function (dt) {
    if (this._componentContainer && !this._componentContainer.isEmpty())
      this._componentContainer.visit(dt);
  },
  updateTransform: function () {
    var children = this._children, node;
    for (var i = 0; i < children.length; i++) {
      node = children[i];
      if (node)
        node.updateTransform();
    }
  },
  retain: function () {
  },
  release: function () {
  },
  getComponent: function (name) {
    if (this._componentContainer)
      return this._componentContainer.getComponent(name);
    return null;
  },
  addComponent: function (component) {
    if (this._componentContainer)
      this._componentContainer.add(component);
  },
  removeComponent: function (component) {
    if (this._componentContainer)
      return this._componentContainer.remove(component);
    return false;
  },
  removeAllComponents: function () {
    if (this._componentContainer)
      this._componentContainer.removeAll();
  },
  grid: null,
  visit: function (parent) {
    var cmd = this._renderCmd, parentCmd = parent ? parent._renderCmd : null;
    if (!this._visible) {
      cmd._propagateFlagsDown(parentCmd);
      return;
    }
    var renderer = renderer;
    cmd.visit(parentCmd);
    var i, children = this._children, len = children.length, child;
    if (len > 0) {
      if (this._reorderChildDirty) {
        this.sortAllChildren();
      }
      for (i = 0; i < len; i++) {
        child = children[i];
        if (child._localZOrder < 0) {
          child.visit(this);
        }
        else {
          break;
        }
      }
      renderer.pushRenderCommand(cmd);
      for (; i < len; i++) {
        children[i].visit(this);
      }
    } else {
      renderer.pushRenderCommand(cmd);
    }
    cmd._dirtyFlag = 0;
  },
  transform: function (parentCmd, recursive) {
    this._renderCmd.transform(parentCmd, recursive);
  },
  nodeToParentTransform: function () {
    return this.getNodeToParentTransform();
  },
  getNodeToParentTransform: function (ancestor) {
    var t = this._renderCmd.getNodeToParentTransform();
    if (ancestor) {
      var T = { a: t.a, b: t.b, c: t.c, d: t.d, tx: t.tx, ty: t.ty };
      for (var p = this._parent; p != null && p != ancestor; p = p.getParent()) {
        affineTransformConcatIn(T, p.getNodeToParentTransform());
      }
      return T;
    } else {
      return t;
    }
  },
  getNodeToParentAffineTransform: function (ancestor) {
    return this.getNodeToParentTransform(ancestor);
  },
  getCamera: function () {
    return null;
  },
  getGrid: function () {
    return this.grid;
  },
  setGrid: function (grid) {
    this.grid = grid;
  },
  getShaderProgram: function () {
    return this._renderCmd.getShaderProgram();
  },
  setShaderProgram: function (newShaderProgram) {
    this._renderCmd.setShaderProgram(newShaderProgram);
  },
  setGLProgramState: function (glProgramState) {
    this._renderCmd.setGLProgramState(glProgramState);
  },
  getGLProgramState: function () {
    return this._renderCmd.getGLProgramState();
  },
  getGLServerState: function () {
    return 0;
  },
  setGLServerState: function (state) {
  },
  getBoundingBoxToWorld: function () {
    var rect = rect(0, 0, this._contentSize.width, this._contentSize.height);
    var trans = this.getNodeToWorldTransform();
    rect = rectApplyAffineTransform(rect, trans);
    if (!this._children)
      return rect;
    var locChildren = this._children;
    for (var i = 0; i < locChildren.length; i++) {
      var child = locChildren[i];
      if (child && child._visible) {
        var childRect = child._getBoundingBoxToCurrentNode(trans);
        if (childRect)
          rect = rectUnion(rect, childRect);
      }
    }
    return rect;
  },
  _getBoundingBoxToCurrentNode: function (parentTransform) {
    var rect = rect(0, 0, this._contentSize.width, this._contentSize.height);
    var trans = (parentTransform === undefined) ? this.getNodeToParentTransform() : affineTransformConcat(this.getNodeToParentTransform(), parentTransform);
    rect = rectApplyAffineTransform(rect, trans);
    if (!this._children)
      return rect;
    var locChildren = this._children;
    for (var i = 0; i < locChildren.length; i++) {
      var child = locChildren[i];
      if (child && child._visible) {
        var childRect = child._getBoundingBoxToCurrentNode(trans);
        if (childRect)
          rect = rectUnion(rect, childRect);
      }
    }
    return rect;
  },
  getOpacity: function () {
    return this._realOpacity;
  },
  getDisplayedOpacity: function () {
    return this._renderCmd.getDisplayedOpacity();
  },
  setOpacity: function (opacity) {
    this._realOpacity = opacity;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty);
  },
  updateDisplayedOpacity: function (parentOpacity) {
    this._renderCmd._updateDisplayOpacity(parentOpacity);
  },
  isCascadeOpacityEnabled: function () {
    return this._cascadeOpacityEnabled;
  },
  setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
    if (this._cascadeOpacityEnabled === cascadeOpacityEnabled)
      return;
    this._cascadeOpacityEnabled = cascadeOpacityEnabled;
    this._renderCmd.setCascadeOpacityEnabledDirty();
  },
  getColor: function () {
    var locRealColor = this._realColor;
    return color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
  },
  getDisplayedColor: function () {
    return this._renderCmd.getDisplayedColor();
  },
  setColor: function (color) {
    var locRealColor = this._realColor;
    locRealColor.r = color.r;
    locRealColor.g = color.g;
    locRealColor.b = color.b;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty);
  },
  updateDisplayedColor: function (parentColor) {
    this._renderCmd._updateDisplayColor(parentColor);
  },
  isCascadeColorEnabled: function () {
    return this._cascadeColorEnabled;
  },
  setCascadeColorEnabled: function (cascadeColorEnabled) {
    if (this._cascadeColorEnabled === cascadeColorEnabled)
      return;
    this._cascadeColorEnabled = cascadeColorEnabled;
    this._renderCmd.setCascadeColorEnabledDirty();
  },
  setOpacityModifyRGB: function (opacityValue) {
  },
  isOpacityModifyRGB: function () {
    return false;
  },
  _createRenderCmd: function () {
    if (_renderType === game.RENDER_TYPE_CANVAS)
      return new Node.CanvasRenderCmd(this);
    else
      return new Node.WebGLRenderCmd(this);
  },
  enumerateChildren: function (name, callback) {
    assert(name && name.length != 0, "Invalid name");
    assert(callback != null, "Invalid callback function");
    var length = name.length;
    var subStrStartPos = 0;
    var subStrlength = length;
    var searchRecursively = false;
    if (length > 2 && name[0] === "/" && name[1] === "/") {
      searchRecursively = true;
      subStrStartPos = 2;
      subStrlength -= 2;
    }
    var searchFromParent = false;
    if (length > 3 && name[length - 3] === "/" && name[length - 2] === "." && name[length - 1] === ".") {
      searchFromParent = true;
      subStrlength -= 3;
    }
    var newName = name.substr(subStrStartPos, subStrlength);
    if (searchFromParent)
      newName = "[[:alnum:]]+/" + newName;
    if (searchRecursively)
      this.doEnumerateRecursive(this, newName, callback);
    else
      this.doEnumerate(newName, callback);
  },
  doEnumerateRecursive: function (node, name, callback) {
    var ret = false;
    if (node.doEnumerate(name, callback)) {
      ret = true;
    } else {
      var child,
        children = node.getChildren(),
        length = children.length;
      for (var i = 0; i < length; i++) {
        child = children[i];
        if (this.doEnumerateRecursive(child, name, callback)) {
          ret = true;
          break;
        }
      }
    }
    return ret;
  },
  doEnumerate: function (name, callback) {
    var pos = name.indexOf('/');
    var searchName = name;
    var needRecursive = false;
    if (pos !== -1) {
      searchName = name.substr(0, pos);
      needRecursive = true;
    }
    var ret = false;
    var child,
      children = this._children,
      length = children.length;
    for (var i = 0; i < length; i++) {
      child = children[i];
      if (child._name.indexOf(searchName) !== -1) {
        if (!needRecursive) {
          if (callback(child)) {
            ret = true;
            break;
          }
        } else {
          ret = child.doEnumerate(name, callback);
          if (ret)
            break;
        }
      }
    }
    return ret;
  }
}
Node.create = function () {
  return new Node();
};
Node._stateCallbackType = {
  onEnter: 1,
  onExit: 2,
  cleanup: 3,
  onEnterTransitionDidFinish: 4,
  onExitTransitionDidStart: 5,
  max: 6
};
Node._performStacks = [[]];
Node._performing = 0;
assert(isFunction(_tmp.PrototypeCCNode), _LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
_tmp.PrototypeCCNode();
delete _tmp.PrototypeCCNode;
