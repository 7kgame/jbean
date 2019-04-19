import { AnnotationType } from './utils'

export interface BeanMeta {
  file?: string
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: {}
  fieldAnnos?: {}
}

export const CTOR_ID: string

export class BeanFactory {
  public static setCurrentSourceFile (sf: string): void
  public static getCurrentSourceFile (): string

  public static addBeanMeta (
    annoType: AnnotationType,
    target: object | Function,
    prop: string,
    anno: Function,
    params?: any[]): void
  
  public static getBeanMeta (ctor: Function): BeanMeta

  public static addBean (key: string, target: Function | object): void
  public static getBean (key: string): object

  public static registerInitBean (callback: Function): void
  public static registerStartBean (callback: Function): void
  public static initBean (): void
  public static startBean (): void
  public static destroyBean (): void
}