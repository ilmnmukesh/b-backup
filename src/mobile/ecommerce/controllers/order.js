const { OrderQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    createOrder: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "totalAmount",
                "tipForDriver",
                "customerId",
                "referenceId",
                "profileId",
                "extraId",
            ],
        });
        // response.data = await OrderQueries.createOrder(req.body);
        response.success = true;
    },
    getOrder: async (req, response) => {
        let result = await OrderQueries.getOrder(req.params.customerId);
        response.data = result;
        response.success = true;
    },
    cancelOrder: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["orderId", "reason"],
        });
        const { orderId: oid, reason } = req.body;
        let result = await OrderQueries.cancelOrder(oid, reason);
        response.data = result;
        response.success = true;
    },
    getTransaction: async (req, response) => {
        let result = await OrderQueries.getTransaction(req.params.customerId);
        response.data = result;
        response.success = true;
    },
};
