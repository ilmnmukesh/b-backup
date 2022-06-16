const { UserQueries } = require("../../../others/queries");
const { paramsValidation } = require("../../../others/validation");

module.exports = {
    create: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "firstName",
                "lastName",
                "email",
                "profileUrl",
                "dateOfBirth",
                "mobileNumber",
                "countryCode",
                "countryName",
            ],
        });

        const result = await UserQueries.createUser(req.body);
        response.success = result[0];
        response.data = result[1];
        response.errors = result[2];
        response.description = result[3];
    },
    createProfileInfo: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "title",
                "city",
                "address",
                "state",
                "country",
                "name",
                "defaultSelect",
                "postalCode",
                "customerId",
                "latitude",
                "longitude",
            ],
        });

        const result = await UserQueries.createProfileInfo(
            req.body,
            req.body.customerId,
        );
        response.success = true;
        response.description = "Create Successfully";
        response.data = result;
    },
    getProfileInfo: async (req, response) => {
        const { customerId } = req.params;
        const result = await UserQueries.getProfileInfo(customerId);
        response.success = true;
        response.description = "Default select Successfully";
        response.data = result;
    },
    listProfileInfo: async (req, response) => {
        const { customerId } = req.params;
        const result = await UserQueries.listProfileInfo(customerId);
        response.success = true;
        response.description = "List Successfully";
        response.data = result;
    },
    updateProfileInfo: async (req, response) => {
        paramsValidation({
            body: req.body,
            params: [
                "name",
                "defaultSelect",
                "title",
                "city",
                "address",
                "state",
                "country",
                "postalCode",
                "customerId",
                "latitude",
                "longitude",
            ],
        });
        const { profileId } = req.params;
        const result = await UserQueries.updateProfileInfo(req.body, profileId);
        response.success = true;
        response.description = "Profile Update Successfully";
        response.data = result;
    },
    deleteProfileInfo: async (req, response) => {
        const { profileId } = req.params;
        const result = await UserQueries.deleteProfileInfo(profileId);
        response.success = true;
        response.description = "delete Successfully";
        response.data = result;
    },
    updateDefaultSelect: async (req, response) => {
        const { profileId } = req.params;
        const result = await UserQueries.updateDefaultSelect(profileId);
        response.success = true;
        response.description = "Default Select updated Successfully";
        response.data = result;
    },
    updateLocation: async (req, response) => {
        const { cid } = req.params;
        const { lat, lng } = req.query;
        const result = await UserQueries.updateUserLocation(cid, lat, lng);
        response.description = "Location updated";
        response.success = result;
    },
    getUser: async (req, response) => {
        const { customerId } = req.params;
        const result = await UserQueries.getUserDetails(customerId);
        response.description = "user fetch successfully";
        response.success = true;
        response.data = result;
    },
};
