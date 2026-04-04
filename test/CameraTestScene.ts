import { view } from '../src'
import { Camera, CameraFlag } from '../src/camera'
import { Scene, Sprite } from '../src/core'

export class CameraTestScene extends Scene {
  uiCamera: Camera

  constructor() {
    super()
    this.uiCamera = new Camera(CameraFlag.USER2)
    this.addCamera(this.uiCamera)
    console.log('CameraTestScene created with worldCamera and uiCamera', this.getCameras())
  }

  onEnter() {
    super.onEnter()
    this.scheduleUpdate()

    const sprite = new Sprite('button_plus.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height)
    // sprite.setCameraMask(CameraFlag.USER1)
    this.addChild(sprite)

    // UI layer node (always fixed to UI camera)
    const uiSprite = new Sprite('button_plus.png')
    uiSprite.setPosition(100, 500)
    uiSprite.setCameraMask(CameraFlag.USER2)
    this.addChild(uiSprite)
  }

  update() {
    const pos = this.uiCamera.position
    this.uiCamera.setPosition(pos.x, pos.y + 1)
  }
}
