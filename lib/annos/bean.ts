import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'
import ReflectHelper from '../reflect_helper'

const callback = function (annoType: AnnotationType, ctor: Function, name?: string) {
  name = name || ctor.name
  BeanFactory.addBean(name, ctor)
  beans.push(ctor)
  BeanFactory.addBeanMeta(annoType, ctor, null, null)
}

export default function (component?: Function | string) {
  return annotationHelper(arguments, callback)
}

const beans: Function[] = []

BeanFactory.registerInitBean(() => {
  beans.forEach((bean: Function) => {
    ReflectHelper.resetClass(bean)
  })
})