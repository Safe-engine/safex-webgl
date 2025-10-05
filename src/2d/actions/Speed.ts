import { Action } from "./Action";

export class Speed extends Action {
  _speed: number = 0.0;
  _innerAction: any = null;

  constructor(action?: any, speed?: number) {
    super();
    this._speed = 0;
    this._innerAction = null;
    action && this.initWithAction(action, speed as number);
  }

  getSpeed() {
    return this._speed;
  }

  setSpeed(speed: number) {
    this._speed = speed;
  }

  initWithAction(action: any, speed: number) {
    if (!action) throw new Error("Speed.initWithAction(): action must be non nil");
    this._innerAction = action;
    this._speed = speed;
    return true;
  }

  clone() {
    const action = new Speed();
    action.initWithAction(this._innerAction.clone(), this._speed);
    return action;
  }

  startWithTarget(target: any) {
    super.startWithTarget(target);
    this._innerAction.startWithTarget(target);
  }

  stop() {
    this._innerAction.stop();
    super.stop();
  }

  step(dt: number) {
    this._innerAction.step(dt * this._speed);
  }

  isDone() {
    return this._innerAction.isDone();
  }

  reverse() {
    return new Speed(this._innerAction.reverse(), this._speed);
  }

  setInnerAction(action: any) {
    if (this._innerAction !== action) this._innerAction = action;
  }

  getInnerAction() {
    return this._innerAction;
  }
}

export function speed(actionObj: any, speedVal: number) {
  return new Speed(actionObj, speedVal);
}

Speed.create = speed as any;
