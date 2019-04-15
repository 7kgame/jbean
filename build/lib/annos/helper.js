"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean_factory_1 = require("../bean_factory");
const utils_1 = require("../utils");
var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["clz"] = 0] = "clz";
    AnnotationType[AnnotationType["method"] = 1] = "method";
    AnnotationType[AnnotationType["field"] = 2] = "field";
})(AnnotationType = exports.AnnotationType || (exports.AnnotationType = {}));
let compileTrick;
let clzCnt = 0;
const addCtorId = function (target) {
    let ctor;
    if (typeof target === 'object') {
        ctor = target.constructor;
    }
    else {
        ctor = target;
    }
    if (ctor && typeof ctor[bean_factory_1.CTOR_ID] === 'undefined') {
        ctor[bean_factory_1.CTOR_ID] = ctor.name + ':' + (++clzCnt);
    }
};
const doCallback = function (annoType, callback, args0, args1, ignoreAnnotationTypeInference) {
    if (!callback) {
        return;
    }
    if (utils_1.getObjectType(args0) === 'arguments') {
        args0 = Array.prototype.slice.call(args0, 0);
    }
    if (utils_1.getObjectType(args1) === 'arguments') {
        args1 = Array.prototype.slice.call(args1, 0);
    }
    let inferencedAnnoType = AnnotationType.clz;
    if (args0.length > 2) {
        inferencedAnnoType = AnnotationType.method;
    }
    else if (args0.length == 2) {
        inferencedAnnoType = AnnotationType.field;
    }
    if (ignoreAnnotationTypeInference) {
        inferencedAnnoType = annoType;
    }
    callback(inferencedAnnoType, ...args0.concat(args1));
};
function annotationHelper(annoType, callback, args, ignoreAnnotationTypeInference) {
    switch (annoType) {
        case AnnotationType.clz:
            if (args.length === 1 && typeof args[0] === 'function') {
                addCtorId(args[0]);
                callback && callback(annoType, ...args);
                return compileTrick;
            }
            return function () {
                addCtorId(arguments[0]);
                doCallback(annoType, callback, utils_1.rtrimUndefinedArgument(arguments), args, ignoreAnnotationTypeInference);
            };
        // return target => {
        //   addCtorId(target)
        //   callback && callback(target, ...args)
        // }
        case AnnotationType.method:
            if (args.length === 3
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[2] === 'object'
                && typeof args[2].value !== 'undefined') {
                addCtorId(args[0]);
                callback && callback(annoType, ...args);
                return compileTrick;
            }
            return function () {
                addCtorId(arguments[0]);
                doCallback(annoType, callback, utils_1.rtrimUndefinedArgument(arguments), args, ignoreAnnotationTypeInference);
            };
        // return (target: any, method: string, descriptor: PropertyDescriptor) => {
        //   addCtorId(target)
        //   callback && callback(target, method, descriptor, ...args)
        // }
        case AnnotationType.field:
            if (args.length >= 2
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[1] === 'string') {
                addCtorId(args[0]);
                callback && callback(annoType, ...args);
                return compileTrick;
            }
            return function () {
                addCtorId(arguments[0]);
                doCallback(annoType, callback, utils_1.rtrimUndefinedArgument(arguments), args, ignoreAnnotationTypeInference);
            };
        // return (target: any, field: string) => {
        //   addCtorId(target)
        //   callback && callback(target, field, ...args)
        // }
    }
    return compileTrick;
}
exports.annotationHelper = annotationHelper;
