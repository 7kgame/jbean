import { AnnotationType } from './annos/helper'
import { getObjectType } from './utils'

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

export default class BeanFactory {

  private static beans = {}
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
      throw new Error('Bean name "' + key + '" for '+ target['name'] + ' conflicts with ' + BeanFactory.beans[key].target.name)
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

  public static getBean (key: string, filter?: Function) {
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
    for (let i = 0; i < beanLen; i++) {
      if (!filter || (filter(target[i]))) {
        matchedTargets.push(target[i])
      }
    }
    const matchedLen = matchedTargets.length
    if (matchedLen < 1) {
      return null
    } else if (matchedLen === 1) {
      matchedTarget = matchedTargets[0]
    } else {
      matchedTarget = matchedTargets[Math.floor((Math.random() * matchedLen)) % matchedLen]
    }
    if (!matchedTarget.ins) {
      const clz: any = matchedTarget.target
      matchedTarget.ins = new clz()
    }
    return matchedTarget.ins
  }

  public static getBeanByPackage (packageName: string, filter?: Function, packagePrefix?: string) {
    packagePrefix = packagePrefix || ''
    const packageParts = packageName.split('.')
    let packagePartsSize = packageParts.length
    let beanName = packagePrefix + packageName
    let bean = null
    for (let i = 0; i < packagePartsSize; i++) {
      bean = BeanFactory.getBean(beanName, filter)
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
      // console.log(target)
    })
  }
}