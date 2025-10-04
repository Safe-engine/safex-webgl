/****************************************************************************
 * Converted to ES Module and TypeScript by GitHub Copilot
 ****************************************************************************/

import { cc } from '../Boot';
import type { ActionManager } from '../ActionManager';
import type { Scheduler } from '../Scheduler';

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
export interface Color { r: number; g: number; b: number; a: number }

export class Node {
    // Properties
    _localZOrder: number = 0;
    _globalZOrder: number = 0;
    _vertexZ: number = 0.0;
    _customZ: number = NaN;

    _rotationX: number = 0;
    _rotationY: number = 0.0;
    _scaleX: number = 1.0;
    _scaleY: number = 1.0;
    _position: Point = { x: 0, y: 0 };

    _normalizedPosition: Point = { x: 0, y: 0 };
    _usingNormalizedPosition: boolean = false;
    _normalizedPositionDirty: boolean = false;

    _skewX: number = 0.0;
    _skewY: number = 0.0;
    _children: Node[] = [];
    _visible: boolean = true;
    _anchorPoint: Point = { x: 0, y: 0 };
    _contentSize: Size = { width: 0, height: 0 };
    _running: boolean = false;
    _parent: Node | null = null;
    _ignoreAnchorPointForPosition: boolean = false;
    tag: number = NODE_TAG_INVALID;
    userData: any = null;
    userObject: any = null;
    _reorderChildDirty: boolean = false;
    arrivalOrder: number = 0;
    _actionManager: ActionManager | null = null;
    _scheduler: Scheduler | null = null;
    _additionalTransformDirty: boolean = false;
    _additionalTransform: any = null;
    _componentContainer: any = null;
    _isTransitionFinished: boolean = false;
    _className: string = "Node";
    _showNode: boolean = false;
    _name: string = "";
    _realOpacity: number = 255;
    _realColor: Color = { r: 255, g: 255, b: 255, a: 255 };
    _cascadeColorEnabled: boolean = false;
    _cascadeOpacityEnabled: boolean = false;
    _renderCmd: any = null;
    grid: any = null;

    constructor() {
        this._anchorPoint = p(0, 0);
        this._contentSize = size(0, 0);
        this._position = p(0, 0);
        this._normalizedPosition = p(0, 0);
        this._children = [];
        this._additionalTransform = affineTransformMakeIdentity();
        if (ComponentContainer) {
            this._componentContainer = new ComponentContainer(this);
        }
        this._realColor = color(255, 255, 255, 255);
        this._renderCmd = this._createRenderCmd();
    }

    // --- Example: get/set for skewX ---
    getSkewX(): number { return this._skewX; }
    setSkewX(newSkewX: number) {
        this._skewX = newSkewX;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getSkewY(): number { return this._skewY; }
    setSkewY(newSkewY: number) {
        this._skewY = newSkewY;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }

    setLocalZOrder(localZOrder: number) {
        if (localZOrder === this._localZOrder) return;
        if (this._parent)
            this._parent.reorderChild(this, localZOrder);
        else
            this._localZOrder = localZOrder;
        eventManager._setDirtyForNode(this);
    }
    _setLocalZOrder(localZOrder: number) { this._localZOrder = localZOrder; }
    getLocalZOrder(): number { return this._localZOrder; }
    getZOrder(): number { return this.getLocalZOrder(); }
    setZOrder(z: number) { this.setLocalZOrder(z); }
    setGlobalZOrder(globalZOrder: number) {
        if (this._globalZOrder !== globalZOrder) {
            this._globalZOrder = globalZOrder;
            eventManager._setDirtyForNode(this);
        }
    }
    getGlobalZOrder(): number { return this._globalZOrder; }
    getVertexZ(): number { return this._vertexZ; }
    setVertexZ(Var: number) { this._customZ = this._vertexZ = Var; }
    getRotation(): number { return this._rotationX; }
    setRotation(newRotation: number) {
        this._rotationX = this._rotationY = newRotation;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getRotationX(): number { return this._rotationX; }
    setRotationX(rotationX: number) {
        this._rotationX = rotationX;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getRotationY(): number { return this._rotationY; }
    setRotationY(rotationY: number) {
        this._rotationY = rotationY;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getScale(): number { return this._scaleX; }
    setScale(scale: number, scaleY?: number) {
        this._scaleX = scale;
        this._scaleY = (scaleY !== undefined) ? scaleY : scale;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getScaleX(): number { return this._scaleX; }
    setScaleX(newScaleX: number) {
        this._scaleX = newScaleX;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    getScaleY(): number { return this._scaleY; }
    setScaleY(newScaleY: number) {
        this._scaleY = newScaleY;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    setPosition(newPosOrxValue: Point | number, yValue?: number) {
        const locPosition = this._position;
        if (typeof newPosOrxValue === "object" && yValue === undefined) {
            if (locPosition.x === newPosOrxValue.x && locPosition.y === newPosOrxValue.y) return;
            locPosition.x = newPosOrxValue.x;
            locPosition.y = newPosOrxValue.y;
        } else if (typeof newPosOrxValue === "number" && typeof yValue === "number") {
            if (locPosition.x === newPosOrxValue && locPosition.y === yValue) return;
            locPosition.x = newPosOrxValue;
            locPosition.y = yValue;
        }
        this._usingNormalizedPosition = false;
        this._renderCmd.setDirtyFlag(Node._dirtyFlags.transformDirty);
    }
    // ... (Implement other methods as needed, following the same pattern) ...

    // Example for _renderCmd property
    get renderCmd() {
        return this._renderCmd;
    }

    // ... (Implement all other methods and properties as needed, following the original JS logic) ...
}

// Optionally, attach to cc namespace for compatibility
Node = Node;