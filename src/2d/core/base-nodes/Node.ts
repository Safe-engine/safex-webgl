import { director, game, renderer } from "../../..";
import { _LogInfos, assert, log } from "../../../helper/Debugger";
import { _renderType } from "../../../helper/engine";
import { GLProgramState } from "../../shaders/GLProgramState";
import { ActionManager } from "../ActionManager";
import { affineTransformConcat, affineTransformConcatIn, affineTransformInvert, affineTransformInvertOut, affineTransformMakeIdentity, pointApplyAffineTransform, rectApplyAffineTransform, rectApplyAffineTransformIn } from "../cocoa/AffineTransform";
import { p, Point, rect, rectUnion, Size, size } from "../cocoa/Geometry";
import { eventManager } from "../event-manager/EventManager";
import { Color, color } from "../platform/Color";
import { Scheduler } from "../Scheduler";
import { pAdd, pSub } from "../support/PointExtension";
import { NodeWebGLRenderCmd } from "./NodeWebGLRenderCmd";

export const NODE_TAG_INVALID = -1;
export let s_globalOrderOfArrival = 1;

export class Node {
  static RenderCmd: (renderable: any) => void;
  // Static members
  static create(): Node { return new Node(); }
  static _stateCallbackType: any = { onEnter: 1, onExit: 2, cleanup: 3, onEnterTransitionDidFinish: 4, onExitTransitionDidStart: 5, max: 6 };
  static _performStacks: any[] = [[]];
  static _performing: number = 0;
  static _dirtyFlags = { transformDirty: 1, colorDirty: 2, opacityDirty: 4, orderDirty: 8 };

  // instance id used by scheduler keys
  __instanceId: any = Math.random().toString(36).slice(2);

  // fields (initialized to sensible defaults)
  _localZOrder = 0;
  _globalZOrder = 0;
  _vertexZ = 0.0;
  _customZ = NaN;
  _rotationX = 0;
  _rotationY = 0.0;
  _scaleX = 1.0;
  _scaleY = 1.0;
  _position: Point = null;
  _normalizedPosition = null;
  _usingNormalizedPosition = false;
  _normalizedPositionDirty = false;
  _skewX = 0.0;
  _skewY = 0.0;
  _children: Node[] = [];
  _visible = true;
  _anchorPoint: Point = null;
  _contentSize: Size = null;
  _running = false;
  _parent: Node = null;
  _ignoreAnchorPointForPosition = false;
  tag = NODE_TAG_INVALID;
  userData: any = null;
  userObject: any = null;
  _reorderChildDirty = false;
  arrivalOrder = 0;
  _actionManager: ActionManager = null;
  _scheduler: Scheduler = null;
  _additionalTransformDirty = false;
  _additionalTransform: any = null;
  _componentContainer: any = null;
  _isTransitionFinished = false;
  _className = "Node";
  _showNode = false;
  _name = "";
  _realOpacity = 255;
  _realColor: Color = null;
  _cascadeColorEnabled = false;
  _cascadeOpacityEnabled = false;
  _renderCmd: any = null;

  constructor() {
    this._anchorPoint = p(0, 0);
    this._contentSize = size(0, 0);
    this._position = p(0, 0);
    this._normalizedPosition = p(0, 0);
    this._children = [];
    this._additionalTransform = affineTransformMakeIdentity();
    if ((globalThis as any).ComponentContainer) {
      this._componentContainer = new (globalThis as any).ComponentContainer(this);
    }
    this._realColor = color(255, 255, 255, 255);
    this._renderCmd = this._createRenderCmd();
  }

  init() {
    return true;
  }

  attr(attrs: any) {
    for (const key in attrs) {
      (this as any)[key] = attrs[key];
    }
  }

  getSkewX() { return this._skewX; }
  setSkewX(newSkewX: any) {
    this._skewX = newSkewX;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }

  getSkewY() { return this._skewY; }
  setSkewY(newSkewY: any) {
    this._skewY = newSkewY;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }

  setLocalZOrder(localZOrder: any) {
    if (localZOrder === this._localZOrder) return;
    if (this._parent) this._parent.reorderChild(this, localZOrder);
    else this._localZOrder = localZOrder;
    eventManager._setDirtyForNode(this);
  }

  _setLocalZOrder(localZOrder: any) { this._localZOrder = localZOrder; }
  getLocalZOrder() { return this._localZOrder; }

  getZOrder() { log(_LogInfos.Node_getZOrder); return this.getLocalZOrder(); }
  setZOrder(z: any) { log(_LogInfos.Node_setZOrder); this.setLocalZOrder(z); }

  setGlobalZOrder(globalZOrder: any) {
    if (this._globalZOrder !== globalZOrder) {
      this._globalZOrder = globalZOrder;
      eventManager._setDirtyForNode(this);
    }
  }
  getGlobalZOrder() { return this._globalZOrder; }

  getVertexZ() { return this._vertexZ; }
  setVertexZ(Var: any) { this._customZ = this._vertexZ = Var; }

  getRotation() {
    if (this._rotationX !== this._rotationY) log(_LogInfos.Node_getRotation);
    return this._rotationX;
  }
  setRotation(newRotation: any) {
    this._rotationX = this._rotationY = newRotation;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }

  getRotationX() { return this._rotationX; }
  setRotationX(rotationX: any) { this._rotationX = rotationX; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }
  getRotationY() { return this._rotationY; }
  setRotationY(rotationY: any) { this._rotationY = rotationY; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }

  getScale() { if (this._scaleX !== this._scaleY) log(_LogInfos.Node_getScale); return this._scaleX; }
  setScale(scale: any, scaleY?: any) {
    this._scaleX = scale;
    this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }
  getScaleX() { return this._scaleX; }
  setScaleX(newScaleX: any) { this._scaleX = newScaleX; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }
  getScaleY() { return this._scaleY; }
  setScaleY(newScaleY: any) { this._scaleY = newScaleY; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }

