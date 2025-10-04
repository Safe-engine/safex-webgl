/****************************************************************************
 * Converted to ES Module and TypeScript by GitHub Copilot
 ****************************************************************************/

import { cc } from './Boot';

const MAX_POOL_SIZE = 20;

// ListEntry: double-linked list node for updates with priority
class ListEntry {
    prev: ListEntry | null;
    next: ListEntry | null;
    callback: (dt: number) => void;
    target: any;
    priority: number;
    paused: boolean;
    markedForDeletion: boolean;

    constructor(
        prev: ListEntry | null,
        next: ListEntry | null,
        callback: (dt: number) => void,
        target: any,
        priority: number,
        paused: boolean,
        markedForDeletion: boolean
    ) {
        this.prev = prev;
        this.next = next;
        this.callback = callback;
        this.target = target;
        this.priority = priority;
        this.paused = paused;
        this.markedForDeletion = markedForDeletion;
    }

    static _pool: ListEntry[] = [];

    static get(
        prev: ListEntry | null,
        next: ListEntry | null,
        callback: (dt: number) => void,
        target: any,
        priority: number,
        paused: boolean,
        markedForDeletion: boolean
    ): ListEntry {
        const result = ListEntry._pool.pop();
        if (result) {
            result.prev = prev;
            result.next = next;
            result.callback = callback;
            result.target = target;
            result.priority = priority;
            result.paused = paused;
            result.markedForDeletion = markedForDeletion;
            return result;
        }
        return new ListEntry(prev, next, callback, target, priority, paused, markedForDeletion);
    }

    static put(entry: ListEntry) {
        entry.prev = null;
        entry.next = null;
        entry.callback = null as any;
        entry.target = null;
        entry.priority = 0;
        entry.paused = false;
        entry.markedForDeletion = false;
        if (ListEntry._pool.length < MAX_POOL_SIZE)
            ListEntry._pool.push(entry);
    }
}

// HashUpdateEntry: for fast lookup of update entries
class HashUpdateEntry {
    list: ListEntry[];
    entry: ListEntry;
    target: any;
    callback: ((dt: number) => void) | null;

    constructor(list: ListEntry[], entry: ListEntry, target: any, callback: ((dt: number) => void) | null) {
        this.list = list;
        this.entry = entry;
        this.target = target;
        this.callback = callback;
    }

    static _pool: HashUpdateEntry[] = [];

    static get(list: ListEntry[], entry: ListEntry, target: any, callback: ((dt: number) => void) | null): HashUpdateEntry {
        const result = HashUpdateEntry._pool.pop();
        if (result) {
            result.list = list;
            result.entry = entry;
            result.target = target;
            result.callback = callback;
            return result;
        }
        return new HashUpdateEntry(list, entry, target, callback);
    }

    static put(entry: HashUpdateEntry) {
        entry.list = null as any;
        entry.entry = null as any;
        entry.target = null;
        entry.callback = null;
        if (HashUpdateEntry._pool.length < MAX_POOL_SIZE)
            HashUpdateEntry._pool.push(entry);
    }
}

// HashTimerEntry: for selectors with interval
class HashTimerEntry {
    timers: CallbackTimer[] | null;
    target: any;
    timerIndex: number;
    currentTimer: CallbackTimer | null;
    currentTimerSalvaged: boolean;
    paused: boolean;

    constructor(
        timers: CallbackTimer[] | null,
        target: any,
        timerIndex: number,
        currentTimer: CallbackTimer | null,
        currentTimerSalvaged: boolean,
        paused: boolean
    ) {
        this.timers = timers;
        this.target = target;
        this.timerIndex = timerIndex;
        this.currentTimer = currentTimer;
        this.currentTimerSalvaged = currentTimerSalvaged;
        this.paused = paused;
    }

    static _pool: HashTimerEntry[] = [];

    static get(
        timers: CallbackTimer[] | null,
        target: any,
        timerIndex: number,
        currentTimer: CallbackTimer | null,
        currentTimerSalvaged: boolean,
        paused: boolean
    ): HashTimerEntry {
        const result = HashTimerEntry._pool.pop();
        if (result) {
            result.timers = timers;
            result.target = target;
            result.timerIndex = timerIndex;
            result.currentTimer = currentTimer;
            result.currentTimerSalvaged = currentTimerSalvaged;
            result.paused = paused;
            return result;
        }
        return new HashTimerEntry(timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused);
    }

    static put(entry: HashTimerEntry) {
        entry.timers = null;
        entry.target = null;
        entry.timerIndex = 0;
        entry.currentTimer = null;
        entry.currentTimerSalvaged = false;
        entry.paused = false;
        if (HashTimerEntry._pool.length < MAX_POOL_SIZE)
            HashTimerEntry._pool.push(entry);
    }
}

