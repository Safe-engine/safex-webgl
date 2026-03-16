import { Node } from '../core'
import { log } from '../helper/Debugger'
import { defineGetterSetter } from '../helper/getset'
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

export const TMXTiledMap = Node.extend(
  /** @lends TMXTiledMap# */ {
    properties: null,
    mapOrientation: null,
    objectGroups: null,

    //the map's size property measured in tiles
    _mapSize: null,
    _tileSize: null,
    //tile properties
    _tileProperties: null,
    _className: 'TMXTiledMap',

    /**
     * Creates a TMX Tiled Map with a TMX file  or content string. <br/>
     * Constructor of TMXTiledMap
     * @param {String} tmxFile tmxFile fileName or content string
     * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required.
     */
    ctor: function (tmxFile, resourcePath) {
      Node.prototype.ctor.call(this)
      this._mapSize = size(0, 0)
      this._tileSize = size(0, 0)

      if (resourcePath !== undefined) {
        this.initWithXML(tmxFile, resourcePath)
      } else if (tmxFile !== undefined) {
        this.initWithTMXFile(tmxFile)
      }
    },

    /**
     * Gets the map size.
     * @return {Size}
     */
    getMapSize: function () {
      return size(this._mapSize.width, this._mapSize.height)
    },

    /**
     * Set the map size.
     * @param {Size} Var
     */
    setMapSize: function (Var) {
      this._mapSize.width = Var.width
      this._mapSize.height = Var.height
    },

    _getMapWidth: function () {
      return this._mapSize.width
    },
    _setMapWidth: function (width) {
      this._mapSize.width = width
    },
    _getMapHeight: function () {
      return this._mapSize.height
    },
    _setMapHeight: function (height) {
      this._mapSize.height = height
    },

    /**
     * Gets the tile size.
     * @return {Size}
     */
    getTileSize: function () {
      return size(this._tileSize.width, this._tileSize.height)
    },

    /**
     * Set the tile size
     * @param {Size} Var
     */
    setTileSize: function (Var) {
      this._tileSize.width = Var.width
      this._tileSize.height = Var.height
    },

    _getTileWidth: function () {
      return this._tileSize.width
    },
    _setTileWidth: function (width) {
      this._tileSize.width = width
    },
    _getTileHeight: function () {
      return this._tileSize.height
    },
    _setTileHeight: function (height) {
      this._tileSize.height = height
    },

    /**
     * map orientation
     * @return {Number}
     */
    getMapOrientation: function () {
      return this.mapOrientation
    },

    /**
     * map orientation
     * @param {Number} Var
     */
    setMapOrientation: function (Var) {
      this.mapOrientation = Var
    },

    /**
     * object groups
     * @return {Array}
     */
    getObjectGroups: function () {
      return this.objectGroups
    },

    /**
     * object groups
     * @param {Array} Var
     */
    setObjectGroups: function (Var) {
      this.objectGroups = Var
    },

    /**
     * Gets the properties
     * @return {object}
     */
    getProperties: function () {
      return this.properties
    },

    /**
     * Set the properties
     * @param {object} Var
     */
    setProperties: function (Var) {
      this.properties = Var
    },

    /**
     * Initializes the instance of TMXTiledMap with tmxFile
     * @param {String} tmxFile
     * @return {Boolean} Whether the initialization was successful.
     * @example
     * //example
     * var map = new TMXTiledMap()
     * map.initWithTMXFile("hello.tmx");
     */
    initWithTMXFile: function (tmxFile) {
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
    },

    /**
     * Initializes the instance of TMXTiledMap with tmxString
     * @param {String} tmxString
     * @param {String} resourcePath
     * @return {Boolean} Whether the initialization was successful.
     */
    initWithXML: function (tmxString, resourcePath) {
      this.width = 0
      this.height = 0

      const mapInfo = new TMXMapInfo(tmxString, resourcePath)
      const locTilesets = mapInfo.getTilesets()
      if (!locTilesets || locTilesets.length === 0) log('TMXTiledMap.initWithXML(): Map not found. Please check the filename.')
      this._buildWithMapInfo(mapInfo)
      return true
    },

    _buildWithMapInfo: function (mapInfo) {
      this._mapSize = mapInfo.getMapSize()
      this._tileSize = mapInfo.getTileSize()
      this.mapOrientation = mapInfo.orientation
      this.objectGroups = mapInfo.getObjectGroups()
      this.properties = mapInfo.properties
      this._tileProperties = mapInfo.getTileProperties()

      let idx = 0
      const layers = mapInfo.getLayers()
      if (layers) {
        let layerInfo = null
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
    },

    /**
     * Return All layers array.
     * @returns {Array}
     */
    allLayers: function () {
      const retArr = [],
        locChildren = this._children
      for (let i = 0, len = locChildren.length; i < len; i++) {
        const layer = locChildren[i]
        if (layer && layer instanceof TMXLayer) retArr.push(layer)
      }
      return retArr
    },

    /**
     * return the TMXLayer for the specific layer
     * @param {String} layerName
     * @return {TMXLayer}
     */
    getLayer: function (layerName) {
      if (!layerName || layerName.length === 0) throw new Error('TMXTiledMap.getLayer(): layerName should be non-null or non-empty string.')
      const locChildren = this._children
      for (let i = 0; i < locChildren.length; i++) {
        const layer = locChildren[i]
        if (layer && layer.layerName === layerName) return layer
      }
      // layer not found
      return null
    },

    /**
     * Return the TMXObjectGroup for the specific group
     * @param {String} groupName
     * @return {TMXObjectGroup}
     */
    getObjectGroup: function (groupName) {
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
    },

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {String}
     */
    getProperty: function (propertyName) {
      return this.properties[propertyName.toString()]
    },

    /**
     * Return properties dictionary for tile GID
     * @param {Number} GID
     * @return {object}
     * @deprecated
     */
    propertiesForGID: function (GID) {
      log('propertiesForGID is deprecated. Please use getPropertiesForGID instead.')
      return this.getPropertiesForGID[GID]
    },

    /**
     * Return properties dictionary for tile GID
     * @param {Number} GID
     * @return {object}
     */
    getPropertiesForGID: function (GID) {
      return this._tileProperties[GID]
    },

    _parseLayer: function (layerInfo, mapInfo) {
      const tileset = this._tilesetForLayer(layerInfo, mapInfo)
      const layer = new TMXLayer(tileset, layerInfo, mapInfo)
      // tell the layerinfo to release the ownership of the tiles map.
      layerInfo.ownTiles = false
      return layer
    },

    _tilesetForLayer: function (layerInfo, mapInfo) {
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
    },
  },
)

const _p = TMXTiledMap.prototype

// Extended properties
/** @expose */
_p.mapWidth
defineGetterSetter(_p, 'mapWidth', _p._getMapWidth, _p._setMapWidth)
/** @expose */
_p.mapHeight
defineGetterSetter(_p, 'mapHeight', _p._getMapHeight, _p._setMapHeight)
/** @expose */
_p.tileWidth
defineGetterSetter(_p, 'tileWidth', _p._getTileWidth, _p._setTileWidth)
/** @expose */
_p.tileHeight
defineGetterSetter(_p, 'tileHeight', _p._getTileHeight, _p._setTileHeight)

/**
 * Creates a TMX Tiled Map with a TMX file  or content string.
 * Implementation TMXTiledMap
 * @deprecated since v3.0 please use new TMXTiledMap(tmxFile,resourcePath) instead.
 * @param {String} tmxFile tmxFile fileName or content string
 * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required.
 * @return {TMXTiledMap|undefined}
 */
TMXTiledMap.create = function (tmxFile, resourcePath) {
  return new TMXTiledMap(tmxFile, resourcePath)
}
