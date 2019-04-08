import { AnnotationType } from './annos/helper'

export type BeanMeta = {
  file?: string
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
}

export default class BeanFactory {

  private static container = {}
  private static beansMeta = {}
  private static beanCnt = 0;

  private static currentSourceFile: string

  public static setCurrentSourceFile (sf: string): void {
    BeanFactory.currentSourceFile = sf
  }

  public static getCurrentSourceFile (): string {
    return BeanFactory.currentSourceFile
  }

  public static addAnnotation (
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
    if (ctor && typeof ctor['__ctorId'] === 'undefined') {
      BeanFactory.beanCnt++
      ctor['__ctorId'] = 'b' + BeanFactory.beanCnt
    }
    if (typeof BeanFactory.beansMeta[ctor['__ctorId']] === 'undefined') {
      let beanMeta:BeanMeta = {}
      beanMeta.file = BeanFactory.currentSourceFile
      beanMeta.clz = ctor
      beanMeta.clzAnnos = []
      beanMeta.methodAnnos = {}
      beanMeta.fieldAnnos = {}
      BeanFactory.beansMeta[ctor['__ctorId']] = beanMeta
      // = {
      //   file: BeanFactory.currentSourceFile,
      //   clz: ctor,
      //   ins: null,
      //   clzAnnos: [],
      //   methodAnnos: {},
      //   fieldAnnos: {}
      // }
    }
    const beanMeta: BeanMeta = BeanFactory.beansMeta[ctor['__ctorId']]
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
    console.log(JSON.stringify(beanMeta))
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
}