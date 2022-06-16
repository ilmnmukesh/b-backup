const routes = require("express").Router();
const Service = require("../api");
const Controller = require("../controllers");

const decorator = require("../../../others/decorator");

const config = (router, service, controller) => {
    for (const obj of Object.getOwnPropertyNames(service.get)) {
        router.get(service.get[obj], decorator(controller[obj]));
    }
    for (const obj of Object.getOwnPropertyNames(service.post)) {
        router.post(service.post[obj], decorator(controller[obj]));
    }
};

config(routes, Service.authService, Controller.authController);
config(routes, Service.customerService, Controller.customerController);

module.exports = routes;
