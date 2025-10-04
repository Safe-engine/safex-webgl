/****************************************************************************
 * Converted to ES Module and TypeScript by GitHub Copilot
 ****************************************************************************/

import { eventManager, game, renderer } from '../..';
import { ActionManager } from './ActionManager';
import { Point, Size } from './cocoa/Geometry';
import { Profiler } from './Profiler';
import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { Scheduler } from './Scheduler';

export class DirectorDelegate { }

export class Director {

  // Static and constants
  static EVENT_PROJECTION_CHANGED = "director_projection_changed";
  static EVENT_AFTER_UPDATE = "director_after_update";
  static EVENT_AFTER_VISIT = "director_after_visit";
  static EVENT_AFTER_DRAW = "director_after_draw";

  static PROJECTION_2D = 0;
  static PROJECTION_3D = 1;
  static PROJECTION_CUSTOM = 3;
  static PROJECTION_DEFAULT = Director.PROJECTION_3D;

  static sharedDirector: Director | null = null;
  static firstUseDirector = true;

  static _getInstance(): Director {
    if (Director.firstUseDirector) {
      Director.firstUseDirector = false;
      Director.sharedDirector = new DisplayLinkDirector();
      Director.sharedDirector.init();
    }
    return Director.sharedDirector!;
  }
  // Variables
  private _landscape = false;
  private _nextDeltaTimeZero = false;
  private _paused = false;
  private _purgeDirectorInNextLoop = false;
  private _sendCleanupToScene = false;
  private _animationInterval = 0.0;
  private _oldAnimationInterval = 0.0;
  private _projection = Director.PROJECTION_DEFAULT;
  private _contentScaleFactor = 1.0;

  private _deltaTime = 0.0;

  _winSizeInPoints: Size = { width: 0, height: 0 };

  private _lastUpdate: number = Date.now();
  private _nextScene: Scene | null = null;
  private _notificationNode: Node | null = null;
  private _openGLView: any = null;
  private _scenesStack: Scene[] = [];
  private _projectionDelegate: DirectorDelegate | null = null;
  private _runningScene: Scene | null = null;

  private _totalFrames = 0;
  private _secondsPerFrame = 0;

  private _dirtyRegion: any = null;

  private _scheduler: Scheduler;
  private _actionManager: ActionManager | null = null;
  private _eventProjectionChanged: EventCustom;
  private _eventAfterUpdate: EventCustom;
  private _eventAfterVisit: EventCustom;
  private _eventAfterDraw: EventCustom;

  constructor() {
    this._lastUpdate = Date.now();
    eventManager.addCustomListener(game.EVENT_SHOW, () => {
      this._lastUpdate = Date.now();
    });

    this._scheduler = new Scheduler();
    if (ActionManager) {
      this._actionManager = new ActionManager();
      this._scheduler.scheduleUpdate(this._actionManager, Scheduler.PRIORITY_SYSTEM, false);
    }
    this._eventAfterUpdate = new EventCustom(Director.EVENT_AFTER_UPDATE);
    this._eventAfterUpdate.setUserData(this);
    this._eventAfterVisit = new EventCustom(Director.EVENT_AFTER_VISIT);
    this._eventAfterVisit.setUserData(this);
    this._eventAfterDraw = new EventCustom(Director.EVENT_AFTER_DRAW);
    this._eventAfterDraw.setUserData(this);
    this._eventProjectionChanged = new EventCustom(Director.EVENT_PROJECTION_CHANGED);
    this._eventProjectionChanged.setUserData(this);
  }

  public init(): boolean {
    this._oldAnimationInterval = this._animationInterval = 1.0 / defaultFPS;
    this._scenesStack = [];
    this._projection = Director.PROJECTION_DEFAULT;
    this._projectionDelegate = null;
    this._totalFrames = 0;
    this._lastUpdate = Date.now();
    this._paused = false;
    this._purgeDirectorInNextLoop = false;
    this._winSizeInPoints = { width: 0, height: 0 };
    this._openGLView = null;
    this._contentScaleFactor = 1.0;

    this._scheduler = new Scheduler();
    if (ActionManager) {
      this._actionManager = new ActionManager();
      this._scheduler.scheduleUpdate(this._actionManager, Scheduler.PRIORITY_SYSTEM, false);
    } else {
      this._actionManager = null;
    }

    this._eventAfterUpdate = new EventCustom(Director.EVENT_AFTER_UPDATE);
    this._eventAfterUpdate.setUserData(this);
    this._eventAfterVisit = new EventCustom(Director.EVENT_AFTER_VISIT);
    this._eventAfterVisit.setUserData(this);
    this._eventAfterDraw = new EventCustom(Director.EVENT_AFTER_DRAW);
    this._eventAfterDraw.setUserData(this);
    this._eventProjectionChanged = new EventCustom(Director.EVENT_PROJECTION_CHANGED);
    this._eventProjectionChanged.setUserData(this);

    return true;
  }

