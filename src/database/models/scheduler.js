const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Scheduler = sequelize.define(
        "scheduler",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            executed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            time: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            paymentId: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
        },
        { timestamps: false },
    );

    return { Scheduler };
};
