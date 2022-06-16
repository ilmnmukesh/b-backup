module.exports = (sequelize, DataTypes) => {
    const ShopState = sequelize.define("shop_state", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING, unique: true, allowNull: false },
    });
    return { ShopState };
};
