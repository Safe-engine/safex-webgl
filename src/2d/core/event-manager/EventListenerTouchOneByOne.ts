import { _LogInfos, log } from "../../../helper/Debugger";
import { EventListener } from "./EventListener";

export class EventListenerTouchOneByOne extends EventListener {
  public _claimedTouches: any[] = [];
  public swallowTouches: boolean = false;
  public onTouchBegan: any = null;
  public onTouchMoved: any = null;
  public onTouchEnded: any = null;
  public onTouchCancelled: any = null;

  static LISTENER_ID = "__cc_touch_one_by_one";

  constructor() {
    super(EventListener.TOUCH_ONE_BY_ONE, EventListenerTouchOneByOne.LISTENER_ID, null);
    this._claimedTouches = [];
  }

  setSwallowTouches(needSwallow: boolean) {
    this.swallowTouches = needSwallow;
  }

  isSwallowTouches() {
    return this.swallowTouches;
  }

  clone() {
    const eventListener = new EventListenerTouchOneByOne();
    eventListener.onTouchBegan = this.onTouchBegan;
    eventListener.onTouchMoved = this.onTouchMoved;
    eventListener.onTouchEnded = this.onTouchEnded;
    eventListener.onTouchCancelled = this.onTouchCancelled;
    eventListener.swallowTouches = this.swallowTouches;
    return eventListener;
  }

  checkAvailable() {
    if (!this.onTouchBegan) {
      log(_LogInfos._EventListenerTouchOneByOne_checkAvailable);
      return false;
    }
    return true;
  }

  static create() {
    return new EventListenerTouchOneByOne();
  }
}