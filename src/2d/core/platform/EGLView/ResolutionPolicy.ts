
/**
 * <p>cc.ResolutionPolicy class is the root strategy class of scale strategy,
 * its main task is to maintain the compatibility with Cocos2d-x</p>
 *
 * @class
 * @extends cc.Class
 * @param {cc.ContainerStrategy} containerStg The container strategy
 * @param {cc.ContentStrategy} contentStg The content strategy
 */
cc.ResolutionPolicy = cc.Class.extend(/** @lends cc.ResolutionPolicy# */{
  _containerStrategy: null,
  _contentStrategy: null,

  /**
   * Constructor of cc.ResolutionPolicy
   * @param {cc.ContainerStrategy} containerStg
   * @param {cc.ContentStrategy} contentStg
   */
  ctor: function (containerStg, contentStg) {
    this.setContainerStrategy(containerStg);
    this.setContentStrategy(contentStg);
  },

  /**
   * Manipulation before applying the resolution policy
   * @param {cc.view} view The target view
   */
  preApply: function (view) {
    this._containerStrategy.preApply(view);
    this._contentStrategy.preApply(view);
  },

  /**
   * Function to apply this resolution policy
   * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
   * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
   * @param {cc.view} view The target view
   * @param {cc.Size} designedResolution The user defined design resolution
   * @return {object} An object contains the scale X/Y values and the viewport rect
   */
  apply: function (view, designedResolution) {
    this._containerStrategy.apply(view, designedResolution);
    return this._contentStrategy.apply(view, designedResolution);
  },

  /**
   * Manipulation after appyling the strategy
   * @param {cc.view} view The target view
   */
  postApply: function (view) {
    this._containerStrategy.postApply(view);
    this._contentStrategy.postApply(view);
  },

  /**
   * Setup the container's scale strategy
   * @param {cc.ContainerStrategy} containerStg
   */
  setContainerStrategy: function (containerStg) {
    if (containerStg instanceof cc.ContainerStrategy)
      this._containerStrategy = containerStg;
  },

  /**
   * Setup the content's scale strategy
   * @param {cc.ContentStrategy} contentStg
   */
  setContentStrategy: function (contentStg) {
    if (contentStg instanceof cc.ContentStrategy)
      this._contentStrategy = contentStg;
  }
});

/**
 * @memberOf cc.ResolutionPolicy#
 * @name EXACT_FIT
 * @constant
 * @type Number
 * @static
 * The entire application is visible in the specified area without trying to preserve the original aspect ratio.<br/>
 * Distortion can occur, and the application may appear stretched or compressed.
 */
cc.ResolutionPolicy.EXACT_FIT = 0;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name NO_BORDER
 * @constant
 * @type Number
 * @static
 * The entire application fills the specified area, without distortion but possibly with some cropping,<br/>
 * while maintaining the original aspect ratio of the application.
 */
cc.ResolutionPolicy.NO_BORDER = 1;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name SHOW_ALL
 * @constant
 * @type Number
 * @static
 * The entire application is visible in the specified area without distortion while maintaining the original<br/>
 * aspect ratio of the application. Borders can appear on two sides of the application.
 */
cc.ResolutionPolicy.SHOW_ALL = 2;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_HEIGHT
 * @constant
 * @type Number
 * @static
 * The application takes the height of the design resolution size and modifies the width of the internal<br/>
 * canvas so that it fits the aspect ratio of the device<br/>
 * no distortion will occur however you must make sure your application works on different<br/>
 * aspect ratios
 */
cc.ResolutionPolicy.FIXED_HEIGHT = 3;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_WIDTH
 * @constant
 * @type Number
 * @static
 * The application takes the width of the design resolution size and modifies the height of the internal<br/>
 * canvas so that it fits the aspect ratio of the device<br/>
 * no distortion will occur however you must make sure your application works on different<br/>
 * aspect ratios
 */
cc.ResolutionPolicy.FIXED_WIDTH = 4;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name UNKNOWN
 * @constant
 * @type Number
 * @static
 * Unknow policy
 */
cc.ResolutionPolicy.UNKNOWN = 5;
