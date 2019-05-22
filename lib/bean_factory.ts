import { AnnotationType } from './annos/helper'

export type BeanMeta = {
  file?: string
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
  fieldType?: {}
  retHooks?: {}
}

export const CTOR_ID: string = '__ctorId'

export default class BeanFactory {

  private static beans = {}
  private static beansMeta = {}

  private static currentSourceFile: string

  public static setCurrentSourceFile (sf: string): void {
    BeanFactory.currentSourceFile = sf
  }

  public static getCurrentSourceFile (): string {
    return BeanFactory.currentSourceFile
  }

  public static addBeanMeta (
    annoType: AnnotationType,
    target: object | Function,
    prop: string,
    anno: Function,
    params?: any[],
    fieldType?: string,
    retHook?: Function): void {

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
      beanMeta.file = BeanFactory.currentSourceFile
      beanMeta.clz = ctor
      beanMeta.clzAnnos = []
      beanMeta.methodAnnos = {}
      beanMeta.fieldAnnos = {}
      beanMeta.fieldType = {}
      beanMeta.retHooks = {}
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

  public static addBean (key: string, target: Function | object): void {
    if (!key) {
      return
    }
    key = key.toLowerCase()
    let ins = null
    if (typeof target === 'object') {
      ins = target
      target = target.constructor
    }
    if (BeanFactory.beans[key]) {
      throw new Error('Bean name "' + key + '" for '+ target['name'] + ' conflicts with ' + BeanFactory.beans[key].target.name)
    }
    BeanFactory.beans[key] = {
      target: target,
      ins: ins
    }
  }

  public static getBean (key: string) {
    if (!key) {
      return null
    }
    const target = BeanFactory.beans[key]
    if (!target || !target.target) {
      return null
    }
    if (!target.ins) {
      const clz: any = target.target
      target.ins = new clz()
    }
    return target.ins
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