  setPosition(newPosOrxValue: any, yValue?: any) {
    const locPosition = this._position;
    if (yValue === undefined) {
      if (locPosition.x === newPosOrxValue.x && locPosition.y === newPosOrxValue.y) return;
      locPosition.x = newPosOrxValue.x; locPosition.y = newPosOrxValue.y;
    } else {
      if (locPosition.x === newPosOrxValue && locPosition.y === yValue) return;
      locPosition.x = newPosOrxValue; locPosition.y = yValue;
    }
    this._usingNormalizedPosition = false;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }

  setNormalizedPosition(posOrX: any, y?: any) {
    const locPosition = this._normalizedPosition;
    if (y === undefined) { locPosition.x = posOrX.x; locPosition.y = posOrX.y; }
    else { locPosition.x = posOrX; locPosition.y = y; }
    this._normalizedPositionDirty = this._usingNormalizedPosition = true;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
  }

  getPosition() { return p(this._position); }
  getNormalizedPosition() { return p(this._normalizedPosition); }
  getPositionX() { return this._position.x; }
  setPositionX(x: any) { this._position.x = x; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }
  getPositionY() { return this._position.y; }
  setPositionY(y: any) { this._position.y = y; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }

  getChildrenCount() { return this._children.length; }
  getChildren() { return this._children; }
  isVisible() { return this._visible; }
  setVisible(visible: any) {
    if (this._visible !== visible) {
      this._visible = visible;
      this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
      renderer.childrenOrderDirty = true;
    }
  }

  getAnchorPoint() { return p(this._anchorPoint); }
  setAnchorPoint(point: any, y?: any) {
    const locAnchorPoint = this._anchorPoint;
    if (y === undefined) {
      if ((point.x === locAnchorPoint.x) && (point.y === locAnchorPoint.y)) return;
      locAnchorPoint.x = point.x; locAnchorPoint.y = point.y;
    } else {
      if ((point === locAnchorPoint.x) && (y === locAnchorPoint.y)) return;
      locAnchorPoint.x = point; locAnchorPoint.y = y;
    }
    this._renderCmd._updateAnchorPointInPoint();
  }

  _getAnchorX() { return this._anchorPoint.x; }
  _setAnchorX(x: any) { if (this._anchorPoint.x === x) return; this._anchorPoint.x = x; this._renderCmd._updateAnchorPointInPoint(); }
  _getAnchorY() { return this._anchorPoint.y; }
  _setAnchorY(y: any) { if (this._anchorPoint.y === y) return; this._anchorPoint.y = y; this._renderCmd._updateAnchorPointInPoint(); }
  getAnchorPointInPoints() { return this._renderCmd.getAnchorPointInPoints(); }

  _getWidth() { return this._contentSize.width; }
  _setWidth(width: any) { this._contentSize.width = width; this._renderCmd._updateAnchorPointInPoint(); }
  _getHeight() { return this._contentSize.height; }
  _setHeight(height: any) { this._contentSize.height = height; this._renderCmd._updateAnchorPointInPoint(); }

  getContentSize() { return size(this._contentSize); }
  setContentSize(sz: any, height?: any) {
    const locContentSize = this._contentSize;
    if (height === undefined) {
      if ((sz.width === locContentSize.width) && (sz.height === locContentSize.height)) return;
      locContentSize.width = sz.width; locContentSize.height = sz.height;
    } else {
      if ((sz === locContentSize.width) && (height === locContentSize.height)) return;
      locContentSize.width = sz; locContentSize.height = height;
    }
    this._renderCmd._updateAnchorPointInPoint();
  }

  isRunning() { return this._running; }
  getParent() { return this._parent; }
  setParent(parent: any) { this._parent = parent; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }

