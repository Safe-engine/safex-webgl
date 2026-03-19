import { director } from '../..'
import { Node } from '../base-nodes/Node'

export class Scene extends Node {
  _className = 'Scene'
  constructor() {
    super()
    this._ignoreAnchorPointForPosition = true
    this.setAnchorPoint(0.5, 0.5)
    this.setContentSize(director.getWinSize())
  }
}
