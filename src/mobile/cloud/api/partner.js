const PARTNER = "/partner";

module.exports = {
    get: {
        partnerCloudDetails: `${PARTNER}/:id/`,
        customerReservation: `${PARTNER}/reserved/:cid/`,
    },
    post: {
        partnerReservation: `${PARTNER}/reserve/`,
        addReview: `${PARTNER}/add/review/`,
    },
};
