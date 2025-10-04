export class EventListenerVector {
  _fixedListeners: any[];
  _sceneGraphListeners: any[];
  gt0Index: number = 0;

  constructor() {
    this._fixedListeners = [];
    this._sceneGraphListeners = [];
  }

  size(): number {
    return this._fixedListeners.length + this._sceneGraphListeners.length;
  }

  empty(): boolean {
    return (this._fixedListeners.length === 0) && (this._sceneGraphListeners.length === 0);
  }

  push(listener: any): void {
    if (listener._getFixedPriority && listener._getFixedPriority() === 0)
      this._sceneGraphListeners.push(listener);
    else
      this._fixedListeners.push(listener);
  }

  clearSceneGraphListeners(): void {
    this._sceneGraphListeners.length = 0;
  }

  clearFixedListeners(): void {
    this._fixedListeners.length = 0;
  }

  clear(): void {
    this._sceneGraphListeners.length = 0;
    this._fixedListeners.length = 0;
  }

  getFixedPriorityListeners(): any[] {
    return this._fixedListeners;
  }

  getSceneGraphPriorityListeners(): any[] {
    return this._sceneGraphListeners;
  }
}