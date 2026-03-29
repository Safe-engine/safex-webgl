import { director } from '../boot'
import { p, Size } from '../core'
import { _txtLoader } from '../core/platform/Loaders'
import { SAXParser } from '../core/platform/SAXParser'
import { path } from '../helper'
import { log } from '../helper/Debugger'
import { loader } from '../helper/loader'
import { decodeAsArray, uint8ArrayToUint32Array, unzipBase64AsArray, zlibDecompressBase64 } from '../helper/ZipUtils'
import { TMXLayerInfo } from './TMXLayerInfo'
import { TMXObjectGroup } from './TMXObjectGroup'
import { TMX_ORIENTATION_HEX, TMX_ORIENTATION_ISO, TMX_ORIENTATION_ORTHO } from './TMXTiledMap'
import { TMXTilesetInfo } from './TMXTilesetInfo'
import { TMX_PROPERTY_NONE } from './TMXXMLParser'

export class TMXMapInfo extends SAXParser {
  declare properties: any
  declare orientation: number
  declare parentElement: any
  declare parentGID: number
  layerAttrs = 0
  storingCharacters = false
  declare tmxFileName: string
  declare currentString: string

  declare _objectGroups: any[]
  declare _mapSize: Size
  declare _tileSize: Size
  declare _layers: TMXLayerInfo[]
  declare _tilesets: TMXTilesetInfo[]
  // tile properties
  declare _tileProperties: any
  _resources = ''
  _currentFirstGID = 0

  /**
   * Creates a TMX Format with a tmx file or content string                           <br/>
   * Constructor of TMXMapInfo
   * @param {String} tmxFile fileName or content string
   * @param {String} resourcePath  If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required.
   */
  constructor(tmxFile?: any, resourcePath?: any) {
    super()
    this._mapSize = Size(0, 0)
    this._tileSize = Size(0, 0)
    this._layers = []
    this._tilesets = []
    this._objectGroups = []
    this.properties = []
    this._tileProperties = {}

    this._currentFirstGID = 0

    if (resourcePath !== undefined) {
      this.initWithXML(tmxFile, resourcePath)
    } else if (tmxFile !== undefined) {
      this.initWithTMXFile(tmxFile)
    }
  }

  /**
   * Gets Map orientation.
   * @return {Number}
   */
  getOrientation() {
    return this.orientation
  }

  /**
   * Set the Map orientation.
   * @param {Number} value
   */
  setOrientation(value: any) {
    this.orientation = value
  }

  /**
   * Map width & height
   * @return {Size}
   */
  getMapSize() {
    return Size(this._mapSize.width, this._mapSize.height)
  }

  /**
   * Map width & height
   * @param {Size} value
   */
  setMapSize(value: Size) {
    this._mapSize.width = value.width
    this._mapSize.height = value.height
  }

  _getMapWidth() {
    return this._mapSize.width
  }

  _setMapWidth(width: number) {
    this._mapSize.width = width
  }

  _getMapHeight() {
    return this._mapSize.height
  }

  _setMapHeight(height: number) {
    this._mapSize.height = height
  }

  /**
   * Tiles width & height
   * @return {Size}
   */
  getTileSize() {
    return Size(this._tileSize.width, this._tileSize.height)
  }

  /**
   * Tiles width & height
   * @param {Size} value
   */
  setTileSize(value: Size) {
    this._tileSize.width = value.width
    this._tileSize.height = value.height
  }

  _getTileWidth() {
    return this._tileSize.width
  }

  _setTileWidth(width: number) {
    this._tileSize.width = width
  }

  _getTileHeight() {
    return this._tileSize.height
  }

  _setTileHeight(height: number) {
    this._tileSize.height = height
  }

  /**
   * Layers
   * @return {Array}
   */
  getLayers() {
    return this._layers
  }

  /**
   * Layers
   * @param {TMXLayerInfo} value
   */
  setLayers(value: TMXLayerInfo) {
    this._layers.push(value)
  }

  /**
   * tilesets
   * @return {Array}
   */
  getTilesets() {
    return this._tilesets
  }

