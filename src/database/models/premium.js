const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Premium = sequelize.define(
        "premium",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            level: {
                type: DataTypes.ENUM([
                    "free",
                    "silver",
                    "gold",
                    "platinum",
                    "premium",
                ]),
                defaultValue: "free",
            },
            coinDiscount: {
                type: DataTypes.INTEGER,
                validate: {
                    max: 100,
                    min: 0,
                },
            },
            deliveryWithin: {
                type: DataTypes.INTEGER,
                defaultValue: 24,
            },
            shotLimit: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            price: {
                type: DataTypes.DECIMAL(8, 2),
                defaultValue: 0,
            },
            period: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            deliveryCharge: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            description: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: false },
    );
    const Subscription = sequelize.define(
        "subscription",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            expires_date: {
                type: DataTypes.DATEONLY,
            },
        },
        { timestamps: false },
    );
    const DeliveryType = sequelize.define(
        "delivery_type",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: DataTypes.STRING,
            price: DataTypes.DECIMAL(8, 2),
            period: DataTypes.INTEGER,
        },
        { timestamps: false },
    );
    return { Premium, Subscription, DeliveryType };
};
