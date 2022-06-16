const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return {
        ...require("./kitchen")(sequelize),
        ...require("./amenitites")(sequelize, DataTypes),
        ...require("./event")(sequelize, DataTypes),
        ...require("./review")(sequelize, DataTypes),
        ...require("./reservation")(sequelize, DataTypes),
        ...require("./wallet")(sequelize, DataTypes),
        ...require("./history")(sequelize, DataTypes),
        ...require("./cart")(sequelize, DataTypes),
        ...require("./order")(sequelize, DataTypes),
        ...require("./orderproduct")(sequelize, DataTypes),
    };
};
