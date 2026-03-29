import { DrawNode, Vec2 } from '../src'
import { color, Color, Scene, Sprite } from '../src/core'
export class GraphicsTest extends Scene {
  onEnter() {
    super.onEnter()
    this.createSpriteSafe()
    const draw = new DrawNode()
    this.addChild(draw, 1)
    const draw2 = new DrawNode()
    this.addChild(draw2)
    draw.drawRect(Vec2(100, 300), Vec2(200, 500), Color.RED, 0)
    draw.drawDot(Vec2(300, 1500), 50)
    const points: Vec2[] = [Vec2(40, 1040), Vec2(540, 640), Vec2(840, 940), Vec2(740, 1040)]
    draw2.drawPoly(points, Color.BLUE, 20, Color.ORANGE)
    draw2.drawRect(Vec2(600, 110), Vec2(350, 245), Color.MAGENTA, 5, Color.WHITE)
  }

  createSpriteSafe() {
    const sprite = new Sprite('button_plus.png')
    sprite.setColor(color(255, 0, 0))
    sprite.setPosition(300, 400)
    this.addChild(sprite, 10)
  }
}
