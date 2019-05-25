import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

export default function Id (name?: Function | string | any, options?: any) {
  return annotationHelper(arguments, callback)
}

const callback = function (annoType: AnnotationType, ctor: Function | object, field: string) {
  BeanFactory.addBeanMeta(annoType, ctor, field, Id, null, null, null, field)
}
