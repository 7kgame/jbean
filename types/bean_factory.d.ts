import { AnnotationType } from './utils'

export interface BeanMeta {
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
  fieldType?: {},
  id?: any,
  retHooks?: {}
}

export const CTOR_ID: string

export class BeanFactory {

  public static addBeanMeta (
    annoType: AnnotationType,
    target: object | Function,
    prop: string,
    anno: Function,
    params?: any[],
    fieldType?:string,
    retHook?: Function,
    id?: any): void
  
  public static getBeanMeta (ctor: Function): BeanMeta

  public static addBean (key: string, target: Function | object, multi?: boolean): void
  public static getBean (key: string, filter?: Function): object
  public static getBeanByPackage (packageName: string, filter?: Function, packagePrefix?: string): object

  public static registerInitBean (callback: Function): void
  public static registerStartBean (callback: Function): void
  public static initBean (): void
  public static startBean (): void
  public static destroyBean (): void
}