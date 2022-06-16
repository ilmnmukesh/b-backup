module.exports = (sequelize, DataTypes) => {
    const Unit = sequelize.define("unit", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    });
    return { Unit };
};
