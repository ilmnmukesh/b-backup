const MEMBER = "/membership";

module.exports = {
    get: {
        getMembership: `${MEMBER}/get/`,
        getDeliveryType: `${MEMBER}/delivery_types/`,
        getMembershipDesc: `${MEMBER}/details/`,
    },
    post: { changeMembership: `${MEMBER}/change/` },
};
