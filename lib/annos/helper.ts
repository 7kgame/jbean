import { CTOR_ID } from '../bean_factory'
import { getObjectType, rtrimUndefinedArgument } from '../utils';

export enum AnnotationType {
  clz,
  method,
  field,
  none
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

export function checkAnnotationType (args) {
  if (args.length === 1 
      && typeof args[0] === 'function' 
      && args[0].name.toLowerCase() !== 'object') {
    return AnnotationType.clz
  }
  if (args.length === 3
      && (typeof args[0] === 'object' || typeof args[0] === 'function')
      && typeof args[1] === 'string'
      && typeof args[2] === 'object'
      && ((args[0].constructor && args[0].constructor.name.toLowerCase() !== 'object')
          || args[0].name.toLowerCase() !== 'object')
      && (typeof args[2]['value'] !== 'undefined' && typeof args[2]['enumerable'] !== 'undefined')) {
    return AnnotationType.method
  }
  if (args.length >= 2
      && (typeof args[0] === 'object' || typeof args[0] === 'function')
      && typeof args[1] === 'string'
      && ((args[0].constructor && args[0].constructor.name.toLowerCase() !== 'object')
          || args[0].name.toLowerCase() !== 'object')) {
    return AnnotationType.field
  }
  return AnnotationType.none
}

export function annotationHelper (args, callback: Function, ignoreAnnotationTypeCheck?: boolean) {
  let annoType = AnnotationType.none
  if (!ignoreAnnotationTypeCheck) {
    annoType = checkAnnotationType(args)
  }

  if (getObjectType(args) === 'arguments') {
    args = Array.prototype.slice.call(args, 0)
  }
  if (annoType === AnnotationType.none) {
    return function () {
      addCtorId(arguments[0])
      annoType = checkAnnotationType(arguments)
      const args0 = rtrimUndefinedArgument(arguments)
      callback && callback(annoType, ...args0.concat(args))
    }
  } else {
    addCtorId(args[0])
    callback && callback(annoType, ...args)
    return compileTrick
  }
}
