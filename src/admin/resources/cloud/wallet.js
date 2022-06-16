const db = require("../../../database");
const { secureAction } = require("../../authorization");

module.exports = {
    resource: db.CloudWallet,
    options: { actions: secureAction },
};
