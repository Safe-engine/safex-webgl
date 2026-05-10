import { view } from '../src'
import { easeBackOut, moveBy, scaleTo } from '../src/actions'
import { Scene, Sprite } from '../src/core'
import { p } from '../src/core/cocoa/Geometry'

export class ActionScene extends Scene {
  onEnter() {
    super.onEnter()
    const sprite = new Sprite('button_plus.png')
    const sprite2 = new Sprite('particle.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
    sprite2.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
    this.addChild(sprite)
    this.addChild(sprite2)
    const moveAction = moveBy(5, p(100, 600))
    sprite.runAction(moveAction)

    const actScale = scaleTo(6, 5)
    const easing = easeBackOut(actScale)
    sprite2.runAction(easing)
  }
}
