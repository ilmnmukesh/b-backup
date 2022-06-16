const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.Cart,
    options: {
        actions: {
            edit: { isAccessible: canModify },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
            list: { isAccessible: canModify },
        },
    },
};
