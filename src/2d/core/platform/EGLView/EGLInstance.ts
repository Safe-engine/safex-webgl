export class EGLInstance {
  _viewName = ''
  _initialized = false

  initialize() {
    this._initialized = true
  }

  getViewName(): string {
    return this._viewName
  }

  setViewName(viewName: string) {
    if (viewName != null && viewName.length > 0) {
      this._viewName = viewName
    }
  }
}
