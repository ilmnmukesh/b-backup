const dashboardService = require("./dashboard");
const partnerService = require("./partner");
const orderService = require("./order");
const walletService = require("./wallet");
const cartService = require("./cart");
const kitchenService = require("./kitchen");
const eventService = require("./event");

module.exports = {
    walletService,
    dashboardService,
    partnerService,
    orderService,
    cartService,
    kitchenService,
    eventService,
};
