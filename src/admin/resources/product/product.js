const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.Product,
    options: {
        actions: {
            edit: { isAccessible: canModify },
            delete: { isAccessible: canModify },
            bulkDelete: { isAccessible: canModify },
        },
    },
};
