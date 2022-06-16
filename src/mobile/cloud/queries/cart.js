const {
    Varient,
    Product,
    Multipler,
    Unit,
    sequelize,
    Shop,
    Post,
    CloudCart,
} = require("../../../database");
const {
    sequelizeLiteralTerinary,
    sequelizeLiteralDistance,
    sequelizeLiteralCloudCartPrice,
    sequelizeLiteralCloudCartProductCode,
    sequelizeLiteralCloudMultipler,
} = require("../../../others/distance");

const locationQueries = (lat, lng) => ({
    getCartForCustomer: async (cid) => {
        let overAll = {
            subTotal: 0,
            convenience: 0,
            total: 0,
        };
        let res = await Shop.findAll({
            attributes: [
                "id",
                "name",
                "latitude",
                "longitude",
                [sequelizeLiteralDistance(lat, lng), "distance"],
                [sequelizeLiteralTerinary(lat, lng, false), "isAvailable"],
            ],
            include: [
                {
                    model: CloudCart,
                    attributes: [
                        "id",
                        "count",
                        [sequelizeLiteralCloudCartPrice(), "price"],
                        [sequelizeLiteralCloudCartProductCode(), "code"],
                    ],
                    include: {
                        model: Varient,
                        include: [
                            {
                                model: Product,
                                attributes: ["id", "name", "image"],
                            },
                            { model: Unit, attributes: [] },
                            { model: Multipler, attributes: [] },
                        ],
                        attributes: [
                            "id",
                            "mrp",
                            // "image",
                            "volume",
                            "stock",
                            [sequelizeLiteralCloudMultipler(), "multiplers"],
                        ],
                    },
                    where: { customerId: cid },
                    required: true,
                },
            ],
            order: [[sequelize.col("distance"), "ASC"]],
        });
        res = JSON.parse(JSON.stringify(res));
        if (res == null || res.length == 0) return [[], overAll, false];
        for (const shop of res) {
            let payment = {
                subTotal: 0,
            };
            shop?.cloud_carts?.forEach((cartItem) => {
                payment.subTotal += cartItem.count * cartItem.price;
            });
            overAll.subTotal += payment.subTotal;
            shop.payment = {
                subTotal: payment.subTotal.toFixed(2),
            };
        }
        overAll.convenience = overAll.subTotal != 0 ? "4.99" : 0;
        overAll.total = (
            overAll.subTotal + (overAll.subTotal != 0 ? 4.99 : 0)
        ).toFixed(2);
        overAll.subTotal = overAll.subTotal.toFixed(2);

        return [res, overAll];
    },
});
const defaultQueries = {
    addProductToCart: async (varientId, customerId, shopId, count) => {
        let check = await Post.findOne({
            where: { varientId: varientId, shopId: shopId },
        });
        if (check == null) throw "Shop does not have this product";
        let result = await CloudCart.findOne({
            where: {
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
            },
        });
        if (result == null) {
            result = await CloudCart.create({
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
                count: count,
            });
            return [true, result];
        }
        if (count < 1) return [false, result];
        result.count = count;
        result.save();
        return [false, result];
    },
    removeProductToCart: async (varientId, shopId, customerId) => {
        let result = await CloudCart.findOne({
            where: {
                varientId: varientId,
                customerId: customerId,
                shopId: shopId,
            },
        });
        if (result == null) {
            return [false, {}];
        }
        result.destroy();
        return [true, result];
    },
    getCartForCustomer: async (cid) => {
        let overAll = {
            subTotal: 0,
            convenience: 0,
            total: 0,
        };
        let res = await Shop.findAll({
            attributes: [
                "id",
                "name",
                "latitude",
                "longitude",
                [sequelize.literal(`(select false)`), "isAvailable"],
            ],
            include: [
                {
                    model: CloudCart,
                    attributes: [
                        "id",
                        "count",
                        [sequelizeLiteralCloudCartPrice(), "price"],
                        [sequelizeLiteralCloudCartProductCode(), "code"],
                    ],
                    include: {
                        model: Varient,
                        include: [
                            {
                                model: Product,
                                attributes: ["id", "name", "image"],
                            },
                            { model: Unit, attributes: [] },
                            { model: Multipler, attributes: [] },
                        ],
                        attributes: [
                            "id",
                            "mrp",
                            // "image",
                            "volume",
                            "stock",
                            [sequelizeLiteralCloudMultipler(), "multiplers"],
                        ],
                    },
                    where: { customerId: cid },
                    required: true,
                },
            ],
        });
        res = JSON.parse(JSON.stringify(res));
        if (res == null) return [[], overAll, false];
        for (const shop of res) {
            let payment = {
                subTotal: 0,
            };
            shop?.cloud_carts?.forEach((cartItem) => {
                payment.subTotal += cartItem.count * cartItem.price;
            });

            overAll.subTotal += payment.subTotal;
            shop.payment = {
                subTotal: payment.subTotal.toFixed(2),
            };
        }
        overAll.convenience = overAll.subTotal != 0 ? "4.99" : 0;
        overAll.total = (
            overAll.subTotal + (overAll.subTotal != 0 ? 4.99 : 0)
        ).toFixed(2);
        overAll.subTotal = overAll.subTotal.toFixed(2);

        return [res, overAll];
    },
    removeAllProductToCart: async (customerId) => {
        return await CloudCart.destroy({
            where: {
                customerId: customerId,
            },
        });
    },
    checkShopInCart: async (customerId, shopId) => {
        const check = await CloudCart.findOne({
            where: { customerId },
        });
        if (check == null) return true;
        let checkShop = await check.getShop({ where: { id: shopId } });
        if (checkShop == null || checkShop.length == 0) return false;
        return true;
    },
};
const cartQueries = {
    async addProductToCart({ varientId, customerId, shopId, count }) {
        return await defaultQueries.addProductToCart(
            varientId,
            customerId,
            shopId,
            count,
        );
    },
    async removeProductToCart({ varientId, shopId, customerId }) {
        return await defaultQueries.removeProductToCart(
            varientId,
            shopId,
            customerId,
        );
    },
    async getCartForCustomer(cid, lat = null, lng = null) {
        if (lat && lng) {
            return await locationQueries(lat, lng).getCartForCustomer(cid);
        }
        return await defaultQueries.getCartForCustomer(cid);
    },
    async removeAllProductToCart(customerId) {
        return await defaultQueries.removeAllProductToCart(customerId);
    },
    async checkShopInCart(customerId, shopId) {
        return await defaultQueries.checkShopInCart(customerId, shopId);
    },
};

module.exports = cartQueries;
