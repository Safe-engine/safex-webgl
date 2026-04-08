import { view } from '../src'
import { Camera, CameraFlag } from '../src/camera'
import { Scene, Sprite } from '../src/core'
import { Button } from '../src/ui'

export class CameraTestScene extends Scene {
  uiCamera: Camera
  player: Sprite

  constructor() {
    super()
    this.uiCamera = new Camera(CameraFlag.USER2)
    // uiCamera will be auto-registered when added as child
    this.addChild(this.uiCamera)
    const player = new Sprite('particle.png')
    player.setPosition(222, 333)
    this.player = player
    // worldCamera will be auto-registered when player is added (and it will follow player)
    console.log('CameraTestScene created with worldCamera and uiCamera', this.getCameras())
    this.getDefaultCamera().isCenterDraw = true
    this.addChild(player)
  }

  onEnter() {
    super.onEnter()
    this.scheduleUpdate()

    const sprite = new Sprite('sliderThumb.png')
    sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height)
    this.addChild(sprite)
    // UI layer node (always fixed to UI camera)
    const uiSprite = new Sprite('button_plus.png')
    uiSprite.setPosition(100, 100)
    uiSprite.setCameraMask(CameraFlag.USER2)
    this.addChild(uiSprite)
    const uiSprite2 = new Button('button_plus.png')
    uiSprite2.setPosition(200, 100)
    uiSprite2.setCameraMask(CameraFlag.USER2)
    this.addChild(uiSprite2)
  }

  update() {
    const pos = this.player.getPosition()
    this.player.setPosition(pos.x, pos.y + 1)
    this.getDefaultCamera().setPosition(pos.x, pos.y + 1)
    // console.log('Camera position updated to', this.player.getPosition())
  }
}
