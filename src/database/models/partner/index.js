const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./partner")(sequelize, DataTypes),
        // ...require("./type")(sequelize, DataTypes),
    };
};