  isIgnoreAnchorPointForPosition() { return this._ignoreAnchorPointForPosition; }
  ignoreAnchorPointForPosition(newValue: any) { if (newValue !== this._ignoreAnchorPointForPosition) { this._ignoreAnchorPointForPosition = newValue; this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); } }

  getTag() { return this.tag; }
  setTag(tag: any) { this.tag = tag; }
  setName(name: any) { this._name = name; }
  getName() { return this._name; }
  getUserData() { return this.userData; }
  setUserData(Var: any) { this.userData = Var; }
  getUserObject() { return this.userObject; }
  setUserObject(newValue: any) { if (this.userObject !== newValue) this.userObject = newValue; }
  getOrderOfArrival() { return this.arrivalOrder; }
  setOrderOfArrival(Var: any) { this.arrivalOrder = Var; }

  getActionManager() { return this._actionManager || director.getActionManager(); }
  setActionManager(actionManager: any) { if (this._actionManager !== actionManager) { this.stopAllActions(); this._actionManager = actionManager; } }
  // legacy property accessors kept for compatibility with older code
  get actionManager() { return this.getActionManager(); }
  set actionManager(v: any) { this.setActionManager(v); }
  getScheduler() { return this._scheduler || director.getScheduler(); }
  setScheduler(scheduler: any) { if (this._scheduler !== scheduler) { this.unscheduleAllCallbacks(); this._scheduler = scheduler; } }
  get scheduler() { return this.getScheduler(); }
  set scheduler(v: any) { this.setScheduler(v); }

  boundingBox() { log(_LogInfos.Node_boundingBox); return this.getBoundingBox(); }
  getBoundingBox() { const r = rect(0, 0, this._contentSize.width, this._contentSize.height); return rectApplyAffineTransformIn(r, this.getNodeToParentTransform()); }
  cleanup() { this.stopAllActions(); this.unscheduleAllCallbacks(); eventManager.removeListeners(this); }

  getChildByTag(aTag: any) {
    const __children = this._children;
    if (__children !== null) {
      for (let i = 0; i < __children.length; i++) { const node = __children[i]; if (node && node.tag === aTag) return node; }
    }
    return null;
  }

  getChildByName(name: any) {
    if (!name) { log("Invalid name"); return null; }
    const locChildren = this._children;
    for (let i = 0, len = locChildren.length; i < len; i++) if (locChildren[i]._name === name) return locChildren[i];
    return null;
  }

  addChild(child: any, localZOrder?: any, tag?: any) {
    localZOrder = localZOrder === undefined ? child._localZOrder : localZOrder;
    let name: any, setTag = false;
    if (tag === undefined) { name = child._name; }
    else if (typeof tag === 'string') { name = tag; tag = undefined; }
    else if (typeof tag === 'number') { setTag = true; name = ""; }
    assert(child, _LogInfos.Node_addChild_3);
    assert(child._parent === null, "child already added. It can't be added again");
    this._addChildHelper(child, localZOrder, tag, name, setTag);
  }

  _addChildHelper(child: any, localZOrder: any, tag: any, name: any, setTag: boolean) {
    if (!this._children) this._children = [];
    this._insertChild(child, localZOrder);
    if (setTag) child.setTag(tag); else child.setName(name);
    child.setParent(this);
    child.setOrderOfArrival(s_globalOrderOfArrival++);
    if (this._running) {
      child._performRecursive(Node._stateCallbackType.onEnter);
      if (this._isTransitionFinished) child._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish);
    }
    child._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    if (this._cascadeColorEnabled) child._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty);
    if (this._cascadeOpacityEnabled) child._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty);
  }

  removeFromParent(cleanup?: any) { if (this._parent) { if (cleanup === undefined) cleanup = true; this._parent.removeChild(this, cleanup); } }
  removeFromParentAndCleanup(cleanup?: any) { log(_LogInfos.Node_removeFromParentAndCleanup); this.removeFromParent(cleanup); }

  removeChild(child: any, cleanup?: any) {
    if (this._children.length === 0) return;
    if (cleanup === undefined) cleanup = true;
    if (this._children.indexOf(child) > -1) this._detachChild(child, cleanup);
    renderer.childrenOrderDirty = true;
  }

  removeChildByTag(tag: any, cleanup?: any) {
    if (tag === NODE_TAG_INVALID) log(_LogInfos.Node_removeChildByTag);
    const child = this.getChildByTag(tag);
    if (!child) log(_LogInfos.Node_removeChildByTag_2, tag); else this.removeChild(child, cleanup);
  }

  removeAllChildrenWithCleanup(cleanup?: any) { this.removeAllChildren(cleanup); }
  removeAllChildren(cleanup?: any) {
    const __children = this._children;
    if (__children !== null) {
      if (cleanup === undefined) cleanup = true;
      for (let i = 0; i < __children.length; i++) {
        const node = __children[i];
        if (node) {
          if (this._running) {
            node._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
            node._performRecursive(Node._stateCallbackType.onExit);
          }
          if (cleanup) node._performRecursive(Node._stateCallbackType.cleanup);
          node._parent = null;
          node._renderCmd.detachFromParent();
        }
      }
      this._children.length = 0;
      renderer.childrenOrderDirty = true;
    }
  }

  _detachChild(child: any, doCleanup: any) {
    if (this._running) { child._performRecursive(Node._stateCallbackType.onExitTransitionDidStart); child._performRecursive(Node._stateCallbackType.onExit); }
    if (doCleanup) child._performRecursive(Node._stateCallbackType.cleanup);
    child.parent = null;
    child._renderCmd.detachFromParent();
    arrayRemoveObject(this._children, child);
  }

  _insertChild(child: any, z: any) { renderer.childrenOrderDirty = this._reorderChildDirty = true; this._children.push(child); child._setLocalZOrder(z); }
  setNodeDirty() { this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty); }

  reorderChild(child: any, zOrder: any) {
    assert(child, _LogInfos.Node_reorderChild);
    if (this._children.indexOf(child) === -1) { log(_LogInfos.Node_reorderChild_2); return; }
    renderer.childrenOrderDirty = this._reorderChildDirty = true;
    child.arrivalOrder = s_globalOrderOfArrival; s_globalOrderOfArrival++;
    child._setLocalZOrder(zOrder);
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.orderDirty);
  }

  sortAllChildren() {
    if (this._reorderChildDirty) {
      const _children = this._children; let len = _children.length, i, j, tmp;
      for (i = 1; i < len; i++) {
        tmp = _children[i]; j = i - 1;
        while (j >= 0) {
          if (tmp._localZOrder < _children[j]._localZOrder) { _children[j + 1] = _children[j]; }
          else if (tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder) { _children[j + 1] = _children[j]; }
          else { break; }
          j--;
        }
        _children[j + 1] = tmp;
      }
      this._reorderChildDirty = false;
    }
  }

  draw(ctx: any) { }
  transformAncestors() { if (this._parent !== null) { this._parent.transformAncestors(); this._parent.transform(); } }

  onEnter() { this._isTransitionFinished = false; this._running = true; this.resume(); }

  _performRecursive(callbackType: any) {
    const nodeCallbackType = Node._stateCallbackType;
    if (callbackType >= nodeCallbackType.max) return;
    let index = 0; let children: any, child: any, curr: any, i: any, len: any;
    let stack = Node._performStacks[Node._performing];
    if (!stack) { stack = []; Node._performStacks.push(stack); }
    stack.length = 0;
    Node._performing++;
    curr = stack[0] = this;
    while (curr) {
      children = curr._children;
      if (children && children.length > 0) {
        for (i = 0, len = children.length; i < len; ++i) { child = children[i]; stack.push(child); }
      }
      children = curr._protectedChildren;
      if (children && children.length > 0) {
        for (i = 0, len = children.length; i < len; ++i) { child = children[i]; stack.push(child); }
      }
      index++;
      curr = stack[index];
    }
    for (i = stack.length - 1; i >= 0; --i) {
      curr = stack[i]; stack[i] = null; if (!curr) continue;
      switch (callbackType) {
        case nodeCallbackType.onEnter: curr.onEnter(); break;
        case nodeCallbackType.onExit: curr.onExit(); break;
        case nodeCallbackType.onEnterTransitionDidFinish: curr.onEnterTransitionDidFinish(); break;
        case nodeCallbackType.cleanup: curr.cleanup(); break;
        case nodeCallbackType.onExitTransitionDidStart: curr.onExitTransitionDidStart(); break;
      }
    }
    Node._performing--;
  }

  onEnterTransitionDidFinish() { this._isTransitionFinished = true; }
  onExitTransitionDidStart() { }
  onExit() { this._running = false; this.pause(); this.removeAllComponents(); }

  runAction(action: any) { assert(action, _LogInfos.Node_runAction); this.actionManager.addAction(action, this, !this._running); return action; }
  stopAllActions() { this.actionManager && this.actionManager.removeAllActionsFromTarget(this); }
  stopAction(action: any) { this.actionManager.removeAction(action); }
  stopActionByTag(tag: any) { if (tag === ACTION_TAG_INVALID) { log(_LogInfos.Node_stopActionByTag); return; } this.actionManager.removeActionByTag(tag, this); }
  getActionByTag(tag: any) { if (tag === ACTION_TAG_INVALID) { log(_LogInfos.Node_getActionByTag); return null; } return this.actionManager.getActionByTag(tag, this); }
  getNumberOfRunningActions() { return this.actionManager.numberOfRunningActionsInTarget(this); }

  scheduleUpdate() { this.scheduleUpdateWithPriority(0); }
  scheduleUpdateWithPriority(priority: any) { this.scheduler.scheduleUpdate(this, priority, !this._running); }
  unscheduleUpdate() { this.scheduler.unscheduleUpdate(this); }

  schedule(callback: any, interval?: any, repeat?: any, delay?: any, key?: any) {
    const len = arguments.length;
    if (typeof callback === "function") {
      if (len === 1) { interval = 0; repeat = REPEAT_FOREVER; delay = 0; key = this.__instanceId; }
      else if (len === 2) {
        if (typeof interval === "number") { repeat = REPEAT_FOREVER; delay = 0; key = this.__instanceId; }
        else { key = interval; interval = 0; repeat = REPEAT_FOREVER; delay = 0; }
      } else if (len === 3) {
        if (typeof repeat === "string") { key = repeat; repeat = REPEAT_FOREVER; } else { key = this.__instanceId; }
        delay = 0;
      } else if (len === 4) { key = this.__instanceId; }
    } else {
      if (len === 1) { interval = 0; repeat = REPEAT_FOREVER; delay = 0; }
      else if (len === 2) { repeat = REPEAT_FOREVER; delay = 0; }
    }
    assert(callback, _LogInfos.Node_schedule);
    assert(interval >= 0, _LogInfos.Node_schedule_2);
    interval = interval || 0; repeat = isNaN(repeat) ? REPEAT_FOREVER : repeat; delay = delay || 0;
    this.scheduler.schedule(callback, this, interval, repeat, delay, !this._running, key);
  }

  scheduleOnce(callback: any, delay: any, key?: any) { if (key === undefined) key = this.__instanceId; this.schedule(callback, 0, 0, delay, key); }
  unschedule(callback_fn: any) { if (!callback_fn) return; this.scheduler.unschedule(callback_fn, this); }
  unscheduleAllCallbacks() { this.scheduler.unscheduleAllForTarget(this); }

  resumeSchedulerAndActions() { log(_LogInfos.Node_resumeSchedulerAndActions); this.resume(); }
  resume() { this.scheduler.resumeTarget(this); this.actionManager && this.actionManager.resumeTarget(this); eventManager.resumeTarget(this); }
  pauseSchedulerAndActions() { log(_LogInfos.Node_pauseSchedulerAndActions); this.pause(); }
  pause() { this.scheduler.pauseTarget(this); this.actionManager && this.actionManager.pauseTarget(this); eventManager.pauseTarget(this); }

  setAdditionalTransform(additionalTransform?: any) {
    if (additionalTransform === undefined) return this._additionalTransformDirty = false;
    this._additionalTransform = additionalTransform;
    this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    this._additionalTransformDirty = true;
  }

  getParentToNodeTransform() { return this._renderCmd.getParentToNodeTransform(); }
  parentToNodeTransform() { return this.getParentToNodeTransform(); }

  getNodeToWorldTransform() {
    let t = this.getNodeToParentTransform();
    for (let p = this._parent; p !== null; p = p._parent) t = affineTransformConcat(t, p.getNodeToParentTransform());
    return t;
  }
  nodeToWorldTransform() { return this.getNodeToWorldTransform(); }
  getWorldToNodeTransform() { return affineTransformInvert(this.getNodeToWorldTransform()); }
  worldToNodeTransform() { return this.getWorldToNodeTransform(); }

  convertToNodeSpace(worldPoint: any) { return pointApplyAffineTransform(worldPoint, this.getWorldToNodeTransform()); }
  convertToWorldSpace(nodePoint?: any) { nodePoint = nodePoint || p(0, 0); return pointApplyAffineTransform(nodePoint, this.getNodeToWorldTransform()); }
  convertToNodeSpaceAR(worldPoint: any) { return pSub(this.convertToNodeSpace(worldPoint), this._renderCmd.getAnchorPointInPoints()); }
  convertToWorldSpaceAR(nodePoint?: any) { nodePoint = nodePoint || p(0, 0); const pt = pAdd(nodePoint, this._renderCmd.getAnchorPointInPoints()); return this.convertToWorldSpace(pt); }

  _convertToWindowSpace(nodePoint: any) { const worldPoint = this.convertToWorldSpace(nodePoint); return director.convertToUI(worldPoint); }
  convertTouchToNodeSpace(touch: any) { const point = touch.getLocation(); return this.convertToNodeSpace(point); }
  convertTouchToNodeSpaceAR(touch: any) { const point = director.convertToGL(touch.getLocation()); return this.convertToNodeSpaceAR(point); }

  update(dt: any) { if (this._componentContainer && !this._componentContainer.isEmpty()) this._componentContainer.visit(dt); }
  updateTransform() { const children = this._children; for (let i = 0; i < children.length; i++) { const node = children[i]; if (node) node.updateTransform(); } }
  retain() { }
  release() { }

  getComponent(name: any) { if (this._componentContainer) return this._componentContainer.getComponent(name); return null; }
  addComponent(component: any) { if (this._componentContainer) this._componentContainer.add(component); }
  removeComponent(component: any) { if (this._componentContainer) return this._componentContainer.remove(component); return false; }
  removeAllComponents() { if (this._componentContainer) this._componentContainer.removeAll(); }

  grid: any = null;

  visit(parent?: any) {
    const cmd = this._renderCmd, parentCmd = parent ? parent._renderCmd : null;
    if (!this._visible) { cmd._propagateFlagsDown(parentCmd); return; }
    cmd.visit(parentCmd);
    let i: any, children = this._children, len = children.length, child: any;
    if (len > 0) {
      if (this._reorderChildDirty) this.sortAllChildren();
      for (i = 0; i < len; i++) { child = children[i]; if (child._localZOrder < 0) child.visit(this); else break; }
      renderer.pushRenderCommand(cmd);
      for (; i < len; i++) children[i].visit(this);
    } else { renderer.pushRenderCommand(cmd); }
    cmd._dirtyFlag = 0;
  }

  transform(parentCmd?: any, recursive?: any) { this._renderCmd.transform(parentCmd, recursive); }
  nodeToParentTransform() { return this.getNodeToParentTransform(); }

  getNodeToParentTransform(ancestor?: any) {
    const t = this._renderCmd.getNodeToParentTransform();
    if (ancestor) {
      const T: any = { a: t.a, b: t.b, c: t.c, d: t.d, tx: t.tx, ty: t.ty };
      for (let p = this._parent; p != null && p != ancestor; p = p.getParent()) affineTransformConcatIn(T, p.getNodeToParentTransform());
      return T;
    } else {
      return t;
    }
  }

  getNodeToParentAffineTransform(ancestor?: any) { return this.getNodeToParentTransform(ancestor); }
  getCamera() { return null; }
  getGrid() { return this.grid; }
  setGrid(grid: any) { this.grid = grid; }
  getShaderProgram() { return this._renderCmd.getShaderProgram(); }
  setShaderProgram(newShaderProgram: any) { this._renderCmd.setShaderProgram(newShaderProgram); }
  setGLProgramState(glProgramState: any) { this._renderCmd.setGLProgramState(glProgramState); }
  getGLProgramState() { return this._renderCmd.getGLProgramState(); }
  getGLServerState() { return 0; }
  setGLServerState(state: any) { }

  getBoundingBoxToWorld() {
    let r = rect(0, 0, this._contentSize.width, this._contentSize.height);
    const trans = this.getNodeToWorldTransform();
    r = rectApplyAffineTransform(r, trans);
    if (!this._children) return r;
    const locChildren = this._children;
    for (let i = 0; i < locChildren.length; i++) { const child = locChildren[i]; if (child && child._visible) { const childRect = child._getBoundingBoxToCurrentNode(trans); if (childRect) r = rectUnion(r, childRect); } }
    return r;
  }

  _getBoundingBoxToCurrentNode(parentTransform?: any) {
    let r = rect(0, 0, this._contentSize.width, this._contentSize.height);
    const trans = (parentTransform === undefined) ? this.getNodeToParentTransform() : affineTransformConcat(this.getNodeToParentTransform(), parentTransform);
    r = rectApplyAffineTransform(r, trans);
    if (!this._children) return r;
    const locChildren = this._children;
    for (let i = 0; i < locChildren.length; i++) { const child = locChildren[i]; if (child && child._visible) { const childRect = child._getBoundingBoxToCurrentNode(trans); if (childRect) r = rectUnion(r, childRect); } }
    return r;
  }

  getOpacity() { return this._realOpacity; }
  getDisplayedOpacity() { return this._renderCmd.getDisplayedOpacity(); }
  setOpacity(opacity: any) { this._realOpacity = opacity; this._renderCmd.setDirtyFlag(Node._dirtyFlags.opacityDirty); }
  updateDisplayedOpacity(parentOpacity: any) { this._renderCmd._updateDisplayOpacity(parentOpacity); }

  isCascadeOpacityEnabled() { return this._cascadeOpacityEnabled; }
  setCascadeOpacityEnabled(cascadeOpacityEnabled: any) { if (this._cascadeOpacityEnabled === cascadeOpacityEnabled) return; this._cascadeOpacityEnabled = cascadeOpacityEnabled; this._renderCmd.setCascadeOpacityEnabledDirty(); }

  getColor() { const locRealColor = this._realColor; return color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a); }
  getDisplayedColor() { return this._renderCmd.getDisplayedColor(); }
  setColor(col: any) { const locRealColor = this._realColor; locRealColor.r = col.r; locRealColor.g = col.g; locRealColor.b = col.b; this._renderCmd.setDirtyFlag(Node._dirtyFlags.colorDirty); }
  updateDisplayedColor(parentColor: any) { this._renderCmd._updateDisplayColor(parentColor); }

  isCascadeColorEnabled() { return this._cascadeColorEnabled; }
  setCascadeColorEnabled(cascadeColorEnabled: any) { if (this._cascadeColorEnabled === cascadeColorEnabled) return; this._cascadeColorEnabled = cascadeColorEnabled; this._renderCmd.setCascadeColorEnabledDirty(); }
  setOpacityModifyRGB(opacityValue: any) { }
  isOpacityModifyRGB() { return false; }

  _createRenderCmd() { if (_renderType === game.RENDER_TYPE_CANVAS) return new (Node as any).CanvasRenderCmd(this); else return new NodeWebGLRenderCmd(this); }

  enumerateChildren(name: any, callback: any) {
    assert(name && name.length != 0, "Invalid name");
    assert(callback != null, "Invalid callback function");
    let length = name.length; let subStrStartPos = 0; let subStrlength = length; let searchRecursively = false;
    if (length > 2 && name[0] === "/" && name[1] === "/") { searchRecursively = true; subStrStartPos = 2; subStrlength -= 2; }
    let searchFromParent = false;
    if (length > 3 && name[length - 3] === "/" && name[length - 2] === "." && name[length - 1] === ".") { searchFromParent = true; subStrlength -= 3; }
    let newName = name.substr(subStrStartPos, subStrlength);
    if (searchFromParent) newName = "[[:alnum:]]+/" + newName;
    if (searchRecursively) this.doEnumerateRecursive(this, newName, callback); else this.doEnumerate(newName, callback);
  }

  doEnumerateRecursive(node: any, name: any, callback: any) {
    let ret = false;
    if (node.doEnumerate(name, callback)) ret = true; else {
      let child, children = node.getChildren(), length = children.length;
      for (let i = 0; i < length; i++) { child = children[i]; if (this.doEnumerateRecursive(child, name, callback)) { ret = true; break; } }
    }
    return ret;
  }

  doEnumerate(name: any, callback: any) {
    const pos = name.indexOf('/'); let searchName = name; let needRecursive = false;
    if (pos !== -1) { searchName = name.substr(0, pos); needRecursive = true; }
    let ret = false; let child, children = this._children, length = children.length;
    for (let i = 0; i < length; i++) { child = children[i]; if (child._name.indexOf(searchName) !== -1) { if (!needRecursive) { if (callback(child)) { ret = true; break; } } else { ret = child.doEnumerate(name, callback); if (ret) break; } } }
    return ret;
  }
}

