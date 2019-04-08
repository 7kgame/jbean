"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
function merge(target, source) {
    if (!target || typeof target !== 'object') {
        throw new Error('target value must be an object');
    }
    if (!source || typeof source !== 'object') {
        return target;
    }
    if (Array.isArray(source)) {
        if (Array.isArray(target)) {
            for (let i = 0; i < source.length; i++) {
                target.push(source[i]);
            }
        }
    }
    else {
        for (let key in source) {
            const val = source[key];
            // console.log(key, '-----------', val)
            if (typeof target[key] === 'undefined' || typeof val !== 'object') {
                target[key] = val;
            }
            else {
                merge(target[key], val);
            }
        }
    }
}
exports.merge = merge;
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
