module.exports = {
    getCustomerDetails: async (req, response) => {
        response.success = true;
        response.data = await req.customer.getCustomer({
            attributes: [
                "id",
                "mobileNumber",
                "isVerified",
                "email",
                "dateOfBirth",
                "firstName",
                "lastName",
                "latitude",
                "longitude",
            ],
        });
    },
};
