"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var App_1;
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const user_service_1 = require("./user_service");
const test_1 = require("./test/test");
let App = App_1 = class App {
    func() {
        console.log(this.userService.getName());
        console.log(App_1.prop);
        const test = new test_1.default();
        console.log(test.func1());
    }
    static main(configs) {
        console.log('app start');
        console.log(configs);
        let app = new App_1();
        app.func();
    }
};
__decorate([
    lib_1.Autowired,
    __metadata("design:type", user_service_1.default)
], App.prototype, "userService", void 0);
__decorate([
    lib_1.Autowired,
    __metadata("design:type", Object)
], App, "prop", void 0);
App = App_1 = __decorate([
    lib_1.JBootApplication
], App);
exports.default = App;
