"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const reflect_helper_1 = require("../reflect_helper");
const callback = function (annoType, ctor, name) {
    name = name || ctor.name;
    bean_factory_1.default.addBean(name, ctor);
    beans.push(ctor);
    bean_factory_1.default.addBeanMeta(annoType, ctor, null, null);
};
function default_1(component) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = default_1;
const beans = [];
bean_factory_1.default.registerInitBean(() => {
    beans.forEach((bean) => {
        reflect_helper_1.default.resetClass(bean);
    });
});
