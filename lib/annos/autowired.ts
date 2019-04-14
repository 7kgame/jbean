import { redefineProperty } from '../utils'
import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

const callback = function (annoType: AnnotationType, target: Function | object, field: string, name?: string) {
  name = name || field
  redefineProperty(target, field, {
    get: function () {
      return BeanFactory.getBean(name)
    }
  })
}

export default function Autowired (component?: any, name?: any) {
  return annotationHelper(AnnotationType.field, callback, arguments)
}