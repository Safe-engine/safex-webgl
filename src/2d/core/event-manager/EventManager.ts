import { director, game } from "../../..";
import { isNumber } from "../../../helper/checkType";
import { _LogInfos, assert, log } from "../../../helper/Debugger";
import { Node } from "../base-nodes/Node";
import { EventCustom } from "./EventCustom";
import { EventListener } from "./EventListener";

function __getListenerID(event) {
  var eventType = Event, getType = event._type;
  if (getType === eventType.ACCELERATION)
    return _EventListenerAcceleration.LISTENER_ID;
  if (getType === eventType.CUSTOM)
    return event._eventName;
  if (getType === eventType.KEYBOARD)
    return _EventListenerKeyboard.LISTENER_ID;
  if (getType === eventType.MOUSE)
    return _EventListenerMouse.LISTENER_ID;
  if (getType === eventType.FOCUS)
    return _EventListenerFocus.LISTENER_ID;
  if (getType === eventType.TOUCH) {
    // Touch listener is very special, it contains two kinds of listeners, EventListenerTouchOneByOne and EventListenerTouchAllAtOnce.
    // return UNKNOWN instead.
    log(_LogInfos.__getListenerID);
  }
  return "";
}

/**
 * <p>
 *  eventManager is a singleton object which manages event listener subscriptions and event dispatching. <br/>
 *                                                                                                              <br/>
 *  The EventListener list is managed in such way so that event listeners can be added and removed          <br/>
 *  while events are being dispatched.
 * </p>
 * @class
 * @name eventManager
 */
