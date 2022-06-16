const db = require("../../../database");
const { canModify } = require("../../authorization");

module.exports = {
    resource: db.Category,
    options: {
        actions: {
            edit: { isAccessible: canModify },
            delete: { isAccessible: canModify },
            new: { isAccessible: canModify },
            show: { isAccessible: canModify },
            list: { isAccessible: canModify },
        },
    },
};

// [
//     {
//         resource: db.Category,
//         options: {
//             actions: {
//                 edit: { isAccessible: canModify },
//                 delete: { isAccessible: canModify },
//                 new: { isAccessible: canModify },
//                 show: { isAccessible: canModify },
//                 list: { isAccessible: canModify },
//             },
//             navigation: canModify ? "Category" : null,
//         },
//     },
// ]
