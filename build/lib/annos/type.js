"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
function Type(type) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Type;
const callback = function (annoType, target, field, type) {
    bean_factory_1.default.addBeanMeta(annoType, target, field, Type, null, type.toLowerCase());
};
