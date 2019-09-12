"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const reflect_helper_1 = require("../reflect_helper");
const callback = function (annoType, ctor, name) {
    name = name || ctor.name;
    bean_factory_1.default.addBean(name, ctor);
    repositories.push(ctor);
    bean_factory_1.default.addBeanMeta(annoType, ctor, null, null);
};
function Repository(name) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Repository;
const repositories = [];
bean_factory_1.default.registerInitBean(() => {
    repositories.forEach((repository) => {
        reflect_helper_1.default.resetClass(repository);
    });
});