  /**
   * tilesets
   * @param {TMXTilesetInfo} value
   */
  setTilesets(value: TMXTilesetInfo) {
    this._tilesets.push(value)
  }

  /**
   * ObjectGroups
   * @return {Array}
   */
  getObjectGroups() {
    return this._objectGroups
  }

  /**
   * ObjectGroups
   * @param {TMXObjectGroup} value
   */
  setObjectGroups(value: TMXObjectGroup) {
    this._objectGroups.push(value)
  }

  /**
   * parent element
   * @return {Object}
   */
  getParentElement() {
    return this.parentElement
  }

  /**
   * parent element
   * @param {Object} value
   */
  setParentElement(value: any) {
    this.parentElement = value
  }

  /**
   * parent GID
   * @return {Number}
   */
  getParentGID() {
    return this.parentGID
  }

  /**
   * parent GID
   * @param {Number} value
   */
  setParentGID(value: number) {
    this.parentGID = value
  }

  /**
   * Layer attribute
   * @return {Object}
   */
  getLayerAttribs() {
    return this.layerAttrs
  }

  /**
   * Layer attribute
   * @param {Object} value
   */
  setLayerAttribs(value: any) {
    this.layerAttrs = value
  }

  /**
   * Is reading storing characters stream
   * @return {Boolean}
   */
  getStoringCharacters() {
    return this.storingCharacters
  }

  /**
   * Is reading storing characters stream
   * @param {Boolean} value
   */
  setStoringCharacters(value: boolean) {
    this.storingCharacters = value
  }

  /**
   * Properties
   * @return {Array}
   */
  getProperties() {
    return this.properties
  }

  /**
   * Properties
   * @param {object} value
   */
  setProperties(value: any) {
    this.properties = value
  }

  /**
   * Initializes a TMX format with a  tmx file
   * @param {String} tmxFile
   * @return {Element}
   */
  initWithTMXFile(tmxFile: string) {
    this._internalInit(tmxFile, null)
    return this.parseXMLFile(tmxFile)
  }

  /**
   * initializes a TMX format with an XML string and a TMX resource path
   * @param {String} tmxString
   * @param {String} resourcePath
   * @return {Boolean}
   */
  initWithXML(tmxString: string, resourcePath: string) {
    this._internalInit(null, resourcePath)
    return this.parseXMLString(tmxString)
  }

