const middleware = require("./middleware");
const database = require("./database");
//database.sequelize.sync({ force: true });
database.sequelize.sync();

module.exports = {
    middleware,
    database,
};

// "react": "^16.13.1",
// "react-dom": "^16.13.1",
