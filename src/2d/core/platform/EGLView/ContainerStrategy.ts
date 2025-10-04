
/**
 * <p>cc.ContainerStrategy class is the root strategy class of container's scale strategy,
 * it controls the behavior of how to scale the cc.container and cc._canvas object</p>
 *
 * @class
 * @extends cc.Class
 */
cc.ContainerStrategy = cc.Class.extend(/** @lends cc.ContainerStrategy# */{
  /**
   * Manipulation before appling the strategy
   * @param {cc.view} The target view
   */
  preApply: function (view) {
  },

  /**
   * Function to apply this strategy
   * @param {cc.view} view
   * @param {cc.Size} designedResolution
   */
  apply: function (view, designedResolution) {
  },

  /**
   * Manipulation after applying the strategy
   * @param {cc.view} view  The target view
   */
  postApply: function (view) {

  },

  _setupContainer: function (view, w, h) {
    var locCanvas = cc.game.canvas, locContainer = cc.game.container;
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      document.body.style.width = (view._isRotated ? h : w) + 'px';
      document.body.style.height = (view._isRotated ? w : h) + 'px';
    }

    // Setup style
    locContainer.style.width = locCanvas.style.width = w + 'px';
    locContainer.style.height = locCanvas.style.height = h + 'px';
    // Setup pixel ratio for retina display
    var devicePixelRatio = view._devicePixelRatio = 1;
    if (view.isRetinaEnabled())
      devicePixelRatio = view._devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
    // Setup canvas
    locCanvas.width = w * devicePixelRatio;
    locCanvas.height = h * devicePixelRatio;
    cc._renderContext.resetCache && cc._renderContext.resetCache();
  },

  _fixContainer: function () {
    // Add container to document body
    document.body.insertBefore(cc.container, document.body.firstChild);
    // Set body's width height to window's size, and forbid overflow, so that game will be centered
    var bs = document.body.style;
    bs.width = window.innerWidth + "px";
    bs.height = window.innerHeight + "px";
    bs.overflow = "hidden";
    // Body size solution doesn't work on all mobile browser so this is the aleternative: fixed container
    var contStyle = cc.container.style;
    contStyle.position = "fixed";
    contStyle.left = contStyle.top = "0px";
    // Reposition body
    document.body.scrollTop = 0;
  }
});