  /** Initalises parsing of an XML file, either a tmx (Map) file or tsx (Tileset) file
   * @param {String} tmxFile
   * @param {boolean} [isXmlString=false]
   * @return {Element}
   */
  parseXMLFile(tmxFile: string, isXmlString = false) {
    const xmlStr = isXmlString ? tmxFile : loader.getRes(tmxFile)
    if (!xmlStr) throw new Error(`Please load the resource first : ${tmxFile}`)

    const mapXML = this._parseXML(xmlStr)
    let i, j

    // PARSE <map>
    const map = mapXML.documentElement

    const version = map.getAttribute('version')
    const orientationStr = map.getAttribute('orientation')

    if (map.nodeName === 'map') {
      if (version !== '1.0' && version !== null) log(`safex: TMXFormat: Unsupported TMX version:${version}`)

      if (orientationStr === 'orthogonal') this.orientation = TMX_ORIENTATION_ORTHO
      else if (orientationStr === 'isometric') this.orientation = TMX_ORIENTATION_ISO
      else if (orientationStr === 'hexagonal') this.orientation = TMX_ORIENTATION_HEX
      else if (orientationStr !== null) log(`safex: TMXFomat: Unsupported orientation:${orientationStr}`)

      let mapSize = Size(0, 0)
      mapSize.width = parseFloat(map.getAttribute('width'))
      mapSize.height = parseFloat(map.getAttribute('height'))
      this.setMapSize(mapSize)

      mapSize = Size(0, 0)
      mapSize.width = parseFloat(map.getAttribute('tilewidth'))
      mapSize.height = parseFloat(map.getAttribute('tileheight'))
      this.setTileSize(mapSize)

      // The parent element is the map
      const propertyArr = map.querySelectorAll('map > properties >  property')
      if (propertyArr) {
        const aPropertyDict = {}
        for (i = 0; i < propertyArr.length; i++) {
          aPropertyDict[propertyArr[i].getAttribute('name')] = propertyArr[i].getAttribute('value')
        }
        this.properties = aPropertyDict
      }
    }

    // PARSE <tileset>
    let tilesets: any = map.getElementsByTagName('tileset')
    if (map.nodeName !== 'map') {
      tilesets = []
      tilesets.push(map)
    }

    for (i = 0; i < tilesets.length; i++) {
      const selTileset = tilesets[i]
      // If this is an external tileset then start parsing that
      const tsxName = selTileset.getAttribute('source')
      if (tsxName) {
        //this._currentFirstGID = parseInt(selTileset.getAttribute('firstgid'));
        const tsxPath = isXmlString ? path.join(this._resources, tsxName) : path.changeBasename(tmxFile, tsxName)
        this.parseXMLFile(tsxPath)
      } else {
        const tileset = new TMXTilesetInfo()
        tileset.name = selTileset.getAttribute('name') || ''
        //TODO need fix
        //if(this._currentFirstGID === 0){
        tileset.firstGid = parseInt(selTileset.getAttribute('firstgid')) || 0
        //}else{
        //    tileset.firstGid = this._currentFirstGID;
        //    this._currentFirstGID = 0;
        //}

        tileset.spacing = parseInt(selTileset.getAttribute('spacing')) || 0
        tileset.margin = parseInt(selTileset.getAttribute('margin')) || 0

        const tilewidth = parseFloat(selTileset.getAttribute('tilewidth'))
        const tileheight = parseFloat(selTileset.getAttribute('tileheight'))
        const tilesetSize = Size(tilewidth, tileheight)
        tileset._tileSize = tilesetSize

        const image = selTileset.getElementsByTagName('image')[0]
        const imagename = image.getAttribute('source')
        let num = -1
        if (this.tmxFileName) num = this.tmxFileName.lastIndexOf('/')
        if (num !== -1) {
          const dir = this.tmxFileName.substr(0, num + 1)
          tileset.sourceImage = dir + imagename
        } else {
          tileset.sourceImage = this._resources + (this._resources ? '/' : '') + imagename
        }
        this.setTilesets(tileset)

        // PARSE  <tile>
        const tiles = selTileset.getElementsByTagName('tile')
        if (tiles) {
          for (let tIdx = 0; tIdx < tiles.length; tIdx++) {
            const t = tiles[tIdx]
            this.parentGID = tileset.firstGid + parseInt(t.getAttribute('id') || 0)
            const tp = t.querySelectorAll('properties > property')
            if (tp) {
              const dict = {}
              for (j = 0; j < tp.length; j++) {
                const name = tp[j].getAttribute('name')
                dict[name] = tp[j].getAttribute('value')
              }
              this._tileProperties[this.parentGID] = dict
            }
          }
        }
      }
    }

    // PARSE  <layer>
    const layers = map.getElementsByTagName('layer')
    if (layers) {
      for (i = 0; i < layers.length; i++) {
        const selLayer = layers[i]
        const data = selLayer.getElementsByTagName('data')[0]

        const layer = new TMXLayerInfo()
        layer.name = selLayer.getAttribute('name')

        const layerSize = Size(0, 0)
        layerSize.width = parseFloat(selLayer.getAttribute('width'))
        layerSize.height = parseFloat(selLayer.getAttribute('height'))
        layer._layerSize = layerSize

        const visible = selLayer.getAttribute('visible')
        layer.visible = !(visible == '0')

        const opacity = parseFloat(selLayer.getAttribute('opacity')) || 1

        if (opacity) layer._opacity = 255 * opacity
        else layer._opacity = 255
        layer.offset = p(parseFloat(selLayer.getAttribute('x')) || 0, parseFloat(selLayer.getAttribute('y')) || 0)

        let nodeValue = ''
        for (j = 0; j < data.childNodes.length; j++) {
          nodeValue += data.childNodes[j].nodeValue
        }
        nodeValue = nodeValue.trim()

        // Unpack the tilemap data
        const compression = data.getAttribute('compression')
        const encoding = data.getAttribute('encoding')
        if (compression && compression !== 'gzip' && compression !== 'zlib') {
          log('TMXMapInfo.parseXMLFile(): unsupported compression method')
          return null
        }
        let tiles
        switch (compression) {
          case 'gzip':
            tiles = unzipBase64AsArray(nodeValue, 4)
            break
          case 'zlib': {
            tiles = zlibDecompressBase64(nodeValue)
            break
          }
          case null:
          case '':
            // Uncompressed
            if (encoding === 'base64') tiles = uint8ArrayToUint32Array(decodeAsArray(nodeValue))
            else if (encoding === 'csv') {
              tiles = []
              const csvTiles = nodeValue.split(',')
              for (let csvIdx = 0; csvIdx < csvTiles.length; csvIdx++) tiles.push(parseInt(csvTiles[csvIdx]))
            } else {
              //XML format
              const selDataTiles = data.getElementsByTagName('tile')
              tiles = []
              for (let xmlIdx = 0; xmlIdx < selDataTiles.length; xmlIdx++) tiles.push(parseInt(selDataTiles[xmlIdx].getAttribute('gid')))
            }
            break
          default:
            if (this.layerAttrs === TMXLayerInfo.ATTRIB_NONE)
              log('TMXMapInfo.parseXMLFile(): Only base64 and/or gzip/zlib maps are supported')
            break
        }
        if (tiles) {
          layer._tiles = new Uint32Array(tiles)
        }

        // The parent element is the last layer
        const layerProps = selLayer.querySelectorAll('properties > property')
        if (layerProps) {
          const layerProp = {}
          for (j = 0; j < layerProps.length; j++) {
            layerProp[layerProps[j].getAttribute('name')] = layerProps[j].getAttribute('value')
          }
          layer.properties = layerProp
        }
        this.setLayers(layer)
      }
    }

    // PARSE <objectgroup>
    const objectGroups = map.getElementsByTagName('objectgroup')
    if (objectGroups) {
      for (i = 0; i < objectGroups.length; i++) {
        const selGroup = objectGroups[i]
        const objectGroup = new TMXObjectGroup()
        objectGroup.groupName = selGroup.getAttribute('name')
        objectGroup.setPositionOffset(
          p(
            parseFloat(selGroup.getAttribute('x')) * this.getTileSize().width || 0,
            parseFloat(selGroup.getAttribute('y')) * this.getTileSize().height || 0,
          ),
        )

        const groupProps = selGroup.querySelectorAll('objectgroup > properties > property')
        if (groupProps) {
          for (j = 0; j < groupProps.length; j++) {
            const groupProp: any = {}
            groupProp[groupProps[j].getAttribute('name')] = groupProps[j].getAttribute('value')
            // Add the property to the layer
            objectGroup.properties = groupProp
          }
        }

        const objects = selGroup.querySelectorAll('object')
        const getContentScaleFactor = director.getContentScaleFactor()
        if (objects) {
          for (j = 0; j < objects.length; j++) {
            const selObj = objects[j]
            // The value for "type" was blank or not a valid class name
            // Create an instance of TMXObjectInfo to store the object and its properties
            const objectProp = {}

            // Set the name of the object to the value for "name"
            objectProp['name'] = selObj.getAttribute('name') || ''

            // Assign all the attributes as key/name pairs in the properties dictionary
            objectProp['type'] = selObj.getAttribute('type') || ''

            objectProp['width'] = parseInt(selObj.getAttribute('width')) || 0
            objectProp['height'] = parseInt(selObj.getAttribute('height')) || 0

            objectProp['x'] = (Number(selObj.getAttribute('x') ?? 0) + objectGroup.getPositionOffset().x) / getContentScaleFactor
            const y = Number(selObj.getAttribute('y') ?? 0) + objectGroup.getPositionOffset().y / getContentScaleFactor
            // Correct y position. (Tiled uses Flipped, safex uses Standard)
            objectProp['y'] =
              (this.getMapSize().height * this.getTileSize().height - y - objectProp['height']) / director.getContentScaleFactor()

            objectProp['rotation'] = parseInt(selObj.getAttribute('rotation')) || 0

            const docObjProps = selObj.querySelectorAll('properties > property')
            if (docObjProps) {
              for (let k = 0; k < docObjProps.length; k++)
                objectProp[docObjProps[k].getAttribute('name')] = docObjProps[k].getAttribute('value')
            }

            //polygon
            const polygonProps = selObj.querySelectorAll('polygon')
            if (polygonProps && polygonProps.length > 0) {
              const selPgPointStr = polygonProps[0].getAttribute('points')
              if (selPgPointStr) objectProp['points'] = this._parsePointsString(selPgPointStr)
            }

            //polyline
            const polylineProps = selObj.querySelectorAll('polyline')
            if (polylineProps && polylineProps.length > 0) {
              const selPlPointStr = polylineProps[0].getAttribute('points')
              if (selPlPointStr) objectProp['polylinePoints'] = this._parsePointsString(selPlPointStr)
            }

            // Add the object to the objectGroup
            objectGroup.setObjects(objectProp)
          }
        }

        this.setObjectGroups(objectGroup)
      }
    }
    return map
  }

