"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["clz"] = 0] = "clz";
    AnnotationType[AnnotationType["method"] = 1] = "method";
    AnnotationType[AnnotationType["field"] = 2] = "field";
})(AnnotationType = exports.AnnotationType || (exports.AnnotationType = {}));
let compileTrick;
function annotationHelper(annoType, callback, args) {
    switch (annoType) {
        case AnnotationType.clz:
            if (args.length === 1 && typeof args[0] === 'function') {
                callback && callback(...args);
                return compileTrick;
            }
            return target => {
                callback && callback(target, ...args);
            };
        case AnnotationType.method:
            if (args.length === 3
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[2] === 'object'
                && typeof args[2].value !== 'undefined') {
                callback && callback(...args);
                return compileTrick;
            }
            return (target, method, descriptor) => {
                callback && callback(target, method, descriptor, ...args);
            };
        case AnnotationType.field:
            if (args.length >= 2
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[1] === 'string') {
                callback && callback(...args);
                return compileTrick;
            }
            return (target, field) => {
                callback && callback(target, field, ...args);
            };
    }
    return compileTrick;
}
exports.annotationHelper = annotationHelper;
