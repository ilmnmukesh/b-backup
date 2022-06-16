module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("order", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        totalAmount: { type: DataTypes.DECIMAL(8, 2) },
        subTotal: { type: DataTypes.DECIMAL(8, 2) },
        shippingCost: { type: DataTypes.DECIMAL(8, 2) },
        taxes: { type: DataTypes.DECIMAL(8, 2) },
        convenienceFee: { type: DataTypes.DECIMAL(8, 2) },
        tipForDriver: { type: DataTypes.DECIMAL(8, 2) },
        txnFee: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
        extra: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
        referenceId: { type: DataTypes.STRING },
        trackingId: {
            type: DataTypes.STRING,
            defaultValue: "NIL",
        },
        estimateDelivery: DataTypes.DATE,
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
        amountTransferred: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        orderAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
    return { Order };
};
