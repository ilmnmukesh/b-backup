//const cloudRoutes = require("../cloud");
const routes = require("express").Router();
const config = require("./config");
const Service = require("../api");
const Controller = require("../controllers");

config(routes, Service.cartService, Controller.cartController);
config(routes, Service.dashboardService, Controller.dashboardController);
config(routes, Service.filterService, Controller.filterController);
config(routes, Service.offerService, Controller.offerController);
config(routes, Service.orderService, Controller.orderController);
config(routes, Service.otpService, Controller.otpController);
config(routes, Service.paymentService, Controller.paymentController);
config(routes, Service.productService, Controller.productController);
config(routes, Service.shopService, Controller.shopController);
config(routes, Service.userService, Controller.userController);
config(routes, Service.verificationService, Controller.verificationController);
config(routes, Service.partnerService, Controller.partnerController);
config(routes, Service.membershipService, Controller.membershipController);

//routes.use("/cloud", cloudRoutes);
module.exports = routes;