  /**
   * Calculates delta time since last time it was called
   */
  public calculateDeltaTime(): void {
    const now = Date.now();

    if (this._nextDeltaTimeZero) {
      this._deltaTime = 0;
      this._nextDeltaTimeZero = false;
    } else {
      this._deltaTime = (now - this._lastUpdate) / 1000;
    }

    if ((game.config[game.CONFIG_KEY.debugMode] > 0) && (this._deltaTime > 0.2))
      this._deltaTime = 1 / 60.0;

    this._lastUpdate = now;
  }

  /**
   * Converts a view coordinate to a WebGL coordinate
   */
  public convertToGL(uiPoint: Point): Point {
    const docElem = document.documentElement;
    const view = view;
    const box = docElem.getBoundingClientRect();
    const left = box.left + window.pageXOffset - docElem.clientLeft;
    const top = box.top + window.pageYOffset - docElem.clientTop;
    const x = view._devicePixelRatio * (uiPoint.x - left);
    const y = view._devicePixelRatio * (top + box.height - uiPoint.y);
    return view._isRotated
      ? { x: view._viewPortRect.width - y, y: x }
      : { x, y };
  }

  /**
   * Converts a WebGL coordinate to a view coordinate
   */
  public convertToUI(glPoint: Point): Point {
    const docElem = document.documentElement;
    const view = view;
    const box = docElem.getBoundingClientRect();
    const left = box.left + window.pageXOffset - docElem.clientLeft;
    const top = box.top + window.pageYOffset - docElem.clientTop;
    let uiPoint: Point = { x: 0, y: 0 };
    if (view._isRotated) {
      uiPoint.x = left + glPoint.y / view._devicePixelRatio;
      uiPoint.y = top + box.height - (view._viewPortRect.width - glPoint.x) / view._devicePixelRatio;
    } else {
      uiPoint.x = left + glPoint.x / view._devicePixelRatio;
      uiPoint.y = top + box.height - glPoint.y / view._devicePixelRatio;
    }
    return uiPoint;
  }

  /**
   * Draw the scene. This method is called every frame. Don't call it manually.
   */
  public drawScene(): void {
    const renderer: Renderer = renderer;

    this.calculateDeltaTime();

    if (!this._paused) {
      this._scheduler.update(this._deltaTime);
      eventManager.dispatchEvent(this._eventAfterUpdate);
    }

    if (this._nextScene) {
      this.setNextScene();
    }

    if (this._runningScene) {
      if (renderer.childrenOrderDirty) {
        renderer.clearRenderCommands();
        renderer.assignedZ = 0;
        (this._runningScene as any)._renderCmd._curLevel = 0;
        this._runningScene.visit();
        renderer.resetFlag();
      } else if (renderer.transformDirty()) {
        renderer.transform();
      }
    }

    renderer.clear();

    if (this._notificationNode)
      this._notificationNode.visit();

    eventManager.dispatchEvent(this._eventAfterVisit);
    g_NumberOfDraws = 0;

    renderer.rendering(_renderContext);
    this._totalFrames++;

    eventManager.dispatchEvent(this._eventAfterDraw);
    eventManager.frameUpdateListeners();

    this._calculateMPF();
  }

  /**
   * End the life of director in the next frame
   */
  public end(): void {
    this._purgeDirectorInNextLoop = true;
  }

  public getContentScaleFactor(): number {
    return this._contentScaleFactor;
  }

  public getNotificationNode(): Node | null {
    return this._notificationNode;
  }

  public getWinSize(): Size {
    return { ...this._winSizeInPoints };
  }

