const { Shop } = require("../../../database");

module.exports = {
    getSeller: async (shopId) => {
        return await Shop.findByPk(shopId);
    },
    updateDetails: async (shopId, data) => {
        return await Shop.update(data, { where: { id: shopId } });
    },
};
