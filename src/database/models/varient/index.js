const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./multipler")(sequelize, DataTypes),
        ...require("./unit")(sequelize, DataTypes),
        ...require("./varient")(sequelize, DataTypes),
    };
};
