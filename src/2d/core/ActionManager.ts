/****************************************************************************
 * Converted to ES Module and TypeScript by GitHub Copilot
 ****************************************************************************/

// You may need to adjust these imports to match your project structure
import { cc } from './Boot';
import type { Node } from './Node';
import type { Action } from './Action';

export class HashElement {
    actions: Action[] = [];
    target: Node | null = null;
    actionIndex: number = 0;
    currentAction: Action | null = null;
    paused: boolean = false;
    lock: boolean = false;
}

export class ActionManager {
    private _elementPool: HashElement[] = [];
    private _hashTargets: { [id: string]: HashElement } = {};
    private _arrayTargets: HashElement[] = [];
    private _currentTarget: HashElement | null = null;

    constructor() { }

    private _searchElementByTarget(arr: HashElement[], target: Node): HashElement | null {
        for (let k = 0; k < arr.length; k++) {
            if (target === arr[k].target)
                return arr[k];
        }
        return null;
    }

    private _getElement(target: Node, paused: boolean): HashElement {
        let element = this._elementPool.pop();
        if (!element) {
            element = new HashElement();
        }
        element.target = target;
        element.paused = !!paused;
        return element;
    }

    private _putElement(element: HashElement) {
        element.actions.length = 0;
        element.actionIndex = 0;
        element.currentAction = null;
        element.paused = false;
        element.target = null;
        element.lock = false;
        this._elementPool.push(element);
    }

    /** Adds an action with a target. */
    addAction(action: Action, target: Node, paused: boolean) {
        if (!action)
            throw new Error("ActionManager.addAction(): action must be non-null");
        if (!target)
            throw new Error("ActionManager.addAction(): target must be non-null");

        // check if the action target already exists
        let element = this._hashTargets[(target as any).__instanceId];
        // if doesn't exist, create a hashelement and push in mpTargets
        if (!element) {
            element = this._getElement(target, paused);
            this._hashTargets[(target as any).__instanceId] = element;
            this._arrayTargets.push(element);
        } else if (!element.actions) {
            element.actions = [];
        }

        element.actions.push(action);
        action.startWithTarget(target);
    }

    /** Removes all actions from all the targets. */
    removeAllActions() {
        const locTargets = this._arrayTargets;
        for (let i = 0; i < locTargets.length; i++) {
            const element = locTargets[i];
            if (element)
                this.removeAllActionsFromTarget(element.target, true);
        }
    }

    /** Removes all actions from a certain target. */
    removeAllActionsFromTarget(target: Node | null, forceDelete: boolean) {
        if (target == null)
            return;
        const element = this._hashTargets[(target as any).__instanceId];
        if (element) {
            element.actions.length = 0;
            this._deleteHashElement(element);
        }
    }

    /** Removes an action given an action reference. */
    removeAction(action: Action | null) {
        if (action == null)
            return;
        const target = action.getOriginalTarget();
        const element = this._hashTargets[(target as any).__instanceId];

        if (element) {
            for (let i = 0; i < element.actions.length; i++) {
                if (element.actions[i] === action) {
                    element.actions.splice(i, 1);
                    // update actionIndex in case we are in tick. looping over the actions
                    if (element.actionIndex >= i)
                        element.actionIndex--;
                    break;
                }
            }
        } else {
            log?.(_LogInfos?.ActionManager_removeAction);
        }
    }

    /** Removes an action given its tag and the target */
    removeActionByTag(tag: number, target: Node) {
        if (tag === (cc as any).ACTION_TAG_INVALID)
            log?.(_LogInfos?.ActionManager_addAction);

        assert?.(target, _LogInfos?.ActionManager_addAction);

        const element = this._hashTargets[(target as any).__instanceId];

        if (element) {
            const limit = element.actions.length;
            for (let i = 0; i < limit; ++i) {
                const action = element.actions[i];
                if (action && action.getTag() === tag && action.getOriginalTarget() === target) {
                    this._removeActionAtIndex(i, element);
                    break;
                }
            }
        }
    }

    /** Gets an action given its tag and a target */
    getActionByTag(tag: number, target: Node): Action | null {
        if (tag === (cc as any).ACTION_TAG_INVALID)
            log?.(_LogInfos?.ActionManager_getActionByTag);

        const element = this._hashTargets[(target as any).__instanceId];
        if (element) {
            if (element.actions != null) {
                for (let i = 0; i < element.actions.length; ++i) {
                    const action = element.actions[i];
                    if (action && action.getTag() === tag)
                        return action;
                }
            }
            log?.(_LogInfos?.ActionManager_getActionByTag_2, tag);
        }
        return null;
    }

