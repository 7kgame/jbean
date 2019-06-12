import * as FS from 'fs'
import * as Path from 'path'
import { merge } from '../utils'
import { scan, registerScanner } from './component_scan'
import { AnnotationType, annotationHelper } from './helper'

export const CTOR_JWEB_FILE_KEY = '$__jweb__file'
export const CTOR_JWEB_PACKAGE_KEY = '$__jweb__package'

const Module = require('module')
const originRequire = Module.prototype.require

Module.prototype.require = function (request) {
  const ret = originRequire.apply(this, arguments)

  let ctor = null
  if (typeof ret === 'function') {
    ctor = ret
  } else if (ret.default && typeof ret.default === 'function') {
    ctor = ret.default
  }

  if (ctor) {
    const filename = Module._resolveFilename(request, this)
    const applicationRoot = Path.dirname(require.main.filename)
    if (filename.indexOf(applicationRoot) === 0) {
      ctor[CTOR_JWEB_FILE_KEY] = filename
      ctor[CTOR_JWEB_PACKAGE_KEY] = Path.dirname(filename.substr(applicationRoot.length))
                                  .replace(new RegExp(Path.sep.replace(/\\/g, '\\\\'), 'g'), '.').substr(1)
    }
  }

  return ret
}

const appConfigs = {}

const configParser = {
  json: function (content) {
    if (!content) {
      return null
    }
    return JSON.parse(content)
  }
}

export function getApplicationConfigs (): object {
  return appConfigs
}

export function registerConfigParser (key: string, parser: Function): void {
  configParser[key] = parser
}

registerScanner(function (fpath: string, isExclude: boolean, isFile: boolean): void {
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

const appCallback = function (annoType: AnnotationType, target: Function, options?: any): void {
  // do component scan, add annotations to bean factory
  scan(annoType, target)

  // start app: web mode | task mode
  if (typeof target['main'] === 'function') {
    setTimeout(() => {
      target['main'](merge(appConfigs, options))
    }, 0)
  }
}

export default function JBootApplication (target?: any, options?: any) {
  return annotationHelper(arguments, appCallback)
}