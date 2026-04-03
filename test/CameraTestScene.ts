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
    this.scheduleUpdate()

    const sprite = new Sprite('button_plus.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height)
    this.addChild(sprite)
    this.camera.setPosition(0, 0)
    this.camera.setZoom(1)
  }

  update() {
    const pos = this.camera.position
    this.camera.setPosition(pos.x, pos.y + 1)
  }
}
