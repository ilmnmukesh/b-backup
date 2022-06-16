const { uuidValidator } = require("../../../others/validation");
const { DashboardQueries, WalletQueries } = require("../queries");

module.exports = {
    cloudBarDashboard: async (req, response) => {
        const { lat, lng, state, cid } = req.query;
        if (cid) uuidValidator(cid);
        response.data = {
            wallets: cid ? await WalletQueries.getCustomerWallet(cid, 5) : [],
            partners: await DashboardQueries.partnerDashboard(lat, lng, state),
            categories: await DashboardQueries.categoryDashboard(),
            brands: [],
            initialCategory: [],
            initialBrands: [],
        };
        if (response.data.categories.length != 0) {
            response.data.initialCategory =
                await DashboardQueries.getBasedOnCategory(
                    response.data.categories[0].id,
                    lat,
                    lng,
                    state,
                );
            response.data.brands = await DashboardQueries.brandDashboard(
                response.data.categories[0].id,
            );

            if (response.data.brands.length != 0) {
                response.data.initialBrands =
                    await DashboardQueries.getBasedOnBrand(
                        response.data.brands[0].id,
                        response.data.categories[0].id,
                        lat,
                        lng,
                        state,
                    );
            }
        }
        response.success = true;
    },
};
