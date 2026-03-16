// Bits on the far end of the 32-bit global tile ID (GID's) are used for tile flags

import { p } from '../core'

/**
 * <p>TMXLayerInfo contains the information about the layers like: <br />
 * - Layer name<br />
 * - Layer size <br />
 * - Layer opacity at creation time (it can be modified at runtime)  <br />
 * - Whether the layer is visible (if it's not visible, then the CocosNode won't be created) <br />
 *  <br />
 * This information is obtained from the TMX file.</p>
 * @class
 * @extends Class
 *
 * @property {Array}    properties  - Properties of the layer info.
 */
export class TMXLayerInfo {
  constructor() {
    this.properties = []
    this.name = ''
    this._layerSize = null
    this._tiles = null
    this.visible = true
    this._opacity = 0
    this.ownTiles = true
    this._minGID = 100000
    this._maxGID = 0
    this.offset = p(0, 0)
  }

  /**
   * Gets the Properties.
   * @return {Array}
   */
  getProperties() {
    return this.properties
  }

  /**
   * Set the Properties.
   * @param {object} value
   */
  setProperties(value) {
    this.properties = value
  }
}

/**
 * @constant
 * @type Number
 */
TMXLayerInfo.ATTRIB_NONE = 1 << 0
/**
 * @constant
 * @type Number
 */
TMXLayerInfo.ATTRIB_BASE64 = 1 << 1
/**
 * @constant
 * @type Number
 */
TMXLayerInfo.ATTRIB_GZIP = 1 << 2
/**
 * @constant
 * @type Number
 */
TMXLayerInfo.ATTRIB_ZLIB = 1 << 3
