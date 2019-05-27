import { AnnotationType, annotationHelper } from './helper'
import BeanFactory, { BeanMeta } from '../bean_factory' 

export default function Entity (name?: Function | string | TableNameSeperatorType) {
  return annotationHelper(arguments, callback)
}

export enum TableNameSeperatorType {
  underline
}

const callback = function (annoType: AnnotationType, ctor: Function, name?: string | TableNameSeperatorType) {
  ctor.prototype.toObject = function () {
    const fields = Object.getOwnPropertyNames(this)
    const obj = {}
    fields.forEach(field => {
      if (this[field] !== undefined) {
        obj[field] = this[field]
      }
    })
    return obj
  }

  ctor['getPrimaryVal'] = function (data: object, returnKV?: boolean, defaultVal?: any) {
    const meta: BeanMeta = BeanFactory.getBeanMeta(ctor)
    if (!meta || !meta.id) {
      throw new Error('primary key is not exist in ' + ctor.name)
    }
    let val = data ? data[meta.id] : undefined
    if (val === undefined) {
      val = defaultVal
    }
    if (returnKV) {
      return {
        [meta.id]: val
      }
    } else {
      return val
    }
  }

  ctor['clone'] = function (data: object) {
    if (!data) {
      return null
    }
    const clz: any = ctor
    const entity = new clz()
    const fields = Object.getOwnPropertyNames(entity)
    fields.forEach(field => {
      if (typeof data[field] !== 'undefined') {
        entity[field] = data[field]
      }
    })
    return entity
  }

  if (name && typeof name === 'string') {
    ctor['$tableName'] = name
  } else if (!name || (typeof name === 'number' && name === TableNameSeperatorType.underline)) {
    ctor['$tableName'] = (ctor.name.charAt(0) + ctor.name.substr(1).replace(/([A-Z])/g, '_$1')).toLowerCase()
  } else {
    throw new Error('wrong arguments of @entity')
  }
}
