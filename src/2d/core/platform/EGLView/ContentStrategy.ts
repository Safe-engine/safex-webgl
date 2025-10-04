
/**
 * <p>cc.ContentStrategy class is the root strategy class of content's scale strategy,
 * it controls the behavior of how to scale the scene and setup the viewport for the game</p>
 *
 * @class
 * @extends cc.Class
 */
cc.ContentStrategy = cc.Class.extend(/** @lends cc.ContentStrategy# */{

  _result: {
    scale: [1, 1],
    viewport: null
  },

  _buildResult: function (containerW, containerH, contentW, contentH, scaleX, scaleY) {
    // Makes content fit better the canvas
    Math.abs(containerW - contentW) < 2 && (contentW = containerW);
    Math.abs(containerH - contentH) < 2 && (contentH = containerH);

    var viewport = cc.rect(Math.round((containerW - contentW) / 2),
      Math.round((containerH - contentH) / 2),
      contentW, contentH);

    // Translate the content
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
      //TODO: modify something for setTransform
      //cc._renderContext.translate(viewport.x, viewport.y + contentH);
    }

    this._result.scale = [scaleX, scaleY];
    this._result.viewport = viewport;
    return this._result;
  },

  /**
   * Manipulation before applying the strategy
   * @param {cc.view} view The target view
   */
  preApply: function (view) {
  },

  /**
   * Function to apply this strategy
   * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
   * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
   * @param {cc.view} view
   * @param {cc.Size} designedResolution
   * @return {object} scaleAndViewportRect
   */
  apply: function (view, designedResolution) {
    return { "scale": [1, 1] };
  },

  /**
   * Manipulation after applying the strategy
   * @param {cc.view} view The target view
   */
  postApply: function (view) {
  }
});
