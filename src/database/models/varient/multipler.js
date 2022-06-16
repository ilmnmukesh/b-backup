module.exports = (sequelize, DataTypes) => {
    const Multipler = sequelize.define("multipler", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        lowerUnit: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        upperUnit: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    });

    return { Multipler };
};
