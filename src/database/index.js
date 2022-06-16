const { Sequelize, Op } = require("sequelize");
const dbConfig = require("./config");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {
    Op,
    sequelize: sequelize,
    models: sequelize.models,
    // ...require("./model/tandc")(sequelize),
    // ...require("./model/user")(sequelize),
    // ...require("./model/product")(sequelize),
    // ...require("./model/cart")(sequelize),
    // ...require("./model/order")(sequelize),
    // ...require("./model/cloud")(sequelize),
    // ...require("./model/admin")(sequelize),
    ...require("./models")(sequelize),
};

require("./trigger")(db);
module.exports = db;
