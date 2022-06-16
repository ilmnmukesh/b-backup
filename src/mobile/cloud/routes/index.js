const routes = require("express").Router();
const config = require("./config");
const Service = require("../api");
const Controller = require("../controllers");

config(routes, Service.dashboardService, Controller.dashboardController);
config(routes, Service.orderService, Controller.orderController);
config(routes, Service.partnerService, Controller.partnerController);
config(routes, Service.walletService, Controller.walletController);
config(routes, Service.cartService, Controller.cartController);
config(routes, Service.kitchenService, Controller.kitchenController);
config(routes, Service.eventService, Controller.eventController);

module.exports = routes;
