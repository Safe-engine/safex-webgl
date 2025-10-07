import { director } from "../../../..";
import { degreesToRadians } from "../../platform/Macro";
import { math } from "../utility";


export const KM_GL_MODELVIEW = 0x1700;
export const KM_GL_PROJECTION = 0x1701;
export const KM_GL_TEXTURE = 0x1702;

let modelview_matrix_stack = new math.Matrix4Stack();
let projection_matrix_stack = new math.Matrix4Stack();
let texture_matrix_stack = new math.Matrix4Stack();

let current_stack = null;
let initialized = false;

export const lazyInitialize = function () {
  if (!initialized) {
    var identity = new math.Matrix4(); //Temporary identity matrix

    //Initialize all 3 stacks
    modelview_matrix_stack.initialize();
    projection_matrix_stack.initialize();
    texture_matrix_stack.initialize();

    current_stack = modelview_matrix_stack;
    initialized = true;
    identity.identity();

    //Make sure that each stack has the identity matrix
    modelview_matrix_stack.push(identity);
    projection_matrix_stack.push(identity);
    texture_matrix_stack.push(identity);
  }
};

lazyInitialize();

export const kmGLFreeAll = function () {
  //Clear the matrix stacks
  modelview_matrix_stack.release();
  modelview_matrix_stack = null;
  projection_matrix_stack.release();
  projection_matrix_stack = null;
  texture_matrix_stack.release();
  texture_matrix_stack = null;

  //Delete the matrices
  initialized = false; //Set to uninitialized
  current_stack = null; //Set the current stack to point nowhere
};

export const kmGLPushMatrix = function () {
  current_stack.push(current_stack.top);
};

export const kmGLPushMatrixWitMat4 = function (saveMat) {
  current_stack.stack.push(current_stack.top);
  saveMat.assignFrom(current_stack.top);
  current_stack.top = saveMat;
};

export const kmGLPopMatrix = function () {
  //No need to lazy initialize, you shouldn't be popping first anyway!
  //km_mat4_stack_pop(current_stack, null);
  current_stack.top = current_stack.stack.pop();
};

export const kmGLMatrixMode = function (mode) {
  //lazyInitialize();
  switch (mode) {
    case KM_GL_MODELVIEW:
      current_stack = modelview_matrix_stack;
      break;
    case KM_GL_PROJECTION:
      current_stack = projection_matrix_stack;
      break;
    case KM_GL_TEXTURE:
      current_stack = texture_matrix_stack;
      break;
    default:
      throw new Error("Invalid matrix mode specified");   //TODO: Proper error handling
      break;
  }
  current_stack.lastUpdated = director.getTotalFrames();
};

export const kmGLLoadIdentity = function () {
  //lazyInitialize();
  current_stack.top.identity(); //Replace the top matrix with the identity matrix
};

export const kmGLLoadMatrix = function (pIn) {
  //lazyInitialize();
  current_stack.top.assignFrom(pIn);
};

export const kmGLMultMatrix = function (pIn) {
  //lazyInitialize();
  current_stack.top.multiply(pIn);
};

var tempMatrix = new math.Matrix4();    //an internal matrix
export const kmGLTranslatef = function (x, y, z) {
  //Create a rotation matrix using translation
  var translation = math.Matrix4.createByTranslation(x, y, z, tempMatrix);

  //Multiply the rotation matrix by the current matrix
  current_stack.top.multiply(translation);
};

var tempVector3 = new math.Vec3();
export const kmGLRotatef = function (angle, x, y, z) {
  tempVector3.fill(x, y, z);
  //Create a rotation matrix using the axis and the angle
  var rotation = math.Matrix4.createByAxisAndAngle(tempVector3, degreesToRadians(angle), tempMatrix);

  //Multiply the rotation matrix by the current matrix
  current_stack.top.multiply(rotation);
};

export const kmGLScalef = function (x, y, z) {
  var scaling = math.Matrix4.createByScale(x, y, z, tempMatrix);
  current_stack.top.multiply(scaling);
};

export const kmGLGetMatrix = function (mode, pOut) {
  //lazyInitialize();
  switch (mode) {
    case KM_GL_MODELVIEW:
      pOut.assignFrom(modelview_matrix_stack.top);
      break;
    case KM_GL_PROJECTION:
      pOut.assignFrom(projection_matrix_stack.top);
      break;
    case KM_GL_TEXTURE:
      pOut.assignFrom(texture_matrix_stack.top);
      break;
    default:
      throw new Error("Invalid matrix mode specified"); //TODO: Proper error handling
      break;
  }
};
