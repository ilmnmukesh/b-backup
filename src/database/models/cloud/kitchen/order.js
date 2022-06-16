// const { DataTypes, Sequelize, literal } = require("sequelize");
// const sequelize = new Sequelize();
// module.exports = () => {

module.exports = (sequelize, DataTypes) => {
    const KitchenOrder = sequelize.define("kitchen_order", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        subTotal: DataTypes.DECIMAL(8, 2),
        processingFee: DataTypes.DECIMAL(8, 2),
        tipForService: DataTypes.DECIMAL(8, 2),
        walletTax: DataTypes.DECIMAL(8, 2),
        kitchenTax: DataTypes.DECIMAL(8, 2),
        total: DataTypes.DECIMAL(8, 2),
    });
    const KitchenOrderProduct = sequelize.define(
        "kitchen_order_product",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            count: { type: DataTypes.INTEGER, defaultValue: 1 },
            unitPrice: DataTypes.DECIMAL(8, 2),
        },
        {
            timestamps: false,
        },
    );

    return { KitchenOrder, KitchenOrderProduct };
};
