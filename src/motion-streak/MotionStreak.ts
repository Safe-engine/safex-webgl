import { _renderContext } from '..'
import { pDistanceSQ } from '../core'
import { Node } from '../core/base-nodes/Node'
import { p } from '../core/cocoa/Geometry'
import { BlendFunc, ONE_MINUS_SRC_ALPHA, SRC_ALPHA } from '../core/platform'
import { vertexLineToPolygon } from '../core/support/Vertex'
import { isString } from '../helper/checkType'
import { log } from '../helper/Debugger'
import { textureCache } from '../textures'
import { MotionStreakWebGLRenderCmd } from './MotionStreakWebGLRenderCmd'

export class MotionStreak extends Node {
  texture: any = null
  fastMode = false
  startingPositionInitialized = false

  _blendFunc: any = null

  _stroke = 0
  _fadeDelta = 0
  _minSeg = 0

  _maxPoints = 0
  _nuPoints = 0
  _previousNuPoints = 0

  /* Pointers */
  _pointVertexes: any = null
  _pointState: any = null

  // webgl
  _vertices: any = null
  _colorPointer: any = null
  _texCoords: any = null

  _verticesBuffer: any = null
  _colorPointerBuffer: any = null
  _texCoordsBuffer: any = null
  _className = 'MotionStreak'
  _positionR: any
  // inherited property placeholders
  anchorX: number
  anchorY: number
  ignoreAnchor: boolean
  color: any
  constructor(fade?: number, minSeg?: number, stroke?: number, color?: any, texture?: any) {
    super()
    this._positionR = p(0, 0)
    this._blendFunc = new BlendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)

    this.fastMode = false
    this.startingPositionInitialized = false

    this.texture = null

    this._stroke = 0
    this._fadeDelta = 0
    this._minSeg = 0

    this._maxPoints = 0
    this._nuPoints = 0
    this._previousNuPoints = 0

    /** Pointers */
    this._pointVertexes = null
    this._pointState = null

    // webgl
    this._vertices = null
    this._colorPointer = null
    this._texCoords = null

    this._verticesBuffer = null
    this._colorPointerBuffer = null
    this._texCoordsBuffer = null

