import { loader, view } from '../src'
import { Scene } from '../src/core'
import { MeshNode } from '../src/mesh'

export class MeshTest extends Scene {
  onEnter() {
    super.onEnter()
    loader.load(['ortho-test1.png'], (err: any, resources: any) => {
      const uvs2 = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])
      const vertices2 = new Float32Array([-200, 100, 360, 100, -200, -320, 360, -320])
      const indices2 = new Uint16Array([0, 1, 2, 1, 2, 3])
      const mesh = new MeshNode()
      mesh.initMesh('ortho-test1.png', vertices2, uvs2, indices2)
      mesh.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      this.addChild(mesh)
    })
  }
}
