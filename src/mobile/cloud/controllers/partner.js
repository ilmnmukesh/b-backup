const { PartnerQueries } = require("../queries");
const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");
const moment = require("moment");

module.exports = {
    partnerCloudDetails: async (req, response) => {
        const { id } = req.params;
        const { lat, lng } = req.query;
        parseInt(id);
        response.data = await PartnerQueries.partnerDetails(id, lat, lng);
        response.success = true;
    },
    partnerReservation: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "customerId",
                "noOfSeats",
                "description",
                "date",
                "time",
                "partnerId",
            ],
        });
        uuidValidator(req.body.customerId);
        parseInt(req.body.noOfSeats);
        parseInt(req.body.partnerId);

        if (moment(req.body.date) < moment(moment().format("L"), "MM/DD/YYYY"))
            throw "Invalid Date";
        response.data = await PartnerQueries.reservation(req.body);
        response.success = true;
    },
    customerReservation: async (req, response) => {
        const { cid } = req.params;
        uuidValidator(cid);
        response.data = await PartnerQueries.customerReservation(cid);
        response.success = true;
    },
    addReview: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: ["name", "comment", "rating", "partnerId"],
        });
        let [created, result] = await PartnerQueries.createReview(req.body);
        if (created) {
            response.description = "review add successfully";
            response.data = result;
            response.success = true;
        } else {
            response.description =
                "review failed to add partner id doesn't matched";
        }
    },
};
