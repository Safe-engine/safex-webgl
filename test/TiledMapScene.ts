import { loader, view } from '../src'
import { Scene } from '../src/core'
import { TMXTiledMap } from '../src/tilemap'

export class TiledMapScene extends Scene {
  onEnter() {
    super.onEnter()
    loader.load(['orthogonal-test1.tmx', 'orthogonal-test1.tsx'], (err: any, resources: any) => {
      const map = new TMXTiledMap('orthogonal-test1.tmx')
      map.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      this.addChild(map)
    })
  }
}
