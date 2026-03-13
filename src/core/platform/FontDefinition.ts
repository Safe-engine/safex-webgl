import { color } from './Color'
import { TEXT_ALIGNMENT_CENTER, VERTICAL_TEXT_ALIGNMENT_TOP } from './Types'

/**
 * Common usage:
 *
 * var fontDef = new FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = 12;
 * ...
 *
 * OR using inline definition useful for constructor injection
 *
 * var fontDef = new FontDefinition({
 *  fontName: "Arial",
 *  fontSize: 12
 * });
 *
 *
 *
 * @class FontDefinition
 * @param {Object} properties - (OPTIONAL) Allow inline FontDefinition
 * @constructor
 */
export class FontDefinition {
  fontName = 'Arial'
  fontSize = 12
  textAlign = TEXT_ALIGNMENT_CENTER
  verticalAlign = VERTICAL_TEXT_ALIGNMENT_TOP
  fillStyle = color(255, 255, 255, 255)
  boundingWidth = 0
  boundingHeight = 0

  strokeEnabled = false
  strokeStyle = color(255, 255, 255, 255)
  lineWidth = 1
  lineHeight = 'normal'
  fontStyle = 'normal'
  fontWeight = 'normal'

  shadowEnabled = false
  shadowOffsetX = 0
  shadowOffsetY = 0
  shadowBlur = 0
  shadowOpacity = 1.0

  constructor(properties?: any) {
    if (properties && typeof properties === 'object') {
      for (const key in properties) {
        ;(this as any)[key] = properties[key]
      }
    }
  }

  /**
   * Web ONLY
   */
  _getCanvasFontStr(): string {
    const lineHeight = typeof this.lineHeight !== 'string' ? `${this.lineHeight}px` : this.lineHeight
    return `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px/${lineHeight} '${this.fontName}'`
  }
}
