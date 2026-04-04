import { director } from '../..'
import { Camera } from '../../camera/Camera'
import { Node } from '../base-nodes/Node'

export class Scene extends Node {
  _defaultCamera: Camera
  _cameras: Camera[] = []

  constructor() {
    super()
    this._ignoreAnchorPointForPosition = true
    this.setAnchorPoint(0.5, 0.5)
    this.setContentSize(director.getWinSize())

    this._defaultCamera = new Camera()
    this._cameras.push(this._defaultCamera)
  }

  addCamera(camera: Camera) {
    this._cameras.push(camera)
  }

  getDefaultCamera() {
    return this._defaultCamera
  }

  getCameras() {
    return this._cameras
  }
}
