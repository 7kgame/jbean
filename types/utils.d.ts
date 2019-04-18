export function merge (target: object, source: object): object

export function redefineProperty (target: object, key: string, config: object): void

export function readDirSync (path: string, cb: Function): void

export function getObjectType(target: object): string

export function isAsyncFunction (func: Function): boolean

export enum AnnotationType {
  clz,
  method,
  field,
  none
}

export function annotationHelper (args, callback: Function, ignoreAnnotationTypeInference?: boolean): any