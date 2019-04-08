import { AnnotationType } from './utils'

export interface BeanMeta {
  file?: string
  clz?: Function
  ins?: object
  clzAnnos?: any[]
  methodAnnos?: []
  fieldAnnos?: []
}

export class BeanFactory {
  public static setCurrentSourceFile (sf: string): void
  public static getCurrentSourceFile (): string

  public static addAnnotation (
    annoType: AnnotationType,
    target: object | Function,
    prop: string,
    anno: Function,
    params?: any[]): void

  public static addBean (key: string, target: BeanMeta): void
  public static getBean (key: string): object
}