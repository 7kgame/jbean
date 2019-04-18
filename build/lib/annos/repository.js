"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const callback = function (annoType, ctor, name) {
    name = name || ctor.name;
    bean_factory_1.default.addBean(name, ctor);
};
function Repository(name) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Repository;
