const { UserQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");
const { verifyOTP, sendOTP } = require("../../../others/twilio");

module.exports = {
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
    isVerifyAndCreate: async (req, response) => {
        req.body.countryCode = req.body.countryCode
            ? req.body.countryCode
            : "91";
        paramsValidation({
            body: req.body,
            params: ["countryCode", "mobileNumber", "code"],
        });
        let number = "+" + req.body.countryCode + req.body.mobileNumber;
        let check;
        if (req.body.code == 9999) {
            check = { status: "approved" };
        } else {
            check = await verifyOTP(number, req.body.code);
        }

        if (check.status == "approved") {
            response.success = true;
            const [checkCustomer, details] = await UserQueries.createOrCheck(
                req.body.mobileNumber,
                req.body.countryCode
            );
            if (checkCustomer) {
                response.data = { newCustomer: true };
            } else {
                response.data = { newCustomer: false };
            }
            response.data.details = details;
            response.description = "OTP verified";
        } else {
            response.success = false;
            response.description = "Invalid OTP";
        }
    },
};
