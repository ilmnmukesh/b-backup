const Shop = require("./shop");
const State = require("./state");
const Food = require("./food");
const Event = require("./event");
const Amenitites = require("./amenitites");
const Review = require("./review");
const { OptionList } = require("../options");

let list = [Shop, State, Food, Event, Amenitites, Review];

list = OptionList(list, { name: "Store", icon: "Store" });
module.exports = list;
