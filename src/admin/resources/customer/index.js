const Customer = require("./customer");
const Cart = require("./cart");
const ProfileInfo = require("./profileInfo");
const { OptionList } = require("../options");

let list = [Customer, ProfileInfo, Cart];

list = OptionList(list, { name: "Customer", icon: "UserActivity" });

module.exports = list;
