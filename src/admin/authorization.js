const canModify = ({ currentAdmin }) => {
    //return true;
    return true;
    currentAdmin && currentAdmin.role == "superuser";
};

const canRestricted = async (req, context) => {
    if (context.currentAdmin && context.currentAdmin.shopId) {
        req.query["filters.shopId"] = context.currentAdmin.shopId;
    }
    //  else {
    //     req.query["filters.shopId"] = 3;
    // }
    //console.log(req.query);
    return req;
};

const canRestrictedCurrent = async (req, context) => {
    if (context.currentAdmin && context.currentAdmin.shopId) {
        req.query["filters.id"] = context.currentAdmin.shopId;
    }
    return req;
};

const secureAction = {
    edit: { isAccessible: canModify },
    delete: { isAccessible: canModify },
    bulkDelete: { isAccessible: canModify },
    new: { isAccessible: canModify },
    list: { showFilter: false },
};

const restricedAction = {
    edit: { isAccessible: canModify },
    delete: { isAccessible: canModify },
    bulkDelete: { isAccessible: canModify },
};

module.exports = {
    canModify,
    canRestricted,
    secureAction,
    restricedAction,
    canRestrictedCurrent,
};
