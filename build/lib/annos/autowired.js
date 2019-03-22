"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const bean_factory_1 = require("../bean_factory");
const callback = function (target, prop, name) {
    name = name || prop;
    utils_1.redefineProperty(target, prop, {
        get: function () {
            return bean_factory_1.default.getBean(name);
        }
    });
};
function Autowired(component, name) {
    return utils_1.annotationHelper(utils_1.AnnotationType.field, callback, arguments);
}
exports.default = Autowired;
