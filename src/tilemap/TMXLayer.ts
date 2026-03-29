import { renderer } from '../boot'
import {
  Node,
  p,
  Point,
  pointPixelsToPoints,
  Rect,
  rectPixelsToPoints,
  SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST,
  Size,
  sizePixelsToPoints,
  Sprite,
  UNIFORM_ALPHA_TEST_VALUE_S,
} from '../core'
import { SpriteBatchNode } from '../core/sprites/SpriteBatchNode'
import { log } from '../helper/Debugger'
import { defineGetterSetter } from '../helper/getset'
import { shaderCache } from '../shaders/ShaderCache'
import { Texture2D, textureCache } from '../textures'
import type { TMXLayerInfo } from './TMXLayerInfo'
import { TMXLayerWebGLRenderCmd } from './TMXLayerWebGLRenderCmd'
import type { TMXMapInfo } from './TMXMapInfo'
import { TMX_ORIENTATION_HEX, TMX_ORIENTATION_ISO, TMX_ORIENTATION_ORTHO } from './TMXTiledMap'
import type { TMXTilesetInfo } from './TMXTilesetInfo'
import {
  TMX_TILE_DIAGONAL_FLAG,
  TMX_TILE_FLIPPED_ALL,
  TMX_TILE_FLIPPED_MASK,
  TMX_TILE_HORIZONTAL_FLAG,
  TMX_TILE_VERTICAL_FLAG,
} from './TMXXMLParser'

/**
 * <p>TMXLayer represents the TMX layer. </p>
 *
 * <p>It is a subclass of SpriteBatchNode. By default the tiles are rendered using a TextureAtlas. <br />
 * If you modify a tile on runtime, then, that tile will become a Sprite, otherwise no Sprite objects are created. <br />
 * The benefits of using Sprite objects as tiles are: <br />
 * - tiles (Sprite) can be rotated/scaled/moved with a nice API </p>
 *
 * <p>If the layer contains a property named "vertexz" with an integer (in can be positive or negative), <br />
 * then all the tiles belonging to the layer will use that value as their OpenGL vertex Z for depth. </p>
 *
 * <p>On the other hand, if the "vertexz" property has the "automatic" value, then the tiles will use an automatic vertex Z value. <br />
 * Also before drawing the tiles, GL_ALPHA_TEST will be enabled, and disabled after drawing them. The used alpha func will be:  </p>
 *
 * glAlphaFunc( GL_GREATER, value ) <br />
 *
 * <p>"value" by default is 0, but you can change it from Tiled by adding the "cc_alpha_func" property to the layer. <br />
 * The value 0 should work for most cases, but if you have tiles that are semi-transparent, then you might want to use a different value, like 0.5.</p>
 * @class
 * @extends SpriteBatchNode
 *
 * @property {Array}                tiles               - Tiles for layer
 * @property {TMXTilesetInfo}    tileset             - Tileset for layer
 * @property {Number}               layerOrientation    - Layer orientation
 * @property {Array}                properties          - Properties from the layer. They can be added using tilemap editors
 * @property {String}               layerName           - Name of the layer
 * @property {Number}               layerWidth          - Width of the layer
 * @property {Number}               layerHeight         - Height of the layer
 * @property {Number}               tileWidth           - Width of a tile
 * @property {Number}               tileHeight          - Height of a tile
 */
export class TMXLayer extends SpriteBatchNode {
  declare tiles: Uint32Array
  declare tileset: TMXTilesetInfo
  declare layerOrientation: number
  declare properties: any
  layerName = ''

  declare _textures: Texture2D[]
  declare _texGrids: (Rect & { texId?: number })[]
  declare _spriteTiles: { [key: number]: Sprite }

  //size of the layer in tiles
  declare _layerSize: Size
  declare _mapTileSize: Size
  //TMX Layer supports opacity
  _opacity = 255
  declare _minGID: number
  declare _maxGID: number
  //Only used when vertexZ is used
  declare _vertexZvalue: number
  declare _useAutomaticVertexZ: boolean
  //used for optimization
  // declare _reusedTile: any
  // declare _atlasIndexArray: any
  //used for retina display
  // declare _contentScaleFactor: number

