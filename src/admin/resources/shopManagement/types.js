const db = require("../../../database");
const { canModify, canRestricted } = require("../../authorization");

module.exports = {
    resource: db.Shop_Type,
    options: {
        actions: {
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: canModify },
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: true,
                before: canRestricted,
                showFilter: false,
            },
        },
    },
};
