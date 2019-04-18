import { redefineProperty } from '../utils'
import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

const autowiredTargets: any[] = []

const callback = function (annoType: AnnotationType, target: Function | object, field: string, name?: string) {
  name = name || field
  autowiredTargets.push([target, field, name.toLowerCase()])
}

export default function Autowired (component?: any, name?: any) {
  return annotationHelper(arguments, callback)
}

BeanFactory.registerStartBean(() => {
  autowiredTargets.forEach(([target, field, name]) => {
    redefineProperty(target, field, {
      get: function () {
        return BeanFactory.getBean(name)
      }
    })
  })
})