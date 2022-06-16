module.exports = (sequelize, DataTypes) => {
    const { literal } = require("sequelize");

    const Reservation = sequelize.define(
        "bar_reservation",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            noOfSeats: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            description: { type: DataTypes.TEXT },
            registrar: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "Anonymous",
            },
            date: {
                type: DataTypes.DATEONLY,
                defaultValue: literal("CURRENT_TIMESTAMP"),
            },
            time: {
                type: DataTypes.TIME,
                defaultValue: literal("CURRENT_TIMESTAMP"),
            },
            status: {
                type: DataTypes.ENUM(["waiting", "reserved", "cancelled"]),
                defaultValue: "waiting",
            },
        },
        {
            timestamps: false,
        },
    );
    return { Reservation };
};
