  export class SpriteLoadManager {
  list: any[] = [];

  constructor() {
    this.list = [];
  }

  add(source: any, callback: any, target: any): void {
    if (!source || !source.addEventListener) return;
    source.addEventListener('load', callback, target);
    this.list.push({
      source: source,
      listener: callback,
      target: target
    });
  }

  once(source: any, callback: any, target: any): void {
    if (!source || !source.addEventListener) return;
    var tmpCallback = function (event: any) {
      source.removeEventListener('load', tmpCallback, target);
      callback.call(target, event);
    };
    source.addEventListener('load', tmpCallback, target);
    this.list.push({
      source: source,
      listener: tmpCallback,
      target: target
    });
  }

  clear(): void {
    while (this.list.length > 0) {
      var item = this.list.pop();
      item.source.removeEventListener('load', item.listener, item.target);
    }
  }
}