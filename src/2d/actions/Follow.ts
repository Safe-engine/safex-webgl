import { director } from "../..";
import { p, rect, Rect, rectEqualToZero } from "../core/cocoa/Geometry";
import { clampf, pMult } from "../core/support/PointExtension";
import { Action } from "./Action";

export class Follow extends Action {
  _followedNode: any = null;
  _boundarySet: boolean = false;
  _boundaryFullyCovered: boolean = false;
  _halfScreenSize: any = null;
  _fullScreenSize: any = null;
  _worldRect: any = null;

  leftBoundary: number = 0.0;
  rightBoundary: number = 0.0;
  topBoundary: number = 0.0;
  bottomBoundary: number = 0.0;

  constructor(followedNode?: any, rectArg?: any) {
    super();
    this._followedNode = null;
    this._boundarySet = false;
    this._boundaryFullyCovered = false;
    this._halfScreenSize = null;
    this._fullScreenSize = null;
    this.leftBoundary = 0.0;
    this.rightBoundary = 0.0;
    this.topBoundary = 0.0;
    this.bottomBoundary = 0.0;
    this._worldRect = rect(0, 0, 0, 0);

    if (followedNode) rectArg ? this.initWithTarget(followedNode, rectArg) : this.initWithTarget(followedNode);
  }

  clone() {
    const action = new Follow();
    const locRect = this._worldRect;
    const rectObj = new Rect(locRect.x, locRect.y, locRect.width, locRect.height);
    action.initWithTarget(this._followedNode, rectObj);
    return action;
  }

  isBoundarySet() {
    return this._boundarySet;
  }

  setBoudarySet(value: boolean) {
    this._boundarySet = value;
  }

  initWithTarget(followedNode: any, rectArg?: any) {
    if (!followedNode) throw new Error("Follow.initWithAction(): followedNode must be non nil");
    const _this: any = this;
    rectArg = rectArg || rect(0, 0, 0, 0);
    _this._followedNode = followedNode;
    _this._worldRect = rectArg;

    _this._boundarySet = !rectEqualToZero(rectArg);
    _this._boundaryFullyCovered = false;

    const winSize = director.getWinSize();
    _this._fullScreenSize = p(winSize.width, winSize.height);
    _this._halfScreenSize = pMult(_this._fullScreenSize, 0.5);

    if (_this._boundarySet) {
      _this.leftBoundary = -((rectArg.x + rectArg.width) - _this._fullScreenSize.x);
      _this.rightBoundary = -rectArg.x;
      _this.topBoundary = -rectArg.y;
      _this.bottomBoundary = -((rectArg.y + rectArg.height) - _this._fullScreenSize.y);

      if (_this.rightBoundary < _this.leftBoundary) {
        _this.rightBoundary = _this.leftBoundary = (_this.leftBoundary + _this.rightBoundary) / 2;
      }
      if (_this.topBoundary < _this.bottomBoundary) {
        _this.topBoundary = _this.bottomBoundary = (_this.topBoundary + _this.bottomBoundary) / 2;
      }

      if ((_this.topBoundary === _this.bottomBoundary) && (_this.leftBoundary === _this.rightBoundary)) _this._boundaryFullyCovered = true;
    }
    return true;
  }

  step(dt: number) {
    let tempPosX = this._followedNode.x;
    let tempPosY = this._followedNode.y;
    tempPosX = this._halfScreenSize.x - tempPosX;
    tempPosY = this._halfScreenSize.y - tempPosY;

    // TODO: this relies on internal renderer command structure
    this.target._renderCmd._dirtyFlag = 0;

    if (this._boundarySet) {
      if (this._boundaryFullyCovered) return;
      this.target.setPosition(clampf(tempPosX, this.leftBoundary, this.rightBoundary), clampf(tempPosY, this.bottomBoundary, this.topBoundary));
    } else {
      this.target.setPosition(tempPosX, tempPosY);
    }
  }

  isDone() {
    return !this._followedNode.running;
  }

  stop() {
    this.target = null;
    super.stop();
  }
}

export function follow(followedNode: any, rectArg?: any) {
  return new Follow(followedNode, rectArg);
}

Follow.create = follow as any;
