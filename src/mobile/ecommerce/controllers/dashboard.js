const {
    ProductQueries,
    CategoryQueries,
    ShopQueries,
    BrandQueries,
    UserQueries,
} = require("../../../others/queries");

module.exports = {
    termsAndCondition: async (_, response) => {
        response.success = true;
        response.data = await UserQueries.termsAndCondition();
        response.updatedAt =
            response.data.length == 0 ? null : response.data[0].updatedAt;
    },
    eCommerce: async (req, response) => {
        const { lat, lng } = req.query;
        response.success = true;
        response.data = {
            sellers: await ShopQueries.getSellers(lat, lng),
            categories: await CategoryQueries.getCategories(),
            brands: [],
            bestDrinks: await ProductQueries.getOnBestDrink(lat, lng),
            initialCategory: [],
            initialBrands: [],
        };
        if (response.data.categories.length != 0) {
            response.data.initialCategory =
                await ProductQueries.getBasedOnCategory(
                    response.data.categories[0].id,
                    lat,
                    lng,
                );
            response.data.brands = await BrandQueries.getBrands(
                response.data.categories[0].id,
            );
            if (response.data.brands.length != 0) {
                response.data.initialBrands =
                    await ProductQueries.getBasedOnBrand(
                        response.data.brands[0].id,
                        response.data.categories[0].id,
                        lat,
                        lng,
                    );
            }
        }
    },
};
