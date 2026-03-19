export class CustomRenderCmd {
  _needDraw = true
  declare _target: any
  declare _callback: (ctx: any, scaleX: number, scaleY: number) => void

  constructor(target: any, func: (ctx: any, scaleX: number, scaleY: number) => void) {
    this._target = target
    this._callback = func
  }

  rendering(ctx: any, scaleX: number, scaleY: number) {
    if (!this._callback) return
    this._callback.call(this._target, ctx, scaleX, scaleY)
  }

  needDraw() {
    return this._needDraw
  }
}
