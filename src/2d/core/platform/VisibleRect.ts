import { p } from "../cocoa/Geometry";

/**
 * visibleRect is a singleton object which defines the actual visible rect of the current view,
 * it should represent the same rect as view.getViewportRect()
 *
 * @property {Point}     topLeft         - Top left coordinate of the screen related to the game scene
 * @property {Point}     topRight        - Top right coordinate of the screen related to the game scene
 * @property {Point}     top             - Top center coordinate of the screen related to the game scene
 * @property {Point}     bottomLeft      - Bottom left coordinate of the screen related to the game scene
 * @property {Point}     bottomRight     - Bottom right coordinate of the screen related to the game scene
 * @property {Point}     bottom          - Bottom center coordinate of the screen related to the game scene
 * @property {Point}     center          - Center coordinate of the screen related to the game scene
 * @property {Point}     left            - Left center coordinate of the screen related to the game scene
 * @property {Point}     right           - Right center coordinate of the screen related to the game scene
 * @property {Number}       width           - Width of the screen
 * @property {Number}       height          - Height of the screen
 *
 * @class
 * @name visibleRect
 */
export const visibleRect = {
  topLeft: p(0, 0),
  topRight: p(0, 0),
  top: p(0, 0),
  bottomLeft: p(0, 0),
  bottomRight: p(0, 0),
  bottom: p(0, 0),
  center: p(0, 0),
  left: p(0, 0),
  right: p(0, 0),
  width: 0,
  height: 0,

  /**
   * initialize
   * @param {Rect} visibleRect
   */
  init: function (visibleRect) {

    var w = this.width = visibleRect.width;
    var h = this.height = visibleRect.height;
    var l = visibleRect.x,
      b = visibleRect.y,
      t = b + h,
      r = l + w;

    //top
    this.topLeft.x = l;
    this.topLeft.y = t;
    this.topRight.x = r;
    this.topRight.y = t;
    this.top.x = l + w / 2;
    this.top.y = t;

    //bottom
    this.bottomLeft.x = l;
    this.bottomLeft.y = b;
    this.bottomRight.x = r;
    this.bottomRight.y = b;
    this.bottom.x = l + w / 2;
    this.bottom.y = b;

    //center
    this.center.x = l + w / 2;
    this.center.y = b + h / 2;

    //left
    this.left.x = l;
    this.left.y = b + h / 2;

    //right
    this.right.x = r;
    this.right.y = b + h / 2;
  }
};