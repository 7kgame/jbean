import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'
import ReflectHelper from '../reflect_helper'

const callback = function (annoType: AnnotationType, ctor: Function, name?: string) {
  name = name || ctor.name
  BeanFactory.addBean(name, ctor)
  repositories.push(ctor)
  BeanFactory.addBeanMeta(annoType, ctor, null, null)
}

export default function Repository (name?: Function | string) {
  return annotationHelper(arguments, callback)
}

const repositories: Function[] = []

BeanFactory.registerInitBean(() => {
  repositories.forEach((repository: Function) => {
    ReflectHelper.resetClass(repository)
  })
})