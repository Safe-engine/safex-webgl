import { warn } from '../../helper/Debugger'

/**
 * A SAX Parser
 * @class
 * @name saxParser
 * @extends Class
 */
export class SAXParser {
  private _parser: DOMParser | null = null

  constructor() {
    this._parser = new DOMParser()
  }

  /**
   * @function
   * @param {String} xmlTxt
   * @return {Document}
   */
  parse(xmlTxt: string): Document {
    return this._parseXML(xmlTxt)
  }

  protected _parseXML(textxml: string): Document {
    // get a reference to the requested corresponding xml file
    const xmlDoc: Document = this._parser!.parseFromString(textxml, 'text/xml')
    return xmlDoc
  }
}

/**
 *
 * plistParser is a singleton object for parsing plist files
 * @class
 * @name plistParser
 * @extends SAXParser
 */
export class PlistParser extends SAXParser {
  /**
   * parse a xml string as plist object.
   * @param {String} xmlTxt plist xml contents
   * @return {*} plist object
   */
  parse(xmlTxt: string): any {
    const xmlDoc = this._parseXML(xmlTxt)
    const plist = xmlDoc.documentElement
    if (plist.tagName !== 'plist') {
      warn('Not a plist file!')
      return {}
    }

    // Get first real node
    let node: Element | null = null
    for (let i = 0, len = plist.childNodes.length; i < len; i++) {
      node = plist.childNodes[i] as Element
      if (node.nodeType === 1) break
    }
    return this._parseNode(node!)
  }

  private _parseNode(node: Element): any {
    let data = null
    const tagName = node.tagName
    if (tagName === 'dict') {
      data = this._parseDict(node)
    } else if (tagName === 'array') {
      data = this._parseArray(node)
    } else if (tagName === 'string') {
      if (node.childNodes.length === 1) data = node.firstChild!.nodeValue
      else {
        //handle Firefox's 4KB nodeValue limit
        data = ''
        for (let i = 0; i < node.childNodes.length; i++) data += node.childNodes[i].nodeValue
      }
    } else if (tagName === 'false') {
      data = false
    } else if (tagName === 'true') {
      data = true
    } else if (tagName === 'real') {
      data = parseFloat(node.firstChild!.nodeValue!)
    } else if (tagName === 'integer') {
      data = parseInt(node.firstChild!.nodeValue!, 10)
    }
    return data
  }

  private _parseArray(node: Element): any[] {
    const data: any[] = []
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      const child = node.childNodes[i] as Element
      if (child.nodeType !== 1) continue
      data.push(this._parseNode(child))
    }
    return data
  }

  private _parseDict(node: Element): Record<string, any> {
    const data: Record<string, any> = {}
    let key: string | null = null
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      const child = node.childNodes[i] as Element
      if (child.nodeType !== 1) continue

      // Grab the key, next node should be the value
      if (child.tagName === 'key') key = child.firstChild!.nodeValue!
      else data[key!] = this._parseNode(child) // Parse the value node
    }
    return data
  }
}

export const saxParser = new SAXParser()
/**
 * A Plist Parser
 * @type {PlistParser}
 * @name plistParser
 * @memberof cc
 */
export const plistParser = new PlistParser()
