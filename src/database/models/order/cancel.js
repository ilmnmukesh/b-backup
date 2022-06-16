module.exports = (sequelize, DataTypes) => {
    const OrderCancel = sequelize.define("order_cancel", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        reason: { type: DataTypes.TEXT },
        amount: { type: DataTypes.FLOAT },
        isRefunded: { type: DataTypes.BOOLEAN, defaultValue: false },
    });
    return { OrderCancel };
};
