const db = require("../../../database");
const {
    canModify,
    canRestricted,
    secureAction,
} = require("../../authorization");
let his = { ...secureAction };
his.list = {
    isAccessible: true,
    handler: canRestricted,
    showFilter: false,
};
module.exports = {
    resource: db.CloudHistory,
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
