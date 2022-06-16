const db = require("../../../database");

module.exports = {
    resource: db.Event,
    options: { actions: {} },
};
