const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_TOKEN;

const twilio = require("twilio")(accountSid, authToken);

const sendOTP = async (mobile) => {
    const data = await twilio.verify
        .services(process.env.TWILIO_VERIFY_SERVICE)
        .verifications.create({
            to: mobile,
            channel: "sms",
        });
    return data;
};

const verifyOTP = async (mobile, code) => {
    const data = await twilio.verify
        .services(process.env.TWILIO_VERIFY_SERVICE)
        .verificationChecks.create({
            to: mobile,
            code: code,
        });
    return data;
};

module.exports = { sendOTP, verifyOTP };
