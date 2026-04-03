import { _renderContext, director, winSize } from '..'
import { Director, p, Point } from '../core'
import {
  KM_GL_MODELVIEW,
  KM_GL_PROJECTION,
  kmGLLoadIdentity,
  kmGLMatrixMode,
  kmGLMultMatrix,
  kmMat4OrthographicProjection,
  kmMat4Translation,
  Matrix4,
} from '../core/kazmath'

export class Camera2D {
  position: Point
  zoom: number
  viewMatrix: Matrix4
  projectionMatrix: Matrix4
  _dirty: boolean

  constructor() {
    this.position = p(0, 0)
    this.zoom = 1

    this.viewMatrix = new Matrix4()
    this.projectionMatrix = new Matrix4()

    this._dirty = true
  }

  setPosition(x, y) {
    this.position.x = x
    this.position.y = y
    this._dirty = true
  }

  setZoom(z) {
    this.zoom = z
    this._dirty = true
  }

  updateMatrix() {
    if (!this._dirty) return

    // 🎯 Projection (orthographic)
    this.projectionMatrix.identity()
    kmMat4OrthographicProjection(
      this.projectionMatrix,
      -winSize.width / 2,
      winSize.width / 2,
      -winSize.height / 2,
      winSize.height / 2,
      -1,
      1,
    )

    // 🎯 View matrix (camera transform)
    this.viewMatrix.identity()

    // translate (camera)
    const tx = -this.position.x
    const ty = -this.position.y

    kmMat4Translation(this.viewMatrix, tx, ty, 0)

    // zoom
    Matrix4.createByScale(this.zoom, this.zoom, 1, this.viewMatrix)

    this._dirty = false
  }

  apply() {
    this.updateMatrix()

    const gl = _renderContext

    // set projection
    director.setProjection(Director.PROJECTION_CUSTOM)

    const stack = kmGLMatrixMode(KM_GL_PROJECTION)
    kmGLMatrixMode(KM_GL_PROJECTION)
    kmGLLoadIdentity()
    kmGLMultMatrix(this.projectionMatrix)

    // set view
    kmGLMatrixMode(KM_GL_MODELVIEW)
    kmGLLoadIdentity()
    kmGLMultMatrix(this.viewMatrix)
  }
}
