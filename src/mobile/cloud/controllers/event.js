const {
    uuidValidator,
    paramsValidation,
} = require("../../../others/validation");
const { EventQueries } = require("../queries");

module.exports = {
    getEvents: async (req, response) => {
        const { cid } = req.query;
        uuidValidator(cid);
        response.data = await EventQueries.getEventReservation(cid);
        response.success = true;
    },
    generateQR: async (req, response) => {
        const { customerId, er_id } = req.body;
        paramsValidation({
            params: ["customerId", "er_id"],
            body: req.body,
        });
        uuidValidator(customerId);
        response.data = await EventQueries.generateQR(er_id, customerId);
        response.success = true;
    },
};
