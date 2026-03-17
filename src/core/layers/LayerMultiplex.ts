import { _LogInfos, log } from '../../helper/Debugger'
import { Layer } from './Layer'

/**
 * CCMultipleLayer is a CCLayer with the ability to multiplex it's children.<br/>
 * Features:<br/>
 *  <ul><li>- It supports one or more children</li>
 *  <li>- Only one children will be active a time</li></ul>
 * @class
 * @extends Layer
 * @param {Array} layers an array of Layer
 * @example
 * // Example
 * var multiLayer = new LayerMultiple(layer1, layer2, layer3);//any number of layers
 */
export class LayerMultiplex extends Layer {
  _enabledLayer: number = 0
  _layers: any[] | null = null
  _className: string = 'LayerMultiplex'

  /**
   * Constructor of LayerMultiplex
   * @param {Array} layers an array of Layer
   */
  constructor(...args: any[]) {
    super()
    if (args.length === 1 && Array.isArray(args[0])) {
      this.initWithLayers(args[0])
    } else {
      this.initWithLayers(args)
    }
  }

  /**
   * Initialization of the layer multiplex, please do not call this function by yourself, you should pass the parameters to constructor to initialize a layer multiplex
   * @param {Array} layers an array of Layer
   * @return {Boolean}
   */
  initWithLayers(layers: any[]) {
    if (layers.length > 0 && layers[layers.length - 1] == null) log(_LogInfos.LayerMultiplex_initWithLayers)

    this._layers = layers
    this._enabledLayer = 0
    this.addChild(this._layers[this._enabledLayer])
    return true
  }

  /**
   * Switches to a certain layer indexed by n.<br/>
   * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
   * @param {Number} n the layer index to switch to
   */
  switchTo(n: number) {
    if (!this._layers || n >= this._layers.length) {
      log(_LogInfos.LayerMultiplex_switchTo)
      return
    }

    this.removeChild(this._layers[this._enabledLayer], true)
    this._enabledLayer = n
    this.addChild(this._layers[n])
  }

  /**
   * Release the current layer and switches to another layer indexed by n.<br/>
   * The current (old) layer will be removed from it's parent with 'cleanup:YES'.
   * @param {Number} n the layer index to switch to
   */
  switchToAndReleaseMe(n: number) {
    if (!this._layers || n >= this._layers.length) {
      log(_LogInfos.LayerMultiplex_switchToAndReleaseMe)
      return
    }

    this.removeChild(this._layers[this._enabledLayer], true)

    //[layers replaceObjectAtIndex:_enabledLayer withObject:[NSNull null]];
    this._layers[this._enabledLayer] = null
    this._enabledLayer = n
    this.addChild(this._layers[n])
  }

  /**
   * Add a layer to the multiplex layers list
   * @param {Layer} layer
   */
  addLayer(layer: any) {
    if (!layer || !this._layers) {
      log(_LogInfos.LayerMultiplex_addLayer)
      return
    }
    this._layers.push(layer)
  }
}
