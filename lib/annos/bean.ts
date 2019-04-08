import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

const callback = function (ctor: Function, name?: string) {
  name = name || ctor.name
  BeanFactory.addBean(name, {clz: ctor})
}

export default function (component?: Function | string) {
  return annotationHelper(AnnotationType.clz, callback, arguments)
}
