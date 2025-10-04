import { director } from "../../..";
import { Node } from "../base-nodes/Node";

/**
 * <p>cc.Scene is a subclass of cc.Node that is used only as an abstract concept.</p>
 *  <p>cc.Scene an cc.Node are almost identical with the difference that cc.Scene has it's
 * anchor point (by default) at the center of the screen.</p>
 *
 * <p>For the moment cc.Scene has no other logic than that, but in future releases it might have
 * additional logic.</p>
 *
 * <p>It is a good practice to use and cc.Scene as the parent of all your nodes.</p>
 * @class
 * @extends cc.Node
 * @example
 * var scene = new cc.Scene();
 */
export class Scene extends Node {
  /**
   * Constructor of cc.Scene
   */
  _className = "Scene"
  constructor() {
    super();
    this._ignoreAnchorPointForPosition = true;
    this.setAnchorPoint(0.5, 0.5);
    this.setContentSize(director.getWinSize());
  }
  /**
  * creates a scene
  * @deprecated since v3.0,please use new cc.Scene() instead.
  * @return {cc.Scene}
  */
  static create = function () {
    return new Scene();
  };
}
