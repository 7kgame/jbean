"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
exports.SCHEDULED_KEY = '__scheduled';
const callback = function (annoType, ctor, options) {
    if (typeof options === 'string') {
        options = { cron: options };
    }
    ctor[exports.SCHEDULED_KEY] = options;
};
function Scheduled(options) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Scheduled;
