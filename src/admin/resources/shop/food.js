const db = require("../../../database");

module.exports = {
    resource: db.Food,
    options: { actions: {} },
};
