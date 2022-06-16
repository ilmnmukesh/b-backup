const db = require("../../../database");
const { canRestricted } = require("../../authorization");
module.exports = {
    resource: db.Review,
    options: {
        actions: {
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: false },
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: true,
                before: canRestricted,
                showFilter: false,
            },
        },
    },
};
