"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./annos/helper");
exports.CTOR_ID = '__ctorId';
class BeanFactory {
    static addBeanMeta(annoType, target, prop, anno, params, fieldType, retHook, id) {
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
            beanMeta.clz = ctor;
            beanMeta.clzAnnos = [];
            beanMeta.methodAnnos = {};
            beanMeta.fieldAnnos = {};
            beanMeta.fieldType = {};
            beanMeta.retHooks = {};
            beanMeta.id = null;
            BeanFactory.beansMeta[ctorId] = beanMeta;
        }
        const beanMeta = BeanFactory.beansMeta[ctorId];
        switch (annoType) {
            case helper_1.AnnotationType.clz:
                if (anno) {
                    beanMeta.clzAnnos.push([anno, params]);
                }
                break;
            case helper_1.AnnotationType.method:
                if (!prop) {
                    break;
                }
                if (typeof beanMeta.methodAnnos[prop] === 'undefined') {
                    beanMeta.methodAnnos[prop] = [];
                }
                beanMeta.methodAnnos[prop].push([anno, params]);
                if (typeof beanMeta.retHooks[prop] === 'undefined') {
                    beanMeta.retHooks[prop] = [];
                }
                if (retHook) {
                    beanMeta.retHooks[prop].push([retHook, params]);
                }
                break;
            case helper_1.AnnotationType.field:
                if (!prop) {
                    break;
                }
                if (id) {
                    beanMeta.id = id;
                }
                if (fieldType) {
                    beanMeta.fieldType[prop] = fieldType;
                }
                else {
                    if (typeof beanMeta.fieldAnnos[prop] === 'undefined') {
                        beanMeta.fieldAnnos[prop] = [];
                    }
                    beanMeta.fieldAnnos[prop].push([anno, params]);
                }
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
    static addBean(key, target, multi) {
        if (!key) {
            return;
        }
        key = key.toLowerCase();
        let ins = null;
        if (typeof target === 'object') {
            ins = target;
            target = target.constructor;
        }
        if (!multi && BeanFactory.beans[key]) {
            throw new Error('Bean name "' + key + '" for ' + target['name'] + ' conflicts with ' + BeanFactory.beans[key].target.name);
        }
        if (multi && !BeanFactory.beans[key]) {
            BeanFactory.beans[key] = [];
        }
        const bean = {
            target: target,
            ins: ins
        };
        if (!multi) {
            BeanFactory.beans[key] = bean;
        }
        else {
            BeanFactory.beans[key].push(bean);
        }
    }
    static getBean(key, filter) {
        if (!key) {
            return null;
        }
        let target = BeanFactory.beans[key];
        if (!target) {
            return null;
        }
        target = [].concat(target);
        const beanLen = target.length;
        let matchedTarget = null;
        const matchedTargets = [];
        for (let i = 0; i < beanLen; i++) {
            if (!filter || (filter(target[i]))) {
                matchedTargets.push(target[i]);
            }
        }
        const matchedLen = matchedTargets.length;
        if (matchedLen < 1) {
            return null;
        }
        else if (matchedLen === 1) {
            matchedTarget = matchedTargets[0];
        }
        else {
            matchedTarget = matchedTargets[Math.floor((Math.random() * matchedLen)) % matchedLen];
        }
        if (!matchedTarget.ins) {
            const clz = matchedTarget.target;
            matchedTarget.ins = new clz();
        }
        return matchedTarget.ins;
    }
    static getBeanByPackage(packageName, filter, packagePrefix) {
        packagePrefix = packagePrefix || '';
        const packageParts = packageName.split('.');
        let packagePartsSize = packageParts.length;
        let beanName = packagePrefix + packageName;
        let bean = null;
        for (let i = 0; i < packagePartsSize; i++) {
            bean = BeanFactory.getBean(beanName, filter);
            if (bean) {
                break;
            }
            beanName = packagePrefix + packageParts.slice(0, packagePartsSize - 1 - i).join('.');
            if (!beanName) {
                break;
            }
        }
        return bean;
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
        Object.values(BeanFactory.beans).forEach((target, ins) => {
            // console.log(target)
        });
    }
}
BeanFactory.beans = {};
BeanFactory.beansMeta = {};
BeanFactory.initBeanCallbacks = [];
BeanFactory.startBeanCallbacks = [];
exports.default = BeanFactory;
