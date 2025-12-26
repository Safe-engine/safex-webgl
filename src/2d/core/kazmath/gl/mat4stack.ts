import { Matrix4 } from "../mat4";

export const Matrix4Stack = function (top?, stack?) {
  this.top = top;
  this.stack = stack || [];
  this.lastUpdated = 0;
  //this._matrixPool = [];            // use pool in next version
};
// km_mat4_stack = Matrix4Stack;
var proto = Matrix4Stack.prototype;

proto.initialize = function () {    //km_mat4_stack_initialize
  this.stack.length = 0;
  this.top = null;
};

//for compatibility
export const km_mat4_stack_push = function (stack, item) {
  stack.stack.push(stack.top);
  stack.top = new Matrix4(item);
};

export const km_mat4_stack_pop = function (stack, pOut) {
  stack.top = stack.stack.pop();
};

export const km_mat4_stack_release = function (stack) {
  stack.stack = null;
  stack.top = null;
};

proto.push = function (item) {
  item = item || this.top;
  this.stack.push(this.top);
  this.top = new Matrix4(item);
  //this.top = this._getFromPool(item);
};

proto.pop = function () {
  //this._putInPool(this.top);
  this.top = this.stack.pop();
};

proto.release = function () {
  this.stack = null;
  this.top = null;
  this._matrixPool = null;
};

proto._getFromPool = function (item) {
  var pool = this._matrixPool;
  if (pool.length === 0)
    return new Matrix4(item);
  var ret = pool.pop();
  ret.assignFrom(item);
  return ret;
};

proto._putInPool = function (matrix) {
  this._matrixPool.push(matrix);
};




