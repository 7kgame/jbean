"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean_factory_1 = require("../bean_factory");
const utils_1 = require("../utils");
var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["clz"] = 0] = "clz";
    AnnotationType[AnnotationType["method"] = 1] = "method";
    AnnotationType[AnnotationType["field"] = 2] = "field";
    AnnotationType[AnnotationType["none"] = 3] = "none";
})(AnnotationType = exports.AnnotationType || (exports.AnnotationType = {}));
let compileTrick;
let clzCnt = 0;
const addCtorId = function (target) {
    let ctor = target;
    if (typeof target === 'object') {
        ctor = target.constructor;
    }
    if (ctor && !ctor.hasOwnProperty(bean_factory_1.CTOR_ID)) { // typeof ctor[CTOR_ID] === 'undefined') {
        // ctor[CTOR_ID] = ctor.name + ':' + (++clzCnt)
        Object.defineProperties(ctor, {
            [bean_factory_1.CTOR_ID]: {
                enumerable: false,
                value: ctor.name + ':' + (++clzCnt)
            }
        });
    }
};
function checkAnnotationType(args) {
    if (args.length === 1
        && typeof args[0] === 'function'
        && args[0].name.toLowerCase() !== 'object') {
        return AnnotationType.clz;
    }
    if (args.length === 3
        && (typeof args[0] === 'object' || typeof args[0] === 'function')
        && typeof args[1] === 'string'
        && typeof args[2] === 'object'
        && ((args[0].constructor && args[0].constructor.name.toLowerCase() !== 'object')
            || args[0].name.toLowerCase() !== 'object')
        && (typeof args[2]['value'] !== 'undefined' && typeof args[2]['enumerable'] !== 'undefined')) {
        return AnnotationType.method;
    }
    if (args.length >= 2
        && (typeof args[0] === 'object' || typeof args[0] === 'function')
        && typeof args[1] === 'string'
        && ((args[0].constructor && args[0].constructor.name.toLowerCase() !== 'object')
            || args[0].name.toLowerCase() !== 'object')) {
        return AnnotationType.field;
    }
    return AnnotationType.none;
}
exports.checkAnnotationType = checkAnnotationType;
function annotationHelper(args, callback, ignoreAnnotationTypeCheck) {
    let annoType = AnnotationType.none;
    if (!ignoreAnnotationTypeCheck) {
        annoType = checkAnnotationType(args);
    }
    if (utils_1.getObjectType(args) === 'arguments') {
        args = Array.prototype.slice.call(args, 0);
    }
    if (annoType === AnnotationType.none) {
        return function () {
            addCtorId(arguments[0]);
            annoType = checkAnnotationType(arguments);
            const args0 = utils_1.rtrimUndefinedArgument(arguments);
            callback && callback(annoType, ...args0.concat(args));
        };
    }
    else {
        addCtorId(args[0]);
        callback && callback(annoType, ...args);
        return compileTrick;
    }
}
exports.annotationHelper = annotationHelper;
