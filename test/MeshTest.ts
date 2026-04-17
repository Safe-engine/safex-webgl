import { loader, view } from '../src'
import { Scene } from '../src/core'
import { MeshNode } from '../src/mesh'

export class MeshTest extends Scene {
  onEnter() {
    super.onEnter()
    loader.load(['button_plus.png'], (err: any, resources: any) => {
      const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])
      const vertices = new Float32Array([0, 0, 50, 0, 0, 50, 50, 50])

      const mesh = new MeshNode()
      mesh.initMesh('button_plus.png', vertices, uvs)
      mesh.setPosition(view.getDesignResolutionSize().width / 2, view.getDesignResolutionSize().height / 2)
      this.addChild(mesh)
      mesh.updateVertices(new Float32Array([0, 0, 80, 0, 0, 80, 80, 80]))
    })
  }
}