  public getWinSizeInPixels(): Size {
    return {
      width: this._winSizeInPoints.width * this._contentScaleFactor,
      height: this._winSizeInPoints.height * this._contentScaleFactor
    };
  }

  public getVisibleSize: (() => Size) | null = null;
  public getVisibleOrigin: (() => Point) | null = null;
  public getZEye: (() => number) | null = null;

  public pause(): void {
    if (this._paused) return;
    this._oldAnimationInterval = this._animationInterval;
    this.setAnimationInterval(1 / 4.0);
    this._paused = true;
  }

  public popScene(): void {
    if (!this._runningScene) throw new Error('No running scene to pop.');
    this._scenesStack.pop();
    const c = this._scenesStack.length;
    if (c === 0) {
      this.end();
    } else {
      this._sendCleanupToScene = true;
      this._nextScene = this._scenesStack[c - 1];
    }
  }

  public purgeCachedData(): void {
    animationCache._clear();
    spriteFrameCache._clear();
    textureCache._clear();
  }

  public purgeDirector(): void {
    this.getScheduler().unscheduleAll();
    if (eventManager)
      eventManager.setEnabled(false);

    if (this._runningScene) {
      this._runningScene._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
      this._runningScene._performRecursive(Node._stateCallbackType.onExit);
      this._runningScene._performRecursive(Node._stateCallbackType.cleanup);
    }

    this._runningScene = null;
    this._nextScene = null;
    this._scenesStack.length = 0;
    this.stopAnimation();
    this.purgeCachedData();
    checkGLErrorDebug();
  }

  public pushScene(scene: Scene): void {
    if (!scene) throw new Error('Scene must not be null.');
    this._sendCleanupToScene = false;
    this._scenesStack.push(scene);
    this._nextScene = scene;
  }

  public runScene(scene: Scene): void {
    if (!scene) throw new Error('Scene must not be null.');
    if (!this._runningScene) {
      this.pushScene(scene);
      this.startAnimation();
    } else {
      const i = this._scenesStack.length;
      if (i === 0) {
        this._sendCleanupToScene = true;
        this._scenesStack[i] = scene;
        this._nextScene = scene;
      } else {
        this._sendCleanupToScene = true;
        this._scenesStack[i - 1] = scene;
        this._nextScene = scene;
      }
    }
  }

  public resume(): void {
    if (!this._paused) return;
    this.setAnimationInterval(this._oldAnimationInterval);
    this._lastUpdate = Date.now();
    this._paused = false;
    this._deltaTime = 0;
  }

  public setContentScaleFactor(scaleFactor: number): void {
    if (scaleFactor !== this._contentScaleFactor) {
      this._contentScaleFactor = scaleFactor;
    }
  }

  public setDepthTest: ((on: boolean) => void) | null = null;
  public setClearColor: ((clearColor: any) => void) | null = null;

  public setDefaultValues(): void { }

  public setNextDeltaTimeZero(nextDeltaTimeZero: boolean): void {
    this._nextDeltaTimeZero = nextDeltaTimeZero;
  }

