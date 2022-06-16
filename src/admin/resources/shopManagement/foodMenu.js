const db = require("../../../database");
const { canRestricted } = require("../../authorization");

module.exports = {
    resource: db.FoodMenu,
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
