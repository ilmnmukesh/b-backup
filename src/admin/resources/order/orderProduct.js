const db = require("../../../database");
const { canModify, canRestricted } = require("../../authorization");

module.exports = {
    resource: db.OrderProduct,
    options: {
        actions: {
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
        },
    },
};
