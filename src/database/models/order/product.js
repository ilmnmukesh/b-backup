module.exports = (sequelize, DataTypes) => {
    const OrderProduct = sequelize.define("order_product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        price: { type: DataTypes.FLOAT },
        quantity: { type: DataTypes.INTEGER },
        image: { type: DataTypes.TEXT },
        name: { type: DataTypes.STRING },
        isOffer: { type: DataTypes.BOOLEAN, defaultValue: false },
        isSubscription: { type: DataTypes.BOOLEAN, defaultValue: false },
    });
    return { OrderProduct };
};
