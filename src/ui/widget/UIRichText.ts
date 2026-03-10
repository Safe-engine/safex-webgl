import { Sprite } from '../../core'
import { p, rect } from '../../core/cocoa/Geometry'
import { arrayRemoveObject } from '../../core/platform'
import { FontDefinition } from '../../core/platform/FontDefinition'
import {
  TEXT_ALIGNMENT_CENTER,
  TEXT_ALIGNMENT_LEFT,
  TEXT_ALIGNMENT_RIGHT,
  VERTICAL_TEXT_ALIGNMENT_BOTTOM,
  VERTICAL_TEXT_ALIGNMENT_CENTER,
  VERTICAL_TEXT_ALIGNMENT_TOP,
} from '../../core/platform/Types'
import { isNumber } from '../../helper/checkType'

export class RichElement {
  _type = 0
  _tag = 0
  _color: any = null
  _opacity = 0

  /**
   * Constructor of ccui.RichElement
   */
  constructor(tag?: number, color?: any, opacity?: number) {
    this._type = 0
    this._tag = tag || 0
    this._color = color(255, 255, 255, 255)
    if (color) {
      this._color.r = color.r
      this._color.g = color.g
      this._color.b = color.b
    }
    this._opacity = opacity || 0
    if (opacity === undefined) {
      this._color.a = color.a
    } else {
      this._color.a = opacity
    }
  }
}

/**
 * The text element for RichText, it has text, fontName, fontSize attributes.
 * @class
 * @extends ccui.RichElement
 */
export class RichElementText extends RichElement {
  _text = ''
  _fontName = ''
  _fontSize = 0
  /** @type FontDefinition */
  _fontDefinition: FontDefinition | null = null

  /**
   * Usage Example using FontDefinition:
   *
   * var rtEl  = new ccui.RichElementText("tag", new FontDefinition({
   *                              fillStyle: color.BLACK,
   *                              fontName: "Arial",
   *                              fontSize: 12,
   *                              fontWeight: "bold",
   *                              fontStyle: "normal",
   *                              lineHeight: 14
   *                          }), 255, "Some Text");
   *
   * Constructor of ccui.RichElementText
   * @param {Number} tag
   * @param {Color|FontDefinition} colorOrFontDef
   * @param {Number} opacity
   * @param {String} text
   * @param {String} fontName
   * @param {Number} fontSize
   */
  constructor(tag?: number, colorOrFontDef?: any, opacity?: number, text?: string, fontName?: string, fontSize?: number) {
    let color = colorOrFontDef
    if (colorOrFontDef && colorOrFontDef instanceof FontDefinition) {
      color = colorOrFontDef.fillStyle
      fontName = colorOrFontDef.fontName
      fontSize = colorOrFontDef.fontSize
      this._fontDefinition = colorOrFontDef
    } else {
      super(tag, color, opacity)
    }
    if (!this._fontDefinition) {
      super(tag, color, opacity)
    }
    this._type = RichElement.TEXT
    this._text = text || ''
    this._fontName = fontName || ''
    this._fontSize = fontSize || 0
  }

  /**
   * Create a richElementText
   * @deprecated since v3.0, please use new ccui.RichElementText() instead.
   * @param {Number} tag
   * @param {Color} color
   * @param {Number} opacity
   * @param {String} text
   * @param {String} fontName
   * @param {Number} fontSize
   * @returns {ccui.RichElementText}
   */
  static create(tag?: number, color?: any, opacity?: number, text?: string, fontName?: string, fontSize?: number): RichElementText {
    return new RichElementText(tag, color, opacity, text, fontName, fontSize)
  }
}

/**
 * The image element for RichText, it has filePath, textureRect, textureType attributes.
 * @class
 * @extends ccui.RichElement
 */
export class RichElementImage extends RichElement {
  _filePath = ''
  _textureRect: any = null
  _textureType = 0

  /**
   * Constructor of ccui.RichElementImage
   * @param {Number} tag
   * @param {Color} color
   * @param {Number} opacity
   * @param {String} filePath
   */
  constructor(tag?: number, color?: any, opacity?: number, filePath?: string) {
    super(tag, color, opacity)
    this._type = RichElement.IMAGE
    this._filePath = filePath || ''
    this._textureRect = rect(0, 0, 0, 0)
    this._textureType = 0
  }

