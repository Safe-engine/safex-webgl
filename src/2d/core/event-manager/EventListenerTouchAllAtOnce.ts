import { _LogInfos, log } from "../../../helper/Debugger";
import { EventListener } from "./EventListener";

export class EventListenerTouchAllAtOnce extends EventListener {
  public onTouchesBegan: any = null;
  public onTouchesMoved: any = null;
  public onTouchesEnded: any = null;
  public onTouchesCancelled: any = null;

  static LISTENER_ID = "__cc_touch_all_at_once";

  constructor() {
    super(EventListener.TOUCH_ALL_AT_ONCE, EventListenerTouchAllAtOnce.LISTENER_ID, null);
  }

  clone() {
    const eventListener = new EventListenerTouchAllAtOnce();
    eventListener.onTouchesBegan = this.onTouchesBegan;
    eventListener.onTouchesMoved = this.onTouchesMoved;
    eventListener.onTouchesEnded = this.onTouchesEnded;
    eventListener.onTouchesCancelled = this.onTouchesCancelled;
    return eventListener;
  }

  checkAvailable() {
    if (this.onTouchesBegan === null && this.onTouchesMoved === null
      && this.onTouchesEnded === null && this.onTouchesCancelled === null) {
      log(_LogInfos._EventListenerTouchAllAtOnce_checkAvailable);
      return false;
    }
    return true;
  }

  static create() {
    return new EventListenerTouchAllAtOnce();
  }
}
