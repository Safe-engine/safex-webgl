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

  addChild(child: Node, localZOrder?: number, tag?: number) {
    super.addChild(child, localZOrder, tag)
    // Auto-register cameras in the hierarchy
    this._registerCamerasInHierarchy(child)
  }

  private _registerCamerasInHierarchy(node: Node) {
    // Check if node itself is a camera
    if (node instanceof Camera) {
      this._addCameraIfNotExists(node as Camera)
    }

    // Recursively check children
    const children = node.getChildren?.()
    if (children) {
      for (const child of children) {
        this._registerCamerasInHierarchy(child)
      }
    }
  }

  addCamera(camera: Camera) {
    this._addCameraIfNotExists(camera)
  }

  private _addCameraIfNotExists(camera: Camera) {
    if (!this._cameras.includes(camera)) {
      this._cameras.push(camera)
    }
  }

  getDefaultCamera() {
    return this._defaultCamera
  }

  getCameras() {
    return this._cameras
  }
}
