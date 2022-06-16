const { Shop } = require("../../../database");

module.exports = {
    getDetails: async (shopId) => {
        return await Shop.findByPk(shopId);
    },

    updateSellerDetails: async (shopId, details) => {
        const fields = {
            name: details.name,
            image: details.image,
            mobileNumber: details.contact_number,
            telephoneNumber: details.telephone_number,
            sellerName: details.seller_name,
            openTime: details.open_time,
            closeTime: details.close_time,
            about: details.about,
        };
        const shop = await Shop.update(fields, { where: { id: shopId } });
        return shop;
    },
};
