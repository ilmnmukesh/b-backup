const db = require("../../../database");
const { canRestrictedCurrent } = require("../../authorization");
module.exports = {
    resource: db.Shop,
    options: {
        actions: {
            list: {
                isAccessible: true,
                before: canRestrictedCurrent,
                showFilter: false,
            },
            delete: { isAccessible: false },
            bulkDelete: { isAccessible: false },
            new: { isAccessible: false },
        },
    },
};
