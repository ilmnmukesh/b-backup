const otpController = require("./otp");
const userController = require("./user");
const productController = require("./product");
const dashboardController = require("./dashboard");
const cartController = require("./cart");
const paymentController = require("./payment");
const orderController = require("./order");
const filterController = require("./filter");
const shopController = require("./shop");
const offerController = require("./offer");
const verificationController = require("./verification");
const partnerController = require("./partner");
const membershipController = require("./membership");

module.exports = {
    userController,
    productController,
    otpController,
    dashboardController,
    cartController,
    paymentController,
    orderController,
    filterController,
    shopController,
    offerController,
    verificationController,
    partnerController,
    membershipController,
};
