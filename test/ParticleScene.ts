import { director, loader, textureCache } from '../src'
import { Scene } from '../src/core'
import { ParticleFireworks } from '../src/particle/examples'
import { ParticleSystem } from '../src/particle/ParticleSystem'

export class ParticleScene extends Scene {
  onEnter() {
    super.onEnter()
    const { width, height } = director.getWinSize()
    loader.load(['Spiral.plist', 'SmallSun.plist', 'base.png'], (err: any, resources: any) => {
      const emitter = new ParticleSystem('Spiral.plist')
      emitter.setPosition(width / 2, height / 3)
      this.addChild(emitter)
      const sun = new ParticleSystem('SmallSun.plist')
      sun.setPosition(width / 2, height * 0.8)
      this.addChild(sun)
      const firework = new ParticleFireworks()
      firework.setPosition(width / 3, height / 2)
      const texture = textureCache.getTextureForKey('base.png')!
      firework.setTexture(texture)
      this.addChild(firework)
    })
  }
}
