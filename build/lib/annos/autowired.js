"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
const autowiredTargets = [];
const callback = function (annoType, target, field, name) {
    name = name || field;
    autowiredTargets.push([target, field, name.toLowerCase()]);
};
function Autowired(name, options) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Autowired;
bean_factory_1.default.registerStartBean(() => {
    autowiredTargets.forEach(([target, field, name]) => {
        utils_1.redefineProperty(target, field, {
            get: function () {
                return bean_factory_1.default.getBean(name);
            }
        });
    });
});
