const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./menus")(sequelize, DataTypes),
        ...require("./cart")(sequelize, DataTypes),
        ...require("./order")(sequelize, DataTypes),
    };
};
