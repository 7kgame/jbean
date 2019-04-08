"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./annos/helper");
class BeanFactory {
    static setCurrentSourceFile(sf) {
        BeanFactory.currentSourceFile = sf;
    }
    static getCurrentSourceFile() {
        return BeanFactory.currentSourceFile;
    }
    static addAnnotation(annoType, target, prop, anno, params) {
        let ctor = target;
        if (typeof target === 'object') {
            ctor = target.constructor;
        }
        if (ctor && typeof ctor['__ctorId'] === 'undefined') {
            BeanFactory.beanCnt++;
            ctor['__ctorId'] = 'b' + BeanFactory.beanCnt;
        }
        if (typeof BeanFactory.beans[ctor['__ctorId']] === 'undefined') {
            BeanFactory.beans[ctor['__ctorId']] = {
                file: BeanFactory.currentSourceFile,
                clz: ctor,
                ins: null,
                clzAnnos: [],
                methodAnnos: {},
                fieldAnnos: {}
            };
        }
        const targetMetas = BeanFactory.beans[ctor['__ctorId']];
        switch (annoType) {
            case helper_1.AnnotationType.clz:
                targetMetas.clzAnnos.push([anno, params]);
                break;
            case helper_1.AnnotationType.method:
                if (typeof targetMetas.methodAnnos[prop] === 'undefined') {
                    targetMetas.methodAnnos[prop] = [];
                }
                targetMetas.methodAnnos[prop].push([anno, params]);
                break;
            case helper_1.AnnotationType.field:
                if (typeof targetMetas.fieldAnnos[prop] === 'undefined') {
                    targetMetas.fieldAnnos[prop] = [];
                }
                targetMetas.fieldAnnos[prop].push([anno, params]);
                break;
            default:
        }
        console.log(JSON.stringify(targetMetas));
    }
    static addBean(key, target) {
        if (!key) {
            return;
        }
        key = key.toLowerCase();
        if (target.clz && BeanFactory.container[key] && BeanFactory.container[key].clz) {
            throw new Error('Bean name "' + key + '" for ' + target.clz.name + ' conflicts with ' + BeanFactory.container[key].clz.name);
        }
        const target0 = BeanFactory.container[key] || {};
        for (let k in target) {
            target0[k] = target[k];
        }
        BeanFactory.container[key] = target0;
        // if (target0.clz && !target0.ins) {
        //   const clz: any = target0.clz;
        //   target0.ins = new clz();
        //   if (typeof target0.ins['postInit'] === 'function') {
        //     target0.ins['postInit']()
        //   }
        // }
    }
    static getBean(key) {
        if (!key) {
            return null;
        }
        const target = BeanFactory.container[key.toLowerCase()];
        if (!target || !target.clz) {
            return null;
        }
        if (!target.ins) {
            const clz = target.clz;
            target.ins = new clz();
            if (typeof target.ins['postInit'] === 'function') {
                target.ins['postInit']();
            }
        }
        return target.ins;
    }
}
BeanFactory.container = {};
BeanFactory.beans = {};
BeanFactory.beanCnt = 0;
exports.default = BeanFactory;
