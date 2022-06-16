const { MenuItem, Op, MenuType } = require("../../../../database");
// const sequelize = new (require("sequelize").Sequelize)();
// const M = sequelize.define();

module.exports = {
    getPartnerMenuType: async (partnerId) => {
        if (partnerId == null) return [];
        return await MenuType.findAll({
            where: { partnerId },
            attributes: ["id", "type"],
        });
    },

    getPartenerMenuItems: async (partnerId, menuTypeId = null) => {
        if (partnerId == null) return [];
        return await MenuItem.findAll({
            where:
                menuTypeId == null ? { partnerId } : { partnerId, menuTypeId },
        });
    },

    searchMenuItemsName: async (partnerId, search) => {
        return await MenuItem.findAll({
            where: { partnerId, name: { [Op.iLike]: `%${search}%` } },
            order: ["name"],
        });
    },
};
