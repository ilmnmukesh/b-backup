const product = require("./product");
const Shop = require("./shop");
const ShopManagement = require("./shopManagement");
const General = require("./general");
const Order = require("./order");
const Customer = require("./customer");
const Cloud = require("./cloud");

module.exports = [
    ...General,
    ...Customer,
    ...Cloud,
    ...product,
    ...Shop,
    ...ShopManagement,
    ...Order,
];