  _parsePointsString(pointsString: string) {
    if (!pointsString) return null

    const points = []
    const pointsStr = pointsString.split(' ')
    for (let i = 0; i < pointsStr.length; i++) {
      const selPointStr = pointsStr[i].split(',')
      points.push({ x: selPointStr[0], y: selPointStr[1] })
    }
    return points
  }

  /**
   * initializes parsing of an XML string, either a tmx (Map) string or tsx (Tileset) string
   * @param {String} xmlString
   * @return {Boolean}
   */
  parseXMLString(xmlString: string) {
    return this.parseXMLFile(xmlString, true)
  }

  /**
   * Gets the tile properties.
   * @return {object}
   */
  getTileProperties() {
    return this._tileProperties
  }

  /**
   * Set the tile properties.
   * @param {object} tileProperties
   */
  setTileProperties(tileProperties: any) {
    this._tileProperties.push(tileProperties)
  }

  /**
   * Gets the currentString
   * @return {String}
   */
  getCurrentString() {
    return this.currentString
  }

  /**
   * Set the currentString
   * @param {String} currentString
   */
  setCurrentString(currentString: string) {
    this.currentString = currentString
  }

  /**
   * Gets the tmxFileName
   * @return {String}
   */
  getTMXFileName() {
    return this.tmxFileName
  }

