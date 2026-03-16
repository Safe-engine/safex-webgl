import { Rect, Size } from '../core'

export const TMX_PROPERTY_NONE = 0

/**
 * @constant
 * @type Number
 */
export const TMX_PROPERTY_MAP = 1

/**
 * @constant
 * @type Number
 */
export const TMX_PROPERTY_LAYER = 2

/**
 * @constant
 * @type Number
 */
export const TMX_PROPERTY_OBJECTGROUP = 3

/**
 * @constant
 * @type Number
 */
export const TMX_PROPERTY_OBJECT = 4

/**
 * @constant
 * @type Number
 */
export const TMX_PROPERTY_TILE = 5

/**
 * @constant
 * @type Number
 */
export const TMX_TILE_HORIZONTAL_FLAG = 0x80000000

/**
 * @constant
 * @type Number
 */
export const TMX_TILE_VERTICAL_FLAG = 0x40000000

/**
 * @constant
 * @type Number
 */
export const TMX_TILE_DIAGONAL_FLAG = 0x20000000

/**
 * @constant
 * @type Number
 */
export const TMX_TILE_FLIPPED_ALL = (TMX_TILE_HORIZONTAL_FLAG | TMX_TILE_VERTICAL_FLAG | TMX_TILE_DIAGONAL_FLAG) >>> 0

/**
 * @constant
 * @type Number
 */
export const TMX_TILE_FLIPPED_MASK = ~TMX_TILE_FLIPPED_ALL >>> 0

/**
 * <p>TMXTilesetInfo contains the information about the tilesets like: <br />
 * - Tileset name<br />
 * - Tileset spacing<br />
 * - Tileset margin<br />
 * - size of the tiles<br />
 * - Image used for the tiles<br />
 * - Image size<br />
 *
 * This information is obtained from the TMX file. </p>
 * @class
 * @extends Class
 *
 * @property {string} name - Tileset name
 * @property {number} firstGid - First grid
 * @property {number} spacing - Spacing
 * @property {number} margin - Margin
 * @property {string} sourceImage - Filename containing the tiles (should be sprite sheet / texture atlas)
 * @property {Size|null} imageSize - Size in pixels of the image
 */
export class TMXTilesetInfo {
  constructor() {
    this.name = ''
    this.firstGid = 0
    this._tileSize = null
    this.spacing = 0
    this.margin = 0
    this.sourceImage = ''
    this.imageSize = null

    this._tileSize = Size(0, 0)
    this.imageSize = Size(0, 0)
  }

  /**
   * Return rect
   * @param {Number} gid
   * @return {Rect}
   */
  rectForGID(gid, result) {
    const rect = result || Rect(0, 0, 0, 0)
    rect.width = this._tileSize.width
    rect.height = this._tileSize.height
    gid &= TMX_TILE_FLIPPED_MASK
    gid = gid - parseInt(this.firstGid, 10)
    const max_x = parseInt((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing), 10)
    rect.x = parseInt((gid % max_x) * (this._tileSize.width + this.spacing) + this.margin, 10)
    rect.y = parseInt(parseInt(gid / max_x, 10) * (this._tileSize.height + this.spacing) + this.margin, 10)
    return rect
  }
}
