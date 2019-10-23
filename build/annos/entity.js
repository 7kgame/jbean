"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const bean_factory_1 = require("../bean_factory");
function Entity(name) {
    return helper_1.annotationHelper(arguments, callback);
}
exports.default = Entity;
var TableNameSeperatorType;
(function (TableNameSeperatorType) {
    TableNameSeperatorType[TableNameSeperatorType["underline"] = 0] = "underline";
})(TableNameSeperatorType = exports.TableNameSeperatorType || (exports.TableNameSeperatorType = {}));
const callback = function (annoType, ctor, name) {
    ctor.prototype.toObject = function () {
        const fields = Object.getOwnPropertyNames(this);
        const obj = {};
        fields.forEach(field => {
            if (this[field] !== undefined) {
                obj[field] = this[field];
            }
        });
        return obj;
    };
    ctor.prototype.init = function (data) {
        if (!data) {
            return null;
        }
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        const fields = Object.getOwnPropertyNames(this);
        fields.forEach(field => {
            if (data[field] !== undefined) {
                this[field] = data[field];
            }
        });
    };
    ctor['getPrimaryVal'] = function (data, returnKV, defaultVal) {
        const meta = bean_factory_1.default.getBeanMeta(ctor);
        if (!meta || !meta.id) {
            throw new Error('primary key is not exist in ' + ctor.name);
        }
        let val = data ? data[meta.id] : undefined;
        if (val === undefined) {
            val = defaultVal;
        }
        if (returnKV) {
            return {
                [meta.id]: val
            };
        }
        else {
            return val;
        }
    };
    ctor['clone'] = function (data) {
        if (!data) {
            return null;
        }
        const clz = ctor;
        const entity = new clz();
        const fields = Object.getOwnPropertyNames(entity);
        fields.forEach(field => {
            if (typeof data[field] !== 'undefined') {
                entity[field] = data[field];
            }
        });
        return entity;
    };
    if (name && typeof name === 'string') {
        ctor['$tableName'] = name;
    }
    else if (!name || (typeof name === 'number' && name === TableNameSeperatorType.underline)) {
        ctor['$tableName'] = (ctor.name.charAt(0) + ctor.name.substr(1).replace(/([A-Z])/g, '_$1')).toLowerCase();
    }
    else {
        throw new Error('wrong arguments of @entity');
    }
};