  public setNextScene(): void {
    let runningIsTransition = false, newIsTransition = false;
    if ((cc as any).TransitionScene) {
      runningIsTransition = this._runningScene ? this._runningScene instanceof (cc as any).TransitionScene : false;
      newIsTransition = this._nextScene ? this._nextScene instanceof (cc as any).TransitionScene : false;
    }

    if (!newIsTransition) {
      const locRunningScene = this._runningScene;
      if (locRunningScene) {
        locRunningScene._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
        locRunningScene._performRecursive(Node._stateCallbackType.onExit);
      }
      if (this._sendCleanupToScene && locRunningScene)
        locRunningScene._performRecursive(Node._stateCallbackType.cleanup);
    }

    this._runningScene = this._nextScene;
    renderer.childrenOrderDirty = true;
    this._nextScene = null;
    if ((!runningIsTransition) && (this._runningScene !== null)) {
      this._runningScene._performRecursive(Node._stateCallbackType.onEnter);
      this._runningScene._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish);
    }
  }

  public setNotificationNode(node: Node | null): void {
    renderer.childrenOrderDirty = true;
    if (this._notificationNode) {
      this._notificationNode._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
      this._notificationNode._performRecursive(Node._stateCallbackType.onExit);
      this._notificationNode._performRecursive(Node._stateCallbackType.cleanup);
    }
    this._notificationNode = node;
    if (!node) return;
    this._notificationNode._performRecursive(Node._stateCallbackType.onEnter);
    this._notificationNode._performRecursive(Node._stateCallbackType.onEnterTransitionDidFinish);
  }

  public getDelegate(): DirectorDelegate | null {
    return this._projectionDelegate;
  }

  public setDelegate(delegate: DirectorDelegate): void {
    this._projectionDelegate = delegate;
  }

  public setOpenGLView: ((openGLView: any) => void) | null = null;
  public setProjection: ((projection: number) => void) | null = null;
  public setViewport: (() => void) | null = null;
  public getOpenGLView: (() => any) | null = null;
  public getProjection: (() => number) | null = null;
  public setAlphaBlending: ((on: boolean) => void) | null = null;

  public isSendCleanupToScene(): boolean {
    return this._sendCleanupToScene;
  }

  public getRunningScene(): Scene | null {
    return this._runningScene;
  }

  public getAnimationInterval(): number {
    return this._animationInterval;
  }

  public isDisplayStats(): boolean {
    return Profiler ? Profiler.isShowingStats() : false;
  }

  public setDisplayStats(displayStats: boolean): void {
    if (Profiler) {
      displayStats ? Profiler.showStats() : Profiler.hideStats();
    }
  }

  public getSecondsPerFrame(): number {
    return this._secondsPerFrame;
  }

  public isNextDeltaTimeZero(): boolean {
    return this._nextDeltaTimeZero;
  }

  public isPaused(): boolean {
    return this._paused;
  }

  public getTotalFrames(): number {
    return this._totalFrames;
  }

  public popToRootScene(): void {
    this.popToSceneStackLevel(1);
  }

  public popToSceneStackLevel(level: number): void {
    if (!this._runningScene) throw new Error('No running scene.');
    const locScenesStack = this._scenesStack;
    let c = locScenesStack.length;
    if (level === 0) {
      this.end();
      return;
    }
    if (level >= c) return;
    while (c > level) {
      const current = locScenesStack.pop();
      if (current && (current as any).running) {
        current._performRecursive(Node._stateCallbackType.onExitTransitionDidStart);
        current._performRecursive(Node._stateCallbackType.onExit);
      }
      current?._performRecursive(Node._stateCallbackType.cleanup);
      c--;
    }
    this._nextScene = locScenesStack[locScenesStack.length - 1];
    this._sendCleanupToScene = true;
  }

  public getScheduler(): Scheduler {
    return this._scheduler;
  }

  public setScheduler(scheduler: Scheduler): void {
    if (this._scheduler !== scheduler) {
      this._scheduler = scheduler;
    }
  }

  public getActionManager(): ActionManager | null {
    return this._actionManager;
  }

  public setActionManager(actionManager: ActionManager): void {
    if (this._actionManager !== actionManager) {
      this._actionManager = actionManager;
    }
  }

  public getDeltaTime(): number {
    return this._deltaTime;
  }

  private _calculateMPF(): void {
    const now = Date.now();
    this._secondsPerFrame = (now - this._lastUpdate) / 1000;
  }

  // Animation control (to be overridden in DisplayLinkDirector)
  public startAnimation(): void { }
  public stopAnimation(): void { }
  public mainLoop(): void { }
  public setAnimationInterval(value: number): void {
    this._animationInterval = value;
  }

}

export class DisplayLinkDirector extends Director {
  private invalid = false;

  public startAnimation(): void {
    this.setNextDeltaTimeZero(true);
    this.invalid = false;
  }

  public mainLoop(): void {
    if ((this as any)._purgeDirectorInNextLoop) {
      (this as any)._purgeDirectorInNextLoop = false;
      this.purgeDirector();
    } else if (!this.invalid) {
      this.drawScene();
    }
  }

  public stopAnimation(): void {
    this.invalid = true;
  }

  public setAnimationInterval(value: number): void {
    (this as any)._animationInterval = value;
    if (!this.invalid) {
      this.stopAnimation();
      this.startAnimation();
    }
  }
}

// Default FPS
export const defaultFPS = 60;