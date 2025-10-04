
(function () {

  // Container scale strategys
  /**
   * @class
   * @extends cc.ContainerStrategy
   */
  var EqualToFrame = cc.ContainerStrategy.extend({
    apply: function (view) {
      var frameH = view._frameSize.height, containerStyle = cc.container.style;
      this._setupContainer(view, view._frameSize.width, view._frameSize.height);
      // Setup container's margin and padding
      if (view._isRotated) {
        containerStyle.margin = '0 0 0 ' + frameH + 'px';
      }
      else {
        containerStyle.margin = '0px';
      }
    }
  });

  /**
   * @class
   * @extends cc.ContainerStrategy
   */
  var ProportionalToFrame = cc.ContainerStrategy.extend({
    apply: function (view, designedResolution) {
      var frameW = view._frameSize.width, frameH = view._frameSize.height, containerStyle = cc.container.style,
        designW = designedResolution.width, designH = designedResolution.height,
        scaleX = frameW / designW, scaleY = frameH / designH,
        containerW, containerH;

      scaleX < scaleY ? (containerW = frameW, containerH = designH * scaleX) : (containerW = designW * scaleY, containerH = frameH);

      // Adjust container size with integer value
      var offx = Math.round((frameW - containerW) / 2);
      var offy = Math.round((frameH - containerH) / 2);
      containerW = frameW - 2 * offx;
      containerH = frameH - 2 * offy;

      this._setupContainer(view, containerW, containerH);
      // Setup container's margin and padding
      if (view._isRotated) {
        containerStyle.margin = '0 0 0 ' + frameH + 'px';
      }
      else {
        containerStyle.margin = '0px';
      }
      containerStyle.paddingLeft = offx + "px";
      containerStyle.paddingRight = offx + "px";
      containerStyle.paddingTop = offy + "px";
      containerStyle.paddingBottom = offy + "px";
    }
  });

  /**
   * @class
   * @extends EqualToFrame
   */
  var EqualToWindow = EqualToFrame.extend({
    preApply: function (view) {
      this._super(view);
      view._frame = document.documentElement;
    },

    apply: function (view) {
      this._super(view);
      this._fixContainer();
    }
  });

  /**
   * @class
   * @extends ProportionalToFrame
   */
  var ProportionalToWindow = ProportionalToFrame.extend({
    preApply: function (view) {
      this._super(view);
      view._frame = document.documentElement;
    },

    apply: function (view, designedResolution) {
      this._super(view, designedResolution);
      this._fixContainer();
    }
  });

  /**
   * @class
   * @extends cc.ContainerStrategy
   */
  var OriginalContainer = cc.ContainerStrategy.extend({
    apply: function (view) {
      this._setupContainer(view, cc._canvas.width, cc._canvas.height);
    }
  });

  // #NOT STABLE on Android# Alias: Strategy that makes the container's size equals to the window's size
  //    cc.ContainerStrategy.EQUAL_TO_WINDOW = new EqualToWindow();
  // #NOT STABLE on Android# Alias: Strategy that scale proportionally the container's size to window's size
  //    cc.ContainerStrategy.PROPORTION_TO_WINDOW = new ProportionalToWindow();
  // Alias: Strategy that makes the container's size equals to the frame's size
  cc.ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
  // Alias: Strategy that scale proportionally the container's size to frame's size
  cc.ContainerStrategy.PROPORTION_TO_FRAME = new ProportionalToFrame();
  // Alias: Strategy that keeps the original container's size
  cc.ContainerStrategy.ORIGINAL_CONTAINER = new OriginalContainer();

  // Content scale strategys
  var ExactFit = cc.ContentStrategy.extend({
    apply: function (view, designedResolution) {
      var containerW = cc._canvas.width, containerH = cc._canvas.height,
        scaleX = containerW / designedResolution.width, scaleY = containerH / designedResolution.height;

      return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY);
    }
  });

  var ShowAll = cc.ContentStrategy.extend({
    apply: function (view, designedResolution) {
      var containerW = cc._canvas.width, containerH = cc._canvas.height,
        designW = designedResolution.width, designH = designedResolution.height,
        scaleX = containerW / designW, scaleY = containerH / designH, scale = 0,
        contentW, contentH;

      scaleX < scaleY ? (scale = scaleX, contentW = containerW, contentH = designH * scale)
        : (scale = scaleY, contentW = designW * scale, contentH = containerH);

      return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }
  });

  var NoBorder = cc.ContentStrategy.extend({
    apply: function (view, designedResolution) {
      var containerW = cc._canvas.width, containerH = cc._canvas.height,
        designW = designedResolution.width, designH = designedResolution.height,
        scaleX = containerW / designW, scaleY = containerH / designH, scale,
        contentW, contentH;

      scaleX < scaleY ? (scale = scaleY, contentW = designW * scale, contentH = containerH)
        : (scale = scaleX, contentW = containerW, contentH = designH * scale);

      return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    }
  });

  var FixedHeight = cc.ContentStrategy.extend({
    apply: function (view, designedResolution) {
      var containerW = cc._canvas.width, containerH = cc._canvas.height,
        designH = designedResolution.height, scale = containerH / designH,
        contentW = containerW, contentH = containerH;

      return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    },

    postApply: function (view) {
      cc.director._winSizeInPoints = view.getVisibleSize();
    }
  });

  var FixedWidth = cc.ContentStrategy.extend({
    apply: function (view, designedResolution) {
      var containerW = cc._canvas.width, containerH = cc._canvas.height,
        designW = designedResolution.width, scale = containerW / designW,
        contentW = containerW, contentH = containerH;

      return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
    },

    postApply: function (view) {
      cc.director._winSizeInPoints = view.getVisibleSize();
    }
  });

  // Alias: Strategy to scale the content's size to container's size, non proportional
  cc.ContentStrategy.EXACT_FIT = new ExactFit();
  // Alias: Strategy to scale the content's size proportionally to maximum size and keeps the whole content area to be visible
  cc.ContentStrategy.SHOW_ALL = new ShowAll();
  // Alias: Strategy to scale the content's size proportionally to fill the whole container area
  cc.ContentStrategy.NO_BORDER = new NoBorder();
  // Alias: Strategy to scale the content's height to container's height and proportionally scale its width
  cc.ContentStrategy.FIXED_HEIGHT = new FixedHeight();
  // Alias: Strategy to scale the content's width to container's width and proportionally scale its height
  cc.ContentStrategy.FIXED_WIDTH = new FixedWidth();

})();
