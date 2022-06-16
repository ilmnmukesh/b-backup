const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./brand")(sequelize, DataTypes),
        ...require("./category")(sequelize, DataTypes),
        ...require("./post")(sequelize, DataTypes),
        ...require("./product")(sequelize, DataTypes),
    };
};