export const eventManager = /** @lends eventManager# */{
  //Priority dirty flag
  DIRTY_NONE: 0,
  DIRTY_FIXED_PRIORITY: 1 << 0,
  DIRTY_SCENE_GRAPH_PRIORITY: 1 << 1,
  DIRTY_ALL: 3,

  _listenersMap: {},
  _priorityDirtyFlagMap: {},
  _nodeListenersMap: {},
  _nodePriorityMap: {},
  _globalZOrderNodeMap: {},
  _toAddedListeners: [],
  _toRemovedListeners: [],
  _dirtyNodes: [],
  _inDispatch: 0,
  _isEnabled: false,
  _nodePriorityIndex: 0,

  _internalCustomListenerIDs: [game.EVENT_HIDE, game.EVENT_SHOW],

  _setDirtyForNode: function (node) {
    // Mark the node dirty only when there is an event listener associated with it.
    if (this._nodeListenersMap[node.__instanceId] != null)
      this._dirtyNodes.push(node);
    var _children = node.getChildren();
    for (var i = 0, len = _children.length; i < len; i++)
      this._setDirtyForNode(_children[i]);
  },

  /**
   * Pauses all listeners which are associated the specified target.
   * @param {Node} node
   * @param {Boolean} [recursive=false]
   */
  pauseTarget: function (node, recursive?) {
    var listeners = this._nodeListenersMap[node.__instanceId], i, len;
    if (listeners) {
      for (i = 0, len = listeners.length; i < len; i++)
        listeners[i]._setPaused(true);
    }
    if (recursive === true) {
      var locChildren = node.getChildren();
      for (i = 0, len = locChildren.length; i < len; i++)
        this.pauseTarget(locChildren[i], true);
    }
  },

  /**
   * Resumes all listeners which are associated the specified target.
   * @param {Node} node
   * @param {Boolean} [recursive=false]
   */
  resumeTarget: function (node, recursive?) {
    var listeners = this._nodeListenersMap[node.__instanceId], i, len;
    if (listeners) {
      for (i = 0, len = listeners.length; i < len; i++)
        listeners[i]._setPaused(false);
    }
    this._setDirtyForNode(node);
    if (recursive === true) {
      var locChildren = node.getChildren();
      for (i = 0, len = locChildren.length; i < len; i++)
        this.resumeTarget(locChildren[i], true);
    }
  },

  _addListener: function (listener) {
    if (this._inDispatch === 0)
      this._forceAddEventListener(listener);
    else
      this._toAddedListeners.push(listener);
  },

  _forceAddEventListener: function (listener) {
    var listenerID = listener._getListenerID();
    var listeners = this._listenersMap[listenerID];
    if (!listeners) {
      listeners = new _EventListenerVector();
      this._listenersMap[listenerID] = listeners;
    }
    listeners.push(listener);

    if (listener._getFixedPriority() === 0) {
      this._setDirty(listenerID, this.DIRTY_SCENE_GRAPH_PRIORITY);

      var node = listener._getSceneGraphPriority();
      if (node === null)
        log(_LogInfos.eventManager__forceAddEventListener);

      this._associateNodeAndEventListener(node, listener);
      if (node.isRunning())
        this.resumeTarget(node);
    } else
      this._setDirty(listenerID, this.DIRTY_FIXED_PRIORITY);
  },

  _getListeners: function (listenerID) {
    return this._listenersMap[listenerID];
  },

  _updateDirtyFlagForSceneGraph: function () {
    if (this._dirtyNodes.length === 0)
      return;

    var locDirtyNodes = this._dirtyNodes, selListeners, selListener, locNodeListenersMap = this._nodeListenersMap;
    for (var i = 0, len = locDirtyNodes.length; i < len; i++) {
      selListeners = locNodeListenersMap[locDirtyNodes[i].__instanceId];
      if (selListeners) {
        for (var j = 0, listenersLen = selListeners.length; j < listenersLen; j++) {
          selListener = selListeners[j];
          if (selListener)
            this._setDirty(selListener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
        }
      }
    }
    this._dirtyNodes.length = 0;
  },

  _removeAllListenersInVector: function (listenerVector) {
    if (!listenerVector)
      return;
    var selListener;
    for (var i = 0; i < listenerVector.length;) {
      selListener = listenerVector[i];
      selListener._setRegistered(false);
      if (selListener._getSceneGraphPriority() != null) {
        this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
        selListener._setSceneGraphPriority(null);   // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
      }

      if (this._inDispatch === 0)
        arrayRemoveObject(listenerVector, selListener);
      else
        ++i;
    }
  },

  _removeListenersForListenerID: function (listenerID) {
    var listeners = this._listenersMap[listenerID], i;
    if (listeners) {
      var fixedPriorityListeners = listeners.getFixedPriorityListeners();
      var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

      this._removeAllListenersInVector(sceneGraphPriorityListeners);
      this._removeAllListenersInVector(fixedPriorityListeners);

      // Remove the dirty flag according the 'listenerID'.
      // No need to check whether the dispatcher is dispatching event.
      delete this._priorityDirtyFlagMap[listenerID];

      if (!this._inDispatch) {
        listeners.clear();
      }
      delete this._listenersMap[listenerID];
    }

    var locToAddedListeners = this._toAddedListeners, listener;
    for (i = 0; i < locToAddedListeners.length;) {
      listener = locToAddedListeners[i];
      if (listener && listener._getListenerID() === listenerID)
        arrayRemoveObject(locToAddedListeners, listener);
      else
        ++i;
    }
  },

  _sortEventListeners: function (listenerID) {
    var dirtyFlag = this.DIRTY_NONE, locFlagMap = this._priorityDirtyFlagMap;
    if (locFlagMap[listenerID])
      dirtyFlag = locFlagMap[listenerID];

    if (dirtyFlag !== this.DIRTY_NONE) {
      // Clear the dirty flag first, if `rootNode` is null, then set its dirty flag of scene graph priority
      locFlagMap[listenerID] = this.DIRTY_NONE;

      if (dirtyFlag & this.DIRTY_FIXED_PRIORITY)
        this._sortListenersOfFixedPriority(listenerID);

      if (dirtyFlag & this.DIRTY_SCENE_GRAPH_PRIORITY) {
        var rootNode = director.getRunningScene();
        if (rootNode)
          this._sortListenersOfSceneGraphPriority(listenerID, rootNode);
        else
          locFlagMap[listenerID] = this.DIRTY_SCENE_GRAPH_PRIORITY;
      }
    }
  },

  _sortListenersOfSceneGraphPriority: function (listenerID, rootNode) {
    var listeners = this._getListeners(listenerID);
    if (!listeners)
      return;

    var sceneGraphListener = listeners.getSceneGraphPriorityListeners();
    if (!sceneGraphListener || sceneGraphListener.length === 0)
      return;

    // Reset priority index
    this._nodePriorityIndex = 0;
    this._nodePriorityMap = {};

    this._visitTarget(rootNode, true);

    // After sort: priority < 0, > 0
    listeners.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes);
  },

  _sortEventListenersOfSceneGraphPriorityDes: function (l1, l2) {
    var locNodePriorityMap = eventManager._nodePriorityMap, node1 = l1._getSceneGraphPriority(),
      node2 = l2._getSceneGraphPriority();
    if (!l2 || !node2 || !locNodePriorityMap[node2.__instanceId])
      return -1;
    else if (!l1 || !node1 || !locNodePriorityMap[node1.__instanceId])
      return 1;
    return locNodePriorityMap[l2._getSceneGraphPriority().__instanceId] - locNodePriorityMap[l1._getSceneGraphPriority().__instanceId];
  },

  _sortListenersOfFixedPriority: function (listenerID) {
    var listeners = this._listenersMap[listenerID];
    if (!listeners)
      return;

    var fixedListeners = listeners.getFixedPriorityListeners();
    if (!fixedListeners || fixedListeners.length === 0)
      return;
    // After sort: priority < 0, > 0
    fixedListeners.sort(this._sortListenersOfFixedPriorityAsc);

    // FIXME: Should use binary search
    var index = 0;
    for (var len = fixedListeners.length; index < len;) {
      if (fixedListeners[index]._getFixedPriority() >= 0)
        break;
      ++index;
    }
    listeners.gt0Index = index;
  },

  _sortListenersOfFixedPriorityAsc: function (l1, l2) {
    return l1._getFixedPriority() - l2._getFixedPriority();
  },

  _onUpdateListeners: function (listeners) {
    var fixedPriorityListeners = listeners.getFixedPriorityListeners();
    var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();
    var i, selListener, idx, toRemovedListeners = this._toRemovedListeners;

    if (sceneGraphPriorityListeners) {
      for (i = 0; i < sceneGraphPriorityListeners.length;) {
        selListener = sceneGraphPriorityListeners[i];
        if (!selListener._isRegistered()) {
          arrayRemoveObject(sceneGraphPriorityListeners, selListener);
          // if item in toRemove list, remove it from the list
          idx = toRemovedListeners.indexOf(selListener);
          if (idx !== -1)
            toRemovedListeners.splice(idx, 1);
        } else
          ++i;
      }
    }

    if (fixedPriorityListeners) {
      for (i = 0; i < fixedPriorityListeners.length;) {
        selListener = fixedPriorityListeners[i];
        if (!selListener._isRegistered()) {
          arrayRemoveObject(fixedPriorityListeners, selListener);
          // if item in toRemove list, remove it from the list
          idx = toRemovedListeners.indexOf(selListener);
          if (idx !== -1)
            toRemovedListeners.splice(idx, 1);
        } else
          ++i;
      }
    }

    if (sceneGraphPriorityListeners && sceneGraphPriorityListeners.length === 0)
      listeners.clearSceneGraphListeners();

    if (fixedPriorityListeners && fixedPriorityListeners.length === 0)
      listeners.clearFixedListeners();
  },

  frameUpdateListeners: function () {
    var locListenersMap = this._listenersMap, locPriorityDirtyFlagMap = this._priorityDirtyFlagMap;
    for (var selKey in locListenersMap) {
      if (locListenersMap[selKey].empty()) {
        delete locPriorityDirtyFlagMap[selKey];
        delete locListenersMap[selKey];
      }
    }

    var locToAddedListeners = this._toAddedListeners;
    if (locToAddedListeners.length !== 0) {
      for (var i = 0, len = locToAddedListeners.length; i < len; i++)
        this._forceAddEventListener(locToAddedListeners[i]);
      locToAddedListeners.length = 0;
    }
    if (this._toRemovedListeners.length !== 0) {
      this._cleanToRemovedListeners();
    }
  },

  _updateTouchListeners: function (event) {
    var locInDispatch = this._inDispatch;
    assert(locInDispatch > 0, _LogInfos.EventManager__updateListeners);

    if (locInDispatch > 1)
      return;

    var listeners;
    listeners = this._listenersMap[_EventListenerTouchOneByOne.LISTENER_ID];
    if (listeners) {
      this._onUpdateListeners(listeners);
    }
    listeners = this._listenersMap[_EventListenerTouchAllAtOnce.LISTENER_ID];
    if (listeners) {
      this._onUpdateListeners(listeners);
    }

    assert(locInDispatch === 1, _LogInfos.EventManager__updateListeners_2);

    var locToAddedListeners = this._toAddedListeners;
    if (locToAddedListeners.length !== 0) {
      for (var i = 0, len = locToAddedListeners.length; i < len; i++)
        this._forceAddEventListener(locToAddedListeners[i]);
      locToAddedListeners.length = 0;
    }
    if (this._toRemovedListeners.length !== 0) {
      this._cleanToRemovedListeners();
    }
  },

  //Remove all listeners in _toRemoveListeners list and cleanup
  _cleanToRemovedListeners: function () {
    var toRemovedListeners = this._toRemovedListeners;
    for (var i = 0; i < toRemovedListeners.length; i++) {
      var selListener = toRemovedListeners[i];
      var listeners = this._listenersMap[selListener._getListenerID()];
      if (!listeners)
        continue;

      var idx, fixedPriorityListeners = listeners.getFixedPriorityListeners(),
        sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

      if (sceneGraphPriorityListeners) {
        idx = sceneGraphPriorityListeners.indexOf(selListener);
        if (idx !== -1) {
          sceneGraphPriorityListeners.splice(idx, 1);
        }
      }
      if (fixedPriorityListeners) {
        idx = fixedPriorityListeners.indexOf(selListener);
        if (idx !== -1) {
          fixedPriorityListeners.splice(idx, 1);
        }
      }
    }
    toRemovedListeners.length = 0;
  },

  _onTouchEventCallback: function (listener, argsObj) {
    // Skip if the listener was removed.
    if (!listener._isRegistered)
      return false;

    var event = argsObj.event, selTouch = argsObj.selTouch;
    event._setCurrentTarget(listener._node);

    var isClaimed = false, removedIdx;
    var getCode = event.getEventCode(), eventCode = EventTouch.EventCode;
    if (getCode === eventCode.BEGAN) {
      if (listener.onTouchBegan) {
        isClaimed = listener.onTouchBegan(selTouch, event);
        if (isClaimed && listener._registered)
          listener._claimedTouches.push(selTouch);
      }
    } else if (listener._claimedTouches.length > 0
      && ((removedIdx = listener._claimedTouches.indexOf(selTouch)) !== -1)) {
      isClaimed = true;
      if (getCode === eventCode.MOVED && listener.onTouchMoved) {
        listener.onTouchMoved(selTouch, event);
      } else if (getCode === eventCode.ENDED) {
        if (listener.onTouchEnded)
          listener.onTouchEnded(selTouch, event);
        if (listener._registered)
          listener._claimedTouches.splice(removedIdx, 1);
      } else if (getCode === eventCode.CANCELLED) {
        if (listener.onTouchCancelled)
          listener.onTouchCancelled(selTouch, event);
        if (listener._registered)
          listener._claimedTouches.splice(removedIdx, 1);
      }
    }

    // If the event was stopped, return directly.
    if (event.isStopped()) {
      eventManager._updateTouchListeners(event);
      return true;
    }

    if (isClaimed && listener._registered && listener.swallowTouches) {
      if (argsObj.needsMutableSet)
        argsObj.touches.splice(selTouch, 1);
      return true;
    }
    return false;
  },

  _dispatchTouchEvent: function (event) {
    this._sortEventListeners(_EventListenerTouchOneByOne.LISTENER_ID);
    this._sortEventListeners(_EventListenerTouchAllAtOnce.LISTENER_ID);

    var oneByOneListeners = this._getListeners(_EventListenerTouchOneByOne.LISTENER_ID);
    var allAtOnceListeners = this._getListeners(_EventListenerTouchAllAtOnce.LISTENER_ID);

    // If there aren't any touch listeners, return directly.
    if (null === oneByOneListeners && null === allAtOnceListeners)
      return;

    var originalTouches = event.getTouches(), mutableTouches = copyArray(originalTouches);
    var oneByOneArgsObj = { event: event, needsMutableSet: (oneByOneListeners && allAtOnceListeners), touches: mutableTouches, selTouch: null };

    //
    // process the target handlers 1st
    //
    if (oneByOneListeners) {
      for (var i = 0; i < originalTouches.length; i++) {
        oneByOneArgsObj.selTouch = originalTouches[i];
        this._dispatchEventToListeners(oneByOneListeners, this._onTouchEventCallback, oneByOneArgsObj);
        if (event.isStopped())
          return;
      }
    }

    //
    // process standard handlers 2nd
    //
    if (allAtOnceListeners && mutableTouches.length > 0) {
      this._dispatchEventToListeners(allAtOnceListeners, this._onTouchesEventCallback, { event: event, touches: mutableTouches });
      if (event.isStopped())
        return;
    }
    this._updateTouchListeners(event);
  },

  _onTouchesEventCallback: function (listener, callbackParams) {
    // Skip if the listener was removed.
    if (!listener._registered)
      return false;

    var eventCode = EventTouch.EventCode, event = callbackParams.event, touches = callbackParams.touches, getCode = event.getEventCode();
    event._setCurrentTarget(listener._node);
    if (getCode === eventCode.BEGAN && listener.onTouchesBegan)
      listener.onTouchesBegan(touches, event);
    else if (getCode === eventCode.MOVED && listener.onTouchesMoved)
      listener.onTouchesMoved(touches, event);
    else if (getCode === eventCode.ENDED && listener.onTouchesEnded)
      listener.onTouchesEnded(touches, event);
    else if (getCode === eventCode.CANCELLED && listener.onTouchesCancelled)
      listener.onTouchesCancelled(touches, event);

    // If the event was stopped, return directly.
    if (event.isStopped()) {
      eventManager._updateTouchListeners(event);
      return true;
    }
    return false;
  },

  _associateNodeAndEventListener: function (node, listener) {
    var listeners = this._nodeListenersMap[node.__instanceId];
    if (!listeners) {
      listeners = [];
      this._nodeListenersMap[node.__instanceId] = listeners;
    }
    listeners.push(listener);
  },

  _dissociateNodeAndEventListener: function (node, listener) {
    var listeners = this._nodeListenersMap[node.__instanceId];
    if (listeners) {
      arrayRemoveObject(listeners, listener);
      if (listeners.length === 0)
        delete this._nodeListenersMap[node.__instanceId];
    }
  },

  _dispatchEventToListeners: function (listeners, onEvent, eventOrArgs) {
    var shouldStopPropagation = false;
    var fixedPriorityListeners = listeners.getFixedPriorityListeners();
    var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

    var i = 0, j, selListener;
    if (fixedPriorityListeners) {  // priority < 0
      if (fixedPriorityListeners.length !== 0) {
        for (; i < listeners.gt0Index; ++i) {
          selListener = fixedPriorityListeners[i];
          if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
            shouldStopPropagation = true;
            break;
          }
        }
      }
    }

    if (sceneGraphPriorityListeners && !shouldStopPropagation) {    // priority == 0, scene graph priority
      for (j = 0; j < sceneGraphPriorityListeners.length; j++) {
        selListener = sceneGraphPriorityListeners[j];
        if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
          shouldStopPropagation = true;
          break;
        }
      }
    }

    if (fixedPriorityListeners && !shouldStopPropagation) {    // priority > 0
      for (; i < fixedPriorityListeners.length; ++i) {
        selListener = fixedPriorityListeners[i];
        if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
          shouldStopPropagation = true;
          break;
        }
      }
    }
  },

  _setDirty: function (listenerID, flag) {
    var locDirtyFlagMap = this._priorityDirtyFlagMap;
    if (locDirtyFlagMap[listenerID] == null)
      locDirtyFlagMap[listenerID] = flag;
    else
      locDirtyFlagMap[listenerID] = flag | locDirtyFlagMap[listenerID];
  },

  _visitTarget: function (node, isRootNode) {
    var children = node.getChildren(), i = 0;
    var childrenCount = children.length, locGlobalZOrderNodeMap = this._globalZOrderNodeMap, locNodeListenersMap = this._nodeListenersMap;

    if (childrenCount > 0) {
      var child;
      // visit children zOrder < 0
      for (; i < childrenCount; i++) {
        child = children[i];
        if (child && child.getLocalZOrder() < 0)
          this._visitTarget(child, false);
        else
          break;
      }

      if (locNodeListenersMap[node.__instanceId] != null) {
        if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
          locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
        locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
      }

      for (; i < childrenCount; i++) {
        child = children[i];
        if (child)
          this._visitTarget(child, false);
      }
    } else {
      if (locNodeListenersMap[node.__instanceId] != null) {
        if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
          locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
        locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
      }
    }

    if (isRootNode) {
      var globalZOrders = [];
      for (var selKey in locGlobalZOrderNodeMap)
        globalZOrders.push(selKey);

      globalZOrders.sort(this._sortNumberAsc);

      var zOrdersLen = globalZOrders.length, selZOrders, j, locNodePriorityMap = this._nodePriorityMap;
      for (i = 0; i < zOrdersLen; i++) {
        selZOrders = locGlobalZOrderNodeMap[globalZOrders[i]];
        for (j = 0; j < selZOrders.length; j++)
          locNodePriorityMap[selZOrders[j]] = ++this._nodePriorityIndex;
      }
      this._globalZOrderNodeMap = {};
    }
  },

  _sortNumberAsc: function (a, b) {
    return a - b;
  },

  /**
   * <p>
   * Adds a event listener for a specified event.                                                                                                            <br/>
   * if the parameter "nodeOrPriority" is a node, it means to add a event listener for a specified event with the priority of scene graph.                   <br/>
   * if the parameter "nodeOrPriority" is a Number, it means to add a event listener for a specified event with the fixed priority.                          <br/>
   * </p>
   * @param {EventListener|Object} listener The listener of a specified event or a object of some event parameters.
   * @param {Node|Number} nodeOrPriority The priority of the listener is based on the draw order of this node or fixedPriority The fixed priority of the listener.
   * @note  The priority of scene graph will be fixed value 0. So the order of listener item in the vector will be ' <0, scene graph (0 priority), >0'.
   *         A lower priority will be called before the ones that have a higher value. 0 priority is forbidden for fixed priority since it's used for scene graph based priority.
   *         The listener must be a EventListener object when adding a fixed priority listener, because we can't remove a fixed priority listener without the listener handler,
   *         except calls removeAllListeners().
   * @return {EventListener} Return the listener. Needed in order to remove the event from the dispatcher.
   */
  addListener: function (listener, nodeOrPriority) {
    assert(listener && nodeOrPriority, _LogInfos.eventManager_addListener_2);
    if (!(listener instanceof EventListener)) {
      assert(!isNumber(nodeOrPriority), _LogInfos.eventManager_addListener_3);
      listener = EventListener.create(listener);
    } else {
      if (listener._isRegistered()) {
        log(_LogInfos.eventManager_addListener_4);
        return;
      }
    }

    if (!listener.checkAvailable())
      return;

    if (isNumber(nodeOrPriority)) {
      if (nodeOrPriority === 0) {
        log(_LogInfos.eventManager_addListener);
        return;
      }

      listener._setSceneGraphPriority(null);
      listener._setFixedPriority(nodeOrPriority);
      listener._setRegistered(true);
      listener._setPaused(false);
      this._addListener(listener);
    } else {
      listener._setSceneGraphPriority(nodeOrPriority);
      listener._setFixedPriority(0);
      listener._setRegistered(true);
      this._addListener(listener);
    }

    return listener;
  },

  /**
   * Adds a Custom event listener. It will use a fixed priority of 1.
   * @param {string} eventName
   * @param {function} callback
   * @return {EventListener} the generated event. Needed in order to remove the event from the dispatcher
   */
  addCustomListener: function (eventName, callback, target?) {
    var listener = new _EventListenerCustom(eventName, callback, target);
    this.addListener(listener, 1);
    return listener;
  },

  /**
   * Remove a listener
   * @param {EventListener} listener an event listener or a registered node target
   */
  removeListener: function (listener) {
    if (listener == null)
      return;

    var isFound, locListener = this._listenersMap;
    for (var selKey in locListener) {
      var listeners = locListener[selKey];
      var fixedPriorityListeners = listeners.getFixedPriorityListeners(), sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

      isFound = this._removeListenerInVector(sceneGraphPriorityListeners, listener);
      if (isFound) {
        // fixed #4160: Dirty flag need to be updated after listeners were removed.
        this._setDirty(listener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
      } else {
        isFound = this._removeListenerInVector(fixedPriorityListeners, listener);
        if (isFound)
          this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
      }

      if (listeners.empty()) {
        delete this._priorityDirtyFlagMap[listener._getListenerID()];
        delete locListener[selKey];
      }

      if (isFound)
        break;
    }

    if (!isFound) {
      var locToAddedListeners = this._toAddedListeners;
      for (var i = 0, len = locToAddedListeners.length; i < len; i++) {
        var selListener = locToAddedListeners[i];
        if (selListener === listener) {
          arrayRemoveObject(locToAddedListeners, selListener);
          selListener._setRegistered(false);
          break;
        }
      }
    }
  },

  _removeListenerInCallback: function (listeners, callback) {
    if (listeners == null)
      return false;

    for (var i = 0, len = listeners.length; i < len; i++) {
      var selListener = listeners[i];
      if (selListener._onCustomEvent === callback || selListener._onEvent === callback) {
        selListener._setRegistered(false);
        if (selListener._getSceneGraphPriority() != null) {
          this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
          selListener._setSceneGraphPriority(null);         // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
        }

        if (this._inDispatch === 0)
          arrayRemoveObject(listeners, selListener);
        return true;
      }
    }
    return false;
  },

  _removeListenerInVector: function (listeners, listener) {
    if (listeners == null)
      return false;

    for (var i = 0, len = listeners.length; i < len; i++) {
      var selListener = listeners[i];
      if (selListener === listener) {
        selListener._setRegistered(false);
        if (selListener._getSceneGraphPriority() != null) {
          this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
          selListener._setSceneGraphPriority(null);         // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes.
        }

        if (this._inDispatch === 0)
          arrayRemoveObject(listeners, selListener);
        else
          this._toRemovedListeners.push(selListener);
        return true;
      }
    }
    return false;
  },

  /**
   * Removes all listeners with the same event listener type or removes all listeners of a node
   * @param {Number|Node} listenerType listenerType or a node
   * @param {Boolean} [recursive=false]
   */
  removeListeners: function (listenerType, recursive?) {
    var _t = this;
    if (listenerType instanceof Node) {
      // Ensure the node is removed from these immediately also.
      // Don't want any dangling pointers or the possibility of dealing with deleted objects..
      delete _t._nodePriorityMap[listenerType.__instanceId];
      arrayRemoveObject(_t._dirtyNodes, listenerType);
      var listeners = _t._nodeListenersMap[listenerType.__instanceId], i;
      if (listeners) {
        var listenersCopy = copyArray(listeners);
        for (i = 0; i < listenersCopy.length; i++)
          _t.removeListener(listenersCopy[i]);
        listenersCopy.length = 0;
      }

      // Bug fix: ensure there are no references to the node in the list of listeners to be added.
      // If we find any listeners associated with the destroyed node in this list then remove them.
      // This is to catch the scenario where the node gets destroyed before it's listener
      // is added into the event dispatcher fully. This could happen if a node registers a listener
      // and gets destroyed while we are dispatching an event (touch etc.)
      var locToAddedListeners = _t._toAddedListeners;
      for (i = 0; i < locToAddedListeners.length;) {
        var listener = locToAddedListeners[i];
        if (listener._getSceneGraphPriority() === listenerType) {
          listener._setSceneGraphPriority(null);                      // Ensure no dangling ptr to the target node.
          listener._setRegistered(false);
          locToAddedListeners.splice(i, 1);
        } else
          ++i;
      }

      if (recursive === true) {
        var locChildren = listenerType.getChildren(), len;
        for (i = 0, len = locChildren.length; i < len; i++)
          _t.removeListeners(locChildren[i], true);
      }
    } else {
      if (listenerType === EventListener.TOUCH_ONE_BY_ONE)
        _t._removeListenersForListenerID(_EventListenerTouchOneByOne.LISTENER_ID);
      else if (listenerType === EventListener.TOUCH_ALL_AT_ONCE)
        _t._removeListenersForListenerID(_EventListenerTouchAllAtOnce.LISTENER_ID);
      else if (listenerType === EventListener.MOUSE)
        _t._removeListenersForListenerID(_EventListenerMouse.LISTENER_ID);
      else if (listenerType === EventListener.ACCELERATION)
        _t._removeListenersForListenerID(_EventListenerAcceleration.LISTENER_ID);
      else if (listenerType === EventListener.KEYBOARD)
        _t._removeListenersForListenerID(_EventListenerKeyboard.LISTENER_ID);
      else
        log(_LogInfos.eventManager_removeListeners);
    }
  },

  /**
   * Removes all custom listeners with the same event name
   * @param {string} customEventName
   */
  removeCustomListeners: function (customEventName) {
    this._removeListenersForListenerID(customEventName);
  },

  /**
   * Removes all listeners
   */
  removeAllListeners: function () {
    var locListeners = this._listenersMap, locInternalCustomEventIDs = this._internalCustomListenerIDs;
    for (var selKey in locListeners) {
      if (locInternalCustomEventIDs.indexOf(selKey) === -1)
        this._removeListenersForListenerID(selKey);
    }
  },

  /**
   * Sets listener's priority with fixed value.
   * @param {EventListener} listener
   * @param {Number} fixedPriority
   */
  setPriority: function (listener, fixedPriority) {
    if (listener == null)
      return;

    var locListeners = this._listenersMap;
    for (var selKey in locListeners) {
      var selListeners = locListeners[selKey];
      var fixedPriorityListeners = selListeners.getFixedPriorityListeners();
      if (fixedPriorityListeners) {
        var found = fixedPriorityListeners.indexOf(listener);
        if (found !== -1) {
          if (listener._getSceneGraphPriority() != null)
            log(_LogInfos.eventManager_setPriority);
          if (listener._getFixedPriority() !== fixedPriority) {
            listener._setFixedPriority(fixedPriority);
            this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
          }
          return;
        }
      }
    }
  },

  /**
   * Whether to enable dispatching events
   * @param {boolean} enabled
   */
  setEnabled: function (enabled) {
    this._isEnabled = enabled;
  },

  /**
   * Checks whether dispatching events is enabled
   * @returns {boolean}
   */
  isEnabled: function () {
    return this._isEnabled;
  },

  /**
   * Dispatches the event, also removes all EventListeners marked for deletion from the event dispatcher list.
   * @param {Event} event
   */
  dispatchEvent: function (event) {
    if (!this._isEnabled)
      return;

    this._updateDirtyFlagForSceneGraph();
    this._inDispatch++;
    if (!event || !event.getType)
      throw new Error("event is undefined");
    if (event._type === Event.TOUCH) {
      this._dispatchTouchEvent(event);
      this._inDispatch--;
      return;
    }

    var listenerID = __getListenerID(event);
    this._sortEventListeners(listenerID);
    var selListeners = this._listenersMap[listenerID];
    if (selListeners) {
      this._dispatchEventToListeners(selListeners, this._onListenerCallback, event);
      this._onUpdateListeners(selListeners);
    }

    this._inDispatch--;
  },

  _onListenerCallback: function (listener, event) {
    event._setCurrentTarget(listener._getSceneGraphPriority());
    listener._onEvent(event);
    return event.isStopped();
  },

  /**
   * Dispatches a Custom Event with a event name an optional user data
   * @param {string} eventName
   * @param {*} optionalUserData
   */
  dispatchCustomEvent: function (eventName, optionalUserData) {
    var ev = new EventCustom(eventName);
    ev.setUserData(optionalUserData);
    this.dispatchEvent(ev);
  }
};
