const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Admin = sequelize.define(
        "admin",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            email: {
                type: DataTypes.STRING,
                unique: true,
            },
            password: DataTypes.STRING,
            role: {
                type: DataTypes.ENUM(["superuser", "restricted"]),
                defaultValue: "restricted",
            },
        },
        { timestamps: false }
    );
    return { Admin };
};
