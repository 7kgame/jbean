import BusinessException from './business_exception'

import BeanFactory, { BeanMeta } from './bean_factory'
import { isAsyncFunction } from './utils'

const BEFORE_CALL_NAME: string = 'beforeCall'
const AFTER_CALL_NAME: string = 'afterCall'
const PRE_AROUND_NAME: string = 'preAround'
const POST_AROUND_NAME: string = 'postAround'

export default class ReflectHelper {

  public static getMethods (ctor: Function, checkBeforeAfterCaller?: boolean): string[] {
    return Object.getOwnPropertyNames(ctor.prototype).filter((item) => {
      if (item === 'constructor') {
        return false
      }
      if (!checkBeforeAfterCaller &&
        (item === BEFORE_CALL_NAME ||
          item === AFTER_CALL_NAME || 
          item === PRE_AROUND_NAME ||
          item === POST_AROUND_NAME)) {
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
    for (let i = 0; i < classAnnos.length; i++) {
      let existInMethod = false
      for (let j = 0; j < methodsAnnos.length; j++) {
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
    annos = annos.concat(methodsAnnos).reverse()
    const originFunc = ctor.prototype[method]
    let callerStack: any[] = []
    let hasAsyncFunc = false

    if (ReflectHelper.methodExist(ctor, BEFORE_CALL_NAME, 0, true)) {
      callerStack.push([false, isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME]), ctor.prototype[BEFORE_CALL_NAME], null, BEFORE_CALL_NAME, true])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME])
    }
    annos.forEach(([caller, args]) => {
      if (typeof caller.preCall !== 'function') {
        return
      }
      callerStack.push([false, isAsyncFunction(caller.preCall), caller.preCall, args, caller.name, true])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(caller.preCall)
    })
    if (ReflectHelper.methodExist(ctor, PRE_AROUND_NAME, 0, true)) {
      callerStack.push([false, isAsyncFunction(ctor.prototype[PRE_AROUND_NAME]), ctor.prototype[PRE_AROUND_NAME], null, PRE_AROUND_NAME, true])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[PRE_AROUND_NAME])
    }
    callerStack.push([true, isAsyncFunction(originFunc), originFunc, null, originFunc.name, false])
    hasAsyncFunc = hasAsyncFunc || isAsyncFunction(originFunc)
    if (ReflectHelper.methodExist(ctor, POST_AROUND_NAME, 0, true)) {
      callerStack.push([false, isAsyncFunction(ctor.prototype[POST_AROUND_NAME]), ctor.prototype[POST_AROUND_NAME], null, POST_AROUND_NAME, false])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[POST_AROUND_NAME])
    }
    let tempCallStack4PostCall: any[] = []
    annos.forEach(([caller, args]) => {
      if (typeof caller.postCall !== 'function') {
        return
      }
      tempCallStack4PostCall.push([false, isAsyncFunction(caller.postCall), caller.postCall, args, caller.name, false])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(caller.postCall)
    })
    tempCallStack4PostCall.reverse()
    callerStack = callerStack.concat(tempCallStack4PostCall)
    if (ReflectHelper.methodExist(ctor, AFTER_CALL_NAME, 0, true)) {
      callerStack.push([false, isAsyncFunction(ctor.prototype[AFTER_CALL_NAME]), ctor.prototype[AFTER_CALL_NAME], null, AFTER_CALL_NAME, false])
      hasAsyncFunc = hasAsyncFunc || isAsyncFunction(ctor.prototype[AFTER_CALL_NAME])
    }

