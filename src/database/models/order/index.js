const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./transaction")(sequelize, DataTypes),
        ...require("./shipping")(sequelize, DataTypes),
        ...require("./order")(sequelize, DataTypes),
        ...require("./product")(sequelize, DataTypes),
        ...require("./cancel")(sequelize, DataTypes),
    };
};
