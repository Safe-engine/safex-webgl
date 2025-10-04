
cc._Dictionary = cc.Class.extend({
  _keyMapTb: null,
  _valueMapTb: null,
  __currId: 0,

  ctor: function () {
    this._keyMapTb = {};
    this._valueMapTb = {};
    this.__currId = 2 << (0 | (Math.random() * 10));
  },

  __getKey: function () {
    this.__currId++;
    return "key_" + this.__currId;
  },

  setObject: function (value, key) {
    if (key == null)
      return;

    var keyId = this.__getKey();
    this._keyMapTb[keyId] = key;
    this._valueMapTb[keyId] = value;
  },

  objectForKey: function (key) {
    if (key == null)
      return null;

    var locKeyMapTb = this._keyMapTb;
    for (var keyId in locKeyMapTb) {
      if (locKeyMapTb[keyId] === key)
        return this._valueMapTb[keyId];
    }
    return null;
  },

  valueForKey: function (key) {
    return this.objectForKey(key);
  },

  removeObjectForKey: function (key) {
    if (key == null)
      return;

    var locKeyMapTb = this._keyMapTb;
    for (var keyId in locKeyMapTb) {
      if (locKeyMapTb[keyId] === key) {
        delete this._valueMapTb[keyId];
        delete locKeyMapTb[keyId];
        return;
      }
    }
  },

  removeObjectsForKeys: function (keys) {
    if (keys == null)
      return;

    for (var i = 0; i < keys.length; i++)
      this.removeObjectForKey(keys[i]);
  },

  allKeys: function () {
    var keyArr = [], locKeyMapTb = this._keyMapTb;
    for (var key in locKeyMapTb)
      keyArr.push(locKeyMapTb[key]);
    return keyArr;
  },

  removeAllObjects: function () {
    this._keyMapTb = {};
    this._valueMapTb = {};
  },

  count: function () {
    return this.allKeys().length;
  }
});
