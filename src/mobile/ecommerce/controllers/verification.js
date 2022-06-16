const { UserQueries } = require("../../../others/queries");
const {
    paramsValidation,
    uuidValidator,
} = require("../../../others/validation");

const moment = require("moment");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
    createVerification: async (req, response) => {
        uuidValidator(req.params.id);
        paramsValidation({
            body: req.body,
            params: [
                "address",
                "city",
                "country",
                "dob_day",
                "dob_month",
                "dob_year",
                "first_name",
                "last_name",
                "state",
                "zip",
                "email",
            ],
        });

        let user = await UserQueries.getUser(req.params.id);
        if (user == null) throw "user not found";
        let curr = moment(new Date()).format("X");
        let old = moment(user.verificationExpires).add(1, "hours").format("X");
        if (user.isVerified) {
            response.description = "User already verified";
        } else if (user.verificationId != null && curr < old) {
            response.data.url =
                process.env.AGECHECKER_VERIFY_URL + user.verificationId;
        } else {
            user.firstName = req.body.first_name;
            user.lastName = req.body.last_name;
            user.dateOfBirth = moment()
                .set({
                    date: req.body.dob_day,
                    month: req.body.dob_month - 1,
                    year: req.body.dob_year,
                })
                .format("YYYY-MM-DD");
            user.email = req.body.email;
            req.body.phone = "+" + user.countryCode + user.mobileNumber;
            let data = {
                key: process.env.AGECHECKER_PUBLIC_KEY,
                secret: process.env.AGECHECKER_SECRET_KEY,
                data: req.body,
                options: {
                    customer_ip: req.socket.remoteAddress,
                    contact_customer: false,
                    callback_url: process.env.AGECHECKER_CALLBACK + user.id,
                    metadata: {
                        id: user.id,
                    },
                },
            };
            let ac_res = await fetch(process.env.AGECHECKER_CREATE_URL, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });
            ac_res = await ac_res.json();
            console.log(ac_res);
            user.verificationId = ac_res.uuid;
            user.verificationExpires = new Date();
            response.data.url = process.env.AGECHECKER_VERIFY_URL + ac_res.uuid;
            user.save();
        }
        response.success = true;
    },
    validateVerification: async (req, response) => {
        uuidValidator(req.params.id);
        let user = await UserQueries.getUser(req.params.id);
        if (user == null) throw "user not found";
        response.data = {
            verified: false,
            status: "notYetCreated",
        };
        if (user.verificationId == null) {
            response.description = "user not yet verifies";
        } else {
            if (user.isVerified) {
                response.success = true;
                response.data.verified = true;
                response.data.status = "verified";
                response.description = "user already verified";
            } else {
                let ac_res = await fetch(
                    process.env.AGECHECKER_STATUS_URL + user.verificationId
                );
                ac_res = await ac_res.json();
                if (ac_res.status == "accepted") {
                    user.isVerified = true;
                    user.save();
                    response.data.verified = true;
                    response.data.status = "verified";
                    response.description = "Verified Successfully";
                } else {
                    response.data.verified = false;
                    response.data.status = ac_res.status;
                    response.description = "user verification pending...";
                }
            }
        }
        response.success = true;
    },
};
