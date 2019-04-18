import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

const callback = function (annoType: AnnotationType, ctor: Function, name?: string) {
  name = name || ctor.name
  BeanFactory.addBean(name, ctor)
}

export default function Repository (name?: Function | string) {
  return annotationHelper(arguments, callback)
}