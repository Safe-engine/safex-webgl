
/**
 * Blend Function used for textures
 * @Class cc.BlendFunc
 * @Constructor
 * @param {Number} src1 source blend function
 * @param {Number} dst1 destination blend function
 */
cc.BlendFunc = function (src1, dst1) {
  this.src = src1;
  this.dst = dst1;
};

/**
 * @function
 * @returns {cc.BlendFunc}
 */
cc.blendFuncDisable = function () {
  return new cc.BlendFunc(cc.ONE, cc.ZERO);
};

cc.BlendFunc._disable = function () {
  return new cc.BlendFunc(cc.ONE, cc.ZERO);
};
cc.BlendFunc._alphaPremultiplied = function () {
  return new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
};
cc.BlendFunc._alphaNonPremultiplied = function () {
  return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
};
cc.BlendFunc._additive = function () {
  return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE);
};

/** @expose */
cc.BlendFunc.DISABLE;
cc.defineGetterSetter(cc.BlendFunc, "DISABLE", cc.BlendFunc._disable);
/** @expose */
cc.BlendFunc.ALPHA_PREMULTIPLIED;
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_PREMULTIPLIED", cc.BlendFunc._alphaPremultiplied);
/** @expose */
cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_NON_PREMULTIPLIED", cc.BlendFunc._alphaNonPremultiplied);
/** @expose */
cc.BlendFunc.ADDITIVE;
cc.defineGetterSetter(cc.BlendFunc, "ADDITIVE", cc.BlendFunc._additive);
