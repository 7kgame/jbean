import { AnnotationType } from './annos/helper'

export type BeanMeta = {
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
  fieldType?: {}
  id?: any
  retHooks?: {}
}

export const CTOR_ID: string = '__ctorId'
export const REQUEST_ID: string = '$__request_id'
export const REQUEST_START_TIME: string = '$__request_st'

const getRequestKey = function (requestId: number): string {
  return 'r_' + requestId
}

export default class BeanFactory {

  private static beans = {}
  private static requestBeans = {}
  private static beansMeta = {}

  public static addBeanMeta (
    annoType: AnnotationType,
    target: object | Function,
    prop: string,
    anno: Function,
    params?: any[],
    fieldType?: string,
    retHook?: Function,
    id?: any): void {

    let ctor: Function
    if (typeof target === 'object') {
      ctor = target.constructor
    } else {
      ctor = target
    }
    const ctorId = ctor[CTOR_ID]
    if (!ctorId) {
      throw new Error(ctor.name + '.' + CTOR_ID + ' is undefined')
    }
    if (typeof BeanFactory.beansMeta[ctorId] === 'undefined') {
      let beanMeta:BeanMeta = {}
      beanMeta.clz = ctor
      beanMeta.clzAnnos = []
      beanMeta.methodAnnos = {}
      beanMeta.fieldAnnos = {}
      beanMeta.fieldType = {}
      beanMeta.retHooks = {}
      beanMeta.id = null
      BeanFactory.beansMeta[ctorId] = beanMeta
    }
    const beanMeta: BeanMeta = BeanFactory.beansMeta[ctorId]
    switch (annoType) {
      case AnnotationType.clz:
        if (anno) {
          beanMeta.clzAnnos.push([anno, params])
        }
        break
      case AnnotationType.method:
        if (!prop) {
          break
        }
        if (typeof beanMeta.methodAnnos[prop] === 'undefined') {
          beanMeta.methodAnnos[prop] = []
        }
        beanMeta.methodAnnos[prop].push([anno, params])
        if (typeof beanMeta.retHooks[prop] === 'undefined') {
          beanMeta.retHooks[prop] = []
        }
        if (retHook) {
          beanMeta.retHooks[prop].push([retHook, params])
        }
        break
      case AnnotationType.field:
        if (!prop) {
          break
        }
        if (id) {
          beanMeta.id = id
        }
        if (fieldType) {
          beanMeta.fieldType[prop] = fieldType
        } else {
          if (typeof beanMeta.fieldAnnos[prop] === 'undefined') {
            beanMeta.fieldAnnos[prop] = []
          }
          beanMeta.fieldAnnos[prop].push([anno, params])
        }
        break
      default:
    }
  }

  public static getBeanMeta (ctor: Function): BeanMeta {
    const ctorId = ctor[CTOR_ID]
    if (!ctorId || typeof BeanFactory.beansMeta[ctorId] === 'undefined') {
      return null
    } else {
      return BeanFactory.beansMeta[ctorId]
    }
  }

  public static addBean (key: string, target: Function | object, multi?: boolean): void {
    if (!key) {
      return
    }
    key = key.toLowerCase()
    let ins = null
    if (typeof target === 'object') {
      ins = target
      target = target.constructor
    }
    if (!multi && BeanFactory.beans[key]) {
      throw new Error('Bean name "' + key + '" for ' + target['name'] + ' conflicts with ' + BeanFactory.beans[key].target.name)
    }
    if (multi && !BeanFactory.beans[key]) {
      BeanFactory.beans[key] = []
    }
    const bean = {
      target: target,
      ins: ins
    }
    if (!multi) {
      BeanFactory.beans[key] = bean
    } else {
      BeanFactory.beans[key].push(bean)
    }
  }

