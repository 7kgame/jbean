"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const utils_1 = require("../utils");
function Transactional(transactionalOptions, method) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Transactional;
const callback = function (annoType, target) {
    let ctor;
    if (typeof target === 'object') {
        ctor = target.constructor;
    }
    else {
        ctor = target;
    }
    if (annoType === helper_1.AnnotationType.clz) {
        addTransactionalMeta(ctor, arguments[2]);
    }
    else if (annoType === helper_1.AnnotationType.method) {
        addTransactionalMeta(ctor, arguments[4], arguments[2]);
    }
};
const clzTransactionalMetas = {};
const methodTransactionalMetas = {};
const addTransactionalMeta = function (ctor, transactionalOptions, method) {
    const ctorId = ctor[bean_factory_1.CTOR_ID];
    if (!ctorId) {
        throw new Error(ctor.name + '.' + bean_factory_1.CTOR_ID + ' is undefined');
    }
    if (typeof method === 'undefined') {
        clzTransactionalMetas[ctorId] = transactionalOptions || { ignore: false };
    }
    else {
        if (typeof methodTransactionalMetas[ctorId] === 'undefined') {
            methodTransactionalMetas[ctorId] = {};
        }
        methodTransactionalMetas[ctorId][method] = transactionalOptions || { ignore: false };
    }
};
exports.getTransactionalMeta = function (target, method) {
    let ctor;
    if (typeof target === 'object') {
        ctor = target.constructor;
    }
    else {
        ctor = target;
    }
    const ctorId = ctor[bean_factory_1.CTOR_ID];
    if (!ctorId) {
        return null;
    }
    const clzTransactionalMeta = clzTransactionalMetas[ctorId];
    let methodTransactionalMeta = null;
    if (method && typeof methodTransactionalMetas[ctorId] !== 'undefined') {
        methodTransactionalMeta = methodTransactionalMetas[ctorId][method];
    }
    if (!clzTransactionalMeta && !methodTransactionalMeta) {
        return null;
    }
    let newMeta = {};
    utils_1.merge(newMeta, clzTransactionalMeta);
    utils_1.merge(newMeta, methodTransactionalMeta);
    return newMeta;
};
exports.checkSupportTransition = function (target, method) {
    const meta = exports.getTransactionalMeta(target, method);
    if (meta === null) {
        return false;
    }
    return meta.ignore ? false : true;
};
const beginCallbacks = [];
const commitCallbacks = [];
const rollbackCallbacks = [];
function registerBegin(cb) {
    beginCallbacks.push(cb);
}
exports.registerBegin = registerBegin;
function registerCommit(cb) {
    commitCallbacks.push(cb);
}
exports.registerCommit = registerCommit;
function registerRollback(cb) {
    rollbackCallbacks.push(cb);
}
exports.registerRollback = registerRollback;
const emit = function (requestId, step) {
    return __awaiter(this, void 0, void 0, function* () {
        let cbs = beginCallbacks;
        if (step === 2) {
            cbs = commitCallbacks;
        }
        else if (step === 3) {
            cbs = rollbackCallbacks;
        }
        const len = cbs.length;
        for (let i = 0; i < len; i++) {
            let ret = yield cbs[i](requestId);
        }
    });
};
function emitBegin(requestId) {
    return emit(requestId, 1);
}
exports.emitBegin = emitBegin;
function emitCommit(requestId) {
    return emit(requestId, 2);
}
exports.emitCommit = emitCommit;
function emitRollback(requestId) {
    return emit(requestId, 3);
}
exports.emitRollback = emitRollback;
