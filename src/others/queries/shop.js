const {
    Shop,
    Category,
    sequelize,
    ShopState,
    Product,
    Brand,
    ShopReview,
    SellerAuth,
} = require("../../database");
const {
    sequelizeLiteralDistance,
    // sequelizeWhereDistance,
    sequelizeLiteralTerinary,
} = require("../distance");

const ShopQueries = {
    getSellers: async (lat = null, lng = null, state = null) => {
        if (lat && lng) {
            return await Shop.findAll({
                attributes: {
                    include: [
                        [sequelizeLiteralDistance(lat, lng), "distance"],
                        [sequelizeLiteralTerinary(lat, lng, false), "status"],
                    ],
                },
                // where: sequelizeWhereDistance(lat, lng),
                include: [
                    { model: Category, attributes: ["id", "name"] },
                    { model: SellerAuth, required: true, attributes: [] },
                ],
                order: [[sequelize.col("distance"), "ASC"]],
            });
        } else if (state) {
            return await Shop.findAll({
                where: { shopStateId: state },
                include: [
                    { model: Category, attributes: ["id", "name"] },
                    { model: SellerAuth, required: true, attributes: [] },
                ],
            });
        }
        return await Shop.findAll({
            include: [
                { model: Category, attributes: ["id", "name"] },
                { model: SellerAuth, required: true, attributes: [] },
            ],
        });
    },
    getState: async () => {
        return await ShopState.findAll();
    },
    getShopProducts: async (shopId, catId = null) => {
        return await Product.findAll({
            where: catId ? { categoryId: catId } : {},
            // attributes: { include: [] },
            include: [
                {
                    model: Shop,
                    where: { id: shopId },
                    required: true,
                    attributes: ["id"],
                },
                Brand,
            ],
        });
    },
    getDetails: async (shopId, lat = null, lng = null) => {
        let res = await Shop.findByPk(shopId, {
            attributes: {
                include: [
                    ...(lat && lng
                        ? [
                              [sequelizeLiteralDistance(lat, lng), "distance"],
                              [
                                  sequelizeLiteralTerinary(lat, lng, false),
                                  "status",
                              ],
                          ]
                        : []),
                ],
            },
            include: [{ model: SellerAuth, required: true, attributes: [] }],
            order: lat && lng ? [[sequelize.col("distance"), "ASC"]] : [],
        });
        if (res == null) throw "Invalid seller id";
        res = JSON.parse(JSON.stringify(res));
        res["reviewCount"] = await ShopReview.count({ where: { shopId } });
        res["categories"] = await Category.findAll({
            include: [
                {
                    model: Product,
                    include: {
                        model: Shop,
                        required: true,
                        where: { id: shopId },
                        attributes: [],
                    },
                    attributes: [],
                    required: true,
                },
            ],
            order: [["id", "ASC"]],
        });
        res["products"] = [];
        if (res?.categories?.length != 0)
            res["products"] = await ShopQueries.getShopProducts(
                shopId,
                res.categories[0]?.id ? res.categories[0]?.id : null,
            );
        return res;
    },
    addShopReview: async (data) => {
        let shop = await Shop.findByPk(data?.shopId, {
            include: { model: SellerAuth, required: true, attributes: [] },
        });
        if (shop == null) throw "Invalid seller id";
        let cnt = await ShopReview.count({ where: { shopId: shop.id } });
        if (shop == null) return [false, {}];
        shop.rating = ((shop.rating * cnt + data.rating) / (cnt + 1)).toFixed(
            2,
        );
        if (cnt != 0) shop.save();
        return [true, await ShopReview.create(data)];
    },
    getShopReview: async (search, shopId, page) => {
        const LIMIT = 10;
        const [start, end] = [(page - 1) * LIMIT, page * LIMIT];
        switch (search) {
            case 1: // default first
                return await ShopReview.findAll({
                    where: { shopId },
                    offset: start,
                    limit: end,
                    order: [["createdAt", "ASC"]],
                });
            case 2: // Top review
                return await ShopReview.findAll({
                    where: { shopId },
                    order: [["rating", "DESC"]],
                    offset: start,
                    limit: end,
                });
            case 3: // Latest Review
                return await ShopReview.findAll({
                    where: { shopId },
                    offset: start,
                    limit: end,
                    order: [["createdAt", "DESC"]],
                });
            default:
                return [];
        }
    },
};
module.exports = ShopQueries;