  /**
   * Set the tmxFileName
   * @param {String} fileName
   */
  setTMXFileName(fileName: string) {
    this.tmxFileName = fileName
  }

  _internalInit(tmxFileName: string, resourcePath: string) {
    this._tilesets.length = 0
    this._layers.length = 0

    this.tmxFileName = tmxFileName
    if (resourcePath) this._resources = resourcePath

    this._objectGroups.length = 0
    this.properties.length = 0
    this._tileProperties.length = 0

    // tmp vars
    this.currentString = ''
    this.storingCharacters = false
    this.layerAttrs = TMXLayerInfo.ATTRIB_NONE
    this.parentElement = TMX_PROPERTY_NONE
    this._currentFirstGID = 0
  }

  get mapWidth() {
    return this._getMapWidth()
  }

  set mapWidth(width: number) {
    this._setMapWidth(width)
  }

  get mapHeight() {
    return this._getMapHeight()
  }

  set mapHeight(height: number) {
    this._setMapHeight(height)
  }

  get tileWidth() {
    return this._getTileWidth()
  }

  set tileWidth(width: number) {
    this._setTileWidth(width)
  }

  get tileHeight() {
    return this._getTileHeight()
  }

  set tileHeight(height: number) {
    this._setTileHeight(height)
  }
}

loader.register(['tmx', 'tsx'], _txtLoader)