  /**
   * Create a richElementImage
   * @deprecated since v3.0, please use new ccui.RichElementImage() instead.
   * @param {Number} tag
   * @param {Color} color
   * @param {Number} opacity
   * @param {String} filePath
   * @returns {ccui.RichElementImage}
   */
  static create(tag?: number, color?: any, opacity?: number, filePath?: string): RichElementImage {
    return new RichElementImage(tag, color, opacity, filePath)
  }
}

/**
 * The custom node element for RichText.
 * @class
 * @extends ccui.RichElement
 */
export class RichElementCustomNode extends RichElement {
  _customNode: any = null

  /**
   * Constructor of ccui.RichElementCustomNode
   * @param {Number} tag
   * @param {Color} color
   * @param {Number} opacity
   * @param {Node} customNode
   */
  constructor(tag?: number, color?: any, opacity?: number, customNode?: any) {
    super(tag, color, opacity)
    this._type = RichElement.CUSTOM
    this._customNode = customNode || null
  }

  /**
   * Create a richElementCustomNode
   * @deprecated since v3.0, please use new ccui.RichElementCustomNode() instead.
   * @param {Number} tag
   * @param {Number} color
   * @param {Number} opacity
   * @param {Node} customNode
   * @returns {ccui.RichElementCustomNode}
   */
  static create(tag?: number, color?: any, opacity?: number, customNode?: any): RichElementCustomNode {
    return new RichElementCustomNode(tag, color, opacity, customNode)
  }
}

/**
 * The rich text control of Cocos UI. It receives text, image, and custom node as its children to display.
 * @class
 * @extends ccui.Widget
 */
export class RichText extends ccui.Widget {
  _formatTextDirty = false
  _richElements: any[] = []
  _elementRenders: any[] = []
  _leftSpaceWidth = 0
  _verticalSpace = 0
  _elementRenderersContainer: Node | null = null
  _lineBreakOnSpace = false
  _textHorizontalAlignment: number | null = null
  _textVerticalAlignment: number | null = null

  /**
   * create a rich text
   * Constructor of ccui.RichText. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @example
   * var uiRichText = new ccui.RichTex();
   */
  constructor() {
    super()
    this._formatTextDirty = false
    this._richElements = []
    this._elementRenders = []
    this._leftSpaceWidth = 0
    this._verticalSpace = 0
    this._textHorizontalAlignment = TEXT_ALIGNMENT_LEFT
    this._textVerticalAlignment = VERTICAL_TEXT_ALIGNMENT_TOP
  }

  _initRenderer(): void {
    this._elementRenderersContainer = new Node()
    this._elementRenderersContainer.setAnchorPoint(0.5, 0.5)
    this.addProtectedChild(this._elementRenderersContainer!, 0, -1)
  }

  /**
   * Insert a element
   * @param {ccui.RichElement} element
   * @param {Number} index
   */
  insertElement(element: any, index: number): void {
    this._richElements.splice(index, 0, element)
    this._formatTextDirty = true
  }

  /**
   * Push a element
   * @param {ccui.RichElement} element
   */
  pushBackElement(element: any): void {
    this._richElements.push(element)
    this._formatTextDirty = true
  }

  /**
   * Remove element
   * @param {ccui.RichElement} element
   */
  removeElement(element: any): void {
    if (isNumber(element)) this._richElements.splice(element, 1)
    else arrayRemoveObject(this._richElements, element)
    this._formatTextDirty = true
  }

