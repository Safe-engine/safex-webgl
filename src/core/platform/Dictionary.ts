export class Dictionary {
  private _keyMapTb: { [key: string]: any } = {}
  private _valueMapTb: { [key: string]: any } = {}
  private __currId = 0

  constructor() {
    this.__currId = 2 << (0 | (Math.random() * 10))
  }

  private __getKey(): string {
    this.__currId++
    return `key_${this.__currId}`
  }

  setObject(value: any, key: any): void {
    if (key == null) return

    const keyId = this.__getKey()
    this._keyMapTb[keyId] = key
    this._valueMapTb[keyId] = value
  }

  objectForKey(key: any): any {
    if (key == null) return null

    const locKeyMapTb = this._keyMapTb
    for (const keyId in locKeyMapTb) {
      if (locKeyMapTb[keyId] === key) return this._valueMapTb[keyId]
    }
    return null
  }

  valueForKey(key: any): any {
    return this.objectForKey(key)
  }

  removeObjectForKey(key: any): void {
    if (key == null) return

    const locKeyMapTb = this._keyMapTb
    for (const keyId in locKeyMapTb) {
      if (locKeyMapTb[keyId] === key) {
        delete this._valueMapTb[keyId]
        delete locKeyMapTb[keyId]
        return
      }
    }
  }

  removeObjectsForKeys(keys: any[]): void {
    if (keys == null) return

    for (let i = 0; i < keys.length; i++) this.removeObjectForKey(keys[i])
  }

  allKeys(): any[] {
    const keyArr: any[] = []
    const locKeyMapTb = this._keyMapTb
    for (const key in locKeyMapTb) keyArr.push(locKeyMapTb[key])
    return keyArr
  }

  removeAllObjects(): void {
    this._keyMapTb = {}
    this._valueMapTb = {}
  }

  count(): number {
    return this.allKeys().length
  }
}
