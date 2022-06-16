module.exports = (sequelize, DataTypes) => {
    const ShopType = sequelize.define("shop_type", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });
    return { ShopType };
};
