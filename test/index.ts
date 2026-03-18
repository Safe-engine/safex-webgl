import { director, game, global, sys, view } from '../src'
import { ResolutionPolicy } from '../src/core'
import { ParticleScene } from './ParticleScene'

global._isContextMenuEnable = true
game.run(
  {
    debugMode: 1,
    showFPS: true,
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
    const width = 720
    const height = 1280
    const policy = width > height ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH
    view.setDesignResolutionSize(width, height, policy)
    // The game will be resized when browser size change
    view.resizeWithBrowserSize(true)
    director.runScene(new ParticleScene())
  },
)
