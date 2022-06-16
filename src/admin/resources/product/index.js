const Category = require("./category");
const Brand = require("./brand");
const Product = require("./product");
const Multipler = require("./multipler");
const Varient = require("./varient");
const Unit = require("./unit");
const Shop = require("./shop");
const BestDrink = require("./bestDrink");
const { OptionList } = require("../options");

let list = [
    Category,
    Brand,
    Product,
    Multipler,
    Varient,
    Unit,
    BestDrink,
    Shop,
];

list = OptionList(list, { name: "Product Management", icon: "Product" });

module.exports = list;
