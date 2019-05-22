import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'
import ReflectHelper from '../reflect_helper'

const callback = function (annoType: AnnotationType, ctor: Function, name?: string) {
  name = name || ctor.name
  BeanFactory.addBean(name, ctor)
  services.push(ctor)
  BeanFactory.addBeanMeta(annoType, ctor, null, null)
}

export default function Service (name?: Function | string) {
  return annotationHelper(arguments, callback)
}

const services: Function[] = []

BeanFactory.registerInitBean(() => {
  services.forEach((services: Function) => {
    ReflectHelper.resetClass(services)
  })
})