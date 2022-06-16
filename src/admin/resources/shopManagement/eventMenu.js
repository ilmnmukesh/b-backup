const db = require("../../../database");
const { canRestricted } = require("../../authorization");

module.exports = {
    resource: db.EventMenu,
    options: {
        actions: {
            list: {
                isAccessible: true,
                before: canRestricted,
                showFilter: false,
            },
        },
    },
};
