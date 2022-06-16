const { PartnerQueries } = require("../../../others/queries");

module.exports = {
    partnerDetails: async (req, response) => {
        const { id } = req.params;
        const { lat, lng } = req.query;
        response.data = await PartnerQueries.getPartners(id, lat, lng);
        response.success = true;
    },
};