  /**
   * Formats the richText's content.
   */
  formatText(): void {
    if (this._formatTextDirty) {
      this._elementRenderersContainer!.removeAllChildren()
      this._elementRenders.length = 0
      let i,
        element,
        locRichElements = this._richElements
      if (this._ignoreSize) {
        this._addNewLine()
        for (i = 0; i < locRichElements.length; i++) {
          element = locRichElements[i]
          let elementRenderer = null
          switch (element._type) {
            case RichElement.TEXT:
              if (element._fontDefinition)
                elementRenderer = new LabelTTF(element._text, element._fontDefinition) //todo: There may be ambiguous
              else elementRenderer = new LabelTTF(element._text, element._fontName, element._fontSize)
              break
            case RichElement.IMAGE:
              elementRenderer = new Sprite(element._filePath)
              break
            case RichElement.CUSTOM:
              elementRenderer = element._customNode
              break
            default:
              break
          }
          elementRenderer.setColor(element._color)
          elementRenderer.setOpacity(element._color.a)
          this._pushToContainer(elementRenderer)
        }
      } else {
        this._addNewLine()
        for (i = 0; i < locRichElements.length; i++) {
          element = locRichElements[i]
          switch (element._type) {
            case RichElement.TEXT:
              if (element._fontDefinition)
                this._handleTextRenderer(
                  element._text,
                  element._fontDefinition,
                  element._fontDefinition.fontSize,
                  element._fontDefinition.fillStyle,
                )
              else this._handleTextRenderer(element._text, element._fontName, element._fontSize, element._color)
              break
            case RichElement.IMAGE:
              this._handleImageRenderer(element._filePath, element._color, element._color.a)
              break
            case RichElement.CUSTOM:
              this._handleCustomRenderer(element._customNode)
              break
            default:
              break
          }
        }
      }
      this.formatRenderers()
      this._formatTextDirty = false
    }
  }

  /**
   * Prepare the child LabelTTF based on line breaking
   * @param {String} text
   * @param {String|FontDefinition} fontNameOrFontDef
   * @param {Number} fontSize
   * @param {Color} color
   * @private
   */
  private _handleTextRenderer(text: string, fontNameOrFontDef: any, fontSize: number, color: any): void {
    if (text === '') return

    if (text === '\n') {
      //Force Line Breaking
      this._addNewLine()
      return
    }

    const textRenderer =
      fontNameOrFontDef instanceof FontDefinition ? new LabelTTF(text, fontNameOrFontDef) : new LabelTTF(text, fontNameOrFontDef, fontSize)
    const textRendererWidth = textRenderer.getContentSize().width
    this._leftSpaceWidth -= textRendererWidth
    if (this._leftSpaceWidth < 0) {
      const overstepPercent = -this._leftSpaceWidth / textRendererWidth
      const curText = text
      const stringLength = curText.length
      let leftLength = stringLength * (1 - overstepPercent)
      const leftWords = curText.substr(0, leftLength)
      let cutWords = curText.substr(leftLength, curText.length - 1)
      let validLeftLength = leftLength > 0

      if (this._lineBreakOnSpace) {
        const lastSpaceIndex = leftWords.lastIndexOf(' ')
        leftLength = lastSpaceIndex === -1 ? leftLength : lastSpaceIndex + 1
        cutWords = curText.substr(leftLength, curText.length - 1)
        validLeftLength = leftLength > 0 && cutWords !== ' '
      }

      if (validLeftLength) {
        let leftRenderer = null
        if (fontNameOrFontDef instanceof FontDefinition) {
          leftRenderer = new LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef)
          leftRenderer.setOpacity(fontNameOrFontDef.fillStyle.a) //TODO: Verify that might not be needed...
        } else {
          leftRenderer = new LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef, fontSize)
          leftRenderer.setColor(color)
          leftRenderer.setOpacity(color.a)
        }
        this._pushToContainer(leftRenderer)
      }

