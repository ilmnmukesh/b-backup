const CloudWallet = require("./wallet");
const CloudHistory = require("./history");
const { OptionList } = require("../options");

let list = [CloudWallet, CloudHistory];

list = OptionList(list, { name: "Cloud", icon: "Cloud" });

module.exports = list;
