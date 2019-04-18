import * as fs from 'fs'
import * as Path from 'path'

export function merge (target, source) {
  if (!target || typeof target !== 'object') {
    throw new Error('target value must be an object')
  }
  if (!source  || typeof source !== 'object') {
    return target
  }
  if (Array.isArray(source)) {
    if (Array.isArray(target)) {
      for (let i=0; i<source.length; i++) {
        target.push(source[i]);
      }
    }
  } else {
    for (let key in source) {
      const val = source[key]
      if (typeof target[key] === 'undefined' || typeof val !== 'object') {
        target[key] = val
      } else {
        merge(target[key], val)
      }
    }
  }
}

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

export function getObjectType(obj: any) {
  if (obj === null) {
    return 'null'
  }
  if (obj === undefined) {
    return 'undefined'
  }
  return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase()
}

export function isAsyncFunction (func: Function): boolean {
  return getObjectType(func) === 'asyncfunction'
      || func.toString().match(/__awaiter/) !== null
}

export function rtrimUndefinedArgument (args): any[] {
  if (getObjectType(args) === 'arguments') {
    args = Array.prototype.slice.call(args, 0)
  }
  let currentLoop = 0
  const maxLoop = args.length
  while(currentLoop < maxLoop) {
    if (typeof args[args.length-1] === 'undefined') {
      args.pop()
    }
    currentLoop++
  }
  return args
}