const { canModify } = require("../authorization");

const OptionList = (list, parent = { name: "General", icon: "Activity" }) => {
    list.forEach((e) => {
        if (e?.options == undefined) {
            e.options = {
                actions: {
                    edit: { isAccessible: canModify, showFilter: canModify },
                    delete: { isAccessible: canModify, showFilter: canModify },
                    new: { isAccessible: canModify, showFilter: canModify },
                    show: { isAccessible: canModify, showFilter: canModify },
                    list: { isAccessible: canModify, showFilter: canModify },
                    bulkDelete: {
                        isAccessible: canModify,
                        showFilter: canModify,
                    },
                },
            };
        }
        e.options.parent = canModify ? parent : null;
        e.options.properties = {
            createdAt: { isVisible: false },
            updatedAt: { isVisible: false },
        };
        return e;
    });
    return list;
};

module.exports = { OptionList };
