import { AnnotationType, annotationHelper } from './helper'
import { CTOR_ID } from '../bean_factory'
import { merge } from '../utils'

export default function Transactional (transactionalOptions?: TransactionalOptions | Function | Object, method?: any) {
  return annotationHelper(arguments, callback)
}

export type TransactionalOptions = {
  ignore?: boolean
}

const callback = function (annoType: AnnotationType, target: object | Function) {
  let ctor: Function
  if (typeof target === 'object') {
    ctor = target.constructor
  } else {
    ctor = target
  }
  if (annoType === AnnotationType.clz) {
    addTransactionalMeta(ctor, arguments[2])
  } else if (annoType === AnnotationType.method) {
    addTransactionalMeta(ctor, arguments[4], arguments[2])
  }
}

const clzTransactionalMetas = {}
const methodTransactionalMetas = {}

const addTransactionalMeta = function (ctor: Function, transactionalOptions: TransactionalOptions, method?: string) {
  const ctorId = ctor[CTOR_ID]
  if (!ctorId) {
    throw new Error(ctor.name + '.' + CTOR_ID + ' is undefined')
  }
  if (typeof method === 'undefined') {
    clzTransactionalMetas[ctorId] = transactionalOptions || {ignore: false}
  } else {
    if (typeof methodTransactionalMetas[ctorId] === 'undefined') {
      methodTransactionalMetas[ctorId] = {}
    }
    methodTransactionalMetas[ctorId][method] = transactionalOptions || {ignore: false}
  }
}

export const getTransactionalMeta = function (target: Function | object, method?: string): TransactionalOptions | null {
  let ctor: Function
  if (typeof target === 'object') {
    ctor = target.constructor
  } else {
    ctor = target
  }
  const ctorId = ctor[CTOR_ID]
  if (!ctorId) {
    return null
  }
  const clzTransactionalMeta = clzTransactionalMetas[ctorId]
  let methodTransactionalMeta = null
  if (method && typeof methodTransactionalMetas[ctorId] !== 'undefined') {
    methodTransactionalMeta = methodTransactionalMetas[ctorId][method]
  }
  if (!clzTransactionalMeta && !methodTransactionalMeta) {
    return null
  }
  let newMeta = {}
  merge(newMeta, clzTransactionalMeta)
  merge(newMeta, methodTransactionalMeta)
  return newMeta
}

export const checkSupportTransition = function (target: Function | object, method?: string): boolean {
  const meta = getTransactionalMeta(target, method)
  if (meta === null) {
    return false
  }
  return meta.ignore ? false : true
}

const beginCallbacks = []
const commitCallbacks = []
const rollbackCallbacks = []

export function registerBegin (cb: Function): void {
  beginCallbacks.push(cb)
}

export function registerCommit (cb: Function): void {
  commitCallbacks.push(cb)
}

export function registerRollback (cb: Function): void {
  rollbackCallbacks.push(cb)
}

const emit = async function (requestId: number, step: number) {
  let cbs = beginCallbacks
  if (step === 2) {
    cbs = commitCallbacks
  } else if (step === 3) {
    cbs = rollbackCallbacks
  }
  const len = cbs.length
  for (let i = 0; i < len; i++) {
    let ret = await cbs[i](requestId)
  }
}

export function emitBegin (requestId: number): Promise<void> {
  return emit(requestId, 1)
}

export function emitCommit (requestId: number): Promise<void> {
  return emit(requestId, 2)
}

export function emitRollback (requestId: number): Promise<void> {
  return emit(requestId, 3)
}