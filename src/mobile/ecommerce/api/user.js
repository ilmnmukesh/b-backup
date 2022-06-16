const USER = "/user";
const PROFILEINFO = "/profile_info";
module.exports = {
    get: {
        listProfileInfo: `${USER}${PROFILEINFO}/list/:customerId`,
        getProfileInfo: `${USER}${PROFILEINFO}/get/:customerId`,

        updateLocation: `${USER}/location/:cid/`,
        getUser: `${USER}/get/:customerId`,
    },
    post: {
        create: `${USER}/create/`,

        createProfileInfo: `${USER}${PROFILEINFO}/create/`,
        updateProfileInfo: `${USER}${PROFILEINFO}/update/:profileId/`,
        deleteProfileInfo: `${USER}${PROFILEINFO}/delete/:profileId/`,
        updateDefaultSelect: `${USER}${PROFILEINFO}/select/:profileId/`,
    },
};
