import { view } from '../src'
import { moveBy } from '../src/actions'
import { Scene, Sprite } from '../src/core'
import { p } from '../src/core/cocoa/Geometry'

export class ActionScene extends Scene {
  onEnter() {
    super.onEnter()
    const sprite = new Sprite('button_plus.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
    this.addChild(sprite)
    const moveAction = moveBy(5, p(100, 600))
    sprite.runAction(moveAction)
  }
}
