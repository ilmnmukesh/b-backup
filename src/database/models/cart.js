const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Cart = sequelize.define(
        "cart",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            count: {
                type: DataTypes.INTEGER,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ["shopId", "varientId", "customerId"],
                },
            ],
        }
    );

    return { Cart };
};
