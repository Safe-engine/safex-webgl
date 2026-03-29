import { director, loader, textureCache } from '../src'
import { Scene, Sprite } from '../src/core'
import { decodeGzipBase64 } from '../src/helper/ZipUtils'
import { ParticleFireworks } from '../src/particle/examples'
import { ParticleSystem } from '../src/particle/ParticleSystem'
import { PNGReader } from '../src/particle/PNGReader'

const base64String =
  'H4sIAAAAAAAAAwFmA5n8iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADLUlEQVRYCcXX51JbQRCEUeOc/f6v6ZzxHKFPLAoI84epmrp7985294QVxcXl5eWjh7Sn9yB/MWcej19sXQb87/iP8f+yiztWAOmzcYL5k/F9AX9m7/fWf83zTmLOVeD5AHECWieiKpR95D8nlhPcepbH7TYBL+dI/mrWRCRkrQIBZY9Q5vzb+PdxQj2P2ikBCPnrxb0TRMQpAYiRIa9lVcregR0TgATZm/G3W7cmxn5VaA6qQNkjEkNAMbPcDOpBJfYF6DMByJC/H3+3XSfC97IziATov8FD8HUcDmzZs+bETSF0Z+cEICeCE0TYOQFlHznSZoTQkwIc5PW+FqwC7NUGVagCXTvlXzNHXnXE5LsrulYAYFduX4Ts11b4LlaWlbXBWzNH2GxojzN4jgogJgENYreganyYGELsq1YCAOp9CZX5eivEwy9mltcvPvqwirBHSGKIQE6Eitg35forO5mxSo5cDJyVHIf3TRVSIxNgiUgIUO5Abel2qII4hLJnSk5M7XC2rMPGU5s2APO++11PiKBVUECEyAq5athHyvS6TO2vhOHB72/ILK+VtHnb0+EEAkeiLZGV2UpyG94cvRbgh+KcGyzenZb5l3FPbbBfzDks3zcmE9aBCIBF1FCt16meO98M6L3BEpeohIUHP65ZXvXJM2IH8oCAATZYiJWc+a7swJF/HvddnHjnuLgwE4RvY1XAAVMuwAHvHPA61cUDNnD6DUws8k/j2kJEZ8NahdjbWIBeVvJIgSISh4yJ8931SgBwpMhVwtPZKiIeaSJmeWWrgMolENh6pSKXrTjftcKU66m9ziViFSI+AWJ3tgoQADTwrtdKLvvinE2AfcAylTXyj9tn1UiE8ztbBdhUIiD2u9ez3PS5LP0QJe6UgKpgJhpOuPBv2DEBMubAmbI3H0BqDYEJcBOAy06mqpCI/xIw5zYViFx/gZc98IZyX0DtITIR+4M4n27afgX6CgB52dffsq9FawWqkipUCWLyWR7aKQEiHVwFuHbrX7batApNRO3wPOj77O3swf8zuquAneJZaEPZ14KqcOOKrYdOre8j4BTWvfZl8qD2D7ghcomuE8XXAAAAAElFTkSuQmCCksg8PmYDAAA='

export class ParticleScene extends Scene {
  onEnter() {
    super.onEnter()
    const { width, height } = director.getWinSize()
    loader.load(['Spiral.plist', 'SmallSun.plist', 'base.png', 'particle.png'], (err: any, resources: any) => {
      console.log(resources)
      const emitter = new ParticleSystem('Spiral.plist')
      emitter.setPosition(width / 2, height / 3)
      this.addChild(emitter)
      const sun = new ParticleSystem('SmallSun.plist')
      sun.setPosition(width / 2, height * 0.8)
      this.addChild(sun)
      const firework = new ParticleFireworks()
      firework.setPosition(width / 3, height / 2)
      const texture = textureCache.getTextureForKey('particle.png')!
      firework.setTexture(texture)
      this.addChild(firework)

      const buffer = decodeGzipBase64(base64String)
      const imgPath = 'base64png'
      const canvasObj = document.createElement('canvas')
      const myPngObj = new PNGReader(buffer)
      myPngObj.render(canvasObj)
      textureCache.cacheImage(imgPath, canvasObj)

      const tex = textureCache.getTextureForKey(imgPath)!
      // console.log(tex)
      const sprite = new Sprite(tex)
      sprite.setPosition(300, 300)
      this.addChild(sprite)
      // firework.setTexture(tex)
      // sun.setTexture(texture)
      // firework.setBlendFunc(770, 1)
      console.log(firework)
    })
  }
}
