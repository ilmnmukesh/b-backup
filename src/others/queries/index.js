const UserQueries = require("./user");
const OTPQueries = require("./otp");
const ShopQueries = require("./shop");
const CartQueries = require("./cart");
const OrderQueries = require("./order");
const FilterQueries = require("./filter");
const OfferQueries = require("./offer");
const PartnerQueries = require("./partner");
const MemberQueries = require("./membership");

module.exports = {
    UserQueries,
    ...require("./product"),
    OTPQueries,
    ShopQueries,
    CartQueries,
    OrderQueries,
    FilterQueries,
    OfferQueries,
    PartnerQueries,
    MemberQueries,
};
