import { director, game, view } from "../src"
import { ResolutionPolicy } from "../src/2d/core/platform/EGLView/ResolutionPolicy"
import { Scene } from "../src/2d/core/scenes/Scene"
import { global } from "../src/helper/global"
import { sys } from "../src/helper/sys"

class BootScene extends Scene {
  constructor() {
    super()
    this.scheduleUpdate()
  }
  onEnter() {
    super.onEnter()
  }

  update(dt) {
  }
}

global._isContextMenuEnable = true
game.run(
  {
    debugMode: 1,
    showFPS: false,
    frameRate: 60,
    id: 'gameCanvas',
    renderMode: 2,
  },
  function onStart() {
    // Pass true to enable retina display, disabled by default to improve performance
    view.enableRetina(sys.os === sys.OS_IOS)
    // Adjust viewport meta
    view.adjustViewPort(true)
    // Setup the resolution policy and design resolution size
    const width = 750
    const height = 1334
    const policy = width > height ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH
    view.setDesignResolutionSize(width, height, policy)
    // The game will be resized when browser size change
    view.resizeWithBrowserSize(true)
    director.runScene(new BootScene())
  },
)