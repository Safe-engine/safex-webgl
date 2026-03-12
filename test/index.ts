import { director, game, global, loader, sys, Vec2, view } from '../src'
import { Color, LabelTTF, ResolutionPolicy, Scene, Sprite, spriteFrameCache } from '../src/core'
import { MotionStreak } from '../src/motion-streak'
import { ProgressTimer } from '../src/progress-timer'
import { Text } from '../src/ui'

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
      sprite2.setPosition(85, 226)
      sprite3.setPosition(100, 200)
      this.addChild(sprite3)
      const timer = new ProgressTimer(sprite)
      this.addChild(timer)
      timer.setPercentage(60)
      timer.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      timer.addChild(sprite2)
      // console.log('sprite onEnter', timer)
      timer.setType(ProgressTimer.TYPE_BAR)
      timer.setMidpoint(Vec2(0, 0))
      timer.setBarChangeRate(Vec2(1, 0))
      const label = new LabelTTF('Hello World', 'Arial', 24)
      label.setPosition(300, 200)
      this.addChild(label)
      const text = new Text('Hello Têxt', 'Arial', 24)
      text.setPosition(400, 200)
      this.addChild(text)
      const motionStreak = new MotionStreak(1, 32, 13, Color.GREEN, 'button.png')
      motionStreak.setPosition(300, 400)
      this.addChild(motionStreak)
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
    showFPS: true,
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
    director.runScene(new BootScene())
  },
)
