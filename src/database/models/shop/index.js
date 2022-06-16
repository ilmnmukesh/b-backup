const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./state")(sequelize, DataTypes),
        ...require("./type")(sequelize, DataTypes),
        ...require("./shop")(sequelize, DataTypes),
        ...require("./review")(sequelize, DataTypes),
        ...require("./seller")(sequelize, DataTypes),
    };
};
