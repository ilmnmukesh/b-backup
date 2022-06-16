module.exports = (sequelize, DataTypes) => {
    const { literal } = require("sequelize");
    const EventImage = sequelize.define(
        "event_images",
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            image: DataTypes.STRING,
        },
        { timestamps: false },
    );
    const Event = sequelize.define(
        "events",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            eventName: { type: DataTypes.STRING, allowNull: false },
            eventLocation: DataTypes.STRING,
            eventStarts: {
                type: DataTypes.DATE,
                defaultValue: literal("CURRENT_TIMESTAMP"),
            },
            eventEnds: {
                type: DataTypes.DATE,
                defaultValue: literal("CURRENT_TIMESTAMP"),
            },
            ticketFee: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: false,
            },
            noOftickets: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            ticketLeft: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            venue: DataTypes.TEXT,
            description: DataTypes.TEXT,
        },
        { timestamps: false },
    );

    const EventReservation = sequelize.define("event_reservations", {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        noOfTickets: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        registrar: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Anonymous",
        },
        amount: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM([
                "waiting",
                "reserved",
                "cancelled",
                "redeemed",
            ]),
            defaultValue: "waiting",
        },
    });
    return { Event, EventReservation, EventImage };
};
