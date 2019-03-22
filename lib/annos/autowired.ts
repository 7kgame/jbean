import { AnnotationType, annotationHelper, redefineProperty } from '../utils'
import BeanFactory from '../bean_factory'

const callback = function (target: Function | object, prop: string, name?: string) {
  name = name || prop
  redefineProperty(target, prop, {
    get: function () {
      return BeanFactory.getBean(name)
    }
  })
}

export default function Autowired (component?: any, name?: any) {
  return annotationHelper(AnnotationType.field, callback, arguments)
}