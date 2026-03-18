import { DrawNode, Vec2 } from '../src'
import { Color, Scene } from '../src/core'

export class GraphicsTest extends Scene {
  onEnter() {
    super.onEnter()
    const draw = new DrawNode()
    this.addChild(draw)
    draw.drawRect(Vec2(100, 300), Vec2(200, 500), Color.RED, 0)
    draw.drawCircle(Vec2(400, 500), 50, Math.PI * 0.5, 64, true, 11, Color.YELLOW)
    draw.drawCircle(Vec2(400, 600), 50, (Math.PI * 2) / 3, 64, true, 11, Color.GREEN)
    const points: Vec2[] = [Vec2(40, 1040), Vec2(540, 640), Vec2(840, 940), Vec2(740, 1040)]
    draw.drawPoly(points, Color.BLUE, 20, Color.ORANGE)
    draw.drawRect(Vec2(600, 110), Vec2(350, 245), Color.MAGENTA, 5, Color.WHITE)
    draw.drawDot(Vec2(300, 1500), 50)
  }
}
