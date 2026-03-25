import {
  ClippingNode,
  Color,
  FontDefinition,
  LabelTTF,
  Rect,
  Scene,
  Sprite,
  Vec2,
  audioEngine,
  color,
  director,
  loader,
  spriteFrameCache,
  view,
} from '../src'
import { MotionStreak } from '../src/motion-streak'
import { ProgressTimer } from '../src/progress-timer'
import { Button, RichElementText, RichText, Scale9Sprite, Slider, Text } from '../src/ui'

export class DemoScene extends Scene {
  declare streak: MotionStreak
  constructor() {
    super()
    const motionStreak = new MotionStreak(1, 32, 13, color(0, 255, 0, 255), 'particle.png')
    console.log('BootScene constructor', motionStreak)
    motionStreak.setPosition(300, 400)
    this.addChild(motionStreak)
    this.streak = motionStreak
    this.scheduleUpdate()
  }
  onEnter() {
    super.onEnter()
    loader.load(['button.png', 'sliderThumb.png', 'ui.plist', 'ui.png'], (err: any, resources: any) => {
      if (err) {
        console.error('Failed to load image', err)
        return
      }
      console.log('Resources loaded', resources)
      spriteFrameCache.addSpriteFrames('ui.plist', 'ui.png')
      const sprite9 = new Scale9Sprite('button.png', Rect(10, 10, 20, 20))
      sprite9.setContentSize(200, 234)
      sprite9.setPosition(300, 900)
      this.addChild(sprite9)
      const sprite = new Sprite('button.png')
      const sprite2 = new Sprite('button_plus.png')
      const frame = spriteFrameCache.getSpriteFrame('ui/buttons/back')
      const sprite3 = new Sprite(frame)
      sprite2.setPosition(85, 226)
      sprite3.setPosition(100, 200)
      this.addChild(sprite3)
      const mask = new ClippingNode(sprite3)
      sprite2.setPosition(85, 226)
      mask.setPosition(100, 200)
      this.addChild(mask)
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
      const text = new Text('From Têxt', 'Arial', 24)
      text.setPosition(500, 200)
      this.addChild(text)
      const rt = new RichText()
      const fontDefinition = new FontDefinition()
      fontDefinition.strokeEnabled = true
      fontDefinition.strokeStyle = Color.GREEN
      fontDefinition.lineWidth = 3
      fontDefinition.fontName = 'Arial'
      fontDefinition.fontSize = 48
      const rtet = new RichElementText(1, fontDefinition, 255, 'rick text')
      rt.pushBackElement(rtet)
      rt.setPosition(200, 300)
      this.addChild(rt)
      const button = new Button('button.png')
      button.setPosition(400, 300)
      button.setTitleText('Click Me')
      this.addChild(button)
      button.addClickEventListener(() => {
        console.log('Button clicked')
        audioEngine.playEffect('Button.mp3', false)
      })
      const slider = new Slider('sliderTrack.png', 'sliderThumb.png')
      slider.setPosition(400, 400)
      this.addChild(slider)
      // slider.loadSlidBallTextureNormal('sliderThumb.png')
      slider.addEventListener((sender: Slider, type: number) => {
        const percent = sender.getPercent()
        console.log('Slider value changed', percent, type)
      }, this)
      // console.log('Slider', slider)
    })
  }

  update(dt: number) {
    // console.log('BootScene update', dt)
    this.streak.setPositionY(this.streak.getPositionY() + dt * 500)
    if (this.streak.getPositionY() > director.getWinSize().height) {
      this.streak.reset()
      this.streak.setPositionY(0)
    }
  }
}
