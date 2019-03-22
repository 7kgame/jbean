import * as fs from 'fs'
import * as Path from 'path'

export function redefineProperty (target, key, config) {
  if (!config) {
    return
  }
  let config0 = {
    enumerable: true,
    configurable: true
  }
  for (let k in config) {
    config0[k] = config[k]
  }

  if (delete target[key]) {
    Object.defineProperty(target, key, config0)
  }
}

export function readDirSync (path, cb: Function) {
  let res = fs.readdirSync(path)
  res.forEach( (fname, index) => {
    let fpath = path + Path.sep + fname
    let stat = fs.statSync(fpath)
    if ( stat.isDirectory() ) {
      readDirSync(fpath, cb)
      cb(fpath, false)
    } else {
      cb(fpath, true)
    }
  });
}

export function getObjectType(obj) {
  if (obj === null) {
    return 'null'
  }
  if (obj === undefined) {
    return 'undefined'
  }
  return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase()
}

export enum AnnotationType {
  clz,
  method,
  field
}

let compileTrick: any

export function annotationHelper (annoType: AnnotationType, callback: Function, args) {
  switch (annoType) {
    case AnnotationType.clz:
      if (args.length === 1 && typeof args[0] === 'function') {
        callback && callback(...args)
        return compileTrick
      }
      return target => {
        callback && callback(target, ...args)
      }
    case AnnotationType.method:
      if (args.length === 3 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[2] === 'object'
          && typeof args[2].value !== 'undefined') {
        callback && callback(...args)
        return compileTrick
      }
      return (target: any, prop: string, descriptor: PropertyDescriptor) => {
        callback && callback(target, prop, descriptor, ...args)
      }
    case AnnotationType.field:
      if (args.length >= 2 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[1] === 'string') {
        callback && callback(...args)
        return compileTrick
      }
      return (target: any, prop: string) => {
        callback && callback(target, prop, ...args)
      }
  }
  return compileTrick
}
