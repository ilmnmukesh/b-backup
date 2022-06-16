const { DataTypes } = require("sequelize");
// const sequelize = new Sequelize();
module.exports = (sequelize) => {
    const Token = sequelize.define(
        "token",
        {
            key: {
                type: DataTypes.STRING(48),
                primaryKey: true,
            },
        },
        {
            timestamps: false,
        },
    );
    return { Token };
};
