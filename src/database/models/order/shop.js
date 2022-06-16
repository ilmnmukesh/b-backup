module.exports = (sequelize, DataTypes) => {
    const OrderShop = sequelize.define("order_shop", {
        trackingId: {
            type: DataTypes.STRING,
            defaultValue: "NIL",
        },
        estimateDelivery: {
            type: DataTypes.DATE,
        },
        status: {
            type: DataTypes.ENUM([
                "created",
                "dispatch",
                "shipping",
                "delivered",
                "cancelled",
            ]),
            defaultValue: "created",
        },
    });
    return { OrderShop };
};