  public static getBean (key: string, filter?: Function, requestId?: number) {
    if (!key) {
      return null
    }

    let target = BeanFactory.beans[key]
    if (!target) {
      return null
    }
    target = [].concat(target)
    const beanLen = target.length
    let matchedTarget = null
    const matchedTargets = []
    if (beanLen > 1) {
      for (let i = 0; i < beanLen; i++) {
        if (!filter || (filter(target[i]))) {
          matchedTargets.push(target[i])
        }
      }
    } else {
      matchedTargets.push(target[0])
    }

    const matchedLen = matchedTargets.length
    if (matchedLen < 1) {
      return null
    } else if (matchedLen === 1) {
      matchedTarget = matchedTargets[0]
    } else {
      matchedTarget = matchedTargets[Math.floor((Math.random() * matchedLen)) % matchedLen]
    }

    const clz: any = matchedTarget.target
    if (clz['singleton']) {
      requestId = 0
    }
    if (requestId) {
      const rKey = getRequestKey(requestId)
      if (typeof BeanFactory.requestBeans[rKey] === 'undefined') {
        return null
      }
      if (typeof BeanFactory.requestBeans[rKey][1][key] === 'undefined') {
        const ins = new clz()
        ins[REQUEST_ID] = requestId
        BeanFactory.requestBeans[rKey][1][key] = ins
      }
      return BeanFactory.requestBeans[rKey][1][key]
    } else {
      if (!matchedTarget.ins) {
        matchedTarget.ins = new clz()
      }
      return matchedTarget.ins
    }
  }

  public static getBeanByPackage (packageName: string, filter?: Function, packagePrefix?: string, requestId?: number) {
    packagePrefix = packagePrefix || ''
    const packageParts = packageName.split('.')
    let packagePartsSize = packageParts.length
    let beanName = packagePrefix + packageName
    let bean = null
    for (let i = 0; i < packagePartsSize; i++) {
      bean = BeanFactory.getBean(beanName, filter, requestId)
      if (bean) {
        break
      }
      beanName = packagePrefix + packageParts.slice(0, packagePartsSize - 1 - i).join('.')
      if (!beanName) {
        break
      }
    }
    return bean
  }

  public static async releaseBeans (requestId: number): Promise<void> {
    const rKey = getRequestKey(requestId)
    if (typeof BeanFactory.requestBeans[rKey] === 'undefined') {
      return
    }
    const beanKeys = Object.keys(BeanFactory.requestBeans[rKey][1])
    for (const key of beanKeys) {
      if (typeof BeanFactory.requestBeans[rKey][1][key]['destroy'] === 'function') {
        await BeanFactory.requestBeans[rKey][1][key]['destroy']()
      }
      BeanFactory.requestBeans[rKey][1][key] = null
    }
    if (typeof BeanFactory.requestBeans[rKey][0]['destroy'] === 'function') {
      await BeanFactory.requestBeans[rKey][0]['destroy']()
      BeanFactory.requestBeans[rKey][0] = null
    }
    delete BeanFactory.requestBeans[rKey]
  }

  private static currentRequestNo = 1
  private static MAX_REQUEST_ID = 1000000000 // 1b

  public static genRequestId (ins: object) {
    if (BeanFactory.currentRequestNo > BeanFactory.MAX_REQUEST_ID) {
      BeanFactory.currentRequestNo = 1
    }
    ins[REQUEST_ID] = BeanFactory.currentRequestNo
    ins[REQUEST_START_TIME] = +(new Date())
    const rKey = getRequestKey(BeanFactory.currentRequestNo)
    BeanFactory.requestBeans[rKey] = [ins, {}]
    BeanFactory.currentRequestNo++
  }

  public static attachRequestId (ins: object, requestId: number) {
    ins[REQUEST_ID] = requestId
  }

  public static getRequestId (ins: object): number | null {
    if (ins && typeof ins[REQUEST_ID] !== 'undefined') {
      return ins[REQUEST_ID]
    } else {
      return null
    }
  }

  private static initBeanCallbacks: Function[] = []
  private static startBeanCallbacks: Function[] = []

  public static registerInitBean (callback: Function): void {
    BeanFactory.initBeanCallbacks.push(callback)
  }

  public static registerStartBean (callback: Function): void {
    BeanFactory.startBeanCallbacks.push(callback)
  }

  public static initBean (): void {
    BeanFactory.initBeanCallbacks.forEach((cb: Function) => {
      cb()
    })
    BeanFactory.initBeanCallbacks = []
  }

  public static startBean (): void {
    BeanFactory.startBeanCallbacks.forEach((cb: Function) => {
      cb()
    })
    BeanFactory.startBeanCallbacks
  }

  public static destroyBean (): void {
    // TODO
    Object.values(BeanFactory.beans).forEach((target, ins) => {
    })
  }
}