  /**
   * Creates a TMXLayer with an tile set info, a layer info and a map info   <br/>
   * Constructor of TMXLayer
   * @param {TMXTilesetInfo} tilesetInfo
   * @param {TMXLayerInfo} layerInfo
   * @param {TMXMapInfo} mapInfo
   */
  constructor(tilesetInfo?: TMXTilesetInfo, layerInfo?: TMXLayerInfo, mapInfo?: TMXMapInfo) {
    super()
    // this._descendants = []

    this._layerSize = Size(0, 0)
    this._mapTileSize = Size(0, 0)
    this._spriteTiles = {}

    if (mapInfo !== undefined) this.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo)
  }

  _createRenderCmd() {
    return new TMXLayerWebGLRenderCmd(this)
  }

  _fillTextureGrids(tileset: TMXTilesetInfo, texId: number) {
    const tex = this._textures[texId]
    if (!tex.isLoaded()) {
      tex.addEventListener(
        'load',
        () => {
          this._fillTextureGrids(tileset, texId)
        },
        this,
      )
      return
    }
    if (!tileset.imageSize.width || !tileset.imageSize.height) {
      tileset.imageSize.width = tex._getWidth()
      tileset.imageSize.height = tex._getHeight()
    }
    const tw = tileset._tileSize.width
    const th = tileset._tileSize.height
    const imageW = tex._contentSize.width
    const imageH = tex._contentSize.height
    const spacing = tileset.spacing
    const margin = tileset.margin
    const cols = Math.floor((imageW - margin * 2 + spacing) / (tw + spacing))
    const rows = Math.floor((imageH - margin * 2 + spacing) / (th + spacing))
    const count = rows * cols
    let gid = tileset.firstGid
    const maxGid = tileset.firstGid + count
    const grids = this._texGrids
    let grid: any
    let override = grids[gid] ? true : false

    for (; gid < maxGid; ++gid) {
      // Avoid overlapping
      if (override && !grids[gid]) {
        override = false
      }
      if (!override && grids[gid]) {
        break
      }

      grid = {
        texId: texId,
        x: 0,
        y: 0,
        width: tw,
        height: th,
        t: 0,
        l: 0,
        r: 0,
        b: 0,
      }
      tileset.rectForGID(gid, grid)
      grid.t = grid.y / imageH
      grid.l = grid.x / imageW
      grid.r = (grid.x + grid.width) / imageW
      grid.b = (grid.y + grid.height) / imageH
      grids[gid] = grid
    }
  }

  /**
   * Initializes a TMXLayer with a tileset info, a layer info and a map info
   * @param {TMXTilesetInfo} tilesetInfo
   * @param {TMXLayerInfo} layerInfo
   * @param {TMXMapInfo} mapInfo
   * @return {Boolean}
   */
  initWithTilesetInfo(tilesetInfo: TMXTilesetInfo, layerInfo: TMXLayerInfo, mapInfo: TMXMapInfo): boolean {
    const size = layerInfo._layerSize
    // const totalNumberOfTiles = (size.width * size.height) | 0

    // layerInfo
    this.layerName = layerInfo.name
    this.tiles = layerInfo._tiles
    this.properties = layerInfo.properties
    this._layerSize = size
    this._minGID = layerInfo._minGID
    this._maxGID = layerInfo._maxGID
    this._opacity = layerInfo._opacity

    // tilesetInfo
    this.tileset = tilesetInfo

    // mapInfo
    this.layerOrientation = mapInfo.orientation
    this._mapTileSize = mapInfo.getTileSize()

    const tilesets = mapInfo._tilesets
    if (tilesets) {
      this._textures = []
      this._texGrids = []
      const len = tilesets.length
      for (let i = 0; i < len; ++i) {
        const tileset = tilesets[i]
        const tex = textureCache.addImage(tileset.sourceImage)
        this._textures.push(tex)
        this._fillTextureGrids(tileset, i)
        if (tileset === tilesetInfo) {
          this._texture = tex
        }
      }
    }

    // offset (after layer orientation is set);
    const offset = this._calculateLayerOffset(layerInfo.offset)
    this.setPosition(pointPixelsToPoints(offset))

    // Parse cocos2d properties
    this._parseInternalProperties()

    this.setContentSize(
      sizePixelsToPoints(Size(this._layerSize.width * this._mapTileSize.width, this._layerSize.height * this._mapTileSize.height)),
    )
    this._useAutomaticVertexZ = false
    this._vertexZvalue = 0
    return true
  }

  /**
   * Gets layer size.
   * @return {Size}
   */
  getLayerSize() {
    return Size(this._layerSize.width, this._layerSize.height)
  }

  /**
   * Set layer size
   * @param {Size} sz
   */
  setLayerSize(sz: Size) {
    this._layerSize.width = sz.width
    this._layerSize.height = sz.height
  }

  _getLayerWidth() {
    return this._layerSize.width
  }
  _setLayerWidth(width: number) {
    this._layerSize.width = width
  }
  _getLayerHeight() {
    return this._layerSize.height
  }
  _setLayerHeight(height: number) {
    this._layerSize.height = height
  }

  /**
   * Size of the map's tile (could be different from the tile's size)
   * @return {Size}
   */
  getMapTileSize() {
    return Size(this._mapTileSize.width, this._mapTileSize.height)
  }

  /**
   * Set the map tile size.
   * @param {Size} Var
   */
  setMapTileSize(Var: any) {
    this._mapTileSize.width = Var.width
    this._mapTileSize.height = Var.height
  }

  _getTileWidth() {
    return this._mapTileSize.width
  }
  _setTileWidth(width: number) {
    this._mapTileSize.width = width
  }
  _getTileHeight() {
    return this._mapTileSize.height
  }
  _setTileHeight(height: number) {
    this._mapTileSize.height = height
  }

  /**
   * Pointer to the map of tiles
   * @return {Array}
   */
  getTiles() {
    return this.tiles
  }

  /**
   * Pointer to the map of tiles
   * @param {Array} tiles
   */
  setTiles(tiles: Uint32Array) {
    this.tiles = tiles
  }

  /**
   * Tile set information for the layer
   * @return {TMXTilesetInfo}
   */
  getTileset() {
    return this.tileset
  }

  /**
   * Tile set information for the layer
   * @param {TMXTilesetInfo} info
   */
  setTileset(info: TMXTilesetInfo) {
    this.tileset = info
  }

  /**
   * Layer orientation, which is the same as the map orientation
   * @return {Number}
   */
  getLayerOrientation() {
    return this.layerOrientation
  }

  /**
   * Layer orientation, which is the same as the map orientation
   * @param {Number} orientation
   */
  setLayerOrientation(orientation: number) {
    this.layerOrientation = orientation
  }

  /**
   * properties from the layer. They can be added using Tiled
   * @return {Array}
   */
  getProperties() {
    return this.properties
  }

  /**
   * properties from the layer. They can be added using Tiled
   * @param {Array} properties
   */
  setProperties(properties: any) {
    this.properties = properties
  }

  /**
   * Return the value for the specific property name
   * @param {String} propertyName
   * @return {*}
   */
  getProperty(propertyName: string) {
    return this.properties[propertyName]
  }

  /**
   * Gets the layer name
   * @return {String}
   */
  getLayerName() {
    return this.layerName
  }

  /**
   * Set the layer name
   * @param {String} layerName
   */
  setLayerName(layerName: string) {
    this.layerName = layerName
  }

  /**
   * <p>Dealloc the map that contains the tile position from memory. <br />
   * Unless you want to know at runtime the tiles positions, you can safely call this method. <br />
   * If you are going to call layer.getTileGIDAt() then, don't release the map</p>
   */
  releaseMap() {
    this._spriteTiles = {}
  }

  /**
   * <p>Returns the tile (Sprite) at a given a tile coordinate. <br/>
   * The returned Sprite will be already added to the TMXLayer. Don't add it again.<br/>
   * The Sprite can be treated like any other Sprite: rotated, scaled, translated, opacity, color, etc. <br/>
   * You can remove either by calling: <br/>
   * - layer.removeChild(sprite, cleanup); <br/>
   * - or layer.removeTileAt(ccp(x,y)); </p>
   * @param {Point|Number} pos or x
   * @param {Number} [y]
   * @return {Sprite}
   */
  getTileAt(pos: any, y?: number) {
    if (pos === undefined) {
      throw new Error('TMXLayer.getTileAt(): pos should be non-null')
    }
    let x = pos
    if (y === undefined) {
      x = pos.x
      y = pos.y
    }
    if (x >= this._layerSize.width || y >= this._layerSize.height || x < 0 || y < 0) {
      throw new Error('TMXLayer.getTileAt(): invalid position')
    }
    if (!this.tiles) {
      log('TMXLayer.getTileAt(): TMXLayer: the tiles map has been released')
      return null
    }

    let tile = null
    const gid = this.getTileGIDAt(x, y)

    // if GID == 0, then no tile is present
    if (gid === 0) {
      return tile
    }

    const z = 0 | (x + y * this._layerSize.width)
    tile = this._spriteTiles[z]
    // tile not created yet. create it
    if (!tile) {
      let rect = this._texGrids[gid]
      const tex = this._textures[rect.texId]
      rect = rectPixelsToPoints(rect)

      tile = new Sprite(tex, rect)
      tile.setPosition(this.getPositionAt(x, y))
      const vertexZ = this._vertexZForPos(x, y)
      tile.setVertexZ(vertexZ)
      tile.setAnchorPoint(0, 0)
      tile.setOpacity(this._opacity)

      this.addChild(tile, vertexZ, z)
    }
    return tile
  }

  /**
   * Returns the tile gid at a given tile coordinate. <br />
   * if it returns 0, it means that the tile is empty. <br />
   * This method requires the the tile map has not been previously released (eg. don't call layer.releaseMap())<br />
   * @param {Point|Number} pos or x
   * @param {Number} [y]
   * @return {Number}
   */
  getTileGIDAt(pos: any, y?: number) {
    if (pos === undefined) {
      throw new Error('TMXLayer.getTileGIDAt(): pos should be non-null')
    }
    let x = pos
    if (y === undefined) {
      x = pos.x
      y = pos.y
    }
    if (x >= this._layerSize.width || y >= this._layerSize.height || x < 0 || y < 0) {
      throw new Error('TMXLayer.getTileGIDAt(): invalid position')
    }
    if (!this.tiles) {
      log('TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released')
      return null
    }

    const idx = 0 | (x + y * this._layerSize.width)
    // Bits on the far end of the 32-bit global tile ID are used for tile flags
    const tile = this.tiles[idx]

    return (tile & TMX_TILE_FLIPPED_MASK) >>> 0
  }

  /**
   * <p>Sets the tile gid (gid = tile global id) at a given tile coordinate.<br />
   * The Tile GID can be obtained by using the method "tileGIDAt" or by using the TMX editor . Tileset Mgr +1.<br />
   * If a tile is already placed at that position, then it will be removed.</p>
   * @param {Number} gid
   * @param {Point|Number} posOrX position or x
   * @param {Number} flagsOrY flags or y
   * @param {Number} [flags]
   */
  setTileGID(gid: number, posOrX: any, flagsOrY?: number, flags?: number) {
    if (posOrX === undefined) {
      throw new Error('TMXLayer.setTileGID(): pos should be non-null')
    }
    let pos: Point
    if (flags !== undefined) {
      pos = p(posOrX, flagsOrY)
    } else {
      pos = posOrX
      flags = flagsOrY
    }
    if (pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0) {
      throw new Error('TMXLayer.setTileGID(): invalid position')
    }
    if (!this.tiles) {
      log('TMXLayer.setTileGID(): TMXLayer: the tiles map has been released')
      return
    }
    if (gid !== 0 && gid < this.tileset.firstGid) {
      log(`TMXLayer.setTileGID(): invalid gid:${gid}`)
      return
    }

    flags = flags || 0
    const currentFlags = this.getTileFlagsAt(pos)
    const currentGID = this.getTileGIDAt(pos)

    if (currentGID !== gid || currentFlags !== flags) {
      const gidAndFlags = (gid | flags) >>> 0
      // setting gid=0 is equal to remove the tile
      if (gid === 0) this.removeTileAt(pos)
      else if (currentGID === 0)
        // empty tile. create a new one
        this._updateTileForGID(gidAndFlags, pos)
      else {
        // modifying an existing tile with a non-empty tile
        const z = pos.x + pos.y * this._layerSize.width
        const sprite = this.getChildByTag(z) as Sprite
        if (sprite) {
          let rect = this._texGrids[gid]
          const tex = this._textures[rect.texId]
          rect = rectPixelsToPoints(rect)
          sprite.setTexture(tex)
          sprite.setTextureRect(rect, false)
          if (flags != null) this._setupTileSprite(sprite, pos, gidAndFlags)

          this.tiles[z] = gidAndFlags
        } else {
          this._updateTileForGID(gidAndFlags, pos)
        }
      }
    }
  }

  addChild(child: Sprite, localZOrder?: number, tag?: number) {
    super.addChild(child, localZOrder, tag)
    if (tag !== undefined) {
      this._spriteTiles[tag] = child
      child.setVertexZ(this._vertexZ + (renderer.assignedZStep * tag) / this.tiles.length)
      // child._renderCmd._needDraw = false;
    }
  }

  removeChild(child: Node, cleanup?: boolean) {
    if (this._spriteTiles[child.tag]) {
      this._spriteTiles[child.tag] = null
      // child._renderCmd._needDraw = true;
    }
    super.removeChild(child, cleanup)
  }

  /**
   *  lipped tiles can be changed dynamically
   * @param {Point|Number} pos or x
   * @param {Number} [y]
   * @return {Number}
   */
  getTileFlagsAt(pos: Point, y?: number) {
    if (!pos) throw new Error('TMXLayer.getTileFlagsAt(): pos should be non-null')
    if (y !== undefined) pos = p(pos, y)
    if (pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
      throw new Error('TMXLayer.getTileFlagsAt(): invalid position')
    if (!this.tiles) {
      log('TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released')
      return null
    }

    const idx = 0 | (pos.x + pos.y * this._layerSize.width)
    // Bits on the far end of the 32-bit global tile ID are used for tile flags
    const tile = this.tiles[idx]

    return (tile & TMX_TILE_FLIPPED_ALL) >>> 0
  }

  /**
   * Removes a tile at given tile coordinate
   * @param {Point|Number} pos position or x
   * @param {Number} [y]
   */
  removeTileAt(pos: Point, y?: number) {
    if (!pos) {
      throw new Error('TMXLayer.removeTileAt(): pos should be non-null')
    }
    if (y !== undefined) {
      pos = p(pos, y)
    }
    if (pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0) {
      throw new Error('TMXLayer.removeTileAt(): invalid position')
    }
    if (!this.tiles) {
      log('TMXLayer.removeTileAt(): TMXLayer: the tiles map has been released')
      return
    }

    const gid = this.getTileGIDAt(pos)
    if (gid !== 0) {
      const z = 0 | (pos.x + pos.y * this._layerSize.width)
      // remove tile from GID map
      this.tiles[z] = 0

      // remove it from sprites and/or texture atlas
      const sprite = this._spriteTiles[z]
      if (sprite) {
        this.removeChild(sprite, true)
      }
    }
  }

  /**
   * Returns the position in pixels of a given tile coordinate
   * @param {Point|Number} pos position or x
   * @param {Number} [y]
   * @return {Point}
   */
  getPositionAt(pos: any, y?: number) {
    if (y !== undefined) pos = p(pos, y)
    let ret = p(0, 0)
    switch (this.layerOrientation) {
      case TMX_ORIENTATION_ORTHO:
        ret = this._positionForOrthoAt(pos)
        break
      case TMX_ORIENTATION_ISO:
        ret = this._positionForIsoAt(pos)
        break
      case TMX_ORIENTATION_HEX:
        ret = this._positionForHexAt(pos)
        break
    }
    return pointPixelsToPoints(ret)
  }

  _positionForIsoAt(pos: Point) {
    return p(
      (this._mapTileSize.width / 2) * (this._layerSize.width + pos.x - pos.y - 1),
      (this._mapTileSize.height / 2) * (this._layerSize.height * 2 - pos.x - pos.y - 2),
    )
  }

  _positionForOrthoAt(pos: Point) {
    return p(pos.x * this._mapTileSize.width, (this._layerSize.height - pos.y - 1) * this._mapTileSize.height)
  }

  _positionForHexAt(pos: Point) {
    const diffY = pos.x % 2 === 1 ? -this._mapTileSize.height / 2 : 0
    return p((pos.x * this._mapTileSize.width * 3) / 4, (this._layerSize.height - pos.y - 1) * this._mapTileSize.height + diffY)
  }

  _calculateLayerOffset(pos: Point) {
    let ret = p(0, 0)
    switch (this.layerOrientation) {
      case TMX_ORIENTATION_ORTHO:
        ret = p(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height)
        break
      case TMX_ORIENTATION_ISO:
        ret = p((this._mapTileSize.width / 2) * (pos.x - pos.y), (this._mapTileSize.height / 2) * (-pos.x - pos.y))
        break
      case TMX_ORIENTATION_HEX:
        if (pos.x !== 0 || pos.y !== 0) log('offset for hexagonal map not implemented yet')
        break
    }
    return ret
  }

  _updateTileForGID(gid: number, pos: Point) {
    if (!this._texGrids[gid]) {
      return
    }

    const idx = 0 | (pos.x + pos.y * this._layerSize.width)
    if (idx < this.tiles.length) {
      this.tiles[idx] = gid
    }
  }

  //The layer recognizes some special properties, like cc_vertez
  _parseInternalProperties() {
    // if cc_vertex=automatic, then tiles will be rendered using vertexz
    const vertexz = this.getProperty('cc_vertexz')
    if (vertexz) {
      if (vertexz === 'automatic') {
        this._useAutomaticVertexZ = true
        const alphaFuncVal = this.getProperty('cc_alpha_func')
        let alphaFuncValue = 0
        if (alphaFuncVal) alphaFuncValue = parseFloat(alphaFuncVal)

        //todo: need move to WebGL render cmd
        this.setShaderProgram(shaderCache.programForKey(SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST))
        // NOTE: alpha test shader is hard-coded to use the equivalent of a glAlphaFunc(GL_GREATER) comparison
        this.getShaderProgram().use()
        this.getShaderProgram().setUniformLocationWith1f(UNIFORM_ALPHA_TEST_VALUE_S, alphaFuncValue)
      } else this._vertexZvalue = parseInt(vertexz, 10)
    }
  }

  _setupTileSprite(sprite: Sprite, pos: Point, gid: number) {
    // const z = pos.x + pos.y * this._layerSize.width
    const posInPixel = this.getPositionAt(pos)
    sprite.setPosition(posInPixel)
    sprite.setVertexZ(this._vertexZForPos(pos))
    sprite.setAnchorPoint(0, 0)
    sprite.setOpacity(this._opacity)
    sprite.setFlippedX(false)
    sprite.setFlippedY(false)
    sprite.setRotation(0.0)

    // Rotation in tiled is achieved using 3 flipped states, flipping across the horizontal, vertical, and diagonal axes of the tiles.
    if ((gid & TMX_TILE_DIAGONAL_FLAG) >>> 0) {
      // put the anchor in the middle for ease of rotation.
      sprite.setAnchorPoint(0.5, 0.5)
      sprite.setPosition(posInPixel.x + sprite._getWidth() / 2, posInPixel.y + sprite._getHeight() / 2)

      const flag = (gid & ((TMX_TILE_HORIZONTAL_FLAG | TMX_TILE_VERTICAL_FLAG) >>> 0)) >>> 0
      // handle the 4 diagonally flipped states.
      if (flag === TMX_TILE_HORIZONTAL_FLAG) sprite.setRotation(90)
      else if (flag === TMX_TILE_VERTICAL_FLAG) sprite.setRotation(270)
      else if (flag === (TMX_TILE_VERTICAL_FLAG | TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
        sprite.setRotation(90)
        sprite.setFlippedX(true)
      } else {
        sprite.setRotation(270)
        sprite.setFlippedX(true)
      }
    } else {
      if ((gid & TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
        sprite.setFlippedX(true)
      }
      if ((gid & TMX_TILE_VERTICAL_FLAG) >>> 0) {
        sprite.setFlippedY(true)
      }
    }
  }

  _vertexZForPos(x: any, y?: number) {
    if (y === undefined) {
      y = x.y
      x = x.x
    }
    let ret = 0
    let maxVal
    if (this._useAutomaticVertexZ) {
      switch (this.layerOrientation) {
        case TMX_ORIENTATION_ISO:
          maxVal = this._layerSize.width + this._layerSize.height
          ret = -(maxVal - (x + y))
          break
        case TMX_ORIENTATION_ORTHO:
          ret = -(this._layerSize.height - y)
          break
        case TMX_ORIENTATION_HEX:
          log('TMX Hexa zOrder not supported')
          break
        default:
          log('TMX invalid value')
          break
      }
    } else {
      ret = this._vertexZvalue
    }
    return ret
  }
}

const _p = TMXLayer.prototype

// Extended properties
defineGetterSetter(_p, 'layerWidth', _p._getLayerWidth, _p._setLayerWidth)
defineGetterSetter(_p, 'layerHeight', _p._getLayerHeight, _p._setLayerHeight)
defineGetterSetter(_p, 'tileWidth', _p._getTileWidth, _p._setTileWidth)
defineGetterSetter(_p, 'tileHeight', _p._getTileHeight, _p._setTileHeight)
