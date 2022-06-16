const OTP = "/otp";

module.exports = {
    get: {},
    post: {
        sendOTPToNumber: `${OTP}/send/`,
        isVerifyAndCreate: `${OTP}/verify_create/`,
    },
};
