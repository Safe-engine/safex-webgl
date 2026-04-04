import { director, winSize } from '..'
import { Director, Node, p, Point } from '../core'
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
  position: Point
  zoom: number
  viewMatrix: Matrix4
  projectionMatrix: Matrix4
  _dirty: boolean
  flag: CameraFlag

  constructor(flag: CameraFlag = CameraFlag.DEFAULT) {
    super()
    this.position = p(0, 0)
    this.zoom = 1

    this.viewMatrix = new Matrix4()
    this.projectionMatrix = new Matrix4()

    this._dirty = true
    this.flag = flag
  }

  setPosition(x: number, y: number) {
    this.position.x = x
    this.position.y = y
    this._dirty = true
  }

  setZoom(z: number) {
    this.zoom = z
    this._dirty = true
  }

  updateMatrix() {
    if (!this._dirty) return

    // Base orthographic projection
    const baseProjection = new Matrix4()
    kmMat4OrthographicProjection(baseProjection, 0, winSize.width, 0, winSize.height, -1, 1)

    // View (camera) transform: translate(-x,-y) then scale
    const viewTranslation = new Matrix4()
    kmMat4Translation(viewTranslation, -this.position.x, -this.position.y, 0)

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

  applyToGL() {
    this.updateProjection()
  }

  apply() {
    this.updateMatrix()

    // register ourselves as custom projection delegate for legacy path
    director.setDelegate(this)
    director.setProjection(Director.PROJECTION_CUSTOM)

    this.updateProjection()
  }
}
