const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.Order,
    options: {
        actions: {
            //  edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
            list: { isAccessible: canModify },
        },
    },
};