    /** Returns the numbers of actions that are running in a certain target. */
    numberOfRunningActionsInTarget(target: Node): number {
        const element = this._hashTargets[(target as any).__instanceId];
        if (element)
            return (element.actions) ? element.actions.length : 0;

        return 0;
    }

    /** Pauses the target: all running actions and newly added actions will be paused. */
    pauseTarget(target: Node) {
        const element = this._hashTargets[(target as any).__instanceId];
        if (element)
            element.paused = true;
    }

    /** Resumes the target. All queued actions will be resumed. */
    resumeTarget(target: Node) {
        const element = this._hashTargets[(target as any).__instanceId];
        if (element)
            element.paused = false;
    }

    /**
     * Pauses all running actions, returning a list of targets whose actions were paused.
     */
    pauseAllRunningActions(): Node[] {
        const idsWithActions: Node[] = [];
        const locTargets = this._arrayTargets;
        for (let i = 0; i < locTargets.length; i++) {
            const element = locTargets[i];
            if (element && !element.paused) {
                element.paused = true;
                if (element.target) idsWithActions.push(element.target);
            }
        }
        return idsWithActions;
    }

    /**
     * Resume a set of targets (convenience function to reverse a pauseAllRunningActions call)
     */
    resumeTargets(targetsToResume: Node[]) {
        if (!targetsToResume)
            return;

        for (let i = 0; i < targetsToResume.length; i++) {
            if (targetsToResume[i])
                this.resumeTarget(targetsToResume[i]);
        }
    }

    /** purges the shared action manager. It releases the retained instance. */
    purgeSharedManager() {
        (director?.getScheduler()?.unscheduleUpdate as any)?.(this);
    }

    // protected
    private _removeActionAtIndex(index: number, element: HashElement) {
        const action = element.actions[index];

        element.actions.splice(index, 1);

        // update actionIndex in case we are in tick. looping over the actions
        if (element.actionIndex >= index)
            element.actionIndex--;

        if (element.actions.length === 0) {
            this._deleteHashElement(element);
        }
    }

    private _deleteHashElement(element: HashElement): boolean {
        let ret = false;
        if (element && !element.lock) {
            if (this._hashTargets[(element.target as any).__instanceId]) {
                delete this._hashTargets[(element.target as any).__instanceId];
                const targets = this._arrayTargets;
                for (let i = 0, l = targets.length; i < l; i++) {
                    if (targets[i] === element) {
                        targets.splice(i, 1);
                        break;
                    }
                }
                this._putElement(element);
                ret = true;
            }
        }
        return ret;
    }

    /**
     * @param dt delta time in seconds
     */
    update(dt: number) {
        const locTargets = this._arrayTargets;
        let locCurrTarget: HashElement;
        for (let elt = 0; elt < locTargets.length; elt++) {
            this._currentTarget = locTargets[elt];
            locCurrTarget = this._currentTarget;
            if (!locCurrTarget.paused && locCurrTarget.actions) {
                locCurrTarget.lock = true;
                // The 'actions' array may change while inside this loop.
                for (locCurrTarget.actionIndex = 0; locCurrTarget.actionIndex < locCurrTarget.actions.length; locCurrTarget.actionIndex++) {
                    locCurrTarget.currentAction = locCurrTarget.actions[locCurrTarget.actionIndex];
                    if (!locCurrTarget.currentAction)
                        continue;

                    // use for speed
                    locCurrTarget.currentAction.step(
                        dt * (locCurrTarget.currentAction._speedMethod ? locCurrTarget.currentAction._speed : 1)
                    );

                    if (locCurrTarget.currentAction && locCurrTarget.currentAction.isDone()) {
                        locCurrTarget.currentAction.stop();
                        const action = locCurrTarget.currentAction;
                        locCurrTarget.currentAction = null;
                        this.removeAction(action);
                    }

                    locCurrTarget.currentAction = null;
                }
                locCurrTarget.lock = false;
            }
            // only delete currentTarget if no actions were scheduled during the cycle (issue #481)
            if (locCurrTarget.actions.length === 0) {
                this._deleteHashElement(locCurrTarget) && elt--;
            }
        }
    }
}

// Optionally, attach to cc namespace for compatibility
HashElement = HashElement;
ActionManager