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
const business_exception_1 = require("./business_exception");
const bean_factory_1 = require("./bean_factory");
const utils_1 = require("./utils");
const BEFORE_CALL_NAME = 'beforeCall';
const AFTER_CALL_NAME = 'afterCall';
const PRE_AROUND_NAME = 'preAround';
const POST_AROUND_NAME = 'postAround';
class ReflectHelper {
    static getMethods(ctor, checkBeforeAfterCaller) {
        return Object.getOwnPropertyNames(ctor.prototype).filter((item) => {
            if (item === 'constructor') {
                return false;
            }
            if (!checkBeforeAfterCaller &&
                (item === BEFORE_CALL_NAME ||
                    item === AFTER_CALL_NAME ||
                    item === PRE_AROUND_NAME ||
                    item === POST_AROUND_NAME)) {
                return false;
            }
            return typeof ctor.prototype[item] === 'function';
        });
    }
    static getParentMethods(ctor, checkBeforeAfterCaller) {
        const parent = Object.getPrototypeOf(ctor);
        if (!parent.prototype) {
            return null;
        }
        return ReflectHelper.getMethods(parent, checkBeforeAfterCaller);
    }
    static methodExist(ctor, method, loopCnt, checkBeforeAfterCaller) {
        let ctor0 = ctor;
        let loop = 0;
        if (!loopCnt || loopCnt < 1) {
            loopCnt = 10;
        }
        while (true) {
            if (loop >= loopCnt) {
                return false;
            }
            const methods = ReflectHelper.getMethods(ctor0, checkBeforeAfterCaller);
            if (methods && methods.indexOf(method) >= 0) {
                return true;
            }
            ctor0 = Object.getPrototypeOf(ctor0);
            if (!ctor0.prototype) {
                return false;
            }
            loop++;
        }
    }
    static resetMethod(ctor, method, classAnnos, methodsAnnos) {
        classAnnos = classAnnos || [];
        methodsAnnos = methodsAnnos || [];
        let annos = [];
        for (let i = 0; i < classAnnos.length; i++) {
            let existInMethod = false;
            for (let j = 0; j < methodsAnnos.length; j++) {
                if (methodsAnnos[j][0] === classAnnos[i][0]) {
                    existInMethod = true;
                    break;
                }
            }
            if (existInMethod) {
                continue;
            }
            annos.push(classAnnos[i]);
        }
        annos = annos.concat(methodsAnnos).reverse();
        const originFunc = ctor.prototype[method];
        let callerStack = [];
        let hasAsyncFunc = false;
        if (ReflectHelper.methodExist(ctor, BEFORE_CALL_NAME, 0, true)) {
            callerStack.push([false, utils_1.isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME]), ctor.prototype[BEFORE_CALL_NAME], null, BEFORE_CALL_NAME, true]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(ctor.prototype[BEFORE_CALL_NAME]);
        }
        annos.forEach(([caller, args]) => {
            if (typeof caller.preCall !== 'function') {
                return;
            }
            callerStack.push([false, utils_1.isAsyncFunction(caller.preCall), caller.preCall, args, caller.name, true]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(caller.preCall);
        });
        if (ReflectHelper.methodExist(ctor, PRE_AROUND_NAME, 0, true)) {
            callerStack.push([false, utils_1.isAsyncFunction(ctor.prototype[PRE_AROUND_NAME]), ctor.prototype[PRE_AROUND_NAME], null, PRE_AROUND_NAME, true]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(ctor.prototype[PRE_AROUND_NAME]);
        }
        callerStack.push([true, utils_1.isAsyncFunction(originFunc), originFunc, null, originFunc.name, false]);
        hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(originFunc);
        if (ReflectHelper.methodExist(ctor, POST_AROUND_NAME, 0, true)) {
            callerStack.push([false, utils_1.isAsyncFunction(ctor.prototype[POST_AROUND_NAME]), ctor.prototype[POST_AROUND_NAME], null, POST_AROUND_NAME, false]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(ctor.prototype[POST_AROUND_NAME]);
        }
        let tempCallStack4PostCall = [];
        annos.forEach(([caller, args]) => {
            if (typeof caller.postCall !== 'function') {
                return;
            }
            tempCallStack4PostCall.push([false, utils_1.isAsyncFunction(caller.postCall), caller.postCall, args, caller.name, false]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(caller.postCall);
        });
        tempCallStack4PostCall.reverse();
        callerStack = callerStack.concat(tempCallStack4PostCall);
        if (ReflectHelper.methodExist(ctor, AFTER_CALL_NAME, 0, true)) {
            callerStack.push([false, utils_1.isAsyncFunction(ctor.prototype[AFTER_CALL_NAME]), ctor.prototype[AFTER_CALL_NAME], null, AFTER_CALL_NAME, false]);
            hasAsyncFunc = hasAsyncFunc || utils_1.isAsyncFunction(ctor.prototype[AFTER_CALL_NAME]);
        }
        const prepareCallerParams = function (callerInfo, args0, ret) {
            const [isOriginFunc, isAsyncFunc, caller, args1, callername, pre] = callerInfo;
            let args = [];
            if (!isOriginFunc) {
                args.push(ret);
            }
            if (args1) {
                args = args.concat(args1);
            }
            args = args.concat(args0);
            if (isOriginFunc) {
                args = args0;
            }
            return [caller, isAsyncFunc, isOriginFunc, args, callername, pre];
        };
        if (hasAsyncFunc) {
            ctor.prototype[method] = function () {
                return __awaiter(this, arguments, void 0, function* () {
                    let currentCallIdx = 0;
                    const callerStackLen = callerStack.length;
                    const args0 = Array.prototype.slice.call(arguments, 0);
                    let preRet = {
                        err: null,
                        data: null,
                        from: '',
                        pre: undefined
                    };
                    while (currentCallIdx < callerStackLen) {
                        const [caller, isAsyncFunc, isOriginFunc, args, callername, pre] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet);
                        let ret = undefined;
                        if (preRet && preRet.err && isOriginFunc) { // skip original function when error occurs
                            currentCallIdx++;
                            continue;
                        }
                        try {
                            let isAnnotation = !(callername === PRE_AROUND_NAME) && !(callername === POST_AROUND_NAME)
                                && !(callername === BEFORE_CALL_NAME) && !(callername === AFTER_CALL_NAME)
                                && !isOriginFunc;
                            let ctx = isAnnotation ? {} : this;
                            if (isAsyncFunc) {
                                ret = yield caller.call(ctx, ...args);
                            }
                            else {
                                ret = caller.call(ctx, ...args);
                            }
                            if (ret === null) {
                                break;
                            }
                            if (ret && ret.err) {
                                ret.from = ret.from || callername;
                                ret.pre = ret.pre || pre;
                            }
                            if (ret === undefined) {
                                ret = preRet;
                            }
                            if (isOriginFunc) {
                                ret = {
                                    err: null,
                                    data: ret,
                                    from: '',
                                    pre: undefined
                                };
                            }
                        }
                        catch (e) {
                            if (e instanceof business_exception_1.default) {
                                ret = {
                                    err: e,
                                    data: e.data,
                                    from: callername,
                                    pre: pre
                                };
                            }
                            else {
                                throw e;
                            }
                        }
                        preRet = ret;
                        currentCallIdx++;
                    }
                    if (preRet.err)
                        throw new Error(preRet.err);
                    else
                        return preRet;
                });
            };
        }
        else {
            ctor.prototype[method] = function () {
                let currentCallIdx = 0;
                const callerStackLen = callerStack.length;
                const args0 = Array.prototype.slice.call(arguments, 0);
                let preRet = {
                    err: null,
                    data: null,
                    from: '',
                    pre: undefined
                };
                while (currentCallIdx < callerStackLen) {
                    const [caller, isAsyncFunc, isOriginFunc, args, callername, pre] = prepareCallerParams(callerStack[currentCallIdx], args0, preRet);
                    let ret;
                    if (preRet && preRet.err && isOriginFunc) {
                        currentCallIdx++;
                        continue;
                    }
                    try {
                        let isAnnotation = !(callername === PRE_AROUND_NAME) && !(callername === POST_AROUND_NAME)
                            && !(callername === BEFORE_CALL_NAME) && !(callername === AFTER_CALL_NAME)
                            && !isOriginFunc;
                        let ctx = isAnnotation ? {} : this;
                        ret = caller.call(ctx, ...args);
                        if (ret === null) {
                            break;
                        }
                        if (ret && ret.err) {
                            ret.from = ret.from || callername;
                            ret.pre = ret.pre || pre;
                        }
                        if (ret === undefined) {
                            ret = preRet;
                        }
                        if (isOriginFunc) {
                            ret = {
                                err: '',
                                data: ret,
                                from: '',
                                pre: undefined
                            };
                        }
                    }
                    catch (e) {
                        if (e instanceof business_exception_1.default) {
                            ret = {
                                err: e,
                                data: e.data,
                                from: callername,
                                pre: pre
                            };
                        }
                        else {
                            throw e;
                        }
                    }
                    preRet = ret;
                    currentCallIdx++;
                }
                if (preRet.err) {
                    throw new Error(preRet.err);
                }
                else {
                    return preRet;
                }
            };
        }
    }
    static resetClass(ctor) {
        const beanMeta = bean_factory_1.default.getBeanMeta(ctor);
        if (!beanMeta) {
            return;
        }
        ReflectHelper.getMethods(ctor).forEach((method) => {
            ReflectHelper.resetMethod(ctor, method, beanMeta.clzAnnos, beanMeta.methodAnnos[method]);
        });
    }
}
exports.default = ReflectHelper;
