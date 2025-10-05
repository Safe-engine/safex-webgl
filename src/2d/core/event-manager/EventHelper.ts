
// The event helper
export class EventHelper {
  // apply(object: any) {
  //   object.addEventListener = this.addEventListener;
  //   object.hasEventListener = this.hasEventListener;
  //   object.removeEventListener = this.removeEventListener;
  //   object.removeEventTarget = this.removeEventTarget;
  //   object.dispatchEvent = this.dispatchEvent;
  // }

  addEventListener(this: any, type: any, listener: any, target?: any) {
    // check 'type' status, if the status is ready, dispatch event next frame
    if (type === "load" && this._textureLoaded) { // only load event checked.
      setTimeout(function () {
        listener.call(target);
      }, 0);
      return;
    }

    if (this._listeners === undefined) this._listeners = {};

    const listeners = this._listeners;
    if (listeners[type] === undefined) listeners[type] = [];

    if (!this.hasEventListener(type, listener, target))
      listeners[type].push({ callback: listener, eventTarget: target });
  }

  hasEventListener(this: any, type: any, listener: any, target?: any) {
    if (this._listeners === undefined) return false;

    const listeners = this._listeners;
    const listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      for (let i = 0, len = listenerArray.length; i < len; i++) {
        const selListener = listenerArray[i];
        if (selListener.callback === listener && selListener.eventTarget === target) return true;
      }
    }
    return false;
  }

  removeEventListener(this: any, type: any, listener: any, target?: any) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      for (let i = 0; i < listenerArray.length;) {
        const selListener = listenerArray[i];
        if (selListener.eventTarget === target && selListener.callback === listener) listenerArray.splice(i, 1);
        else i++;
      }
    }
  }

  removeEventTarget(this: any, type: any, target?: any) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      for (let i = 0; i < listenerArray.length;) {
        const selListener = listenerArray[i];
        if (selListener.eventTarget === target) listenerArray.splice(i, 1);
        else i++;
      }
    }
  }

  dispatchEvent(this: any, event: any, clearAfterDispatch?: boolean) {
    if (this._listeners === undefined) return;

    if (clearAfterDispatch == null) clearAfterDispatch = true;
    const listeners = this._listeners;
    const listenerArray = listeners[event];

    if (listenerArray !== undefined) {
      const array: any[] = [];
      const length = listenerArray.length;

      for (let i = 0; i < length; i++) {
        array[i] = listenerArray[i];
      }

      for (let i = 0; i < length; i++) {
        array[i].callback.call(array[i].eventTarget, this);
      }

      if (clearAfterDispatch) listenerArray.length = 0;
    }
  }
}
