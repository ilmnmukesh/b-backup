const { OptionList } = require("../options");
const Order = require("./order");
const OrderProduct = require("./orderProduct");
const OrderCancel = require("./cancel");
const Transaction = require("./transaction");

let list = [Transaction, Order, OrderProduct, OrderCancel];

list = OptionList(list, { name: "Order Management", icon: "ShoppingCatalog" });

module.exports = list;
