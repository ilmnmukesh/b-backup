const {
    FilterQueries,
    CategoryQueries,
    BrandQueries,
} = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    filterDashboard: async (_, response) => {
        const filter = [
            {
                id: 1,
                name: "Category",
                key: "category",
                type: 1,
                value: await CategoryQueries.getCategoriesForFilter(),
            },
            {
                id: 2,
                name: "Brand",
                key: "brand",
                type: 1,
                value: await BrandQueries.getBrandsForFilter(),
            },
            {
                id: 3,
                name: "Rating",
                key: "rating",
                type: 2,
                value: [
                    { id: 1, key: "start", value: 0 },
                    { id: 2, key: "end", value: 5 },
                ],
            },
            {
                id: 4,
                name: "Discount",
                key: "discount",
                type: 2,
                value: [
                    { id: 1, key: "start", value: 0 },
                    { id: 2, key: "end", value: 100 },
                ],
            },
        ];

        response.data = filter;
        response.success = true;
    },
    combineFilter: async (req, response) => {
        response.data = await FilterQueries.combine({
            ...req.query,
            ...req.body,
        });
        response.success = true;
    },
    rangeFilter: async (req, response) => {
        paramsValidation({ body: req.body, params: ["start", "end"] });
        const { start, end } = req.body;
        const { lat, lng } = req.query;
        let result = await FilterQueries.range(start, end, lat, lng);
        response.data = result;
        response.success = true;
    },
};
