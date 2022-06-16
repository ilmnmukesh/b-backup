const CategoryQueries = require("./inventory/category");
const BrandQueries = require("./inventory/brand");
const ProductQueries = require("./inventory/product");
const PostQueries = require("./inventory/post");
const ComboQueries = require("./inventory/combo");
const DashboardQueries = require("./dashboard");

module.exports = {
    CategoryQueries,
    BrandQueries,
    ProductQueries,
    PostQueries,
    ComboQueries,
    DashboardQueries,
    ...require("./order"),
    ...require("./profile"),
};
