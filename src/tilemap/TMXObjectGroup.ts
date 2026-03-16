import { p } from '../core'

export class TMXObjectGroup {
  constructor() {
    this.groupName = ''
    this._positionOffset = p(0, 0)
    this.properties = []
    this._objects = []
  }

  /**
   * Offset position of child objects
   * @return {Point}
   */
  getPositionOffset() {
    return p(this._positionOffset)
  }

  /**
   * Offset position of child objects
   * @param {Point} offset
   */
  setPositionOffset(offset) {
    this._positionOffset.x = offset.x
    this._positionOffset.y = offset.y
  }

  /**
   * List of properties stored in a dictionary
   * @return {Array}
   */
  getProperties() {
    return this.properties
  }

  /**
   * List of properties stored in a dictionary
   * @param {object} Var
   */
  setProperties(v) {
    this.properties.push(v)
  }

  /**
   * Gets the Group name.
   * @return {String}
   */
  getGroupName() {
    return this.groupName.toString()
  }

  /**
   * Set the Group name
   * @param {String} groupName
   */
  setGroupName(groupName) {
    this.groupName = groupName
  }

  /**
   * Return the value for the specific property name
   * @param {String} propertyName
   * @return {object}
   */
  propertyNamed(propertyName) {
    return this.properties[propertyName]
  }

  /**
   * <p>Return the dictionary for the specific object name. <br />
   * It will return the 1st object found on the array for the given name.</p>
   * @deprecated since v3.4 please use .getObject
   * @param {String} objectName
   * @return {object|Null}
   */
  objectNamed(objectName) {
    return this.getObject(objectName)
  }

  /**
   * <p>Return the dictionary for the specific object name. <br />
   * It will return the 1st object found on the array for the given name.</p>
   * @param {String} objectName
   * @return {object|Null}
   */
  getObject(objectName) {
    if (this._objects && this._objects.length > 0) {
      const locObjects = this._objects
      for (let i = 0, len = locObjects.length; i < len; i++) {
        const name = locObjects[i]['name']
        if (name && name === objectName) return locObjects[i]
      }
    }
    // object not found
    return null
  }

  /**
   * Gets the objects.
   * @return {Array}
   */
  getObjects() {
    return this._objects
  }

  /**
   * Set the objects.
   * @param {object} objects
   */
  setObjects(objects) {
    this._objects.push(objects)
  }
}
