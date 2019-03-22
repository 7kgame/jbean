"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
function redefineProperty(target, key, config) {
    if (!config) {
        return;
    }
    let config0 = {
        enumerable: true,
        configurable: true
    };
    for (let k in config) {
        config0[k] = config[k];
    }
    if (delete target[key]) {
        Object.defineProperty(target, key, config0);
    }
}
exports.redefineProperty = redefineProperty;
function readDirSync(path, cb) {
    let res = fs.readdirSync(path);
    res.forEach((fname, index) => {
        let fpath = path + Path.sep + fname;
        let stat = fs.statSync(fpath);
        if (stat.isDirectory()) {
            readDirSync(fpath, cb);
            cb(fpath, false);
        }
        else {
            cb(fpath, true);
        }
    });
}
exports.readDirSync = readDirSync;
function getObjectType(obj) {
    if (obj === null) {
        return 'null';
    }
    if (obj === undefined) {
        return 'undefined';
    }
    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase();
}
exports.getObjectType = getObjectType;
var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["clz"] = 0] = "clz";
    AnnotationType[AnnotationType["method"] = 1] = "method";
    AnnotationType[AnnotationType["field"] = 2] = "field";
})(AnnotationType = exports.AnnotationType || (exports.AnnotationType = {}));
let compileTrick;
function annotationHelper(annoType, callback, args) {
    switch (annoType) {
        case AnnotationType.clz:
            if (args.length === 1 && typeof args[0] === 'function') {
                callback && callback(...args);
                return compileTrick;
            }
            return target => {
                callback && callback(target, ...args);
            };
        case AnnotationType.method:
            if (args.length === 3
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[2] === 'object'
                && typeof args[2].value !== 'undefined') {
                callback && callback(...args);
                return compileTrick;
            }
            return (target, prop, descriptor) => {
                callback && callback(target, prop, descriptor, ...args);
            };
        case AnnotationType.field:
            if (args.length >= 2
                && (typeof args[0] === 'object' || typeof args[0] === 'function')
                && typeof args[1] === 'string') {
                callback && callback(...args);
                return compileTrick;
            }
            return (target, prop) => {
                callback && callback(target, prop, ...args);
            };
    }
    return compileTrick;
}
exports.annotationHelper = annotationHelper;
