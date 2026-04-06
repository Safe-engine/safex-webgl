import { winSize } from '..'
import { Node } from '../core'
import {
  KM_GL_MODELVIEW,
  KM_GL_PROJECTION,
  kmGLLoadIdentity,
  kmGLMatrixMode,
  kmGLMultMatrix,
  kmMat4Multiply,
  kmMat4OrthographicProjection,
  kmMat4Translation,
  Matrix4,
} from '../core/kazmath'
import { CameraFlag } from './CameraFlag'

export class Camera extends Node {
  zoom: number
  viewMatrix: Matrix4
  projectionMatrix: Matrix4
  _dirty: boolean
  flag: CameraFlag
  private _lastWorldPos = { x: 0, y: 0 }

  constructor(flag: CameraFlag = CameraFlag.DEFAULT) {
    super()
    this.zoom = 1

    this.viewMatrix = new Matrix4()
    this.projectionMatrix = new Matrix4()

    this._dirty = true
    this.flag = flag
  }

  setPosition(x: any, y?: number) {
    super.setPosition(x, y)
    this._dirty = true
  }

  setZoom(z: number) {
    this.zoom = z
    this._dirty = true
  }

  updateMatrix() {
    const worldPos = this.convertToWorldSpace()

    if (!this._dirty && this._lastWorldPos.x === worldPos.x && this._lastWorldPos.y === worldPos.y) {
      return
    }

    this._lastWorldPos.x = worldPos.x
    this._lastWorldPos.y = worldPos.y

    // Base orthographic projection
    const baseProjection = new Matrix4()
    kmMat4OrthographicProjection(baseProjection, 0, winSize.width, 0, winSize.height, -1, 1)

    // View (camera) transform: translate(-worldPos.x, -worldPos.y) then scale
    const viewTranslation = new Matrix4()
    kmMat4Translation(viewTranslation, -worldPos.x, -worldPos.y, 0)

    const viewScale = Matrix4.createByScale(this.zoom, this.zoom, 1, new Matrix4())

    const viewMat = new Matrix4()
    kmMat4Multiply(viewMat, viewScale, viewTranslation)

    // Store the viewMatrix for any shaders that use CC_MVMatrix as well
    this.viewMatrix = viewMat

    // Combine projection and camera view into final projection matrix for this engine
    const combined = new Matrix4()
    kmMat4Multiply(combined, baseProjection, viewMat)
    this.projectionMatrix = combined

    this._dirty = false
  }

  updateProjection() {
    this.updateMatrix()

    // set effective projection matrix (projection * camera view)
    kmGLMatrixMode(KM_GL_PROJECTION)
    kmGLLoadIdentity()
    kmGLMultMatrix(this.projectionMatrix)

    // keep modelview identity; sprite shader uses CC_PMatrix only
    kmGLMatrixMode(KM_GL_MODELVIEW)
    kmGLLoadIdentity()
  }
}
