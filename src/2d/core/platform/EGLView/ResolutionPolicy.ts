import { ContainerStrategy } from './ContainerStrategy';
import { ContentStrategy } from './ContentStrategy';

/**
 * @class ResolutionPolicy
 * @extends Class
 * @param {ContainerStrategy} containerStg The container strategy.
 * @param {ContentStrategy} contentStg The content strategy.
 * @brief
 * ResolutionPolicy class is the root strategy class of scale strategy,
 * its main task is to maintain the compatibility with Cocos2d-x.
 */
export class ResolutionPolicy {
  /**
   * The entire application is visible in the specified area without trying to preserve the original aspect ratio.
   * Distortion can occur, and the application may appear stretched or compressed.
   * @constant
   * @type {number}
   */
  public static EXACT_FIT = 0;
  /**
   * The entire application fills the specified area, without distortion but possibly with some cropping,
   * while maintaining the original aspect ratio of the application.
   * @constant
   * @type {number}
   */
  public static NO_BORDER = 1;
  /**
   * The entire application is visible in the specified area without distortion while maintaining the original
   * aspect ratio of the application. Borders can appear on two sides of the application.
   * @constant
   * @type {number}
   */
  public static SHOW_ALL = 2;
  /**
   * The application takes the height of the design resolution size and modifies the width of the internal
   * canvas so that it fits the aspect ratio of the device.
   * No distortion will occur however you must make sure your application works on different
   * aspect ratios.
   * @constant
   * @type {number}
   */
  public static FIXED_HEIGHT = 3;
  /**
   * The application takes the width of the design resolution size and modifies the height of the internal
   * canvas so that it fits the aspect ratio of the device.
   * No distortion will occur however you must make sure your application works on different
   * aspect ratios.
   * @constant
   * @type {number}
   */
  public static FIXED_WIDTH = 4;
  /**
   * Unknown policy.
   * @constant
   * @type {number}
   */
  public static UNKNOWN = 5;

  private _containerStrategy: ContainerStrategy | null = null;
  private _contentStrategy: ContentStrategy | null = null;

  /**
   * @constructor
   * @param {ContainerStrategy} containerStg
   * @param {ContentStrategy} contentStg
   */
  constructor(containerStg: ContainerStrategy, contentStg: ContentStrategy) {
    this.setContainerStrategy(containerStg);
    this.setContentStrategy(contentStg);
  }

  /**
   * Manipulation before applying the resolution policy.
   * @param {View} view
   */
  public preApply(view) {
    this._containerStrategy.preApply(view);
    this._contentStrategy.preApply(view);
  }

  /**
   * Function to apply this resolution policy.
   * The return value is {scale: [scaleX, scaleY], viewport: {Rect}},
   * The target view can then apply these value to itself, it's preferred not to modify directly its private variables.
   * @param {View} view
   * @param {Size} designedResolution
   * @returns {{scale: number[], viewport: Rect}}
   */
  public apply(view, designedResolution) {
    this._containerStrategy.apply(view, designedResolution);
    return this._contentStrategy.apply(view, designedResolution);
  }

  /**
   * Manipulation after applying the strategy.
   * @param {View} view
   */
  public postApply(view) {
    this._containerStrategy.postApply(view);
    this._contentStrategy.postApply(view);
  }

  /**
   * Setup the container's scale strategy.
   * @param {ContainerStrategy} containerStg
   */
  public setContainerStrategy(containerStg: ContainerStrategy) {
    if (containerStg instanceof ContainerStrategy) {
      this._containerStrategy = containerStg;
    }
  }

  /**
   * Setup the content's scale strategy.
   * @param {ContentStrategy} contentStg
   */
  public setContentStrategy(contentStg: ContentStrategy) {
    if (contentStg instanceof ContentStrategy) {
      this._contentStrategy = contentStg;
    }
  }
}

