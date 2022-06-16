module.exports = (sequelize, DataTypes) => {
    const ShopReview = sequelize.define("shop_review", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING },
        comment: { type: DataTypes.TEXT },
        rating: { type: DataTypes.FLOAT },
    });
    return { ShopReview };
};
