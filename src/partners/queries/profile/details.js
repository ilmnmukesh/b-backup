const { Shop, Partner } = require("../../../database");

module.exports = {
    getDetails: async (shopId) => {
        return await Shop.findByPk(shopId, { include: Partner });
    },
};
