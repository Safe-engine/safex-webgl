
export const each = function (obj, iterator, context?) {
  if (!obj)
    return;
  if (obj instanceof Array) {
    for (var i = 0, li = obj.length; i < li; i++) {
      if (iterator.call(context, obj[i], i) === false)
        return;
    }
  } else {
    for (var key in obj) {
      if (iterator.call(context, obj[key], key) === false)
        return;
    }
  }
};

export const AsyncPool = function (srcObj, limit, iterator, onEnd, target?) {
  const self = this;
  self._finished = false;
  self._srcObj = srcObj;
  self._limit = limit;
  self._pool = [];
  self._iterator = iterator;
  self._iteratorTarget = target;
  self._onEnd = onEnd;
  self._onEndTarget = target;
  self._results = srcObj instanceof Array ? [] : {};
  self._errors = srcObj instanceof Array ? [] : {};

  each(srcObj, function (value, index) {
    self._pool.push({ index: index, value: value });
  });

  self.size = self._pool.length;
  self.finishedSize = 0;
  self._workingSize = 0;

  self._limit = self._limit || self.size;

  self.onIterator = function (iterator, target) {
    self._iterator = iterator;
    self._iteratorTarget = target;
  };

  self.onEnd = function (endCb, endCbTarget) {
    self._onEnd = endCb;
    self._onEndTarget = endCbTarget;
  };

  self._handleItem = function () {
    var self = this;
    if (self._pool.length === 0 || self._workingSize >= self._limit)
      return;                                                         //return directly if the array's length = 0 or the working size great equal limit number

    var item = self._pool.shift();
    var value = item.value, index = item.index;
    self._workingSize++;
    self._iterator.call(self._iteratorTarget, value, index,
      function (err, result) {
        if (self._finished) {
          return;
        }

        if (err) {
          self._errors[this.index] = err;
        }
        else {
          self._results[this.index] = result;
        }

        self.finishedSize++;
        self._workingSize--;
        if (self.finishedSize === self.size) {
          var errors = self._errors.length === 0 ? null : self._errors;
          self.onEnd(errors, self._results);
          return;
        }
        self._handleItem();
      }.bind(item),
      self);
  };

  self.flow = function () {
    var self = this;
    if (self._pool.length === 0) {
      if (self._onEnd)
        self._onEnd.call(self._onEndTarget, null, []);
      return;
    }
    for (var i = 0; i < self._limit; i++)
      self._handleItem();
  };

  self.onEnd = function (errors, results) {
    self._finished = true;
    if (self._onEnd) {
      var selector = self._onEnd;
      var target = self._onEndTarget;
      self._onEnd = null;
      self._onEndTarget = null;
      selector.call(target, errors, results);
    }
  };
};

/**
 * @class
 */
export const async = /** @lends async# */{
  /**
   * Do tasks series.
   * @param {Array|Object} tasks
   * @param {function} [cb] callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  series: function (tasks, cb, target) {
    var asyncPool = new AsyncPool(tasks, 1, function (func, index, cb1) {
      func.call(target, cb1);
    }, cb, target);
    asyncPool.flow();
    return asyncPool;
  },

  /**
   * Do tasks parallel.
   * @param {Array|Object} tasks
   * @param {function} cb callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  parallel: function (tasks, cb, target) {
    var asyncPool = new AsyncPool(tasks, 0, function (func, index, cb1) {
      func.call(target, cb1);
    }, cb, target);
    asyncPool.flow();
    return asyncPool;
  },

  /**
   * Do tasks waterfall.
   * @param {Array|Object} tasks
   * @param {function} cb callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  waterfall: function (tasks, cb, target) {
    let args = [];
    let lastResults = [null];//the array to store the last results
    let asyncPool = new AsyncPool(tasks, 1,
      function (func, index, cb1) {
        args.push(function (err) {
          args = Array.prototype.slice.call(arguments, 1);
          if (tasks.length - 1 === index) lastResults = lastResults.concat(args);//while the last task
          cb1.apply(null, arguments);
        });
        func.apply(target, args);
      }, function (err) {
        if (!cb)
          return;
        if (err)
          return cb.call(target, err);
        cb.apply(target, lastResults);
      });
    asyncPool.flow();
    return asyncPool;
  },

  /**
   * Do tasks by iterator.
   * @param {Array|Object} tasks
   * @param {function|Object} iterator
   * @param {function} [callback]
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  map: function (tasks, iterator, callback, target) {
    var locIterator = iterator;
    if (typeof (iterator) === "object") {
      callback = iterator.cb;
      target = iterator.iteratorTarget;
      locIterator = iterator.iterator;
    }
    var asyncPool = new AsyncPool(tasks, 0, locIterator, callback, target);
    asyncPool.flow();
    return asyncPool;
  },

  /**
   * Do tasks by iterator limit.
   * @param {Array|Object} tasks
   * @param {Number} limit
   * @param {function} iterator
   * @param {function} cb callback
   * @param {Object} [target]
   */
  mapLimit: function (tasks, limit, iterator, cb, target) {
    var asyncPool = new AsyncPool(tasks, limit, iterator, cb, target);
    asyncPool.flow();
    return asyncPool;
  }
};
