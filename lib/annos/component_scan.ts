import * as Path from 'path'
import { readDirSync } from '../utils'
import { AnnotationType, annotationHelper } from './helper'
import BeanFactory from '../bean_factory'

const ouertScanner: Function[] = []

export const registerScanner = function (scanner: Function) {
  ouertScanner.push(scanner)
}

export const scan = function (annoType: AnnotationType, ctor: Function, options?: string | object, ext?: string) {
  options = options || ''
  ext = ext || 'js'
  ext = '.' + ext
  if (typeof options === 'string') {
    options = {include: [options || '']}
  }

  const appRoot = Path.dirname(require.main.filename)
  const includes = [].concat(options['include'] || [''])
  const excludes = [].concat(options['exclude'] || [])
  includes.forEach( (item, index) => {
    includes[index] = Path.resolve(appRoot, item)
  })
  excludes.forEach( (item, index) => {
    excludes[index] = Path.resolve(appRoot, item)
  })
  // console.log(includes)
  // console.log(excludes)
  includes.forEach( dir => {
    readDirSync(dir, (fpath: string, isFile: boolean) => {
      let isExclude = false
      excludes.every((item, index, arr) => {
        if (fpath.indexOf(item) === 0) {
          isExclude = true
          return false
        }
        return true
      })
      if (isFile && !isExclude && fpath.endsWith(ext)) {
        BeanFactory.setCurrentSourceFile(fpath)
        require(fpath)
        BeanFactory.setCurrentSourceFile(null)
      }
      ouertScanner.forEach(scanner => {
        scanner(fpath, isExclude, isFile)
      })
    })
  })
}

export default function ComponentScan (options?: string | object | Function, ext?: string) {
  return annotationHelper(AnnotationType.clz, scan, arguments)
}