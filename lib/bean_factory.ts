import { AnnotationType } from './annos/helper'

export type BeanMeta = {
  file?: string
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
}

export const CTOR_ID: string = '__ctorId'

export default class BeanFactory {

  private static container = {}
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
    params?: any[]): void {

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
      BeanFactory.beansMeta[ctorId] = beanMeta
    }
    const beanMeta: BeanMeta = BeanFactory.beansMeta[ctorId]
    switch (annoType) {
      case AnnotationType.clz:
        beanMeta.clzAnnos.push([anno, params])
        break
      case AnnotationType.method:
        if (typeof beanMeta.methodAnnos[prop] === 'undefined') {
          beanMeta.methodAnnos[prop] = []
        }
        beanMeta.methodAnnos[prop].push([anno, params])
        break
      case AnnotationType.field:
        if (typeof beanMeta.fieldAnnos[prop] === 'undefined') {
          beanMeta.fieldAnnos[prop] = []
        }
        beanMeta.fieldAnnos[prop].push([anno, params])
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

  public static addBean (key: string, target: BeanMeta): void {
    if (!key) {
      return
    }
    key = key.toLowerCase()
    if (target.clz && BeanFactory.container[key] && BeanFactory.container[key].clz) {
      throw new Error('Bean name "' + key + '" for '+ target.clz.name + ' conflicts with ' + BeanFactory.container[key].clz.name)
    }
    const target0 = BeanFactory.container[key] || {}
    for (let k in target) {
      target0[k] = target[k]
    }
    BeanFactory.container[key] = target0
    // if (target0.clz && !target0.ins) {
    //   const clz: any = target0.clz;
    //   target0.ins = new clz();
    //   if (typeof target0.ins['postInit'] === 'function') {
    //     target0.ins['postInit']()
    //   }
    // }
  }

  public static getBean (key: string) {
    if (!key) {
      return null
    }
    const target = BeanFactory.container[key.toLowerCase()]
    if (!target || !target.clz) {
      return null
    }
    if (!target.ins) {
      const clz: any = target.clz;
      target.ins = new clz();
      if (typeof target.ins['postInit'] === 'function') {
        target.ins['postInit']()
      }
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
  }
}