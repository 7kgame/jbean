"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BeanFactory {
    static setCurrentSourceFile(sf) {
        BeanFactory.currentSourceFile = sf;
    }
    static getCurrentSourceFile() {
        return BeanFactory.currentSourceFile;
    }
    static addBean(key, target) {
        if (!key) {
            return;
        }
        key = key.toLowerCase();
        const target0 = BeanFactory.container[key] || {};
        for (let k in target) {
            target0[k] = target[k];
        }
        BeanFactory.container[key] = target0;
        if (target0.clz) {
            const clz = target0.clz;
            target0.ins = new clz();
        }
    }
    static getBean(key) {
        if (!key) {
            return null;
        }
        const target = BeanFactory.container[key.toLowerCase()];
        if (!target || !target.ins) {
            return null;
        }
        return target.ins;
    }
}
BeanFactory.container = {};
exports.default = BeanFactory;
