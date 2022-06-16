const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");
const { OrderQueries } = require("../queries");
module.exports = {
    createCloudOrder: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "totalAmount",
                "customerId",
                "referenceId",
                "postalCode",
                "stateCode",
                "countryCode",
            ],
        });
        response.data = {};
        // response.data = await OrderQueries.createOrder(req.body);
        response.success = true;
    },

    getCloudOrder: async (req, response) => {
        const { cid } = req.params;
        uuidValidator(cid);
        response.data = await OrderQueries.getOrder(cid);
        response.success = true;
    },
};
