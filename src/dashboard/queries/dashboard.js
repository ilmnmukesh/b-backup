const {
    Order,
    OrderProduct,
    sequelize,
    Op,
    Varient,
    ShippingDetails,
    OrderCancel,
} = require("../../database");
const moment = require("moment");
module.exports = {
    getDashboard: async (shopId) => {
        return {
            revenue: await Order.sum("totalAmount", { where: { shopId } }),
            count: await Order.count({ where: { shopId } }),
            productCount: await OrderProduct.count({
                include: { model: Order, attributes: [] },
                where: { "$order.shopId$": shopId },
            }),
        };
    },

    getProductGraph: async (shopId) => {
        const res = JSON.parse(
            JSON.stringify(
                await OrderProduct.findAll({
                    include: {
                        model: Order,
                        attributes: [],
                        required: true,
                        where: { shopId },
                    },
                    attributes: [
                        [
                            sequelize.fn(
                                "to_char",
                                sequelize.col("order_product.createdAt"),
                                "YYYY-MM-DD",
                            ),
                            "date",
                        ],
                        [
                            sequelize.fn("count", sequelize.col("orderId")),
                            "count",
                        ],
                    ],
                    where: {
                        createdAt: {
                            [Op.gte]: moment()
                                .subtract({ months: 3 })
                                .format("YYYY-MM-DD"),
                        },
                    },
                    group: ["date", "order.shopId"],
                    order: [sequelize.col("date")],
                }),
            ),
        );
        let label = [];
        let value = [];
        for (const s of res) {
            label.push(moment(s.date).format("D MMM"));
            value.push(s.count);
        }
        return {
            label,
            value,
        };
    },

    getCountAndTotal: async (shopId) => {
        const res = JSON.parse(
            JSON.stringify(
                await Order.findAll({
                    attributes: [
                        [
                            sequelize.fn(
                                "to_char",
                                sequelize.col("createdAt"),
                                "YYYY-MM-DD",
                            ),
                            "date",
                        ],
                        [
                            sequelize.fn("sum", sequelize.col("totalAmount")),
                            "amount",
                        ],
                        [
                            sequelize.fn("count", sequelize.col("totalAmount")),
                            "count",
                        ],
                    ],
                    where: {
                        createdAt: {
                            [Op.gte]: moment()
                                .subtract({ month: 3 })
                                .format("YYYY-MM-DD"),
                        },
                        shopId,
                    },
                    group: ["date", "shopId"],
                    order: [sequelize.col("date")],
                }),
            ),
        );

        let label = [];
        let value1 = [],
            value2 = [];

        for (const s of res) {
            label.push(moment(s.date).format("D MMM"));
            value1.push(s.amount);
            value2.push(s.count);
        }
        return {
            one: { label: label, value: value1 },
            two: { label: label, value: value2 },
        };
    },

    getProductBar: async (shopId) => {
        const res = JSON.parse(
            JSON.stringify(
                await Order.findAll({
                    attributes: [
                        [
                            sequelize.fn(
                                "to_char",
                                sequelize.col("createdAt"),
                                "YYYY-MM",
                            ),
                            "date",
                        ],
                        [
                            sequelize.fn("sum", sequelize.col("totalAmount")),
                            "amount",
                        ],
                    ],
                    where: {
                        createdAt: {
                            [Op.gte]: moment()
                                .subtract({ month: 12 })
                                .format("YYYY-MM-DD"),
                        },
                        shopId,
                    },
                    group: ["date", "shopId"],
                    order: [sequelize.col("date")],
                }),
            ),
        );

        let label = [];
        let value = [];

        for (const s of res) {
            label.push(moment(s.date).format("MMM"));
            value.push(s.amount);
        }
        return {
            label,
            value,
        };
    },

    getOrder: async (shopId) => {
        return await Order.findAll({
            where: {
                shopId,
                createdAt: {
                    [Op.gte]: moment().format("YYYY-MM-DD"),
                },
            },
            include: [
                {
                    model: OrderProduct,
                    include: [
                        { model: Varient, attributes: ["productId", "volume"] },
                    ],
                },
                ShippingDetails,
                OrderCancel,
            ],
            order: ["createdAt"],
        });
    },
};
