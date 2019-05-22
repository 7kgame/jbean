"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const reflect_helper_1 = require("../reflect_helper");
const callback = function (annoType, ctor, name) {
    name = name || ctor.name;
    bean_factory_1.default.addBean(name, ctor);
    services.push(ctor);
    bean_factory_1.default.addBeanMeta(annoType, ctor, null, null);
};
function Service(name) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Service;
const services = [];
bean_factory_1.default.registerInitBean(() => {
    services.forEach((services) => {
        reflect_helper_1.default.resetClass(services);
    });
});
