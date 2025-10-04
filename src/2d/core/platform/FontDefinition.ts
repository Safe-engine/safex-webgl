
/**
 * Common usage:
 *
 * var fontDef = new cc.FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = 12;
 * ...
 *
 * OR using inline definition useful for constructor injection
 *
 * var fontDef = new cc.FontDefinition({
 *  fontName: "Arial",
 *  fontSize: 12
 * });
 *
 *
 *
 * @class cc.FontDefinition
 * @param {Object} properties - (OPTIONAL) Allow inline FontDefinition
 * @constructor
 */
cc.FontDefinition = function (properties) {
  var _t = this;
  _t.fontName = "Arial";
  _t.fontSize = 12;
  _t.textAlign = cc.TEXT_ALIGNMENT_CENTER;
  _t.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
  _t.fillStyle = cc.color(255, 255, 255, 255);
  _t.boundingWidth = 0;
  _t.boundingHeight = 0;

  _t.strokeEnabled = false;
  _t.strokeStyle = cc.color(255, 255, 255, 255);
  _t.lineWidth = 1;
  _t.lineHeight = "normal";
  _t.fontStyle = "normal";
  _t.fontWeight = "normal";

  _t.shadowEnabled = false;
  _t.shadowOffsetX = 0;
  _t.shadowOffsetY = 0;
  _t.shadowBlur = 0;
  _t.shadowOpacity = 1.0;

  //properties mapping:
  if (properties && properties instanceof Object) {
    for (var key in properties) {
      _t[key] = properties[key];
    }
  }
};
/**
 * Web ONLY
 * */
cc.FontDefinition.prototype._getCanvasFontStr = function () {
  var lineHeight = !this.lineHeight.charAt ? this.lineHeight + "px" : this.lineHeight;
  return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + "px/" + lineHeight + " '" + this.fontName + "'";
};