// Minimal runtime fallbacks used during migration
declare const arrayRemoveObject: any;
export const REPEAT_FOREVER = -1;
export const ACTION_TAG_INVALID = -1;

Node.RenderCmd = function (renderable) {
  this._node = renderable;
  this._anchorPointInPoints = { x: 0, y: 0 };
  this._displayedColor = color(255, 255, 255, 255);
};

Node.RenderCmd.prototype = {
  constructor: Node.RenderCmd,

  _needDraw: false,
  _dirtyFlag: 1,
  _curLevel: -1,

  _displayedOpacity: 255,
  _cascadeColorEnabledDirty: false,
  _cascadeOpacityEnabledDirty: false,

  _transform: null,
  _worldTransform: null,
  _inverse: null,

  needDraw: function () {
    return this._needDraw;
  },

  getAnchorPointInPoints: function () {
    return p(this._anchorPointInPoints);
  },

  getDisplayedColor: function () {
    var tmpColor = this._displayedColor;
    return color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
  },

  getDisplayedOpacity: function () {
    return this._displayedOpacity;
  },

  setCascadeColorEnabledDirty: function () {
    this._cascadeColorEnabledDirty = true;
    this.setDirtyFlag(Node._dirtyFlags.colorDirty);
  },

  setCascadeOpacityEnabledDirty: function () {
    this._cascadeOpacityEnabledDirty = true;
    this.setDirtyFlag(Node._dirtyFlags.opacityDirty);
  },

  getParentToNodeTransform: function () {
    if (!this._inverse) {
      this._inverse = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    }
    if (this._dirtyFlag & Node._dirtyFlags.transformDirty) {
      affineTransformInvertOut(this.getNodeToParentTransform(), this._inverse);
    }
    return this._inverse;
  },

  detachFromParent: function () {
  },

  _updateAnchorPointInPoint: function () {
    var locAPP = this._anchorPointInPoints, locSize = this._node._contentSize, locAnchorPoint = this._node._anchorPoint;
    locAPP.x = locSize.width * locAnchorPoint.x;
    locAPP.y = locSize.height * locAnchorPoint.y;
    this.setDirtyFlag(Node._dirtyFlags.transformDirty);
  },

  setDirtyFlag: function (dirtyFlag) {
    if (this._dirtyFlag === 0 && dirtyFlag !== 0)
      renderer.pushDirtyNode(this);
    this._dirtyFlag |= dirtyFlag;
  },

  getParentRenderCmd: function () {
    if (this._node && this._node._parent && this._node._parent._renderCmd)
      return this._node._parent._renderCmd;
    return null;
  },

  transform: function (parentCmd, recursive) {
    if (!this._transform) {
      this._transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      this._worldTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    }

    var node = this._node,
      pt = parentCmd ? parentCmd._worldTransform : null,
      t = this._transform,
      wt = this._worldTransform;         //get the world transform

    if (node._usingNormalizedPosition && node._parent) {
      var conSize = node._parent._contentSize;
      node._position.x = node._normalizedPosition.x * conSize.width;
      node._position.y = node._normalizedPosition.y * conSize.height;
      node._normalizedPositionDirty = false;
    }

    var hasRotation = node._rotationX || node._rotationY;
    var hasSkew = node._skewX || node._skewY;
    var sx = node._scaleX, sy = node._scaleY;
    var appX = this._anchorPointInPoints.x, appY = this._anchorPointInPoints.y;
    var a = 1, b = 0, c = 0, d = 1;
    if (hasRotation || hasSkew) {
      // position
      t.tx = node._position.x;
      t.ty = node._position.y;

      // rotation
      if (hasRotation) {
        var rotationRadiansX = node._rotationX * ONE_DEGREE;
        c = Math.sin(rotationRadiansX);
        d = Math.cos(rotationRadiansX);
        if (node._rotationY === node._rotationX) {
          a = d;
          b = -c;
        }
        else {
          var rotationRadiansY = node._rotationY * ONE_DEGREE;
          a = Math.cos(rotationRadiansY);
          b = -Math.sin(rotationRadiansY);
        }
      }

      // scale
      t.a = a *= sx;
      t.b = b *= sx;
      t.c = c *= sy;
      t.d = d *= sy;

      // skew
      if (hasSkew) {
        var skx = Math.tan(node._skewX * ONE_DEGREE);
        var sky = Math.tan(node._skewY * ONE_DEGREE);
        if (skx === Infinity)
          skx = 99999999;
        if (sky === Infinity)
          sky = 99999999;
        t.a = a + c * sky;
        t.b = b + d * sky;
        t.c = c + a * skx;
        t.d = d + b * skx;
      }

      if (appX || appY) {
        t.tx -= t.a * appX + t.c * appY;
        t.ty -= t.b * appX + t.d * appY;
        // adjust anchorPoint
        if (node._ignoreAnchorPointForPosition) {
          t.tx += appX;
          t.ty += appY;
        }
      }

      if (node._additionalTransformDirty) {
        affineTransformConcatIn(t, node._additionalTransform);
      }

      if (pt) {
        // AffineTransformConcat is incorrect at get world transform
        wt.a = t.a * pt.a + t.b * pt.c;                               //a
        wt.b = t.a * pt.b + t.b * pt.d;                               //b
        wt.c = t.c * pt.a + t.d * pt.c;                               //c
        wt.d = t.c * pt.b + t.d * pt.d;                               //d
        wt.tx = pt.a * t.tx + pt.c * t.ty + pt.tx;
        wt.ty = pt.d * t.ty + pt.ty + pt.b * t.tx;
      } else {
        wt.a = t.a;
        wt.b = t.b;
        wt.c = t.c;
        wt.d = t.d;
        wt.tx = t.tx;
        wt.ty = t.ty;
      }
    }
    else {
      t.a = sx;
      t.b = 0;
      t.c = 0;
      t.d = sy;
      t.tx = node._position.x;
      t.ty = node._position.y;

      if (appX || appY) {
        t.tx -= t.a * appX;
        t.ty -= t.d * appY;
        // adjust anchorPoint
        if (node._ignoreAnchorPointForPosition) {
          t.tx += appX;
          t.ty += appY;
        }
      }

      if (node._additionalTransformDirty) {
        affineTransformConcatIn(t, node._additionalTransform);
      }

      if (pt) {
        wt.a = t.a * pt.a + t.b * pt.c;
        wt.b = t.a * pt.b + t.b * pt.d;
        wt.c = t.c * pt.a + t.d * pt.c;
        wt.d = t.c * pt.b + t.d * pt.d;
        wt.tx = t.tx * pt.a + t.ty * pt.c + pt.tx;
        wt.ty = t.tx * pt.b + t.ty * pt.d + pt.ty;
      } else {
        wt.a = t.a;
        wt.b = t.b;
        wt.c = t.c;
        wt.d = t.d;
        wt.tx = t.tx;
        wt.ty = t.ty;
      }
    }

    if (this._updateCurrentRegions) {
      this._updateCurrentRegions();
      this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.DirtyDouble);
    }

    if (recursive) {
      transformChildTree(node);
    }

    this._cacheDirty = true;
  },

  getNodeToParentTransform: function () {
    if (!this._transform || this._dirtyFlag & Node._dirtyFlags.transformDirty) {
      this.transform();
    }
    return this._transform;
  },

  visit: function (parentCmd) {
    var node = this._node, renderer = renderer;

    parentCmd = parentCmd || this.getParentRenderCmd();
    if (parentCmd)
      this._curLevel = parentCmd._curLevel + 1;

    if (isNaN(node._customZ)) {
      node._vertexZ = renderer.assignedZ;
      renderer.assignedZ += renderer.assignedZStep;
    }

    this._syncStatus(parentCmd);
  },

  _updateDisplayColor: function (parentColor) {
    var node = this._node;
    var locDispColor = this._displayedColor, locRealColor = node._realColor;
    var i, len, selChildren, item;
    this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty);
    if (this._cascadeColorEnabledDirty && !node._cascadeColorEnabled) {
      locDispColor.r = locRealColor.r;
      locDispColor.g = locRealColor.g;
      locDispColor.b = locRealColor.b;
      var whiteColor = new Color(255, 255, 255, 255);
      selChildren = node._children;
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i];
        if (item && item._renderCmd)
          item._renderCmd._updateDisplayColor(whiteColor);
      }
      this._cascadeColorEnabledDirty = false;
    } else {
      if (parentColor === undefined) {
        var locParent = node._parent;
        if (locParent && locParent._cascadeColorEnabled)
          parentColor = locParent.getDisplayedColor();
        else
          parentColor = color.WHITE;
      }
      locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
      locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
      locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
      if (node._cascadeColorEnabled) {
        selChildren = node._children;
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i];
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayColor(locDispColor);
            item._renderCmd._updateColor();
          }
        }
      }
    }
    this._dirtyFlag &= ~dirtyFlags.colorDirty;
  },

  _updateDisplayOpacity: function (parentOpacity) {
    var node = this._node;
    var i, len, selChildren, item;
    this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty);
    if (this._cascadeOpacityEnabledDirty && !node._cascadeOpacityEnabled) {
      this._displayedOpacity = node._realOpacity;
      selChildren = node._children;
      for (i = 0, len = selChildren.length; i < len; i++) {
        item = selChildren[i];
        if (item && item._renderCmd)
          item._renderCmd._updateDisplayOpacity(255);
      }
      this._cascadeOpacityEnabledDirty = false;
    } else {
      if (parentOpacity === undefined) {
        var locParent = node._parent;
        parentOpacity = 255;
        if (locParent && locParent._cascadeOpacityEnabled)
          parentOpacity = locParent.getDisplayedOpacity();
      }
      this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
      if (node._cascadeOpacityEnabled) {
        selChildren = node._children;
        for (i = 0, len = selChildren.length; i < len; i++) {
          item = selChildren[i];
          if (item && item._renderCmd) {
            item._renderCmd._updateDisplayOpacity(this._displayedOpacity);
            item._renderCmd._updateColor();
          }
        }
      }
    }
    this._dirtyFlag &= ~dirtyFlags.opacityDirty;
  },

  _syncDisplayColor: function (parentColor) {
    var node = this._node, locDispColor = this._displayedColor, locRealColor = node._realColor;
    if (parentColor === undefined) {
      var locParent = node._parent;
      if (locParent && locParent._cascadeColorEnabled)
        parentColor = locParent.getDisplayedColor();
      else
        parentColor = color.WHITE;
    }
    locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
    locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
    locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);
  },

  _syncDisplayOpacity: function (parentOpacity) {
    var node = this._node;
    if (parentOpacity === undefined) {
      var locParent = node._parent;
      parentOpacity = 255;
      if (locParent && locParent._cascadeOpacityEnabled)
        parentOpacity = locParent.getDisplayedOpacity();
    }
    this._displayedOpacity = node._realOpacity * parentOpacity / 255.0;
  },

  _updateColor: function () {
  },

  _propagateFlagsDown: function (parentCmd) {
    var locFlag = this._dirtyFlag;
    var parentNode = parentCmd ? parentCmd._node : null;

    if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & dirtyFlags.colorDirty))
      locFlag |= dirtyFlags.colorDirty;

    if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & dirtyFlags.opacityDirty))
      locFlag |= dirtyFlags.opacityDirty;

    if (parentCmd && (parentCmd._dirtyFlag & dirtyFlags.transformDirty))
      locFlag |= dirtyFlags.transformDirty;

    this._dirtyFlag = locFlag;
  },

  updateStatus: function () {
    var locFlag = this._dirtyFlag;
    var colorDirty = locFlag & dirtyFlags.colorDirty,
      opacityDirty = locFlag & dirtyFlags.opacityDirty;

    if (locFlag & dirtyFlags.contentDirty) {
      this._notifyRegionStatus && this._notifyRegionStatus(Node.CanvasRenderCmd.RegionStatus.Dirty);
      this._dirtyFlag &= ~dirtyFlags.contentDirty;
    }

    if (colorDirty)
      this._updateDisplayColor();

    if (opacityDirty)
      this._updateDisplayOpacity();

    if (colorDirty || opacityDirty)
      this._updateColor();

    if (locFlag & dirtyFlags.transformDirty) {
      //update the transform
      this.transform(this.getParentRenderCmd(), true);
      this._dirtyFlag &= ~dirtyFlags.transformDirty;
    }

    if (locFlag & dirtyFlags.orderDirty)
      this._dirtyFlag &= ~dirtyFlags.orderDirty;
  },

  _syncStatus: function (parentCmd) {
    //  In the visit logic does not restore the _dirtyFlag
    //  Because child elements need parent's _dirtyFlag to change himself
    var locFlag = this._dirtyFlag, parentNode = parentCmd ? parentCmd._node : null;

    //  There is a possibility:
    //    The parent element changed color, child element not change
    //    This will cause the parent element changed color
    //    But while the child element does not enter the circulation
    //    Here will be reset state in last
    //    In order the child elements get the parent state
    if (parentNode && parentNode._cascadeColorEnabled && (parentCmd._dirtyFlag & dirtyFlags.colorDirty))
      locFlag |= dirtyFlags.colorDirty;

    if (parentNode && parentNode._cascadeOpacityEnabled && (parentCmd._dirtyFlag & dirtyFlags.opacityDirty))
      locFlag |= dirtyFlags.opacityDirty;

    if (parentCmd && (parentCmd._dirtyFlag & dirtyFlags.transformDirty))
      locFlag |= dirtyFlags.transformDirty;

    this._dirtyFlag = locFlag;

    var colorDirty = locFlag & dirtyFlags.colorDirty,
      opacityDirty = locFlag & dirtyFlags.opacityDirty;

    if (colorDirty)
      //update the color
      this._syncDisplayColor();

    if (opacityDirty)
      //update the opacity
      this._syncDisplayOpacity();

    if (colorDirty || opacityDirty)
      this._updateColor();

    if (locFlag & dirtyFlags.transformDirty)
      //update the transform
      this.transform(parentCmd);

    if (locFlag & dirtyFlags.orderDirty)
      this._dirtyFlag &= ~dirtyFlags.orderDirty;
  },

  setShaderProgram: function (shaderProgram) {
    //do nothing.
  },

  getShaderProgram: function () {
    return null;
  },

  getGLProgramState: function () {
    return null;
  },

  setGLProgramState: function (glProgramState) {
    // do nothing
  },
};

