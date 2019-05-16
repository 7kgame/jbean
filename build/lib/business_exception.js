"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BusinessException {
    constructor(err, code, data) {
        this.err = err;
        this.code = code || -1;
        this.data = data;
    }
}
exports.default = BusinessException;
