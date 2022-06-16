const {
    Order,
    OrderProduct,
    ShippingDetails,
    OrderCancel,
    Varient,
    Customer,
    Shop,
    SellerAuth,
} = require("../../../database");
const { transferAmount } = require("../../../others/payment");

const OrderDetails = {
    getDetails: async (shopId, obj = {}) => {
        const { date, amount, status } = obj;
        const check = [
            "created",
            "dispatch",
            "delivered",
            "shipping",
            "cancelled",
        ];
        return await Order.findAll({
            where:
                check.includes(status) && status != null
                    ? { status, shopId }
                    : { shopId },
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
            order: [
                [
                    "createdAt",
                    date == null ? "DESC" : date == -1 ? "DESC" : "ASC",
                ],
                [
                    "totalAmount",
                    amount == null ? "ASC" : amount == -1 ? "DESC" : "ASC",
                ],
            ],
        });
    },
    changeStatus: async (shopId, id, status) => {
        return await Order.update({ status }, { where: { id, shopId } });
    },
    getCount: async (shopId) => {
        return await Order.count({ where: { shopId } });
    },
    getShopCount: async (shopId) => {
        return await Order.count({
            where: { status: "created", shopId },
        });
    },
    viewOrder: async (shopId, id) => {
        return await Order.findOne({
            where: { id, shopId },
            include: [
                {
                    model: OrderProduct,
                    include: { model: Varient, attributes: ["productId"] },
                },
                { model: Customer, attributes: ["mobileNumber"] },
                { model: OrderCancel },
                { model: ShippingDetails },
            ],
        });
    },
    retryPayment: async (shopId, id) => {
        let resp = {
            success: false,
            msg: "",
        };
        const shop = await Shop.findByPk(shopId, {
            include: {
                model: SellerAuth,
                attributes: ["accountId", "isVerified"],
            },
        });

        if (shop == null) {
            resp.msg = "Seller not found for retry transfer";
            return resp;
        }
        if (shop.seller_auth != null && !shop.seller_auth.isVerified) {
            resp.msg = "Seller isn't verified";
            return resp;
        }

        const order = await Order.findOne({
            where: {
                shopId,
                id,
                amountTransferred: false,
                orderAccepted: true,
            },
        });

        if (order == null) {
            resp.msg = "Order not found for retry transfer";
            return resp;
        }

        try {
            let amt = (
                (parseFloat(order.totalAmount) -
                    parseFloat(order.convenienceFee) -
                    parseFloat(order.txnFee)) *
                100
            ).toFixed();
            await transferAmount(
                amt,
                shop.seller_auth.accountId,
                order.referenceId,
            );

            order.amountTransferred = true;
            await order.save();
            resp.success = true;
            resp.msg = "Amount transferred";
        } catch (e) {
            resp.msg = "Try again still facing error....";
        }
        return resp;
    },
};

module.exports = OrderDetails;
