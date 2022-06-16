const DashboardQueries = require("./dashboard");
const PartnerQueries = require("./partner");
const OrderQueries = require("./order");
const WalletQueries = require("./wallet");
const CartQueries = require("./cart");
const EventQueries = require("./event");

module.exports = {
    DashboardQueries,
    PartnerQueries,
    OrderQueries,
    WalletQueries,
    CartQueries,
    EventQueries,
    ...require("./kitchen"),
};
