"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
function Validation(entity, mode) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Validation;
const callback = function (annoType, target, method, descriptor, entity, mode) {
    bean_factory_1.default.addBeanMeta(helper_1.AnnotationType.method, target, method, Validation, [entity, mode]);
};
Validation.preCall = function (param, req, res) {
    console.log(arguments);
    // if (param === 'ignore') {
    //   console.log('return login data')
    //   return null
    // }
};
