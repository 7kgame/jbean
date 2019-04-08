import * as FS from 'fs'
import * as Path from 'path'

import { merge } from '../utils'
import { scan, registerScanner } from './component_scan'
import { AnnotationType, annotationHelper } from './helper'

const configParser = {
  json: function (content) {
    if (!content) {
      return null
    }
    return JSON.parse(content)
  }
}

export function registerConfigParser (key: string, parser: Function) {
  configParser[key] = parser
}

const appConfigs = {}

registerScanner(function (fpath: string, isExclude: boolean, isFile: boolean) {
  // console.log(fpath, isExclude, isFile)
  if (!isFile || isExclude) {
    return
  }
  const ext: string = Path.extname(fpath).substr(1)
  if (typeof configParser[ext] === 'function') {
    let content = configParser[ext](FS.readFileSync(fpath, 'utf8'))
    if (!content) {
      return
    }
    merge(appConfigs, content)
  }
})

const app = function (target: Function, options?: any) {
  // do component scan, add annotations to bean factory
  scan(target)
  // TODO
  // parse annotation

  // start app: web mode | task mode
  if (typeof target['main'] === 'function') {
    setTimeout(() => {
      target['main'](merge(appConfigs, options))
    }, 0);
  }
}

export default function JBootApplication (target?: any, options?: any) {
  return annotationHelper(AnnotationType.clz, app, arguments)
}