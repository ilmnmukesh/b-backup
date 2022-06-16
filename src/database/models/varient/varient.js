const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Varient = sequelize.define(
        "varient",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            mrp: {
                type: DataTypes.FLOAT,
            },
            volume: {
                type: DataTypes.STRING,
            },
            stock: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
        },
        {
            timestamps: false,
        },
    );
    return { Varient };
};
