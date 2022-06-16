const {
    BestDrink,
    Category,
    Product,
    Op,
    sequelize,
    Shop,
    Varient,
    Post,
    Brand,
} = require("../../database");
const {
    sequelizeLiteralDistance,
    sequelizeLiteralTerinary,
    sequelizeWhereDistance,
} = require("../distance");

const OfferQueries = {
    offerShop: async (lat = null, lng = null) => {
        return await Shop.findAll({
            include: {
                model: Product,
                through: { where: { discount: { [Op.ne]: 0 } } },
                attributes: [],
                required: true,
            },
            where: lat && lng ? sequelizeWhereDistance(lat, lng) : {},
            attributes: [
                "id",
                "image",
                ...(lat && lng
                    ? ["name", [sequelizeLiteralDistance(lat, lng), "distance"]]
                    : ["name"]),
            ],
        });
    },
    searchOffers: async (cat = null, shop = null, lat = null, lng = null) => {
        return await Post.findAll({
            attributes: [
                "id",
                "price",
                "discount",
                [
                    sequelize.literal(
                        `(select (price*((100-discount)::numeric/100)))::numeric(10,2)`,
                    ),
                    "discountPrice",
                ],
                ...(lat && lng
                    ? [
                          [sequelizeLiteralDistance(lat, lng), "distance"],
                          [sequelizeLiteralTerinary(lat, lng, 0), "status"],
                      ]
                    : [[sequelize.literal("(select false)"), "status"]]),
            ],
            where: { discount: { [Op.ne]: 0 } },
            include: [
                {
                    model: Product,
                    required: true,
                    include: [Brand],
                    attributes: ["id", "name", "image", "categoryId"],
                    where: {
                        categoryId: cat != null ? cat : { [Op.ne]: null },
                    },
                },
                { model: Varient, attributes: ["id", "mrp", "volume"] },
                {
                    model: Shop,
                    where: {
                        id: shop != null ? shop : { [Op.ne]: null },
                    },
                    attributes: ["id", "name"],
                    required: true,
                },
            ],
            order: lat && lng ? [sequelize.col("distance")] : [],
        });
    },
    offerDashboard: async (sid = null, lat = null, lng = null) => {
        let cat = await Category.findAll({
            include: [
                {
                    model: Product,
                    attributes: [],
                    include: [
                        {
                            model: Shop,
                            where: sid != null ? { id: sid } : {},
                            through: { where: { discount: { [Op.ne]: 0 } } },
                            attributes: [],
                            required: true,
                        },
                    ],
                    required: true,
                },
            ],
            order: ["name"],
        });
        return {
            categories: cat,
            initial: await OfferQueries.searchOffers(
                cat.length != 0 ? cat[0].id : null,
                sid,
                lat,
                lng,
            ),
        };
    },
};
module.exports = OfferQueries;
