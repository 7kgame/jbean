"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const app = function (target, options) {
    if (typeof target['main'] === 'function') {
        setTimeout(() => {
            target['main'](options);
        }, 0);
    }
};
function JBootApplication(target, options) {
    return utils_1.annotationHelper(utils_1.AnnotationType.clz, app, arguments);
}
exports.default = JBootApplication;
