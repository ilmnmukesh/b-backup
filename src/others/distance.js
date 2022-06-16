const { sequelize, Op } = require("../database");
const DISTANCE = 100;

function distance(lat1, lat2, lon1, lon2) {
    lon1 = (lon1 * Math.PI) / 180;
    lon2 = (lon2 * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    let r = 6371;
    return c * r;
}

function sequelizeWhereDistance(lat, lng) {
    return sequelize.where(
        sequelize.literal(
            "6371 * acos(cos(radians(" +
                lat +
                ")) * cos(radians(latitude)) * cos(radians(" +
                lng +
                ") - radians(longitude)) + sin(radians(" +
                lat +
                ")) * sin(radians(latitude)))",
        ),
        {
            [Op.lte]: DISTANCE,
        },
    );
}

function sequelizeLiteralDistance(lat, lng) {
    return sequelize.literal(
        "ROUND((6371 * acos(cos(radians(" +
            lat +
            ")) * cos(radians(latitude)) * cos(radians(" +
            lng +
            ") - radians(longitude)) + sin(radians(" +
            lat +
            ")) * sin(radians(latitude))))::numeric, 2)",
    );
}
function sequelizeLiteralDistanceForPartner(lat, lng) {
    return sequelize.literal(
        "ROUND((6371 * acos(cos(radians(" +
            lat +
            ")) * cos(radians(partner.latitude)) * cos(radians(" +
            lng +
            ") - radians(partner.longitude)) + sin(radians(" +
            lat +
            ")) * sin(radians(partner.latitude))))::numeric, 2)",
    );
}
function sequelizeLiteralTerinary(lat, lng, cond = true) {
    return sequelize.literal(
        `(CASE WHEN (${
            "6371 * acos(cos(radians(" +
            lat +
            ")) * cos(radians(latitude)) * cos(radians(" +
            lng +
            ") - radians(longitude)) + sin(radians(" +
            lat +
            ")) * sin(radians(latitude)))"
        }>${DISTANCE}) THEN ${
            cond
                ? `\'Unable to purchase\' ELSE 'Within 25km'`
                : `FALSE ELSE TRUE`
        }  END)`,
    );
}

function sequelizeLiteralCartPrice() {
    return sequelize.literal(
        `(select price from product_posts where "shopId"=carts."shopId" and "varientId"=carts."varientId")`,
    );
}

function sequelizeLiteralCloudCartPrice() {
    return sequelize.literal(
        `(select price from product_posts where "shopId"=cloud_carts."shopId" and "varientId"=cloud_carts."varientId")`,
    );
}

function sequelizeLiteralMultipler() {
    return sequelize.fn(
        "concat",
        sequelize.col("carts->varient->multipler.value"),
        " ",
        sequelize.col("carts->varient->unit.value"),
    );
}

function sequelizeLiteralMultiplerProduct() {
    return sequelize.fn(
        "concat",
        sequelize.col("varients->multipler.value"),
        " ",
        sequelize.col("varients->unit.value"),
    );
}
function sequelizeLiteralCloudMultipler() {
    return sequelize.fn(
        "concat",
        sequelize.col("cloud_carts->varient->multipler.value"),
        " ",
        sequelize.col("cloud_carts->varient->unit.value"),
    );
}

function sequelizeLiteralCartProductCode() {
    return sequelize.literal(
        `(SELECT code FROM categories AS c INNER JOIN products AS p ON "categoryId" = c.id AND p.id = "carts->varient->product".id)`,
    );
}

function sequelizeLiteralCloudCartProductCode() {
    return sequelize.literal(
        `(SELECT code FROM categories AS c INNER JOIN products AS p ON "categoryId" = c.id AND p.id = "cloud_carts->varient->product".id)`,
    );
}

function sequelizeLiteralCartTenAddOne(cid) {
    return sequelize.literal(
        `(select coalesce(sum(quantity), 0) from order_products where "customerId"='${cid}' and "varientId"=carts."varientId" and "isSubscription"=true)`,
    );
}

function sequelizeLiteralProductOrder(shopId) {
    return sequelize.literal(
        `"varients->shops"."id" = ${shopId} DESC, "varients->shops"."id" ASC, "varients.shops.distance"`,
    );
}

module.exports = {
    distance,
    sequelizeLiteralDistance,
    sequelizeWhereDistance,
    sequelizeLiteralTerinary,
    sequelizeLiteralCartPrice,
    sequelizeLiteralMultipler,
    sequelizeLiteralCartProductCode,
    sequelizeLiteralMultiplerProduct,
    sequelizeLiteralCloudCartPrice,
    sequelizeLiteralCloudCartProductCode,
    sequelizeLiteralCloudMultipler,
    sequelizeLiteralCartTenAddOne,
    sequelizeLiteralProductOrder,
    sequelizeLiteralDistanceForPartner,
};
