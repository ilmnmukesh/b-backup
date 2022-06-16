const BASE = "/auth";

module.exports = {
    get: {},
    post: {
        sendOTPToNumber: `/send/otp`,
        authentication: `${BASE}/`,
    },
};
