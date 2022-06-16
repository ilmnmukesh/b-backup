const db = require("../../../database");
const { canRestricted } = require("../../authorization");

module.exports = {
    resource: db.Shop_Product,
    options: {
        parent: { name: "Product Management", icon: "Product" },
        actions: {
            list: {
                isAccessible: true,
                before: canRestricted,
                showFilter: false,
            },
        },
    },
};
