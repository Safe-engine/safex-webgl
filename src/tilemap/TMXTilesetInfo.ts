import { Rect, Size } from '../core'
import { TMX_TILE_FLIPPED_MASK } from './TMXXMLParser'

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
  name: string
  firstGid: string
  _tileSize: Size
  spacing: number
  margin: number
  sourceImage: string
  imageSize: Size

  constructor() {
    this.name = ''
    this.firstGid = '0'
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