// CallbackTimer: lightweight timer
class CallbackTimer {
    _scheduler: Scheduler | null = null;
    _elapsed: number = -1;
    _runForever: boolean = false;
    _useDelay: boolean = false;
    _timesExecuted: number = 0;
    _repeat: number = 0;
    _delay: number = 0;
    _interval: number = 0;
    _target: any = null;
    _callback: ((dt: number) => void) | null = null;
    _key: string | null = null;

    initWithCallback(
        scheduler: Scheduler,
        callback: ((dt: number) => void),
        target: any,
        seconds: number,
        repeat: number,
        delay: number,
        key?: string
    ): boolean {
        this._scheduler = scheduler;
        this._target = target;
        this._callback = callback;
        if (key)
            this._key = key;

        this._elapsed = -1;
        this._interval = seconds;
        this._delay = delay;
        this._useDelay = (this._delay > 0);
        this._repeat = repeat;
        this._runForever = (this._repeat === REPEAT_FOREVER);
        return true;
    }

    getInterval(): number { return this._interval; }
    setInterval(interval: number) { this._interval = interval; }
    getCallback() { return this._callback; }
    getKey() { return this._key; }

    update(dt: number) {
        if (this._elapsed === -1) {
            this._elapsed = 0;
            this._timesExecuted = 0;
        } else {
            this._elapsed += dt;
            if (this._runForever && !this._useDelay) {
                if (this._elapsed >= this._interval) {
                    this.trigger();
                    this._elapsed = 0;
                }
            } else {
                if (this._useDelay) {
                    if (this._elapsed >= this._delay) {
                        this.trigger();
                        this._elapsed -= this._delay;
                        this._timesExecuted += 1;
                        this._useDelay = false;
                    }
                } else {
                    if (this._elapsed >= this._interval) {
                        this.trigger();
                        this._elapsed = 0;
                        this._timesExecuted += 1;
                    }
                }
                if (this._callback && !this._runForever && this._timesExecuted > this._repeat)
                    this.cancel();
            }
        }
    }

    trigger() {
        if (this._target && this._callback) {
            this._callback.call(this._target, this._elapsed);
        }
    }

    cancel() {
        this._scheduler?.unschedule(this._callback!, this._target);
    }

    static _pool: CallbackTimer[] = [];

    static get(): CallbackTimer {
        return CallbackTimer._pool.pop() || new CallbackTimer();
    }

    static put(timer: CallbackTimer) {
        timer._scheduler = null;
        timer._elapsed = -1;
        timer._runForever = false;
        timer._useDelay = false;
        timer._timesExecuted = 0;
        timer._repeat = 0;
        timer._delay = 0;
        timer._interval = 0;
        timer._target = null;
        timer._callback = null;
        timer._key = null;
        if (CallbackTimer._pool.length < MAX_POOL_SIZE)
            CallbackTimer._pool.push(timer);
    }
}

// Scheduler class
export class Scheduler {
    static PRIORITY_SYSTEM = (-2147483647 - 1);
    static PRIORITY_NON_SYSTEM = Scheduler.PRIORITY_SYSTEM + 1;

    _timeScale: number = 1.0;

    _updatesNegList: ListEntry[] = [];
    _updates0List: ListEntry[] = [];
    _updatesPosList: ListEntry[] = [];

    _hashForTimers: { [id: string]: HashTimerEntry } = {};
    _arrayForTimers: HashTimerEntry[] = [];
    _hashForUpdates: { [id: string]: HashUpdateEntry } = {};

    _currentTarget: HashTimerEntry | null = null;
    _currentTargetSalvaged: boolean = false;
    _updateHashLocked: boolean = false;

    constructor() {
        this._timeScale = 1.0;
        this._updatesNegList = [];
        this._updates0List = [];
        this._updatesPosList = [];
        this._hashForUpdates = {};
        this._hashForTimers = {};
        this._currentTarget = null;
        this._currentTargetSalvaged = false;
        this._updateHashLocked = false;
        this._arrayForTimers = [];
    }

    setTimeScale(timeScale: number) {
        this._timeScale = timeScale;
    }

    getTimeScale(): number {
        return this._timeScale;
    }

