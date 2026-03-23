import type { Node, Sprite } from '../core'
import { log } from '../helper/Debugger'

// Default Action tag
export const ACTION_TAG_INVALID = -1

export class Action {
  declare public originalTarget: Node
  declare public target: Node
  public tag: number = ACTION_TAG_INVALID
  declare _speedMethod: boolean
  declare _speed: number

  constructor() {
    this.originalTarget = null
    this.target = null
    this.tag = ACTION_TAG_INVALID
  }

  copy() {
    log('copy is deprecated. Please use clone instead.')
    return this.clone()
  }

  clone() {
    const action = new Action()
    action.originalTarget = null
    action.target = null
    action.tag = this.tag
    return action
  }

  isDone() {
    return true
  }

  startWithTarget(target: Node) {
    this.originalTarget = target
    this.target = target
  }

  stop() {
    this.target = null
  }

  step(dt: number) {
    log('[Action step]. override me')
  }

  update(dt: number) {
    log('[Action update]. override me')
  }

  getTarget() {
    return this.target
  }

  setTarget(target: Sprite) {
    this.target = target
  }

  getOriginalTarget() {
    return this.originalTarget
  }

  setOriginalTarget(originalTarget: Node) {
    this.originalTarget = originalTarget
  }

  getTag() {
    return this.tag
  }

  setTag(tag: number) {
    this.tag = tag
  }

  retain() {}
  release() {}
}

export function action() {
  return new Action()
}