    const prepareCallerParams = function (callerInfo, args0, ret) {
      const [isOriginFunc, isAsyncFunc, caller, args1, callername, pre] = callerInfo
      let args: any[] = []
      if (!isOriginFunc) {
        args.push(ret)
      }
      if (args1) {
        args = args.concat(args1)
      }
      args = args.concat(args0)
      if (isOriginFunc) {
        args = args0
      }
      return [caller, isAsyncFunc, isOriginFunc, args, callername, pre]
    }
    if (hasAsyncFunc) {
      ctor.prototype[method] = async function () {
        let currentCallIdx = 0
        const callerStackLen = callerStack.length
        const args0 = Array.prototype.slice.call(arguments, 0)
        let preRet = {
          err: null,
          data: null,
          from: '',
          pre: undefined
        }
        while (currentCallIdx < callerStackLen) {
          const [caller, isAsyncFunc, isOriginFunc, args, callername, pre] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet)
          let ret = undefined
          if (preRet && preRet.err && isOriginFunc) { // skip original function when error occurs
            currentCallIdx++
            continue
          }
          try {
            let isAnnotation = !(callername === PRE_AROUND_NAME) && !(callername === POST_AROUND_NAME)
              && !(callername === BEFORE_CALL_NAME) && !(callername === AFTER_CALL_NAME)
              && !isOriginFunc
            let ctx = isAnnotation ? {} : this
            if (isAsyncFunc) {
              ret = await caller.call(ctx, ...args)
            } else {
              ret = caller.call(ctx, ...args)
            }
            if (ret === null) {
              break
            }
            if (ret && ret.err) {
              ret.from = ret.from || callername
              ret.pre = ret.pre || pre
            }
            if (ret === undefined) {
              ret = preRet
            }
            if (isOriginFunc) {
              ret = {
                err: null,
                data: ret,
                from: '',
                pre: undefined
              }
            }
          } catch (e) {
            if (e instanceof BusinessException) {
              ret = {
                err: e,
                data: e.data,
                from: callername,
                pre: pre
              }
            } else {
              throw e
            }
          }
          preRet = ret
          currentCallIdx++
        }
        if (preRet.err) {
          throw new Error(JSON.stringify(preRet))
        } else {
          return preRet.data
        }
      }
    } else {
      ctor.prototype[method] = function () {
        let currentCallIdx = 0
        const callerStackLen = callerStack.length
        const args0 = Array.prototype.slice.call(arguments, 0)
        let preRet = {
          err: null,
          data: null,
          from: '',
          pre: undefined
        }
        while (currentCallIdx < callerStackLen) {
          const [caller, isAsyncFunc, isOriginFunc, args, callername, pre] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet)
          let ret
          if (preRet && preRet.err && isOriginFunc) {
            currentCallIdx++
            continue
          }
          try {
            let isAnnotation = !(callername === PRE_AROUND_NAME) && !(callername === POST_AROUND_NAME)
              && !(callername === BEFORE_CALL_NAME) && !(callername === AFTER_CALL_NAME)
              && !isOriginFunc
            let ctx = isAnnotation?{}:this
            ret = caller.call(ctx, ...args)
            if (ret === null) {
              break
            }
            if (ret && ret.err) {
              ret.from = ret.from || callername
              ret.pre = ret.pre || pre
            }
            if (ret === undefined) {
              ret = preRet
            }
            if (isOriginFunc) {
              ret = {
                err: '',
                data: ret,
                from: '',
                pre: undefined
              }
            }
          } catch (e) {
            if (e instanceof BusinessException) {
              ret = {
                err: e,
                data: e.data,
                from: callername,
                pre: pre
              }
            } else {
              throw e
            }
          }
          preRet = ret
          currentCallIdx++
        }
        if (preRet.err) {
          throw new Error(JSON.stringify(preRet))
        } else {
          return preRet.data
        }
      }
    }
  }

  public static resetClass (ctor: Function): void {
    const beanMeta: BeanMeta = BeanFactory.getBeanMeta(ctor)
    if (!beanMeta) {
      return
    }
    ReflectHelper.getMethods(ctor).forEach((method: string) => {
      ReflectHelper.resetMethod(ctor, method, beanMeta.clzAnnos, beanMeta.methodAnnos[method])
    })
  }

}