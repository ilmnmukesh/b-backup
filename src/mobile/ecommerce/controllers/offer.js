const { OfferQueries } = require("../../../others/queries");

module.exports = {
    offerDashboard: async (req, response) => {
        const { sid, lat, lng } = req.query;
        response.data = await OfferQueries.offerDashboard(sid, lat, lng);
        response.success = true;
    },
    offerShop: async (req, response) => {
        const { lat, lng } = req.query;
        response.data = await OfferQueries.offerShop(lat, lng);
        response.success = true;
    },
    getFilterOffer: async (req, response) => {
        const { lat, lng, catid, sid } = req.query;
        response.data = await OfferQueries.searchOffers(catid, sid, lat, lng);
        response.success = true;
    },
};
