"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const utils_1 = require("../utils");
const helper_1 = require("./helper");
const ouertScanner = [];
exports.registerScanner = function (scanner) {
    ouertScanner.push(scanner);
};
exports.scan = function (annoType, ctor, options, ext) {
    options = options || '';
    ext = ext || 'js';
    ext = '.' + ext;
    if (typeof options === 'string') {
        options = { include: [options || ''] };
    }
    const appRoot = Path.dirname(require.main.filename);
    const includes = [].concat(options['include'] || ['']);
    const excludes = [].concat(options['exclude'] || []);
    includes.forEach((item, index) => {
        includes[index] = Path.resolve(appRoot, item);
    });
    excludes.forEach((item, index) => {
        excludes[index] = Path.resolve(appRoot, item);
    });
    includes.forEach(dir => {
        utils_1.readDirSync(dir, (fpath, isFile) => {
            let isExclude = false;
            excludes.every((item, index, arr) => {
                if (fpath.indexOf(item) === 0) {
                    isExclude = true;
                    return false;
                }
                return true;
            });
            if (isFile && !isExclude && fpath.endsWith(ext)) {
                require(fpath);
            }
            ouertScanner.forEach(scanner => {
                scanner(fpath, isExclude, isFile);
            });
        });
    });
};
function ComponentScan(options, ext) {
    return helper_1.annotationHelper(arguments, exports.scan);
}
exports.default = ComponentScan;
