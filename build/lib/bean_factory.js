"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./annos/helper");
exports.CTOR_ID = '__ctorId';
exports.REQUEST_ID = '$__request_id';
exports.REQUEST_START_TIME = '$__request_st';
const getRequestKey = function (requestId) {
    return 'r_' + requestId;
};
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
    static getBean(key, filter, requestId) {
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
        const clz = matchedTarget.target;
        if (clz['singleton']) {
            requestId = 0;
        }
        if (requestId) {
            const rKey = getRequestKey(requestId);
            if (typeof BeanFactory.requestBeans[rKey] === 'undefined') {
                return null;
            }
            if (typeof BeanFactory.requestBeans[rKey][1][key] === 'undefined') {
                const ins = new clz();
                ins[exports.REQUEST_ID] = requestId;
                BeanFactory.requestBeans[rKey][1][key] = ins;
            }
            return BeanFactory.requestBeans[rKey][1][key];
        }
        else {
            if (!matchedTarget.ins) {
                matchedTarget.ins = new clz();
            }
            return matchedTarget.ins;
        }
    }
    static getBeanByPackage(packageName, filter, packagePrefix, requestId) {
        packagePrefix = packagePrefix || '';
        const packageParts = packageName.split('.');
        let packagePartsSize = packageParts.length;
        let beanName = packagePrefix + packageName;
        let bean = null;
        for (let i = 0; i < packagePartsSize; i++) {
            bean = BeanFactory.getBean(beanName, filter, requestId);
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
    static releaseBeans(requestId) {
        const rKey = getRequestKey(requestId);
        if (typeof BeanFactory.requestBeans[rKey] === 'undefined') {
            return;
        }
        const beanKeys = Object.keys(BeanFactory.requestBeans[rKey][1]);
        for (const key of beanKeys) {
            if (typeof BeanFactory.requestBeans[rKey][1][key]['destroy'] === 'function') {
                BeanFactory.requestBeans[rKey][1][key]['destroy']();
            }
            BeanFactory.requestBeans[rKey][1][key] = null;
        }
        if (typeof BeanFactory.requestBeans[rKey][0]['destroy'] === 'function') {
            BeanFactory.requestBeans[rKey][0]['destroy']();
            BeanFactory.requestBeans[rKey][0] = null;
        }
        delete BeanFactory.requestBeans[rKey];
    }
    static genRequestId(ins) {
        if (BeanFactory.currentRequestNo > BeanFactory.MAX_REQUEST_ID) {
            BeanFactory.currentRequestNo = 1;
        }
        ins[exports.REQUEST_ID] = BeanFactory.currentRequestNo;
        ins[exports.REQUEST_START_TIME] = +(new Date());
        const rKey = getRequestKey(BeanFactory.currentRequestNo);
        BeanFactory.requestBeans[rKey] = [ins, {}];
        BeanFactory.currentRequestNo++;
    }
    static attachRequestId(ins, requestId) {
        ins[exports.REQUEST_ID] = requestId;
    }
    static getRequestId(ins) {
        if (ins && typeof ins[exports.REQUEST_ID] !== 'undefined') {
            return ins[exports.REQUEST_ID];
        }
        else {
            return null;
        }
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
        });
    }
}
BeanFactory.beans = {};
BeanFactory.requestBeans = {};
BeanFactory.beansMeta = {};
BeanFactory.currentRequestNo = 1;
BeanFactory.MAX_REQUEST_ID = 1000000000; // 1b
BeanFactory.initBeanCallbacks = [];
BeanFactory.startBeanCallbacks = [];
exports.default = BeanFactory;
