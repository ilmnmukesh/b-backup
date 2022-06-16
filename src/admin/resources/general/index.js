const Admin = require("./admin");
const TandC = require("./tandc");
const { OptionList } = require("../options");

let list = [Admin, TandC];

list = OptionList(list);

module.exports = list;
