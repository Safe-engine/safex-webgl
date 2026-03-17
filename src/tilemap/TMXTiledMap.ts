import { Node, Size } from '../core'
import { log } from '../helper/Debugger'
import { TMXLayer } from './TMXLayer'
import { TMXMapInfo } from './TMXMapInfo'
import { TMX_TILE_FLIPPED_MASK } from './TMXXMLParser'

/**
 Orthogonal orientation
 * @constant
 * @type Number
 */
export const TMX_ORIENTATION_ORTHO = 0

/**
 * Hexagonal orientation
 * @constant
 * @type Number
 */

export const TMX_ORIENTATION_HEX = 1

/**
 * Isometric orientation
 * @constant
 * @type Number
 */
export const TMX_ORIENTATION_ISO = 2

export class TMXTiledMap extends Node {
  properties: any = null
  mapOrientation: any = null
  objectGroups: any = null

  //the map's size property measured in tiles
  _mapSize: any = null
  _tileSize: any = null
  //tile properties
  _tileProperties: any = null
  _className = 'TMXTiledMap'

  /**
   * Creates a TMX Tiled Map with a TMX file  or content string. <br/>
   * Constructor of TMXTiledMap
   * @param {String} tmxFile tmxFile fileName or content string
   * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required.
   */
  constructor(tmxFile?: any, resourcePath?: any) {
    super()
    this._mapSize = Size(0, 0)
    this._tileSize = Size(0, 0)

    if (resourcePath !== undefined) {
      this.initWithXML(tmxFile, resourcePath)
    } else if (tmxFile !== undefined) {
      this.initWithTMXFile(tmxFile)
    }
  }

  /**
   * Gets the map size.
   * @return {Size}
   */
  getMapSize() {
    return Size(this._mapSize.width, this._mapSize.height)
  }

  /**
   * Set the map size.
   * @param {Size} Var
   */
  setMapSize(Var: any) {
    this._mapSize.width = Var.width
    this._mapSize.height = Var.height
  }

  _getMapWidth() {
    return this._mapSize.width
  }
  _setMapWidth(width: any) {
    this._mapSize.width = width
  }
  _getMapHeight() {
    return this._mapSize.height
  }
  _setMapHeight(height: any) {
    this._mapSize.height = height
  }

  /**
   * Gets the tile size.
   * @return {Size}
   */
  getTileSize() {
    return Size(this._tileSize.width, this._tileSize.height)
  }

  /**
   * Set the tile size
   * @param {Size} Var
   */
  setTileSize(Var: any) {
    this._tileSize.width = Var.width
    this._tileSize.height = Var.height
  }

  _getTileWidth() {
    return this._tileSize.width
  }
  _setTileWidth(width: any) {
    this._tileSize.width = width
  }
  _getTileHeight() {
    return this._tileSize.height
  }
  _setTileHeight(height: any) {
    this._tileSize.height = height
  }

  /**
   * map orientation
   * @return {Number}
   */
  getMapOrientation() {
    return this.mapOrientation
  }

  /**
   * map orientation
   * @param {Number} Var
   */
  setMapOrientation(Var: any) {
    this.mapOrientation = Var
  }

  /**
   * object groups
   * @return {Array}
   */
  getObjectGroups() {
    return this.objectGroups
  }

  /**
   * object groups
   * @param {Array} Var
   */
  setObjectGroups(Var: any) {
    this.objectGroups = Var
  }

  /**
   * Gets the properties
   * @return {object}
   */
  getProperties() {
    return this.properties
  }

  /**
   * Set the properties
   * @param {object} Var
   */
  setProperties(Var: any) {
    this.properties = Var
  }

  /**
   * Initializes the instance of TMXTiledMap with tmxFile
   * @param {String} tmxFile
   * @return {Boolean} Whether the initialization was successful.
   * @example
   * //example
   * var map = new TMXTiledMap()
   * map.initWithTMXFile("hello.tmx");
   */
  initWithTMXFile(tmxFile: any) {
    if (!tmxFile || tmxFile.length === 0)
      throw new Error('TMXTiledMap.initWithTMXFile(): tmxFile should be non-null or non-empty string.')
    this.width = 0
    this.height = 0
    const mapInfo = new TMXMapInfo(tmxFile)
    if (!mapInfo) return false

    const locTilesets = mapInfo.getTilesets()
    if (!locTilesets || locTilesets.length === 0) log('TMXTiledMap.initWithTMXFile(): Map not found. Please check the filename.')
    this._buildWithMapInfo(mapInfo)
    return true
  }

  /**
   * Initializes the instance of TMXTiledMap with tmxString
   * @param {String} tmxString
   * @param {String} resourcePath
   * @return {Boolean} Whether the initialization was successful.
   */
  initWithXML(tmxString: any, resourcePath: any) {
    this.width = 0
    this.height = 0

    const mapInfo = new TMXMapInfo(tmxString, resourcePath)
    const locTilesets = mapInfo.getTilesets()
    if (!locTilesets || locTilesets.length === 0) log('TMXTiledMap.initWithXML(): Map not found. Please check the filename.')
    this._buildWithMapInfo(mapInfo)
    return true
  }

