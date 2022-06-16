const { BrandQueries, ProductQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    getCategoryBased: async (req, response) => {
        paramsValidation({ body: req.body, params: ["id"] });
        const { id } = req.body;
        const { lat, lng } = req.query;
        response.data = {
            categoryDetails: await ProductQueries.getBasedOnCategory(
                id,
                lat,
                lng,
            ),
            brands: await BrandQueries.getBrands(id),
            brandDetails: [],
        };

        if (response.data?.brands.length != 0) {
            response.data.brandDetails = await ProductQueries.getBasedOnBrand(
                response.data?.brands[0].id,
                id,
                lat,
                lng,
            );
        }

        response.success = true;
    },
    getBrandBased: async (req, response) => {
        paramsValidation({ body: req.body, params: ["id"] });
        const { id, catId } = req.body;
        const { lat, lng } = req.query;
        response.data = await ProductQueries.getBasedOnBrand(
            id,
            catId,
            lat,
            lng,
        );
        response.success = true;
    },
    getProductDetails: async (req, response) => {
        const { pid } = req.params;
        const { lat, lng } = req.query;
        let data = await ProductQueries.getProductDetails(pid, lat, lng);
        data = JSON.parse(JSON.stringify(data));
        let check = data.isAvailable;
        if (!check) {
            response.description = "Unable to purchase this product!";
        }
        response.data = data;
        response.success = true;
    },
    getProductVarient: async (req, response) => {
        const { pid, sid } = req.query;
        let data = await ProductQueries.getShopVarients(pid, sid);
        data = JSON.parse(JSON.stringify(data));

        if (data.length != 0 || data != null) {
            data.forEach((f, i) => {
                try {
                    let e = f.varient;
                    e.multiplers = e.multipler.value + " " + e.unit.value;
                    delete e.unit;
                    delete e.multipler;
                } catch (e) {
                    data.varients[i].multiplers = " 1";
                }
            });
        }
        response.data = data;
        response.success = true;
    },
    searchProduct: async (req, response) => {
        paramsValidation({ body: req.query, params: ["key"] });
        const { key, lat, lng } = req.query;
        response.data = await ProductQueries.searchProductName(key, lat, lng);
        response.success = true;
    },
};
