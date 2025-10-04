import { Node } from '../base-nodes/Node';

/**
 * @brief Base class of all kinds of events.
 */
export class Event {
    /**
     * The type code of Touch event.
     */
    static readonly TOUCH = 0;
    /**
     * The type code of Keyboard event.
     */
    static readonly KEYBOARD = 1;
    /**
     * The type code of Acceleration event.
     */
    static readonly ACCELERATION = 2;
    /**
     * The type code of Mouse event.
     */
    static readonly MOUSE = 3;
    /**
     * The type code of UI focus event.
     */
    static readonly FOCUS = 4;
    /**
     * The type code of Custom event.
     */
    static readonly CUSTOM = 6;

    protected _type: number;
    protected _isStopped = false;
    protected _currentTarget: Node | null = null;

    constructor(type: number) {
        this._type = type;
    }

    /**
     * Gets the event type.
     */
    getType() {
        return this._type;
    }

    /**
     * Stops propagation for current event.
     */
    stopPropagation() {
        this._isStopped = true;
    }

    /**
     * Checks whether the event has been stopped.
     */
    isStopped() {
        return this._isStopped;
    }

    /**
     * Gets current target of the event.
     * @note It only be available when the event listener is associated with node.
     * It returns null when the listener is associated with fixed priority.
     */
    getCurrentTarget() {
        return this._currentTarget;
    }

    /**
     * Sets current target of the event
     */
    _setCurrentTarget(target: Node | null) {
        this._currentTarget = target;
    }
}