  _buildWithMapInfo(mapInfo: any) {
    this._mapSize = mapInfo.getMapSize()
    this._tileSize = mapInfo.getTileSize()
    this.mapOrientation = mapInfo.orientation
    this.objectGroups = mapInfo.getObjectGroups()
    this.properties = mapInfo.properties
    this._tileProperties = mapInfo.getTileProperties()

    let idx = 0
    const layers = mapInfo.getLayers()
    if (layers) {
      let layerInfo
      for (let i = 0, len = layers.length; i < len; i++) {
        layerInfo = layers[i]
        if (layerInfo && layerInfo.visible) {
          const child = this._parseLayer(layerInfo, mapInfo)
          this.addChild(child, idx, idx)
          // update content size with the max size
          this.width = Math.max(this.width, child.width)
          this.height = Math.max(this.height, child.height)
          idx++
        }
      }
    }
  }

  /**
   * Return All layers array.
   * @returns {Array}
   */
  allLayers() {
    const retArr = [],
      locChildren = this._children
    for (let i = 0, len = locChildren.length; i < len; i++) {
      const layer = locChildren[i]
      if (layer && layer instanceof TMXLayer) retArr.push(layer)
    }
    return retArr
  }

  /**
   * return the TMXLayer for the specific layer
   * @param {String} layerName
   * @return {TMXLayer}
   */
  getLayer(layerName: any) {
    if (!layerName || layerName.length === 0) throw new Error('TMXTiledMap.getLayer(): layerName should be non-null or non-empty string.')
    const locChildren = this._children
    for (let i = 0; i < locChildren.length; i++) {
      const layer = locChildren[i]
      if (layer && (layer as any).layerName === layerName) return layer
    }
    // layer not found
    return null
  }

  /**
   * Return the TMXObjectGroup for the specific group
   * @param {String} groupName
   * @return {TMXObjectGroup}
   */
  getObjectGroup(groupName: any) {
    if (!groupName || groupName.length === 0)
      throw new Error('TMXTiledMap.getObjectGroup(): groupName should be non-null or non-empty string.')
    if (this.objectGroups) {
      for (let i = 0; i < this.objectGroups.length; i++) {
        const objectGroup = this.objectGroups[i]
        if (objectGroup && objectGroup.groupName === groupName) {
          return objectGroup
        }
      }
    }
    // objectGroup not found
    return null
  }

  /**
   * Return the value for the specific property name
   * @param {String} propertyName
   * @return {String}
   */
  getProperty(propertyName: any) {
    return this.properties[propertyName.toString()]
  }

  /**
   * Return properties dictionary for tile GID
   * @param {Number} GID
   * @return {object}
   * @deprecated
   */
  propertiesForGID(GID: any) {
    log('propertiesForGID is deprecated. Please use getPropertiesForGID instead.')
    return this.getPropertiesForGID(GID)
  }

  /**
   * Return properties dictionary for tile GID
   * @param {Number} GID
   * @return {object}
   */
  getPropertiesForGID(GID: any) {
    return this._tileProperties[GID]
  }

  _parseLayer(layerInfo: any, mapInfo: any) {
    const tileset = this._tilesetForLayer(layerInfo, mapInfo)
    const layer = new TMXLayer(tileset, layerInfo, mapInfo)
    // tell the layerinfo to release the ownership of the tiles map.
    layerInfo.ownTiles = false
    return layer
  }

  _tilesetForLayer(layerInfo: any, mapInfo: any) {
    const size = layerInfo._layerSize
    const tilesets = mapInfo.getTilesets()
    if (tilesets) {
      for (let i = tilesets.length - 1; i >= 0; i--) {
        const tileset = tilesets[i]
        if (tileset) {
          for (let y = 0; y < size.height; y++) {
            for (let x = 0; x < size.width; x++) {
              const pos = x + size.width * y
              const gid = layerInfo._tiles[pos]
              if (gid !== 0) {
                // Optimization: quick return
                // if the layer is invalid (more than 1 tileset per layer) an assert will be thrown later
                if ((gid & TMX_TILE_FLIPPED_MASK) >>> 0 >= tileset.firstGid) {
                  return tileset
                }
              }
            }
          }
        }
      }
    }

    // If all the tiles are 0, return empty tileset
    log(`cocos2d: Warning: TMX Layer ${layerInfo.name} has no tiles`)
    return null
  }

  /** @expose */
  get mapWidth() {
    return this._getMapWidth()
  }
  set mapWidth(width: any) {
    this._setMapWidth(width)
  }

  /** @expose */
  get mapHeight() {
    return this._getMapHeight()
  }
  set mapHeight(height: any) {
    this._setMapHeight(height)
  }

  /** @expose */
  get tileWidth() {
    return this._getTileWidth()
  }
  set tileWidth(width: any) {
    this._setTileWidth(width)
  }

  /** @expose */
  get tileHeight() {
    return this._getTileHeight()
  }
  set tileHeight(height: any) {
    this._setTileHeight(height)
  }

  /**
   * Creates a TMX Tiled Map with a TMX file  or content string.
   * Implementation TMXTiledMap
   * @deprecated since v3.0 please use new TMXTiledMap(tmxFile,resourcePath) instead.
   * @param {String} tmxFile tmxFile fileName or content string
   * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required.
   * @return {TMXTiledMap|undefined}
   */
  static create(tmxFile: any, resourcePath?: any) {
    return new TMXTiledMap(tmxFile, resourcePath)
  }
}
