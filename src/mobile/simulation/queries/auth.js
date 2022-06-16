const { Customer, Token } = require("../../../database");

module.exports = {
    getCustomer: async (mobileNumber) => {
        return await Customer.findOne({
            where: { mobileNumber },
            include: [Token],
        });
    },
};
