interface Window {
  requestAnimFrame: (callback: FrameRequestCallback) => number
  cancelAnimationFrame: (handle: number) => void
  gl: WebGLRenderingContext | null
  webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number
  mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number
  oRequestAnimationFrame?: (callback: FrameRequestCallback) => number
  msRequestAnimationFrame?: (callback: FrameRequestCallback) => number
  cancelRequestAnimationFrame?: (handle: number) => void
  msCancelRequestAnimationFrame?: (handle: number) => void
  mozCancelRequestAnimationFrame?: (handle: number) => void
  oCancelRequestAnimationFrame?: (handle: number) => void
  webkitCancelRequestAnimationFrame?: (handle: number) => void
  msCancelAnimationFrame?: (handle: number) => void
  mozCancelAnimationFrame?: (handle: number) => void
  webkitCancelAnimationFrame?: (handle: number) => void
  oCancelAnimationFrame?: (handle: number) => void
  ENABLE_IMAGE_POOL: boolean
  webkitAudioContext: any
  mozAudioContext: any
  __audioSupport: any
  IEBinaryToArray_ByteStr: any
  IEBinaryToArray_ByteStr_Last: any
}
type SafexXMLHttpRequest = XMLHttpRequest & { _timeoutId: number }

interface Document {
  ccConfig?: any
  mozHidden?: boolean
  msHidden?: boolean
  webkitHidden?: boolean
}

interface Navigator {
  msPointerEnabled?: boolean
}