Node.RenderCmd.prototype.originTransform = Node.RenderCmd.prototype.transform;
Node.RenderCmd.prototype.originUpdateStatus = Node.RenderCmd.prototype.updateStatus;
Node.RenderCmd.prototype._originSyncStatus = Node.RenderCmd.prototype._syncStatus;

var proto = NodeWebGLRenderCmd.prototype = Object.create(Node.RenderCmd.prototype);
proto.constructor = NodeWebGLRenderCmd;
proto._rootCtor = NodeWebGLRenderCmd;

proto._updateColor = function () {
};

proto.setShaderProgram = function (shaderProgram) {
  this._glProgramState = GLProgramState.getOrCreateWithGLProgram(shaderProgram);
};

proto.getShaderProgram = function () {
  return this._glProgramState ? this._glProgramState.getGLProgram() : null;
};

proto.getGLProgramState = function () {
  return this._glProgramState;
};

proto.setGLProgramState = function (glProgramState) {
  this._glProgramState = glProgramState;
};

// Use a property getter/setter for backwards compatability, and
// to ease the transition from using glPrograms directly, to
// using glProgramStates.
Object.defineProperty(proto, '_shaderProgram', {
  set: function (value) { this.setShaderProgram(value); },
  get: function () { return this.getShaderProgram(); }
});
/** @expose */
// proto._shaderProgram;
