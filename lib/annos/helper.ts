
export enum AnnotationType {
  clz,
  method,
  field
}

let compileTrick: any

export function annotationHelper (annoType: AnnotationType, callback: Function, args) {
  switch (annoType) {
    case AnnotationType.clz:
      if (args.length === 1 && typeof args[0] === 'function') {
        callback && callback(...args)
        return compileTrick
      }
      return target => {
        callback && callback(target, ...args)
      }
    case AnnotationType.method:
      if (args.length === 3 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[2] === 'object'
          && typeof args[2].value !== 'undefined') {
        callback && callback(...args)
        return compileTrick
      }
      return (target: any, method: string, descriptor: PropertyDescriptor) => {
        callback && callback(target, method, descriptor, ...args)
      }
    case AnnotationType.field:
      if (args.length >= 2 
          && (typeof args[0] === 'object' || typeof args[0] === 'function')
          && typeof args[1] === 'string') {
        callback && callback(...args)
        return compileTrick
      }
      return (target: any, field: string) => {
        callback && callback(target, field, ...args)
      }
  }
  return compileTrick
}
