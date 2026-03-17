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
