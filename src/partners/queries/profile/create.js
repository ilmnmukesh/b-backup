const { Shop, Partner } = require("../../../database");

module.exports = {
    getSeller: async (shopId) => {
        return await Shop.findByPk(shopId);
    },
    updateDetails: async (shopId, obj) => {
        const data = {
            latitude: obj.latitude,
            longitude: obj.longitude,
            location: obj.location,
        };
        await Partner.update(
            {
                countryCode: obj.countryCode,
                stateCode: obj.stateCode,
                postalCode: obj.postalCode,
            },
            { where: { shopId } },
        );
        return await Shop.update(data, { where: { id: shopId } });
    },
};
