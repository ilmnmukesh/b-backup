const {
    Order,
    OrderProduct,
    ShippingDetails,
    Varient,
    Op,
} = require("../../../database");
const moment = require("moment");

const tracking = {
    getNewOrders: async (shopId) => {
        return await Order.findAll({
            where: {
                status: "created",
                shopId,
                createdAt: { [Op.gte]: moment().subtract({ minute: 30 }) },
            },
            include: [
                {
                    model: OrderProduct,
                    include: [
                        { model: Varient, attributes: ["productId", "volume"] },
                    ],
                },
                ShippingDetails,
            ],
            order: [["createdAt", "ASC"]],
        });
    },
    getNewOrderCount: async (shopId) => {
        await Order.count({
            where: {
                status: "created",
                shopId,
                createdAt: { [Op.gte]: moment().subtract({ minute: 30 }) },
            },
        });
    },
    changeStatus: async (shopId, id, status) => {
        const ST = ["created", "cancelled"];
        if (!ST.includes(status)) return [0];
        let orderAccepted = false;
        if (status == "created") {
            status = "shipping";
            orderAccepted = true;
        }
        return await Order.update(
            { status, orderAccepted },
            {
                where: {
                    id,
                    shopId,
                    createdAt: { [Op.gte]: moment().subtract({ minute: 30 }) },
                },
            },
        );
    },
};

module.exports = tracking;
