import { view } from '../src'
import { Scene } from '../src/core'
import { ParticleFireworks } from '../src/particle/examples'

export class ParticleScene extends Scene {
  onEnter() {
    super.onEnter()
    const emitter = new ParticleFireworks()
    emitter.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
    this.addChild(emitter)
  }
}
