import { view } from '../src'
import { Camera2D } from '../src/camera'
import { Scene, Sprite } from '../src/core'

export class CameraTestScene extends Scene {
  camera: Camera2D

  constructor() {
    super()
    this.camera = new Camera2D()
  }

  onEnter() {
    super.onEnter()
    const sprite = new Sprite('button_plus.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
    this.addChild(sprite)
    this.camera.setPosition(100, 500)
  }

  update() {
    // const pos = this.player.getPosition()
    // this.camera.setPosition(pos.x, pos.y)
    this.camera.apply()
  }
}
