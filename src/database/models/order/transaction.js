const TRANSACTION_STATUS = ["created", "cancelled"];

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define("transaction", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        customerId: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.DECIMAL(8, 2),
        },
        txnClientId: {
            type: DataTypes.STRING,
        },
        action: {
            type: DataTypes.ENUM(TRANSACTION_STATUS),
            defaultValue: TRANSACTION_STATUS[0],
        },
        orderFor: {
            type: DataTypes.ENUM([
                "cloud",
                "e-commerce",
                "kitchen",
                "subscription",
                "event_booking",
            ]),
            defaultValue: "e-commerce",
            allowNull: false,
        },
    });
    return { Transaction };
};
