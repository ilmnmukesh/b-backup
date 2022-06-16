const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.OrderCancel,
    options: {
        actions: {
            //edit: { isAccessible: canModify },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            list: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
        },
    },
};
