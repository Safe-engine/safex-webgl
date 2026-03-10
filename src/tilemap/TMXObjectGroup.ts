
/**
 * cc.TMXObjectGroup represents the TMX object group.
 * @class
 * @extends cc.Class
 *
 * @property {Array}    properties  - Properties from the group. They can be added using tilemap editors
 * @property {String}   groupName   - Name of the group
 */
cc.TMXObjectGroup = cc.Class.extend(/** @lends cc.TMXObjectGroup# */{
	properties: null,
    groupName: "",

    _positionOffset: null,
    _objects: null,

    /**
     * <p>The cc.TMXObjectGroup's constructor. <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new cc.TMXObjectGroup()".<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     */
    ctor:function () {
        this.groupName = "";
        this._positionOffset = cc.p(0,0);
        this.properties = [];
        this._objects = [];
    },

    /**
     * Offset position of child objects
     * @return {cc.Point}
     */
    getPositionOffset:function () {
        return cc.p(this._positionOffset);
    },

    /**
     * Offset position of child objects
     * @param {cc.Point} offset
     */
    setPositionOffset:function (offset) {
        this._positionOffset.x = offset.x;
        this._positionOffset.y = offset.y;
    },

    /**
     * List of properties stored in a dictionary
     * @return {Array}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * List of properties stored in a dictionary
     * @param {object} Var
     */
    setProperties:function (Var) {
        this.properties.push(Var);
    },

    /**
     * Gets the Group name.
     * @return {String}
     */
    getGroupName:function () {
        return this.groupName.toString();
    },

    /**
     * Set the Group name
     * @param {String} groupName
     */
    setGroupName:function (groupName) {
        this.groupName = groupName;
    },

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {object}
     */
    propertyNamed:function (propertyName) {
        return this.properties[propertyName];
    },

    /**
     * <p>Return the dictionary for the specific object name. <br />
     * It will return the 1st object found on the array for the given name.</p>
     * @deprecated since v3.4 please use .getObject
     * @param {String} objectName
     * @return {object|Null}
     */
    objectNamed:function (objectName) {
        return this.getObject(objectName);
    },

    /**
     * <p>Return the dictionary for the specific object name. <br />
     * It will return the 1st object found on the array for the given name.</p>
     * @param {String} objectName
     * @return {object|Null}
     */
    getObject: function(objectName){
        if (this._objects && this._objects.length > 0) {
            var locObjects = this._objects;
            for (var i = 0, len = locObjects.length; i < len; i++) {
                var name = locObjects[i]["name"];
                if (name && name === objectName)
                    return locObjects[i];
            }
        }
        // object not found
        return null;
    },

    /**
     * Gets the objects.
     * @return {Array}
     */
    getObjects:function () {
        return this._objects;
    },

    /**
     * Set the objects.
     * @param {object} objects
     */
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});