      this._addNewLine()
      this._handleTextRenderer(cutWords, fontNameOrFontDef, fontSize, color)
    } else {
      if (fontNameOrFontDef instanceof FontDefinition) {
        textRenderer.setOpacity(fontNameOrFontDef.fillStyle.a) //TODO: Verify that might not be needed...
      } else {
        textRenderer.setColor(color)
        textRenderer.setOpacity(color.a)
      }
      this._pushToContainer(textRenderer)
    }
  }

  private _handleImageRenderer(filePath: string, color: any, opacity: number): void {
    const imageRenderer = new Sprite(filePath)
    this._handleCustomRenderer(imageRenderer)
  }

  private _handleCustomRenderer(renderer: any): void {
    const imgSize = renderer.getContentSize()
    this._leftSpaceWidth -= imgSize.width
    if (this._leftSpaceWidth < 0) {
      this._addNewLine()
      this._pushToContainer(renderer)
      this._leftSpaceWidth -= imgSize.width
    } else this._pushToContainer(renderer)
  }

  private _addNewLine(): void {
    this._leftSpaceWidth = this._customSize.width
    this._elementRenders.push([])
  }

  /**
   * Formats richText's renderer.
   */
  formatRenderers(): void {
    let newContentSizeHeight = 0,
      locRenderersContainer = this._elementRenderersContainer!
    const locElementRenders = this._elementRenders
    let i, j, row, nextPosX, l
    let lineHeight, offsetX
    if (this._ignoreSize) {
      let newContentSizeWidth = 0
      row = locElementRenders[0]
      nextPosX = 0

      for (j = 0; j < row.length; j++) {
        l = row[j]
        l.setAnchorPoint(p(0, 0))
        l.setPosition(nextPosX, 0)
        locRenderersContainer.addChild(l, 1, j)

        lineHeight = l.getLineHeight ? l.getLineHeight() : newContentSizeHeight

        const iSize = l.getContentSize()
        newContentSizeWidth += iSize.width
        newContentSizeHeight = Math.max(Math.min(newContentSizeHeight, lineHeight), iSize.height)
        nextPosX += iSize.width
      }

      //Text flow horizontal alignment:
      if (this._textHorizontalAlignment !== TEXT_ALIGNMENT_LEFT) {
        offsetX = 0
        if (this._textHorizontalAlignment === TEXT_ALIGNMENT_RIGHT) offsetX = this._contentSize.width - nextPosX
        else if (this._textHorizontalAlignment === TEXT_ALIGNMENT_CENTER) offsetX = (this._contentSize.width - nextPosX) / 2

        for (j = 0; j < row.length; j++) row[j].x += offsetX
      }

      locRenderersContainer.setContentSize(newContentSizeWidth, newContentSizeHeight)
    } else {
      const maxHeights = []
      for (i = 0; i < locElementRenders.length; i++) {
        row = locElementRenders[i]
        let maxHeight = 0
        for (j = 0; j < row.length; j++) {
          l = row[j]
          lineHeight = l.getLineHeight ? l.getLineHeight() : l.getContentSize().height
          maxHeight = Math.max(Math.min(l.getContentSize().height, lineHeight), maxHeight)
        }
        maxHeights[i] = maxHeight
        newContentSizeHeight += maxHeights[i]
      }

      let nextPosY = this._customSize.height

      for (i = 0; i < locElementRenders.length; i++) {
        row = locElementRenders[i]
        nextPosX = 0
        nextPosY -= maxHeights[i] + this._verticalSpace

        for (j = 0; j < row.length; j++) {
          l = row[j]
          l.setAnchorPoint(p(0, 0))
          l.setPosition(p(nextPosX, nextPosY))
          locRenderersContainer.addChild(l, 1)
          nextPosX += l.getContentSize().width
        }
        //Text flow alignment(s)
        if (this._textHorizontalAlignment !== TEXT_ALIGNMENT_LEFT || this._textVerticalAlignment !== VERTICAL_TEXT_ALIGNMENT_TOP) {
          offsetX = 0
          if (this._textHorizontalAlignment === TEXT_ALIGNMENT_RIGHT) offsetX = this._contentSize.width - nextPosX
          else if (this._textHorizontalAlignment === TEXT_ALIGNMENT_CENTER) offsetX = (this._contentSize.width - nextPosX) / 2

          let offsetY = 0
          if (this._textVerticalAlignment === VERTICAL_TEXT_ALIGNMENT_BOTTOM) offsetY = this._customSize.height - newContentSizeHeight
          else if (this._textVerticalAlignment === VERTICAL_TEXT_ALIGNMENT_CENTER)
            offsetY = (this._customSize.height - newContentSizeHeight) / 2

          for (j = 0; j < row.length; j++) {
            l = row[j]
            l.x += offsetX
            l.y -= offsetY
          }
        }
      }

      locRenderersContainer.setContentSize(this._contentSize)
    }

    const length = locElementRenders.length
    for (i = 0; i < length; i++) {
      locElementRenders[i].length = 0
    }
    this._elementRenders.length = 0

    this.setContentSize(this._ignoreSize ? this.getVirtualRendererSize() : this._customSize)
    this._updateContentSizeWithTextureSize(this._contentSize)

    locRenderersContainer.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5)
  }

  private _pushToContainer(renderer: any): void {
    if (this._elementRenders.length <= 0) return
    this._elementRenders[this._elementRenders.length - 1].push(renderer)
  }

  private _adaptRenderers(): void {
    this.formatText()
  }

  /**
   * Sets vertical space
   * @param {Number} space
   */
  setVerticalSpace(space: number): void {
    this._verticalSpace = space
  }

  /**
   * Sets anchor point
   * @override
   * @param {Point} pt
   */
  setAnchorPoint(pt: any): void {
    super.setAnchorPoint(pt)
    this._elementRenderersContainer?.setAnchorPoint(pt)
  }

  _setAnchorX(x: number): void {
    super._setAnchorX(x)
    this._elementRenderersContainer?._setAnchorX(x)
  }

  _setAnchorY(y: number): void {
    super._setAnchorY(y)
    this._elementRenderersContainer?._setAnchorY(y)
  }

  /**
   * Returns the renderer container's content size.
   * @override
   * @returns {Size}
   */
  getVirtualRendererSize(): any {
    return this._elementRenderersContainer?.getContentSize()
  }

  /**
   * Ignore the richText's custom size, If ignore is true that richText will ignore it's custom size, use renderer's content size, false otherwise.
   * @param {Boolean} ignore
   * @override
   */
  ignoreContentAdaptWithSize(ignore: boolean): void {
    if (this._ignoreSize !== ignore) {
      this._formatTextDirty = true
      super.ignoreContentAdaptWithSize(ignore)
    }
  }

  /**
   * Gets the content size of ccui.RichText
   * @override
   * @return {Size}
   */
  getContentSize(): any {
    this.formatText()
    return super.getContentSize()
  }

  _getWidth(): number {
    this.formatText()
    return super._getWidth()
  }

  _getHeight(): number {
    this.formatText()
    return super._getHeight()
  }

  setContentSize(contentSize: any, height?: number): void {
    const locWidth = height === undefined ? contentSize.width : contentSize
    const locHeight = height === undefined ? contentSize.height : height
    super.setContentSize(locWidth, locHeight)
    this._formatTextDirty = true
  }

  /**
   * Returns the class name of ccui.RichText.
   * @returns {string}
   */
  getDescription(): string {
    return 'RichText'
  }

  /**
   * Allow child renderer to be affected by ccui.RichText's opacity
   * @param {boolean} value
   */
  setCascadeOpacityEnabled(value: boolean): void {
    super.setCascadeOpacityEnabled(value)
    this._elementRenderersContainer?.setCascadeOpacityEnabled(value)
  }

  /**
   * This allow the RichText layout to break line on space only like in Latin text format
   * by default the property is false, which break the line on characters
   * @param value
   */
  setLineBreakOnSpace(value: boolean): void {
    this._lineBreakOnSpace = value
    this._formatTextDirty = true
    this.formatText()
  }

  /**
   * Set the renderer horizontal flow alignment for the Control
   * although it is named TextHorizontalAlignment, it should work with all type of renderer too.
   * NOTE: we should rename this to setHorizontalAlignment directly
   *
   * @example
   * var richText = new ccui.RichText();
   * richText.setTextHorizontalAlignment(Text_ALIGNMENT_RIGHT);
   *
   * @param {Number} value - example TEXT_ALIGNMENT_RIGHT
   */
  setTextHorizontalAlignment(value: number): void {
    if (value !== this._textHorizontalAlignment) {
      this._textHorizontalAlignment = value
      this.formatText()
    }
  }

  /**
   * Set the renderer vertical flow alignment for the Control
   * although it is named TextVerticalAlignment, it should work with all type of renderer too.
   *
   * @example
   * var richText = new ccui.RichText();
   * richText.setTextVerticalAlignment(VERTICAL_TEXT_ALIGNMENT_CENTER);
   *
   * @param {Number} value - example VERTICAL_TEXT_ALIGNMENT_CENTER
   */
  setTextVerticalAlignment(value: number): void {
    if (value !== this._textVerticalAlignment) {
      this._textVerticalAlignment = value
      this.formatText()
    }
  }

  /**
   * create a rich text
   * @deprecated since v3.0, please use new ccui.RichText() instead.
   * @returns {RichText}
   */
  static create(): RichText {
    return new RichText()
  }
}

// Constants
//Rich element type
/**
 * The text type of rich element.
 * @constant
 * @type {number}
 */
RichElement.TEXT = 0
/**
 * The image type of rich element.
 * @constant
 * @type {number}
 */
RichElement.IMAGE = 1
/**
 * The custom type of rich element.
 * @constant
 * @type {number}
 */
RichElement.CUSTOM = 2
