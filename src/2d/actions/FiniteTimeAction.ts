import { log } from "../../helper/Debugger";
import { Action } from "./Action";

export class FiniteTimeAction extends Action {
  _duration: number = 0;
  _timesForRepeat: number = 1;

  constructor() {
    super();
    this._duration = 0;
  }

  getDuration() {
    return this._duration * (this._timesForRepeat || 1);
  }

  setDuration(duration: number) {
    this._duration = duration;
  }

  reverse() {
    log("cocos2d: FiniteTimeAction#reverse: Implement me");
    return null;
  }

  clone() {
    return new FiniteTimeAction();
  }
}
