const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BestDrink = sequelize.define(
        "best_drink",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            discount: {
                type: DataTypes.FLOAT,
            },
            startAt: {
                type: DataTypes.DATE,
            },
            endAt: {
                type: DataTypes.DATE,
            },
        },
        { timestamp: false }
    );

    return { BestDrink };
};
