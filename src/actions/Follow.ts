import { director } from '..'
import { p, rect, Rect, rectEqualToZero } from '../core/cocoa/Geometry'
import { clampf, pMult } from '../core/support/PointExtension'
import { Action } from './Action'

export class Follow extends Action {
  _followedNode: any = null
  _boundarySet = false
  _boundaryFullyCovered = false
  _halfScreenSize: any = null
  _fullScreenSize: any = null
  _worldRect: any = null

  leftBoundary = 0.0
  rightBoundary = 0.0
  topBoundary = 0.0
  bottomBoundary = 0.0

  constructor(followedNode?: any, rectArg?: any) {
    super()
    this._followedNode = null
    this._boundarySet = false
    this._boundaryFullyCovered = false
    this._halfScreenSize = null
    this._fullScreenSize = null
    this.leftBoundary = 0.0
    this.rightBoundary = 0.0
    this.topBoundary = 0.0
    this.bottomBoundary = 0.0
    this._worldRect = rect(0, 0, 0, 0)

    if (followedNode) rectArg ? this.initWithTarget(followedNode, rectArg) : this.initWithTarget(followedNode)
  }

  clone() {
    const action = new Follow()
    const locRect = this._worldRect
    const rectObj = new Rect(locRect.x, locRect.y, locRect.width, locRect.height)
    action.initWithTarget(this._followedNode, rectObj)
    return action
  }

  isBoundarySet() {
    return this._boundarySet
  }

  setBoudarySet(value: boolean) {
    this._boundarySet = value
  }

  initWithTarget(followedNode: any, rectArg?: any) {
    if (!followedNode) throw new Error('Follow.initWithAction(): followedNode must be non nil')
    rectArg = rectArg || rect(0, 0, 0, 0)
    this._followedNode = followedNode
    this._worldRect = rectArg

    this._boundarySet = !rectEqualToZero(rectArg)
    this._boundaryFullyCovered = false

    const winSize = director.getWinSize()
    this._fullScreenSize = p(winSize.width, winSize.height)
    this._halfScreenSize = pMult(this._fullScreenSize, 0.5)

    if (this._boundarySet) {
      this.leftBoundary = -(rectArg.x + rectArg.width - this._fullScreenSize.x)
      this.rightBoundary = -rectArg.x
      this.topBoundary = -rectArg.y
      this.bottomBoundary = -(rectArg.y + rectArg.height - this._fullScreenSize.y)

      if (this.rightBoundary < this.leftBoundary) {
        this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2
      }
      if (this.topBoundary < this.bottomBoundary) {
        this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2
      }

      if (this.topBoundary === this.bottomBoundary && this.leftBoundary === this.rightBoundary) this._boundaryFullyCovered = true
    }
    return true
  }

  step(dt: number) {
    let tempPosX = this._followedNode.x
    let tempPosY = this._followedNode.y
    tempPosX = this._halfScreenSize.x - tempPosX
    tempPosY = this._halfScreenSize.y - tempPosY

    // TODO: this relies on internal renderer command structure
    this.target._renderCmd._dirtyFlag = 0

    if (this._boundarySet) {
      if (this._boundaryFullyCovered) return
      this.target.setPosition(
        clampf(tempPosX, this.leftBoundary, this.rightBoundary),
        clampf(tempPosY, this.bottomBoundary, this.topBoundary),
      )
    } else {
      this.target.setPosition(tempPosX, tempPosY)
    }
  }

  isDone() {
    return !this._followedNode.running
  }

  stop() {
    this.target = null
    super.stop()
  }
}

export function follow(followedNode: any, rectArg?: any) {
  return new Follow(followedNode, rectArg)
}

Follow.create = follow as any
