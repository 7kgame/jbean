"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BusinessException {
    constructor(err, data) {
        this.err = err;
        this.data = data;
    }
}
exports.default = BusinessException;
