// const { DataTypes, Sequelize, literal } = require("sequelize");
// const sequelize = new Sequelize();
// module.exports = () => {
const { literal } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const KitchenCart = sequelize.define(
        "kitchen_cart",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            count: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
        },
        {
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["menuItemId", "customerId"],
                },
            ],
        },
    );

    const KitchenWallet = sequelize.define(
        "kitchen_wallet",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            isPremium: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                type: DataTypes.DATEONLY,
                defaultValue: literal("CURRENT_TIMESTAMP"),
            },
            noOfShots: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            isChecked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            timestamps: false,
        },
    );

    return { KitchenCart, KitchenWallet };
};
