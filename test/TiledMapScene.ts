import { loader, view } from '../src'
import { Rect, Scene } from '../src/core'
import { TMXTiledMap } from '../src/tilemap'

export class TiledMapScene extends Scene {
  onEnter() {
    super.onEnter()
    loader.load(['orthogonal-test1.tmx', 'ortho-test1.png'], (err: any, resources: any) => {
      const map = new TMXTiledMap('orthogonal-test1.tmx')
      map.setPosition(12, view.getDesignResolutionSize().height / 2)
      const layer = map.getLayer('map')!
      const tile = layer.getTileAt(0, 11)
      tile?.setPositionY(-100)
      tile?.setTextureRect(Rect(0, 0, 101, 171))
      console.log(tile)
      this.addChild(map)
    })
  }
}
