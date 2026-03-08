export const each = function (obj, iterator, context?) {
  if (!obj) return
  if (obj instanceof Array) {
    for (let i = 0, li = obj.length; i < li; i++) {
      if (iterator.call(context, obj[i], i) === false) return
    }
  } else {
    for (const key in obj) {
      if (iterator.call(context, obj[key], key) === false) return
    }
  }
}

export class AsyncPool {
  private _finished = false
  private _srcObj: any
  private _limit: number
  private _pool: any[] = []
  private _iterator: any
  private _iteratorTarget: any
  private _onEnd: any
  private _onEndTarget: any
  private _results: any
  private _errors: any
  size: number
  finishedSize = 0
  private _workingSize = 0

  constructor(srcObj: any, limit: number, iterator: any, onEnd: any, target?: any) {
    this._srcObj = srcObj
    this._limit = limit
    this._iterator = iterator
    this._iteratorTarget = target
    this._onEnd = onEnd
    this._onEndTarget = target
    this._results = srcObj instanceof Array ? [] : {}
    this._errors = srcObj instanceof Array ? [] : {}

    each(srcObj, (value: any, index: any) => {
      this._pool.push({ index: index, value: value })
    })

    this.size = this._pool.length
    this._limit = this._limit || this.size
  }

  onIterator(iterator: any, target: any): void {
    this._iterator = iterator
    this._iteratorTarget = target
  }

  // onEnd(endCb: any, endCbTarget: any): void {
  //   this._onEnd = endCb
  //   this._onEndTarget = endCbTarget
  // }

  private _handleItem(): void {
    if (this._pool.length === 0 || this._workingSize >= this._limit) return

    const item = this._pool.shift()
    const value = item.value
    const index = item.index
    this._workingSize++
    this._iterator.call(
      this._iteratorTarget,
      value,
      index,
      (err: any, result: any) => {
        if (this._finished) {
          return
        }

        if (err) {
          this._errors[index] = err
        } else {
          this._results[index] = result
        }

        this.finishedSize++
        this._workingSize--
        if (this.finishedSize === this.size) {
          const errors = Object.keys(this._errors).length === 0 ? null : this._errors
          this.onEnd(errors, this._results)
          return
        }
        this._handleItem()
      },
      this,
    )
  }

  flow(): void {
    if (this._pool.length === 0) {
      if (this._onEnd) this._onEnd.call(this._onEndTarget, null, [])
      return
    }
    for (let i = 0; i < this._limit; i++) this._handleItem()
  }

  onEnd(errors: any, results: any): void {
    this._finished = true
    if (this._onEnd) {
      const selector = this._onEnd
      const target = this._onEndTarget
      this._onEnd = null
      this._onEndTarget = null
      selector.call(target, errors, results)
    }
  }
}
