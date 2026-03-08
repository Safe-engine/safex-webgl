import { AsyncPool } from './AsyncPool'

/**
 * @class
 */
export const async = /** @lends async# */ {
  /**
   * Do tasks series.
   * @param {Array|Object} tasks
   * @param {function} [cb] callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  series: function (tasks, cb, target) {
    const asyncPool = new AsyncPool(
      tasks,
      1,
      function (func, index, cb1) {
        func.call(target, cb1)
      },
      cb,
      target,
    )
    asyncPool.flow()
    return asyncPool
  },

  /**
   * Do tasks parallel.
   * @param {Array|Object} tasks
   * @param {function} cb callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  parallel: function (tasks, cb, target) {
    const asyncPool = new AsyncPool(
      tasks,
      0,
      function (func, index, cb1) {
        func.call(target, cb1)
      },
      cb,
      target,
    )
    asyncPool.flow()
    return asyncPool
  },

  /**
   * Do tasks waterfall.
   * @param {Array|Object} tasks
   * @param {function} cb callback
   * @param {Object} [target]
   * @return {AsyncPool}
   */
  waterfall: function (tasks, cb, target) {
    const args = []
    let lastResults = [null] //the array to store the last results
    const asyncPool = new AsyncPool(
      tasks,
      1,
      (func, index, cb1) => {
        const wrappedCb = (err, ...rest) => {
          if (tasks.length - 1 === index) {
            lastResults = lastResults.concat(rest)
          }
          cb1(err, ...rest)
        }

        func.call(target, ...args, wrappedCb)
      },
      function (err) {
        if (!cb) return
        if (err) return cb.call(target, err)
        cb.apply(target, lastResults)
      },
    )
    asyncPool.flow()
    return asyncPool
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
    let locIterator = iterator
    if (typeof iterator === 'object') {
      callback = iterator.cb
      target = iterator.iteratorTarget
      locIterator = iterator.iterator
    }
    const asyncPool = new AsyncPool(tasks, 0, locIterator, callback, target)
    asyncPool.flow()
    return asyncPool
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
    const asyncPool = new AsyncPool(tasks, limit, iterator, cb, target)
    asyncPool.flow()
    return asyncPool
  },
}
