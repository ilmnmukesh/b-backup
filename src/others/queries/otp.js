const { User } = require("../../database");

const otpQueries = {
    async checkCustomer(countryCode, mobileNumber) {
        const query = await User.findOne({
            where: {
                countryCode: countryCode,
                mobileNumber: mobileNumber,
            },
        });
        if (query == null) return [true, query];
        return [false, query];
    },
};
module.exports = otpQueries;
