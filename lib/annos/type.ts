import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

export default function Type(type: string) {
  return annotationHelper(arguments, callback)
}

const callback = function (annoType: AnnotationType, target: Function | object, field: string, type: string) {
  BeanFactory.addBeanMeta(annoType, target, field, Type, null, type.toLowerCase())
}