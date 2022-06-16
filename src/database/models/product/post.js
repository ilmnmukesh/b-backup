const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Post = sequelize.define(
        "product_post",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            price: DataTypes.DECIMAL(8, 2),
            discount: { type: DataTypes.INTEGER, defaultValue: 0 },
            onlyForCloud: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ["varientId", "shopId", "productId"],
                },
            ],
            timestamps: false,
        },
    );
    return { Post };
};