    update(dt: number) {
        this._updateHashLocked = true;
        if (this._timeScale !== 1)
            dt *= this._timeScale;

        let i: number, list: ListEntry[], len: number, entry: ListEntry;

        for (i = 0, list = this._updatesNegList, len = list.length; i < len; i++) {
            entry = list[i];
            if (!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }
        for (i = 0, list = this._updates0List, len = list.length; i < len; i++) {
            entry = list[i];
            if (!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }
        for (i = 0, list = this._updatesPosList, len = list.length; i < len; i++) {
            entry = list[i];
            if (!entry.paused && !entry.markedForDeletion)
                entry.callback(dt);
        }

        // Iterate over all the custom selectors
        let elt: HashTimerEntry, arr = this._arrayForTimers;
        for (i = 0; i < arr.length; i++) {
            elt = arr[i];
            this._currentTarget = elt;
            this._currentTargetSalvaged = false;

            if (!elt.paused) {
                for (elt.timerIndex = 0; elt.timerIndex < elt.timers!.length; ++(elt.timerIndex)) {
                    elt.currentTimer = elt.timers![elt.timerIndex];
                    elt.currentTimerSalvaged = false;
                    elt.currentTimer.update(dt);
                    elt.currentTimer = null;
                }
            }
            if (this._currentTargetSalvaged && this._currentTarget.timers!.length === 0)
                this._removeHashElement(this._currentTarget);
        }

        // delete all updates that are marked for deletion
        for (i = 0, list = this._updatesNegList; i < list.length;) {
            entry = list[i];
            if (entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }
        for (i = 0, list = this._updates0List; i < list.length;) {
            entry = list[i];
            if (entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }
        for (i = 0, list = this._updatesPosList; i < list.length;) {
            entry = list[i];
            if (entry.markedForDeletion)
                this._removeUpdateFromHash(entry);
            else
                i++;
        }

        this._updateHashLocked = false;
        this._currentTarget = null;
    }

    scheduleCallbackForTarget(target: any, callback_fn: (dt: number) => void, interval: number, repeat: number, delay: number, paused: boolean) {
        this.schedule(callback_fn, target, interval, repeat, delay, paused, target.__instanceId + "");
    }

    schedule(
        callback: ((dt: number) => void) | any,
        target: any,
        interval: number,
        repeat: number,
        delay: number,
        paused: boolean,
        key?: string
    ) {
        let isSelector = false;
        if (typeof callback !== "function") {
            const tmp = callback;
            callback = target;
            target = tmp;
            isSelector = true;
        }
        if (arguments.length === 4 || arguments.length === 5) {
            key = delay as any;
            paused = repeat as any;
            repeat = REPEAT_FOREVER;
            delay = 0;
        }
        if (key === undefined) {
            key = target.__instanceId + "";
        }

        assert?.(target, _LogInfos?.Scheduler_scheduleCallbackForTarget_3);

        let element = this._hashForTimers[target.__instanceId];
        if (!element) {
            element = HashTimerEntry.get(null, target, 0, null, false, paused);
            this._arrayForTimers.push(element);
            this._hashForTimers[target.__instanceId] = element;
        } else {
            assert?.(element.paused === paused, "");
        }

        let timer: CallbackTimer, i: number;
        if (element.timers == null) {
            element.timers = [];
        } else {
            for (i = 0; i < element.timers.length; i++) {
                timer = element.timers[i];
                if (callback === timer._callback) {
                    log?.(_LogInfos?.Scheduler_scheduleCallbackForTarget, timer.getInterval().toFixed(4), interval.toFixed(4));
                    timer._interval = interval;
                    return;
                }
            }
        }

        timer = CallbackTimer.get();
        timer.initWithCallback(this, callback, target, interval, repeat, delay, key);
        element.timers.push(timer);
    }

    scheduleUpdate(target: any, priority: number, paused: boolean) {
        this._schedulePerFrame((dt: number) => {
            target.update(dt);
        }, target, priority, paused);
    }

    private _schedulePerFrame(callback: (dt: number) => void, target: any, priority: number, paused: boolean) {
        const hashElement = this._hashForUpdates[target.__instanceId];
        if (hashElement && hashElement.entry) {
            if (hashElement.entry.priority !== priority) {
                if (this._updateHashLocked) {
                    log?.("warning: you CANNOT change update priority in scheduled function");
                    hashElement.entry.markedForDeletion = false;
                    hashElement.entry.paused = paused;
                    return;
                } else {
                    this.unscheduleUpdate(target);
                }
            } else {
                hashElement.entry.markedForDeletion = false;
                hashElement.entry.paused = paused;
                return;
            }
        }

        if (priority === 0) {
            this._appendIn(this._updates0List, callback, target, paused);
        } else if (priority < 0) {
            this._priorityIn(this._updatesNegList, callback, target, priority, paused);
        } else {
            this._priorityIn(this._updatesPosList, callback, target, priority, paused);
        }
    }

    private _priorityIn(ppList: ListEntry[], callback: (dt: number) => void, target: any, priority: number, paused: boolean): ListEntry[] {
        const listElement = ListEntry.get(null, null, callback, target, priority, paused, false);
        if (!ppList) {
            ppList = [];
            ppList.push(listElement);
        } else {
            let index2Insert = ppList.length - 1;
            let i = 0;
            for (; i <= index2Insert; i++) {
                if (priority < ppList[i].priority) {
                    index2Insert = i;
                    break;
                }
            }
            ppList.splice(i, 0, listElement);
        }
        this._hashForUpdates[target.__instanceId] = HashUpdateEntry.get(ppList, listElement, target, null);
        return ppList;
    }

    private _appendIn(ppList: ListEntry[], callback: (dt: number) => void, target: any, paused: boolean) {
        const listElement = ListEntry.get(null, null, callback, target, 0, paused, false);
        ppList.push(listElement);
        this._hashForUpdates[target.__instanceId] = HashUpdateEntry.get(ppList, listElement, target, null);
    }

    private _removeHashElement(element: HashTimerEntry) {
        delete this._hashForTimers[element.target.__instanceId];
        const arr = this._arrayForTimers;
        for (let i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === element) {
                arr.splice(i, 1);
                break;
            }
        }
        HashTimerEntry.put(element);
    }

    private _removeUpdateFromHash(entry: ListEntry) {
        const element = this._hashForUpdates[entry.target.__instanceId];
        if (element) {
            const list = element.list, listEntry = element.entry;
            for (let i = 0, l = list.length; i < l; i++) {
                if (list[i] === listEntry) {
                    list.splice(i, 1);
                    break;
                }
            }
            delete this._hashForUpdates[element.target.__instanceId];
            ListEntry.put(listEntry);
            HashUpdateEntry.put(element);
        }
    }

    unschedule(key: any, target: any) {
        if (!target || !key)
            return;
        const element = this._hashForTimers[target.__instanceId];
        if (element) {
            const timers = element.timers!;
            for (let i = 0, li = timers.length; i < li; i++) {
                const timer = timers[i];
                if (this._getUnscheduleMark(key, timer)) {
                    if ((timer === element.currentTimer) && (!element.currentTimerSalvaged)) {
                        element.currentTimerSalvaged = true;
                    }
                    timers.splice(i, 1);
                    CallbackTimer.put(timer);
                    if (element.timerIndex >= i) {
                        element.timerIndex--;
                    }
                    if (timers.length === 0) {
                        if (this._currentTarget === element) {
                            this._currentTargetSalvaged = true;
                        } else {
                            this._removeHashElement(element);
                        }
                    }
                    return;
                }
            }
        }
    }

    private _getUnscheduleMark(key: any, timer: CallbackTimer) {
        switch (typeof key) {
            case "number":
            case "string":
                return key === timer._key;
            case "function":
                return key === timer._callback;
        }
    }

    unscheduleUpdate(target: any) {
        if (!target)
            return;
        const element = this._hashForUpdates[target.__instanceId];
        if (element) {
            if (this._updateHashLocked) {
                element.entry.markedForDeletion = true;
            } else {
                this._removeUpdateFromHash(element.entry);
            }
        }
    }

    unscheduleAllForTarget(target: any) {
        if (!target) return;
        const element = this._hashForTimers[target.__instanceId];
        if (element) {
            const timers = element.timers!;
            if (timers.indexOf(element.currentTimer!) > -1 && (!element.currentTimerSalvaged)) {
                element.currentTimerSalvaged = true;
            }
            for (let i = 0, l = timers.length; i < l; i++) {
                CallbackTimer.put(timers[i]);
            }
            timers.length = 0;
            if (this._currentTarget === element) {
                this._currentTargetSalvaged = true;
            } else {
                this._removeHashElement(element);
            }
        }
        this.unscheduleUpdate(target);
    }

    unscheduleAll() {
        this.unscheduleAllWithMinPriority(Scheduler.PRIORITY_SYSTEM);
    }

    unscheduleAllWithMinPriority(minPriority: number) {
        let i, element, arr = this._arrayForTimers;
        for (i = arr.length - 1; i >= 0; i--) {
            element = arr[i];
            this.unscheduleAllForTarget(element.target);
        }
        let entry;
        let temp_length = 0;
        if (minPriority < 0) {
            for (i = 0; i < this._updatesNegList.length;) {
                temp_length = this._updatesNegList.length;
                entry = this._updatesNegList[i];
                if (entry && entry.priority >= minPriority)
                    this.unscheduleUpdate(entry.target);
                if (temp_length == this._updatesNegList.length)
                    i++;
            }
        }
        if (minPriority <= 0) {
            for (i = 0; i < this._updates0List.length;) {
                temp_length = this._updates0List.length;
                entry = this._updates0List[i];
                if (entry)
                    this.unscheduleUpdate(entry.target);
                if (temp_length == this._updates0List.length)
                    i++;
            }
        }
        for (i = 0; i < this._updatesPosList.length;) {
            temp_length = this._updatesPosList.length;
            entry = this._updatesPosList[i];
            if (entry && entry.priority >= minPriority)
                this.unscheduleUpdate(entry.target);
            if (temp_length == this._updatesPosList.length)
                i++;
        }
    }

    isScheduled(callback: (dt: number) => void, target: any): boolean {
        assert?.(callback, "Argument callback must not be empty");
        assert?.(target, "Argument target must be non-nullptr");
        const element = this._hashForTimers[target.__instanceId];
        if (!element) return false;
        if (element.timers == null) {
            return false;
        } else {
            const timers = element.timers;
            for (let i = 0; i < timers.length; ++i) {
                const timer = timers[i];
                if (callback === timer._callback) {
                    return true;
                }
            }
            return false;
        }
    }

    pauseAllTargets(): any[] {
        return this.pauseAllTargetsWithMinPriority(Scheduler.PRIORITY_SYSTEM);
    }

    pauseAllTargetsWithMinPriority(minPriority: number): any[] {
        const idsWithSelectors: any[] = [];
        let self = this, element, locArrayForTimers = self._arrayForTimers;
        let i, li;
        for (i = 0, li = locArrayForTimers.length; i < li; i++) {
            element = locArrayForTimers[i];
            if (element) {
                element.paused = true;
                idsWithSelectors.push(element.target);
            }
        }
        let entry;
        if (minPriority < 0) {
            for (i = 0; i < this._updatesNegList.length; i++) {
                entry = this._updatesNegList[i];
                if (entry) {
                    if (entry.priority >= minPriority) {
                        entry.paused = true;
                        idsWithSelectors.push(entry.target);
                    }
                }
            }
        }
        if (minPriority <= 0) {
            for (i = 0; i < this._updates0List.length; i++) {
                entry = this._updates0List[i];
                if (entry) {
                    entry.paused = true;
                    idsWithSelectors.push(entry.target);
                }
            }
        }
        for (i = 0; i < this._updatesPosList.length; i++) {
            entry = this._updatesPosList[i];
            if (entry) {
                if (entry.priority >= minPriority) {
                    entry.paused = true;
                    idsWithSelectors.push(entry.target);
                }
            }
        }
        return idsWithSelectors;
    }

    resumeTargets(targetsToResume: any[]) {
        if (!targetsToResume)
            return;
        for (let i = 0; i < targetsToResume.length; i++) {
            this.resumeTarget(targetsToResume[i]);
        }
    }

    pauseTarget(target: any) {
        assert?.(target, _LogInfos?.Scheduler_pauseTarget);
        const self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            element.paused = true;
        }
        const elementUpdate = self._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
            elementUpdate.entry.paused = true;
        }
    }

    resumeTarget(target: any) {
        assert?.(target, _LogInfos?.Scheduler_resumeTarget);
        const self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            element.paused = false;
        }
        const elementUpdate = self._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
            elementUpdate.entry.paused = false;
        }
    }

    isTargetPaused(target: any): boolean {
        assert?.(target, _LogInfos?.Scheduler_isTargetPaused);
        const element = this._hashForTimers[target.__instanceId];
        if (element) {
            return element.paused;
        }
        const elementUpdate = this._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
            return elementUpdate.entry.paused;
        }
        return false;
    }

    scheduleUpdateForTarget(target: any, priority: number, paused: boolean) {
        this.scheduleUpdate(target, priority, paused);
    }

    unscheduleCallbackForTarget(target: any, callback: (dt: number) => void) {
        this.unschedule(callback, target);
    }

    unscheduleUpdateForTarget(target: any) {
        this.unscheduleUpdate(target);
    }

    unscheduleAllCallbacksForTarget(target: any) {
        this.unschedule(target.__instanceId + "", target);
    }

    unscheduleAllCallbacks() {
        this.unscheduleAllWithMinPriority(Scheduler.PRIORITY_SYSTEM);
    }

    unscheduleAllCallbacksWithMinPriority(minPriority: number) {
        this.unscheduleAllWithMinPriority(minPriority);
    }
}

// Attach to cc namespace for compatibility
Scheduler