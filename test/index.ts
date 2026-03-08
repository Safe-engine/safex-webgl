import { director, game, view } from '../src'
import { ResolutionPolicy } from '../src/2d/core/platform/EGLView/ResolutionPolicy'
import { Scene } from '../src/2d/core/scenes/Scene'
import { Sprite } from '../src/2d/core/sprites/Sprite'
import { global } from '../src/helper/global'
import { loader } from '../src/helper/loader'
import { sys } from '../src/helper/sys'

class BootScene extends Scene {
  // constructor() {
  //   super()
  //   console.log("BootScene constructor")
  //   this.scheduleUpdate()
  // }
  onEnter() {
    super.onEnter()
    loader.load(['res/button.png'], (err, img) => {
      if (err) {
        console.error('Failed to load image', err)
        return
      }
      // console.log("Image loaded", img)
      const sprite = new Sprite('res/button.png')
      const sprite2 = new Sprite('res/button_plus.png')
      const sprite3 = new Sprite('res/button.png')
      // console.log("sprite onEnter", sprite.getTexture())
      sprite.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      sprite2.setPosition(85, 26)
      sprite3.setPosition(100, 200)
      this.addChild(sprite)
      this.addChild(sprite3)
      sprite.addChild(sprite2)
    })
  }

  update(dt) {
    console.log('BootScene update', dt)
  }
}

global._isContextMenuEnable = true
game.run(
  {
    debugMode: 1,
    showFPS: false,
    frameRate: 60,
    id: 'gameCanvas',
    renderMode: 2,
  },
  function onStart() {
    // Pass true to enable retina display, disabled by default to improve performance
    view.enableRetina(sys.os === sys.OS_IOS)
    // Adjust viewport meta
    view.adjustViewPort(true)
    // Setup the resolution policy and design resolution size
    const width = 720
    const height = 1280
    const policy = width > height ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH
    view.setDesignResolutionSize(width, height, policy)
    // The game will be resized when browser size change
    view.resizeWithBrowserSize(true)
    const scene = new Scene()
    const sprite = new Sprite('res/button.png')
    sprite.setPosition(100, 200)
    scene.addChild(sprite)
    director.runScene(new BootScene())
  },
)
