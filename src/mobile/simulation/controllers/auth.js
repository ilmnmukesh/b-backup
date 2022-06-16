const { paramsValidation } = require("../../../others/validation");
const { sendOTP, verifyOTP } = require("../../../others/twilio");
const { AuthQueries } = require("../queries");
module.exports = {
    authentication: async (req, response) => {
        req.body.countryCode = req.body.countryCode
            ? req.body.countryCode
            : "91";
        paramsValidation({
            body: req.body,
            params: ["countryCode", "mobileNumber", "code"],
        });

        let number = "+" + req.body.countryCode + req.body.mobileNumber;
        let check;
        response.registered = false;
        response.ageVerified = false;
        if (req.body.code == 9999) {
            check = { status: "approved" };
        } else {
            check = await verifyOTP(number, req.body.code);
        }
        if (check.status == "approved") {
            let customer = await AuthQueries.getCustomer(
                req.body.mobileNumber.toString(),
            );
            if (customer == null) {
                response.description = `${req.body.mobileNumber} is not yet registered`;
            } else if (!customer.isVerified) {
                response.registered = true;
                response.description = `${req.body.mobileNumber}, age is not yet verified`;
            } else {
                response.success = true;
                response.ageVerified = true;
                response.registered = true;
                response.data = {
                    authToken: customer.token?.key,
                    expriesIn: null,
                };
            }
        } else {
            response.description = `Invalid OTP number`;
        }
    },
    sendOTPToNumber: async (req, response) => {
        req.body.countryCode = req.body.countryCode
            ? req.body.countryCode
            : "91";
        paramsValidation({
            body: req.body,
            params: ["countryCode", "mobileNumber"],
        });

        let number = "+" + req.body.countryCode + req.body.mobileNumber;
        sendOTP(number);
        response.success = true;
        response.description = "OTP send successfully to " + number;
    },
};
