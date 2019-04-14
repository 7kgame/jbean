"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./annos/helper");
exports.CTOR_ID = '__ctorId';
class BeanFactory {
    static setCurrentSourceFile(sf) {
        BeanFactory.currentSourceFile = sf;
    }
    static getCurrentSourceFile() {
        return BeanFactory.currentSourceFile;
    }
    static addBeanMeta(annoType, target, prop, anno, params) {
        let ctor;
        if (typeof target === 'object') {
            ctor = target.constructor;
        }
        else {
            ctor = target;
        }
        const ctorId = ctor[exports.CTOR_ID];
        if (!ctorId) {
            throw new Error(ctor.name + '.' + exports.CTOR_ID + ' is undefined');
        }
        if (typeof BeanFactory.beansMeta[ctorId] === 'undefined') {
            let beanMeta = {};
            beanMeta.file = BeanFactory.currentSourceFile;
            beanMeta.clz = ctor;
            beanMeta.clzAnnos = [];
            beanMeta.methodAnnos = {};
            beanMeta.fieldAnnos = {};
            BeanFactory.beansMeta[ctorId] = beanMeta;
        }
        const beanMeta = BeanFactory.beansMeta[ctorId];
        switch (annoType) {
            case helper_1.AnnotationType.clz:
                beanMeta.clzAnnos.push([anno, params]);
                break;
            case helper_1.AnnotationType.method:
                if (typeof beanMeta.methodAnnos[prop] === 'undefined') {
                    beanMeta.methodAnnos[prop] = [];
                }
                beanMeta.methodAnnos[prop].push([anno, params]);
                break;
            case helper_1.AnnotationType.field:
                if (typeof beanMeta.fieldAnnos[prop] === 'undefined') {
                    beanMeta.fieldAnnos[prop] = [];
                }
                beanMeta.fieldAnnos[prop].push([anno, params]);
                break;
            default:
        }
    }
    static getBeanMeta(ctor) {
        const ctorId = ctor[exports.CTOR_ID];
        if (!ctorId || typeof BeanFactory.beansMeta[ctorId] === 'undefined') {
            return null;
        }
        else {
            return BeanFactory.beansMeta[ctorId];
        }
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
    static registerInitBean(callback) {
        BeanFactory.initBeanCallbacks.push(callback);
    }
    static registerStartBean(callback) {
        BeanFactory.startBeanCallbacks.push(callback);
    }
    static initBean() {
        BeanFactory.initBeanCallbacks.forEach((cb) => {
            cb();
        });
        BeanFactory.initBeanCallbacks = [];
    }
    static startBean() {
        BeanFactory.startBeanCallbacks.forEach((cb) => {
            cb();
        });
        BeanFactory.startBeanCallbacks;
    }
    static destroyBean() {
        // TODO
    }
}
BeanFactory.container = {};
BeanFactory.beansMeta = {};
BeanFactory.initBeanCallbacks = [];
BeanFactory.startBeanCallbacks = [];
exports.default = BeanFactory;
