import * as util from 'util'

import BeanFactory, { BeanMeta } from './bean_factory'
import { isAsyncFunction } from './utils'

const BEFORE_CALL_NAME: string = 'beforeCall'
const AFTER_CALL_NAME: string = 'afterCall'

export default class ReflectHelper {

  public static getMethods (ctor: Function, checkBeforeAfterCaller?: boolean): string[] {
    return Object.getOwnPropertyNames(ctor.prototype).filter((item) => {
      if (item === 'constructor') {
        return false
      }
      if (!checkBeforeAfterCaller &&
          (item === BEFORE_CALL_NAME || 
          item === AFTER_CALL_NAME)) {
        return false
      }
      return typeof ctor.prototype[item] === 'function'
    })
  }

  public static getParentMethods (ctor: Function, checkBeforeAfterCaller?: boolean): string[] | null {
    const parent = Object.getPrototypeOf(ctor)
    if (!parent.prototype) {
      return null
    }
    return ReflectHelper.getMethods(parent, checkBeforeAfterCaller)
  }

  public static methodExist (ctor: Function, method: string, loopCnt?: number, checkBeforeAfterCaller?: boolean): boolean {
    let ctor0 = ctor
    let loop = 0
    if (!loopCnt || loopCnt < 1) {
      loopCnt = 10
    }
    while (true) {
      if (loop >= loopCnt) {
        return false
      }
      const methods = ReflectHelper.getMethods(ctor0, checkBeforeAfterCaller)
      if (methods && methods.indexOf(method) >= 0) {
        return true
      }
      ctor0 = Object.getPrototypeOf(ctor0)
      if (!ctor0.prototype) {
        return false
      }
      loop++
    }
  }

  public static resetMethod (ctor: Function, method: string, classAnnos?: any[], methodsAnnos?: any[]): void {
    classAnnos = classAnnos || []
    methodsAnnos = methodsAnnos || []
    let annos: any[] = []
    for (let i=0; i < classAnnos.length; i++) {
      let existInMethod = false
      for (let j=0; j < methodsAnnos.length; j++) {
        if (methodsAnnos[j][0] === classAnnos[i][0]) {
          existInMethod = true
          break
        }
      }
      if (existInMethod) {
        continue
      }
      annos.push(classAnnos[i])
    }
    annos = annos.concat(methodsAnnos)
    const originFunc = ctor.prototype[method]
    let callerStack: any[] = []
    let hasAsyncFunc = false
    annos.forEach(([caller, args]) => {
      if (typeof caller.preCall !== 'function') {
        return
      }
      callerStack.push([false, false, isAsyncFunction(caller.preCall), caller.preCall, args])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(caller.preCall)
    })
    if (ReflectHelper.methodExist(ctor, BEFORE_CALL_NAME, 0, true)) {
      callerStack.push([false, false, isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME]), ctor.prototype[BEFORE_CALL_NAME], null])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME])
    }
    callerStack.push([true, true, isAsyncFunction(originFunc), originFunc, null])
    hasAsyncFunc = hasAsyncFunc || isAsyncFunction(originFunc)
    if (ReflectHelper.methodExist(ctor, AFTER_CALL_NAME, 0, true)) {
      callerStack.push([true, false, isAsyncFunction(ctor.prototype[AFTER_CALL_NAME]), ctor.prototype[AFTER_CALL_NAME], null])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[AFTER_CALL_NAME])
    }
    let tempCallStack4PostCall: any[] = []
    annos.forEach(([caller, args]) => {
      if (typeof caller.postCall !== 'function') {
        return
      }
      tempCallStack4PostCall.push([true, false, isAsyncFunction(caller.postCall), caller.postCall, args])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(caller.postCall)
    })
    tempCallStack4PostCall.reverse()
    callerStack = callerStack.concat(tempCallStack4PostCall)

    const prepareCallerParams = function (callerInfo, args0, ret) {
      const [needRet, isOriginFunc, isAsyncFunc, caller, args1] = callerInfo
      let args: any[] = []
      if (needRet && !isOriginFunc) {
        args.push(ret)
      }
      if (args1) {
        args = args.concat(args1)
      }
      args = args.concat(args0)
      if (isOriginFunc) {
        args = args0
      }
      return [caller, isAsyncFunc, args]
    }

    if (hasAsyncFunc) {
      ctor.prototype[method] = async function () {
        let currentCallIdx = 0
        const callerStackLen = callerStack.length
        const args0 = Array.prototype.slice.call(arguments, 0)
        let preRet = null
        while(currentCallIdx < callerStackLen) {
          const [caller, isAsyncFunc, args] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet)
          let ret = undefined
          if (isAsyncFunc) {
            ret = await caller.call(this, ...args)
          } else {
            ret = caller.call(this, ...args)
          }
          if (ret === null) {
            break
          }
          preRet = ret
          currentCallIdx++
        }
        return preRet
      }
    } else {
      ctor.prototype[method] = function () {
        let currentCallIdx = 0
        const callerStackLen = callerStack.length
        const args0 = Array.prototype.slice.call(arguments, 0)
        let preRet = null
        while(currentCallIdx < callerStackLen) {
          const [caller, isAsyncFunc, args] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet)
          let ret = caller.call(this, ...args)
          if (ret === null) {
            break
          }
          preRet = ret
          currentCallIdx++
        }
        return preRet
      }
    }
  }

  public static resetClass (ctor: Function): void {
    const beanMeta:BeanMeta = BeanFactory.getBeanMeta(ctor)
    if (!beanMeta) {
      return
    }
    ReflectHelper.getMethods(ctor).forEach((method: string) => {
      ReflectHelper.resetMethod(ctor, method, beanMeta.clzAnnos, beanMeta.methodAnnos[method])
    })
  }

}