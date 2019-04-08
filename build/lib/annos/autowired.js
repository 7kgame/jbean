"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const callback = function (target, field, name) {
    name = name || field;
    utils_1.redefineProperty(target, field, {
        get: function () {
            return bean_factory_1.default.getBean(name);
        }
    });
};
function Autowired(component, name) {
    return helper_1.annotationHelper(helper_1.AnnotationType.field, callback, arguments);
}
exports.default = Autowired;
