"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const bean_factory_1 = require("../bean_factory");
const callback = function (ctor, name) {
    name = name || ctor.name;
    bean_factory_1.default.addBean(name, { clz: ctor });
};
function default_1(component) {
    return utils_1.annotationHelper(utils_1.AnnotationType.clz, callback, arguments);
}
exports.default = default_1;
