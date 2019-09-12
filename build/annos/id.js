"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
function Id(name, options) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Id;
const callback = function (annoType, ctor, field) {
    bean_factory_1.default.addBeanMeta(annoType, ctor, field, Id, null, null, null, field);
};
