const { OptionList } = require("../options");
const FoodMenu = require("./foodMenu");
const EventMenu = require("./eventMenu");
const AmenititesMenu = require("./amenitiesMenu");
const Reservation = require("./reservation");
const ShopType = require("./types");

let list = [FoodMenu, EventMenu, AmenititesMenu, Reservation, ShopType];

list = OptionList(list, {
    name: "Store Management",
    icon: "DashboardReference",
});

module.exports = list;
