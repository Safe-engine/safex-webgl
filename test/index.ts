import { director, game, global, loader, sys, view } from '../src'
import { ResolutionPolicy, Scene, Sprite, spriteFrameCache } from '../src/core'
import { ProgressTimer } from '../src/progress-timer'

class BootScene extends Scene {
  // constructor() {
  //   super()
  //   console.log("BootScene constructor")
  //   this.scheduleUpdate()
  // }
  onEnter() {
    super.onEnter()
    loader.load(['button.png', 'ui.plist', 'ui.png'], (err, resources) => {
      if (err) {
        console.error('Failed to load image', err)
        return
      }
      console.log('Resources loaded', resources)
      spriteFrameCache.addSpriteFrames('ui.plist', 'ui.png')
      const sprite = new Sprite('button.png')
      const sprite2 = new Sprite('button_plus.png')
      const frame = spriteFrameCache.getSpriteFrame('ui/buttons/back')
      const sprite3 = new Sprite(frame)
      const timer = new ProgressTimer(sprite)
      console.log('sprite onEnter', timer)
      timer.setPercentage(50)
      timer.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      sprite2.setPosition(85, 26)
      sprite3.setPosition(100, 200)
      this.addChild(timer)
      this.addChild(sprite3)
      timer.addChild(sprite2)
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
    const sprite = new Sprite('button.png')
    sprite.setPosition(100, 200)
    scene.addChild(sprite)
    director.runScene(new BootScene())
  },
)
