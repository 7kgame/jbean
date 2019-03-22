"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const utils_1 = require("../utils");
const bean_factory_1 = require("../bean_factory");
const scan = function (ctor, options, ext) {
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
    // console.log(includes)
    // console.log(excludes)
    includes.forEach(dir => {
        utils_1.readDirSync(dir, (fpath, isFile) => {
            if (fpath.endsWith(ext)) {
                let isExclude = false;
                excludes.every((item, index, arr) => {
                    if (fpath.indexOf(item) === 0) {
                        isExclude = true;
                        return false;
                    }
                    return true;
                });
                if (!isExclude) {
                    bean_factory_1.default.setCurrentSourceFile(fpath);
                    require(fpath);
                    bean_factory_1.default.setCurrentSourceFile(null);
                }
            }
        });
    });
};
function ComponentScan(options, ext) {
    return utils_1.annotationHelper(utils_1.AnnotationType.clz, scan, arguments);
}
exports.default = ComponentScan;