    if (texture !== undefined) this.initWithFade(fade, minSeg, stroke, color, texture)
  }

  getTexture() {
    return this.texture
  }

  setTexture(texture: any) {
    if (this.texture !== texture) this.texture = texture
  }

  getBlendFunc() {
    return this._blendFunc
  }

  setBlendFunc(src: any, dst?: any) {
    if (dst === undefined) {
      this._blendFunc = src
    } else {
      this._blendFunc.src = src
      this._blendFunc.dst = dst
    }
  }

  getOpacity() {
    log('MotionStreak.getOpacity has not been supported.')
    return 0
  }

  setOpacity(opacity: any) {
    log('MotionStreak.setOpacity has not been supported.')
  }

  setOpacityModifyRGB(value: any) {}

  isOpacityModifyRGB() {
    return false
  }

  isFastMode() {
    return this.fastMode
  }

  setFastMode(fastMode: boolean) {
    this.fastMode = fastMode
  }

  isStartingPositionInitialized() {
    return this.startingPositionInitialized
  }

  setStartingPositionInitialized(startingPositionInitialized: boolean) {
    this.startingPositionInitialized = startingPositionInitialized
  }

  getStroke() {
    return this._stroke
  }

  setStroke(stroke: number) {
    this._stroke = stroke
  }

  initWithFade(fade: number, minSeg: number, stroke: number, color: any, texture: any) {
    if (!texture) throw new Error('MotionStreak.initWithFade(): Invalid filename or texture')

    if (isString(texture)) texture = textureCache.addImage(texture)

    this.setPosition(p(0, 0))
    this.anchorX = 0
    this.anchorY = 0
    this.ignoreAnchor = true
    this.startingPositionInitialized = false

    this.fastMode = true
    this._minSeg = minSeg === -1.0 ? stroke / 5.0 : minSeg
    this._minSeg *= this._minSeg

    this._stroke = stroke
    this._fadeDelta = 1.0 / fade

    const locMaxPoints = (0 | (fade * 60)) + 2
    this._maxPoints = locMaxPoints
    this._nuPoints = 0
    this._pointState = new Float32Array(locMaxPoints)
    this._pointVertexes = new Float32Array(locMaxPoints * 2)

    this._vertices = new Float32Array(locMaxPoints * 4)
    this._texCoords = new Float32Array(locMaxPoints * 4)
    this._colorPointer = new Uint8Array(locMaxPoints * 8)
    const gl = _renderContext
    this._verticesBuffer = gl.createBuffer()
    this._texCoordsBuffer = gl.createBuffer()
    this._colorPointerBuffer = gl.createBuffer()

    // Set blend mode
    this._blendFunc.src = gl.SRC_ALPHA
    this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA

    this.texture = texture
    this.color = color
    this.scheduleUpdate()

    //bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._texCoords, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorPointerBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._colorPointer, gl.DYNAMIC_DRAW)

    return true
  }

  tintWithColor(color: any) {
    this.color = color

    const locColorPointer = this._colorPointer
    for (let i = 0, len = this._nuPoints * 2; i < len; i++) {
      locColorPointer[i * 4] = color.r
      locColorPointer[i * 4 + 1] = color.g
      locColorPointer[i * 4 + 2] = color.b
    }
  }

  reset() {
    this._nuPoints = 0
  }

  setPosition(position: any, yValue?: number) {
    this.startingPositionInitialized = true
    if (yValue === undefined) {
      this._positionR.x = position.x
      this._positionR.y = position.y
    } else {
      this._positionR.x = position
      this._positionR.y = yValue
    }
  }

  getPositionX() {
    return this._positionR.x
  }

  setPositionX(x: number) {
    this._positionR.x = x
    if (!this.startingPositionInitialized) this.startingPositionInitialized = true
  }

  getPositionY() {
    return this._positionR.y
  }

  setPositionY(y: number) {
    this._positionR.y = y
    if (!this.startingPositionInitialized) this.startingPositionInitialized = true
  }

  update(delta: number) {
    if (!this.startingPositionInitialized) return

    //TODO update the color    (need move to render cmd)
    this._renderCmd._updateDisplayColor()

    delta *= this._fadeDelta

    let i, newIdx, newIdx2, i2
    let mov = 0

    let locNuPoints = this._nuPoints
    const locPointState = this._pointState,
      locPointVertexes = this._pointVertexes,
      locVertices = this._vertices
    const locColorPointer = this._colorPointer

    for (i = 0; i < locNuPoints; i++) {
      locPointState[i] -= delta

      if (locPointState[i] <= 0) mov++
      else {
        newIdx = i - mov
        if (mov > 0) {
          // Move data
          locPointState[newIdx] = locPointState[i]
          // Move point
          locPointVertexes[newIdx * 2] = locPointVertexes[i * 2]
          locPointVertexes[newIdx * 2 + 1] = locPointVertexes[i * 2 + 1]

          // Move vertices
          i2 = i * 2
          newIdx2 = newIdx * 2
          locVertices[newIdx2 * 2] = locVertices[i2 * 2]
          locVertices[newIdx2 * 2 + 1] = locVertices[i2 * 2 + 1]
          locVertices[(newIdx2 + 1) * 2] = locVertices[(i2 + 1) * 2]
          locVertices[(newIdx2 + 1) * 2 + 1] = locVertices[(i2 + 1) * 2 + 1]

          // Move color
          i2 *= 4
          newIdx2 *= 4
          locColorPointer[newIdx2 + 0] = locColorPointer[i2 + 0]
          locColorPointer[newIdx2 + 1] = locColorPointer[i2 + 1]
          locColorPointer[newIdx2 + 2] = locColorPointer[i2 + 2]
          locColorPointer[newIdx2 + 4] = locColorPointer[i2 + 4]
          locColorPointer[newIdx2 + 5] = locColorPointer[i2 + 5]
          locColorPointer[newIdx2 + 6] = locColorPointer[i2 + 6]
        } else newIdx2 = newIdx * 8

        const op = locPointState[newIdx] * 255.0
        locColorPointer[newIdx2 + 3] = op
        locColorPointer[newIdx2 + 7] = op
      }
    }
    locNuPoints -= mov

    // Append new point
    let appendNewPoint = true
    if (locNuPoints >= this._maxPoints) appendNewPoint = false
    else if (locNuPoints > 0) {
      const a1 =
        pDistanceSQ(p(locPointVertexes[(locNuPoints - 1) * 2], locPointVertexes[(locNuPoints - 1) * 2 + 1]), this._positionR) < this._minSeg
      const a2 =
        locNuPoints === 1
          ? false
          : pDistanceSQ(p(locPointVertexes[(locNuPoints - 2) * 2], locPointVertexes[(locNuPoints - 2) * 2 + 1]), this._positionR) <
            this._minSeg * 2.0
      if (a1 || a2) appendNewPoint = false
    }

    if (appendNewPoint) {
      locPointVertexes[locNuPoints * 2] = this._positionR.x
      locPointVertexes[locNuPoints * 2 + 1] = this._positionR.y
      locPointState[locNuPoints] = 1.0

      // Color assignment
      const offset = locNuPoints * 8

      const locDisplayedColor = this.getDisplayedColor()
      locColorPointer[offset] = locDisplayedColor.r
      locColorPointer[offset + 1] = locDisplayedColor.g
      locColorPointer[offset + 2] = locDisplayedColor.b
      //*((ccColor3B*)(m_pColorPointer + offset+4)) = this._color;
      locColorPointer[offset + 4] = locDisplayedColor.r
      locColorPointer[offset + 5] = locDisplayedColor.g
      locColorPointer[offset + 6] = locDisplayedColor.b

      // Opacity
      locColorPointer[offset + 3] = 255
      locColorPointer[offset + 7] = 255

      // Generate polygon
      if (locNuPoints > 0 && this.fastMode) {
        if (locNuPoints > 1) vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, locNuPoints, 1)
        else vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, 2)
      }
      locNuPoints++
    }

    if (!this.fastMode) vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, locNuPoints)

    // Updated Tex Coords only if they are different than previous step
    if (locNuPoints && this._previousNuPoints !== locNuPoints) {
      const texDelta = 1.0 / locNuPoints
      const locTexCoords = this._texCoords
      for (i = 0; i < locNuPoints; i++) {
        locTexCoords[i * 4] = 0
        locTexCoords[i * 4 + 1] = texDelta * i

        locTexCoords[(i * 2 + 1) * 2] = 1
        locTexCoords[(i * 2 + 1) * 2 + 1] = texDelta * i
      }

      this._previousNuPoints = locNuPoints
    }

    this._nuPoints = locNuPoints
  }

  _createRenderCmd() {
    return new MotionStreakWebGLRenderCmd(this)
  }
}
