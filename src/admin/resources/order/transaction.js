const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.Transaction,
    options: {
        actions: {
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            list: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
        },
    },
};
