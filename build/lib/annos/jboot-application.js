"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const utils_1 = require("../utils");
const component_scan_1 = require("./component_scan");
const helper_1 = require("./helper");
exports.CTOR_JWEB_FILE_KEY = '$__jweb__file';
exports.CTOR_JWEB_PACKAGE_KEY = '$__jweb__package';
const Module = require('module');
const originRequire = Module.prototype.require;
Module.prototype.require = function (request) {
    const ret = originRequire.apply(this, arguments);
    let ctor = null;
    if (typeof ret === 'function') {
        ctor = ret;
    }
    else if (ret.default && typeof ret.default === 'function') {
        ctor = ret.default;
    }
    if (ctor) {
        const filename = Module._resolveFilename(request, this);
        const applicationRoot = Path.dirname(require.main.filename);
        if (filename.indexOf(applicationRoot) === 0) {
            ctor[exports.CTOR_JWEB_FILE_KEY] = filename;
            ctor[exports.CTOR_JWEB_PACKAGE_KEY] = Path.dirname(filename.substr(applicationRoot.length))
                .replace(new RegExp(Path.sep, 'g'), '.').substr(1);
        }
    }
    return ret;
};
const appConfigs = {};
const configParser = {
    json: function (content) {
        if (!content) {
            return null;
        }
        return JSON.parse(content);
    }
};
function getApplicationConfigs() {
    return appConfigs;
}
exports.getApplicationConfigs = getApplicationConfigs;
function registerConfigParser(key, parser) {
    configParser[key] = parser;
}
exports.registerConfigParser = registerConfigParser;
component_scan_1.registerScanner(function (fpath, isExclude, isFile) {
    if (!isFile || isExclude) {
        return;
    }
    const ext = Path.extname(fpath).substr(1);
    if (typeof configParser[ext] === 'function') {
        let content = configParser[ext](FS.readFileSync(fpath, 'utf8'));
        if (!content) {
            return;
        }
        utils_1.merge(appConfigs, content);
    }
});
const appCallback = function (annoType, target, options) {
    // do component scan, add annotations to bean factory
    component_scan_1.scan(annoType, target);
    // start app: web mode | task mode
    if (typeof target['main'] === 'function') {
        setTimeout(() => {
            target['main'](utils_1.merge(appConfigs, options));
        }, 0);
    }
};
function JBootApplication(target, options) {
    return helper_1.annotationHelper(arguments, appCallback);
}
exports.default = JBootApplication;
