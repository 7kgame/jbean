import { AnnotationType, annotationHelper } from '../utils'

const app = function (target: Function, options?: any) {
  if (typeof target['main'] === 'function') {
    setTimeout(() => {
      target['main'](options)
    }, 0);
  }
}

export default function JBootApplication (target?: any, options?: any) {
  return annotationHelper(AnnotationType.clz, app, arguments)
}