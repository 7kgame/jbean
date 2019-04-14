import { CTOR_ID } from '../bean_factory'
import { getObjectType } from '../utils';

export enum AnnotationType {
  clz,
  method,
  field
}

let compileTrick: any
let clzCnt: number = 0

const addCtorId = function (target: object | Function) {
  let ctor: Function
  if (typeof target === 'object') {
    ctor = target.constructor
  } else {
    ctor = target
  }
  if (ctor && typeof ctor[CTOR_ID] === 'undefined') {
    ctor[CTOR_ID] = ctor.name + ':' + (++clzCnt)
  }
}

const doCallback = function (callback: Function, args0, args1): void {
  if (!callback) {
    return
  }
  let annoType = AnnotationType.clz
  if (getObjectType(args0) === 'arguments') {
    args0 = Array.prototype.slice.call(args0, 0)
  }
  if (getObjectType(args1) === 'arguments') {
    args1 = Array.prototype.slice.call(args1, 0)
  }
  if (args0.length > 2) {
    annoType = AnnotationType.method
  } else if (args0.length == 2) {
    annoType = AnnotationType.field
  }
  callback(annoType, ...args0.concat(args1))
}

export function annotationHelper (annoType: AnnotationType, callback: Function, args) {
  switch (annoType) {
    case AnnotationType.clz:
      if (args.length === 1 && typeof args[0] === 'function') {
        addCtorId(args[0])
        callback && callback(annoType, ...args)
        return compileTrick
      }
      return function () {
        addCtorId(arguments[0])
        doCallback(callback, arguments, args)
      }
      // return target => {
      //   addCtorId(target)
      //   callback && callback(target, ...args)
      // }
    case AnnotationType.method:
      if (args.length === 3 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[2] === 'object'
          && typeof args[2].value !== 'undefined') {
        addCtorId(args[0])
        callback && callback(annoType, ...args)
        return compileTrick
      }
      return function () {
        addCtorId(arguments[0])
        doCallback(callback, arguments, args)
      }
      // return (target: any, method: string, descriptor: PropertyDescriptor) => {
      //   addCtorId(target)
      //   callback && callback(target, method, descriptor, ...args)
      // }
    case AnnotationType.field:
      if (args.length >= 2 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[1] === 'string') {
        addCtorId(args[0])
        callback && callback(annoType, ...args)
        return compileTrick
      }
      return function () {
        addCtorId(arguments[0])
        doCallback(callback, arguments, args)
      }
      // return (target: any, field: string) => {
      //   addCtorId(target)
      //   callback && callback(target, field, ...args)
      // }
  }
  return compileTrick
}
